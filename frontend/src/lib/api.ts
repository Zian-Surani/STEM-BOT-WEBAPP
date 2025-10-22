/**
 * API integration layer for STEM Bot
 * Handles communication with the Streamlit backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface ChatRequest {
  question: string;
  subject: 'sci' | 'cal' | 'socio';
  mode: 'mcq' | 'short' | 'long';
  temperature?: number;
  topK?: number;
  files?: File[];
  options?: string[];
  context?: string;
}

export interface ChatResponse {
  answer: string;
  timestamp: string;
  metadata?: {
    model?: string;
    processingTime?: number;
  };
}

/**
 * Send a chat message to the backend
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const formData = new FormData();
    formData.append('question', request.question);
    formData.append('subject', request.subject);
    formData.append('mode', request.mode);
    
    if (request.temperature !== undefined) {
      formData.append('temperature', request.temperature.toString());
    }
    
    if (request.topK !== undefined) {
      formData.append('top_k', request.topK.toString());
    }

    if (request.context) {
      formData.append('context', request.context);
    }

    if (request.options && request.options.length > 0) {
      formData.append('options', JSON.stringify(request.options));
    }

    // Append files if present
    if (request.files && request.files.length > 0) {
      request.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
    }

    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      answer: data.answer || 'No response received',
      timestamp: new Date().toISOString(),
      metadata: data.metadata,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Extract text from uploaded PDF/Image using OCR
 */
export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BACKEND_URL}/api/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
