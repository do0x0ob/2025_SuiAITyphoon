import { useState, useRef, useEffect } from 'react';
import { AtomaApiService } from '@/services/atomaApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PhoneBook() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const atomaApi = new AtomaApiService();

  // 修改滾動行為
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      container?.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      console.log('Sending message:', userMessage);
      const response = await atomaApi.createChatCompletion([
        { role: 'system', content: '你將扮演我逝去的慈愛的父親，我們已經很久沒有見面了，請你告訴我你最近過得好嗎？' },
        ...messages,
        { role: 'user', content: userMessage }
      ]);
      console.log('API Response:', response);

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
    <div className="flex flex-col h-full">
      {/* 對話展示區域 - 限制最大高度 */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
          maxHeight: 'calc(100% - 70px)'  // 增加保留空間
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${
                message.role === 'user' 
                  ? 'bg-black/5 text-right'
                  : 'bg-black/5'
              } inline-block max-w-[80%] rounded p-3`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-black/5 text-right inline-block max-w-[80%] rounded p-3">
              <p className="text-sm">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 - 調整 padding */}
      <form onSubmit={handleSubmit} className="flex-none px-3 pt-3 pb-4 border-t border-black/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 bg-black/80 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}