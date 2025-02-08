import { useState } from 'react';
import { AtomaApiService } from '@/services/atomaApi';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const atomaApi = new AtomaApiService();

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      const response = await atomaApi.createChatCompletion([
        ...messages,
        { role: 'user', content }
      ]);

      if (response.choices[0]?.message) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content },
          response.choices[0].message!
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {isLoading && <div>Loading...</div>}
      {/* 聊天界面 JSX */}
    </div>
  );
} 