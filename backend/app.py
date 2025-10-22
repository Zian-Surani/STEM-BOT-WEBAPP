"""
STEM Bot Backend API - Flask Server
Handles chat requests, file uploads (PDF/Image), and OCR processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from PIL import Image
import io
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from huggingface_hub import InferenceClient
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend connection

# Configuration from environment variables
HF_TOKEN = os.getenv('HF_TOKEN')
if not HF_TOKEN:
    raise ValueError("HF_TOKEN not found in environment variables. Please create a .env file with your token.")

HF_MODEL_SCI = os.getenv('HF_MODEL_SCI', 'Qwen/Qwen2.5-7B-Instruct')
HF_MODEL_SOCIO = os.getenv('HF_MODEL_SOCIO', 'Qwen/Qwen2.5-7B-Instruct')
HF_MODEL_FALLBACK = os.getenv('HF_MODEL_FALLBACK', 'HuggingFaceH4/zephyr-7b-beta')
FLASK_PORT = int(os.getenv('FLASK_PORT', '5000'))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']

# Initialize Hugging Face client
client = InferenceClient(api_key=HF_TOKEN)

# SymPy transformations
TRANSFORMS = standard_transformations + (implicit_multiplication_application,)

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(io.BytesIO(file.read()))
        return text or ""
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_image(file):
    """Extract text from image using OCR"""
    try:
        # Try PaddleOCR first
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        
        img = Image.open(file)
        import numpy as np
        img_array = np.array(img.convert('RGB'))
        
        result = ocr.ocr(img_array, cls=True)
        texts = []
        if result and result[0]:
            for line in result[0]:
                if line[1][0]:
                    texts.append(line[1][0])
        
        return '\n'.join(texts)
    except Exception as e:
        print(f"OCR error: {e}")
        return ""

def solve_math_with_sympy(question):
    """Solve math problems using SymPy"""
    try:
        q = question.strip().lower()
        
        # Handle integration
        if 'integrate' in q or '∫' in q:
            # Extract the expression
            import re
            expr_match = re.search(r'integrate\s+(.+)', q, re.I)
            if expr_match:
                expr_text = expr_match.group(1).strip()
                expr = parse_expr(expr_text, transformations=TRANSFORMS)
                result = sp.integrate(expr, sp.Symbol('x'))
                return f"∫ {sp.latex(expr)} dx = {sp.latex(result)} + C"
        
        # Handle differentiation
        if 'differentiate' in q or 'derivative' in q:
            import re
            expr_match = re.search(r'(?:differentiate|derivative)\s+(?:of\s+)?(.+)', q, re.I)
            if expr_match:
                expr_text = expr_match.group(1).strip()
                expr = parse_expr(expr_text, transformations=TRANSFORMS)
                result = sp.diff(expr, sp.Symbol('x'))
                return f"d/dx ({sp.latex(expr)}) = {sp.latex(result)}"
        
        # Handle solve
        if 'solve' in q:
            import re
            expr_match = re.search(r'solve\s+(.+)', q, re.I)
            if expr_match:
                expr_text = expr_match.group(1).strip()
                if '=' in expr_text:
                    left, right = expr_text.split('=')
                    eq = sp.Eq(parse_expr(left, transformations=TRANSFORMS), 
                             parse_expr(right, transformations=TRANSFORMS))
                else:
                    eq = sp.Eq(parse_expr(expr_text, transformations=TRANSFORMS), 0)
                
                solutions = sp.solve(eq)
                return f"Solutions: {', '.join([str(sol) for sol in solutions])}"
        
        # Default: try to evaluate
        expr = parse_expr(question, transformations=TRANSFORMS)
        result = sp.simplify(expr)
        return f"{sp.latex(expr)} = {sp.latex(result)}"
        
    except Exception as e:
        return f"Math error: {str(e)}"

def chat_with_llm(question, subject, mode, temperature=0.3):
    """Chat with Hugging Face LLM"""
    try:
        # Choose model based on subject
        model = HF_MODEL_SCI if subject == 'sci' else HF_MODEL_SOCIO
        
        # Create system prompt
        system_prompt = "You are a helpful STEM tutor. Provide accurate, concise answers."
        if subject == 'sci':
            system_prompt += " Focus on science topics like biology, chemistry, and physics."
        elif subject == 'socio':
            system_prompt += " Focus on social sciences like history, geography, and economics."
        
        # Create messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
        
        # Get response
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=800
        )
        
        if response and response.choices:
            return response.choices[0].message.content
        else:
            return "No response from the model."
            
    except Exception as e:
        print(f"LLM error: {e}")
        # Try fallback model
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": question}
            ]
            response = client.chat.completions.create(
                model=HF_MODEL_FALLBACK,
                messages=messages,
                temperature=temperature,
                max_tokens=800
            )
            if response and response.choices:
                return response.choices[0].message.content
        except:
            pass
        
        return f"Error: {str(e)}"

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "STEM Bot API is running"})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.form if request.form else request.json
        
        question = data.get('question', '')
        subject = data.get('subject', 'sci')
        mode = data.get('mode', 'short')
        temperature = float(data.get('temperature', 0.3))
        
        # Handle file uploads
        context = []
        files = request.files
        
        for key in files:
            file = files[key]
            filename = file.filename.lower()
            
            if filename.endswith('.pdf'):
                text = extract_text_from_pdf(file)
                if text:
                    context.append(f"PDF content: {text[:1000]}")
            elif filename.endswith(('.png', '.jpg', '.jpeg')):
                text = extract_text_from_image(file)
                if text:
                    context.append(f"Image text: {text[:1000]}")
        
        # Combine question with context
        full_question = question
        if context:
            full_question = f"Context: {' '.join(context)}\n\nQuestion: {question}"
        
        # Check if it's a math question
        is_math = subject == 'cal' or any(word in question.lower() for word in 
                                         ['integrate', 'differentiate', 'solve', 'derivative', '∫'])
        
        # Get answer
        if is_math:
            answer = solve_math_with_sympy(question)
        else:
            answer = chat_with_llm(full_question, subject, mode, temperature)
        
        return jsonify({
            "answer": answer,
            "success": True,
            "metadata": {
                "subject": subject,
                "mode": mode,
                "has_context": len(context) > 0
            }
        })
        
    except Exception as e:
        return jsonify({
            "answer": f"Error: {str(e)}",
            "success": False
        }), 500

@app.route('/api/extract', methods=['POST'])
def extract():
    """Extract text from uploaded file"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        filename = file.filename.lower()
        
        text = ""
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file)
        elif filename.endswith(('.png', '.jpg', '.jpeg')):
            text = extract_text_from_image(file)
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        return jsonify({
            "text": text,
            "success": True
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    print("🚀 Starting STEM Bot API Server...")
    print(f"📡 Frontend should connect to: http://localhost:{FLASK_PORT}")
    print(f"🔑 Using HF Token: {HF_TOKEN[:10]}...****" if HF_TOKEN else "⚠️  No HF Token found!")
    app.run(debug=FLASK_DEBUG, host='0.0.0.0', port=FLASK_PORT)
