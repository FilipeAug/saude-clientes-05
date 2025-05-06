
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionID, setSessionID] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialize session ID from localStorage or create a new one
  useEffect(() => {
    const storedSessionID = localStorage.getItem('chatSessionID');
    if (storedSessionID) {
      setSessionID(storedSessionID);
    } else {
      const newSessionID = uuidv4();
      setSessionID(newSessionID);
      localStorage.setItem('chatSessionID', newSessionID);
    }
    
    // Add initial welcome message
    setMessages([
      {
        id: uuidv4(),
        content: "Olá! Eu sou o assistente de dados. Como posso ajudar?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: uuidv4(),
      content: inputValue,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      console.log("Sending request with sessionID:", sessionID);
      
      // Preparar os parâmetros da URL
      const params = new URLSearchParams({
        message: inputValue,
        sessionID: sessionID
      });
      
      const url = `https://n8n-n8n.p6jvp3.easypanel.host/webhook/lovable?${params.toString()}`;
      console.log("Request URL:", url);
      
      // Fazer solicitação GET
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Get text response first
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Try to parse as JSON, fall back to raw text if needed
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON response:", data);
      } catch (e) {
        console.log("Response is not JSON, using raw text");
        data = { response: responseText };
      }
      
      // Extract bot content from the response
      const botContent = data.response || data.message || responseText;
      
      // Add bot reply to messages
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: botContent,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Error sending message to webhook:", error);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível se comunicar com o servidor. Tente novamente mais tarde.",
        variant: "destructive",
      });
      
      // Add error message
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Desculpe, houve um erro na comunicação. Por favor, tente novamente.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <div className="bg-dashboard-card rounded-lg shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium">Fale com os dados</h3>
        <p className="text-sm text-gray-400">
          Pergunte ao assistente sobre os dados dos clientes
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-dashboard-implementation text-white' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="bg-gray-800 border-gray-700 focus-visible:ring-dashboard-implementation"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-dashboard-implementation hover:bg-indigo-600"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
