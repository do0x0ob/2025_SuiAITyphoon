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
  const [selectedMemento, setSelectedMemento] = useState<Memento | null>(null);
  const [characterPrompt, setCharacterPrompt] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState('');

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
      if (!osObjects?.data?.length || !osObjects.data[0].data?.objectId) {
        console.log('No OS objects found:', osObjects);
        return;
      }

      try {
        const osObject = await suiClient.getObject({
          id: osObjects.data[0].data.objectId,
          options: { showContent: true }
        });
        
        console.log('OS object:', osObject);

        const mementosField = (osObject.data?.content as { fields?: { mementos: any[] } })?.fields?.mementos;
        console.log('Mementos field:', mementosField);

        if (mementosField && Array.isArray(mementosField)) {
          const formattedMementos = mementosField.map((m: any, index) => ({
            name: m.fields?.name || 'Unnamed',
            blobId: m.fields?.blob_id || '',
            objectId: `${m.fields?.blob_id}-${index}` // 使用 blob_id 和索引組合作為唯一標識
          }));
          
          console.log('Formatted mementos:', formattedMementos);
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
    console.log('提交檢查:', {
      hasInput: !!input.trim(),
      isLoading,
      hasSelectedMemento: !!selectedMemento,
      hasCharacterPrompt: !!characterPrompt
    });

    if (!input.trim() || isLoading || !selectedMemento || !characterPrompt) {
      console.log('提交被阻止，條件不滿足');
      return;
    }

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      console.log('開始發送消息:', {
        characterPrompt,
        userMessage,
        messagesCount: messages.length
      });

      const response = await atomaApi.createChatCompletion([
        { role: 'system', content: characterPrompt },
        ...messages,
        { role: 'user', content: userMessage }
      ]);
      
      console.log('收到 API 響應:', response);

      if (response.choices[0]?.message) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: response.choices[0].message!.content }
        ]);
        console.log('消息已更新到對話中');
      }
    } catch (error) {
      console.error('發送消息失敗:', error);
    } finally {
      setIsLoading(false);
      console.log('發送狀態已重置');
    }
  };

  const handleMementoSelect = async (memento: Memento) => {
    console.log('開始選擇 Memento:', {
      name: memento.name,
      blobId: memento.blobId,
      objectId: memento.objectId
    });
    
    setSelectedMemento(memento);
    setMessages([]);
    setIsInitializing(true);
    setInitMessage('Accessing Memory Banks_');
    
    try {
      console.log('準備請求 Walrus blob 數據...');
      const cleanBlobId = memento.blobId.split('/').pop()?.replace('blob:', '') || memento.blobId;
      const response = await fetch(`/api/walrus/blob/${cleanBlobId}`);
      
      console.log('Walrus 響應狀態:', response.status);
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const content = await response.text();
      console.log('原始 Walrus 內容:', content);
      
      try {
        const characterData = JSON.parse(content);
        console.log('解析後的完整數據結構:', characterData);
        
        const prompt = SYSTEM_PROMPTS.CHARACTER_TEMPLATE(
          characterData.data.name,
          characterData.data.description,
          characterData.data.traits
        );

        console.log('生成的角色提示:', prompt);
        setCharacterPrompt(prompt);
        setInitMessage('Memory Core Connected_');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('JSON 解析或處理失敗:', error);
        setCharacterPrompt('');
        setInitMessage('Memory Access Failed_');
      }
    } catch (error) {
      console.error('獲取 Walrus 數據失敗:', error);
      setCharacterPrompt('');
      setInitMessage('Connection Failed_');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex h-full min-w-[800px]">
      {/* 左側 Mementos 展示區域 */}
      <div className="w-50 flex-none border-r border-black/20 p-4">
        <div className="text-sm font-bold text-black mb-2 text-center">Mementos</div>
        <div className="space-y-2">
          {mementos.length === 0 ? (
            <div className="text-xs text-gray-500">No mementos found</div>
          ) : (
            mementos.map((memento) => (
              <div 
                key={memento.objectId}
                className="p-2 text-xs text-gray-600 cursor-pointer group flex items-center gap-2"
                onClick={() => {
                  console.log('Selected Memento:', {
                    name: memento.name,
                    blobId: memento.blobId,
                    objectId: memento.objectId
                  });
                  handleMementoSelect(memento);
                }}
              >
                <span className={`${
                  selectedMemento?.objectId === memento.objectId 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                }`}>*</span>
                <span>{memento.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右側聊天區域 */}
      <div className="flex-1 flex flex-col min-w-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent">
          {isInitializing ? (
            <div className="flex items-center justify-center h-full">
              <span className="font-mono text-lg">
                {initMessage}
                <span className="animate-pulse">█</span>
              </span>
            </div>
          ) : (
            <>
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
                    <p className="text-sm">Sending...</p>
                  </div>
                </div>
              )}
            </>
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
              disabled={isInitializing}
            />
            <button
              type="submit"
              disabled={!selectedMemento || isLoading || isInitializing}
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