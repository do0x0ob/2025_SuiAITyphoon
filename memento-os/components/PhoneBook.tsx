import { useState } from 'react';
import { AtomaApiService } from '@/services/atomaApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PhoneBook() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const atomaApi = new AtomaApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      const response = await atomaApi.createConfidentialChatCompletion([
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messages,
        { role: 'user', content: userMessage }
      ]);

      if (response.choices[0]?.message) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: response.choices[0].message!.content }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100%-24px)]">
      {/* 對話展示區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.role === 'user' ? 'ml-auto bg-black/5' : 'mr-auto bg-black/5'
            } max-w-[80%] rounded p-3`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-black/5 max-w-[80%] rounded p-3">
            <p className="text-sm">Typing...</p>
          </div>
        )}
      </div>

      {/* 輸入區域 */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-1.5 border border-black/80 rounded focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 bg-black text-white rounded hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}