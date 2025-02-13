import { useState, useCallback } from 'react';
import { AtomaApiService } from '@/services/atomaApi';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const atomaApi = new AtomaApiService();

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setValue] = useState('');

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const userMessage: ChatMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      const response = await atomaApi.createChatCompletion([
        ...messages,
        userMessage
      ]);

      if (response.choices[0]?.message) {
        setMessages(prev => [...prev, response.choices[0].message!]);
        setValue('');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`max-w-[80%] p-3 rounded ${
              message.role === 'user' 
                ? 'bg-black/10 ml-auto' 
                : 'bg-white/50'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-gray-500">
            Thinking...
          </div>
        )}
        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-black/10 p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-black/20 rounded-sm focus:outline-none focus:border-black/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}