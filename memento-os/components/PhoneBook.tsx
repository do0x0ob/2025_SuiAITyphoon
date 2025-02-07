import { useState } from 'react';

const PhoneBook = () => {
  const [message, setMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      // TODO: 整合 AI API
      setAiResponse('這是一個模擬的 AI 回應...');
    } catch (error) {
      console.error('AI Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* AI 回應區域 */}
      <div className="flex-1 p-4 mb-4 border border-black/20 bg-white/50 overflow-auto">
        {isLoading ? (
          <div className="text-gray-600">AI 思考中...</div>
        ) : (
          aiResponse && <div className="text-gray-800">{aiResponse}</div>
        )}
      </div>

      {/* 輸入區域 */}
      <div className="flex gap-2 p-4 pt-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Input your message here..."
          className="flex-1 px-3 py-2 border border-gray-800 bg-white/70 font-mono text-sm"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-white/70 border border-gray-800 hover:bg-white/90 font-mono text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PhoneBook;