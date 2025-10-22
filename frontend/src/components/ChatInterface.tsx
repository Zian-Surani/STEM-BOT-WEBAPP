import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { Send, RotateCcw, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendChatMessage } from "@/lib/api";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  subject: string;
  mode: string;
  temperature: number;
  topK: number;
}

/**
 * Standalone chat interface component
 * Handles message display and user input
 */
export const ChatInterface = ({ subject, mode, temperature, topK }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your ${subject === 'sci' ? 'Science' : subject === 'cal' ? 'Math' : 'Social Science'} assistant. How can I help you today?`,
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      
      if (isPDF || isImage) {
        validFiles.push(file);
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PDF or image file.`,
          variant: "destructive",
        });
      }
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) added successfully.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    let messageText = inputMessage;
    if (uploadedFiles.length > 0) {
      const fileList = uploadedFiles.map(f => `📎 ${f.name}`).join(', ');
      messageText = `${inputMessage}\n\nAttached: ${fileList}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText || "Processing uploaded files...",
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    const currentFiles = [...uploadedFiles];
    setInputMessage("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Prepare form data for backend
      const formData = new FormData();
      formData.append('question', currentInput);
      formData.append('subject', subject);
      formData.append('mode', mode);
      formData.append('temperature', temperature.toString());
      formData.append('top_k', topK.toString());

      // Add files if present
      currentFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      // Send to backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || "I processed your request. Here's the response based on your question.",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Fallback response if backend is not available
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand your question about "${currentInput}". ${currentFiles.length > 0 ? `I've noted your ${currentFiles.length} uploaded file(s). ` : ''}This is a ${mode} response for ${subject === 'sci' ? 'science' : subject === 'cal' ? 'math' : 'social science'}. (Note: Backend connection failed - showing demo response)`,
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        text: `Hello! I'm your ${subject === 'sci' ? 'Science' : subject === 'cal' ? 'Math' : 'Social Science'} assistant. How can I help you today?`,
        isBot: true,
        timestamp: new Date(),
      }
    ]);
    setUploadedFiles([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isBot={message.isBot}
            timestamp={message.timestamp}
          />
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shadow-md">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="glass-medium border border-glass-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-glass-border p-4">
        {/* File Upload Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-light border border-glass-border rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
              >
                {file.type === 'application/pdf' ? (
                  <FileText className="h-4 w-4 text-accent" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-accent" />
                )}
                <span className="text-secondary max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your subject..."
              className="glass-light border-glass-border resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              variant="glass-secondary"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10"
              title="Upload PDF or Image"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="glass-secondary"
              size="icon"
              onClick={handleNewChat}
              className="h-10 w-10"
              title="New Chat"
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="hero"
              size="icon"
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && uploadedFiles.length === 0) || isLoading}
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-muted mt-2 px-1">
          Press Enter to send • Shift+Enter for new line • Upload PDFs & Images
        </p>
      </div>
    </div>
  );
};