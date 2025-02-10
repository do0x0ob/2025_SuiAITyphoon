import { useState, useRef, useEffect } from 'react';
import { useSuiClient, useSuiClientQuery, useCurrentAccount } from '@mysten/dapp-kit';
import { AtomaApiService } from '@/services/atomaApi';
import { SYSTEM_PROMPTS } from '@/constants/prompts';
import { PACKAGE_ID } from '@/utils/transactions';
import { Memento, ChatMessage } from '@/types/index';


export default function PhoneBook() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [mementos, setMementos] = useState<Memento[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const atomaApi = new AtomaApiService();

  // 使用 hook 查詢 OS object
  const { data: osObjects } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address || '',
      filter: {
        StructType: `${PACKAGE_ID}::memento::OS`
      },
      options: {
        showType: true,
        showContent: true,
      }
    },
    {
      enabled: !!currentAccount?.address
    }
  );

  // 當 OS objects 數據更新時獲取 mementos
  useEffect(() => {
    const fetchMementos = async () => {
      if (!osObjects?.data?.length || !osObjects.data[0].data?.objectId) return;

      try {
        const osObject = await suiClient.getObject({
          id: osObjects.data[0].data.objectId,
          options: { showContent: true }
        });

        const mementosField = (osObject.data?.content as { fields?: { mementos: any } })?.fields?.mementos;
        if (mementosField) {
          const mementosData = (mementosField as any).fields?.contents?.fields?.contents || [];
          console.log('Mementos data:', mementosData);

          const formattedMementos = mementosData.map((m: any) => ({
            name: m.fields.name,
            blobId: m.fields.blob_id,
            objectId: m.fields.id.id
          }));

          setMementos(formattedMementos);
        }
      } catch (error) {
        console.error('Error fetching mementos:', error);
      }
    };

    fetchMementos();
  }, [osObjects, suiClient]);

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
        { role: 'system', content: SYSTEM_PROMPTS.PRIME_GENERATOR },
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
    <div className="flex h-full min-w-[800px]">
      {/* 左側 Mementos 展示區域 */}
      <div className="w-50 flex-none border-r border-black/20 p-4">
        <div className="text-sm font-medium mb-2">Mementos</div>
        <div className="space-y-2">
          {mementos.length === 0 ? (
            <div className="text-sm text-gray-500">No mementos found</div>
          ) : (
            mementos.map((memento) => (
              <div 
                key={memento.objectId}
                className="bg-black/5 p-2 rounded text-sm hover:bg-black/10 transition-colors cursor-pointer"
              >
                {memento.name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右側聊天區域 */}
      <div className="flex-1 flex flex-col min-w-[600px]">
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  message.role === 'user' 
                    ? 'bg-black/5'
                    : 'bg-black/5'
                } inline-block max-w-[80%] rounded p-3`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="bg-black/5 inline-block max-w-[80%] rounded p-3">
                <p className="text-sm">Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
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
    </div>
  );
}