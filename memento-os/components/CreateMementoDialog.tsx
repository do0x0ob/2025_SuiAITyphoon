import { useState } from 'react';
import { useSuiClient, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { PACKAGE_ID, createMemento } from '@/utils/transactions';

interface CreateMementoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MementoData) => void;
  currentAddress?: string;
}

export interface MementoData {
  name: string;          // 必填：人物名稱
  description: string;   // 自由描述
  traits: string[];      // 關鍵特質（可選）
}

// AI Agent 用的資料結構
interface MementoMetadata {
  version: '1.0';
  type: 'memento';
  data: {
    name: string;
    description: string;
    traits: string[];
    createdAt: string;
  };
}

export default function CreateMementoDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  currentAddress 
}: CreateMementoDialogProps) {
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  // 使用 hook 來查詢 OS object
  const { data: osObjects } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAddress || '',
      filter: {
        StructType: `${PACKAGE_ID}::memento::OS`
      },
      options: {
        showType: true,
      }
    },
    {
      enabled: !!currentAddress
    }
  );

  const [data, setData] = useState<MementoData>({
    name: '',
    description: '',
    traits: []
  });

  // 修改 traits 處理方法
  const [traitsInput, setTraitsInput] = useState('');  // 新增狀態來存儲原始輸入

  // 添加狀態管理
  const [status, setStatus] = useState<{
    type: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: ''
  });

  const handleTraitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTraitsInput(value);  // 保存原始輸入

    // 當輸入逗號時，更新 traits 數組
    if (value.includes(',')) {
      const newTraits = value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      setData(prev => ({ ...prev, traits: newTraits }));
    } else {
      setData(prev => ({ ...prev, traits: value ? [value] : [] }));
    }
  };

  const getOSObjectId = async (address: string): Promise<string> => {
    const { data: objects } = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::memento::OS`
      },
      options: {
        showType: true,
      }
    });

    if (!objects || objects.length === 0 || !objects[0].data?.objectId) {
      throw new Error('No OS object found');
    }

    return objects[0].data.objectId;
  };

  const handleSubmit = async () => {
    if (!data.name.trim() || !currentAddress) return;

    try {
      setStatus({
        type: 'uploading',
        message: 'Uploading metadata to Walrus...'
      });

      // 1. 準備 metadata
      const metadata: MementoMetadata = {
        version: '1.0',
        type: 'memento',
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          traits: data.traits.filter(Boolean),
          createdAt: new Date().toISOString(),
        }
      };

      console.log('準備的 metadata:', metadata);

      // 2. 上傳到 Walrus
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      formData.append('data', blob, 'memento.json');
      formData.append('epochs', '100');

      const response = await fetch('/api/walrus', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Walrus 上傳成功:', result);

      // 修改這裡：正確的 blobId 路徑
      const blobId = result.newlyCreated?.blobObject?.blobId;
      if (!blobId) {
        throw new Error('Failed to get blobId from response');
      }
      
      console.log('獲取到的 blobId:', blobId);

      // 3. 獲取 OS object id
      setStatus({
        type: 'uploading',
        message: 'Getting OS object...'
      });

      const osId = await getOSObjectId(currentAddress);
      console.log('獲取到的 OS ID:', osId);

      // 4. 調用 createMemento transaction
      setStatus({
        type: 'uploading',
        message: 'Creating memento on-chain...'
      });

      const tx = await createMemento(osId, data.name.trim(), blobId);
      
      await signAndExecuteTransaction({
        transaction: tx,
        chain: 'sui:testnet'
      }, {
        onSuccess: (result) => {
          console.log('交易成功:', result);
          setStatus({
            type: 'success',
            message: `Memento created successfully! Digest: ${result.digest}`
          });
          
          onSubmit({
            ...data,
            name: data.name.trim(),
            description: data.description.trim(),
            traits: data.traits.filter(Boolean)
          });
        },
        onError: (error) => {
          console.error('交易失敗:', error);
          setStatus({
            type: 'error',
            message: error instanceof Error ? error.message : 'Transaction failed'
          });
        }
      });

    } catch (error) {
      console.error('建立 Memento 失敗:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="p-4 border-black/10">
      <div className="space-y-4">
        {/* 名稱輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Name:</div>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-1.5 border border-black/80 bg-white focus:outline-none"
            placeholder="Enter memento name..."
          />
        </div>

        {/* 描述輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Description:</div>
          <textarea
            value={data.description}
            onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full h-32 px-3 py-1.5 border border-black/80 bg-white focus:outline-none resize-none"
            placeholder="Describe your memento's personality and background..."
          />
        </div>

        {/* 特質輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Traits:</div>
          <input
            type="text"
            value={traitsInput}
            onChange={handleTraitsChange}
            className="w-full px-3 py-1.5 border border-black/80 bg-white focus:outline-none"
            placeholder="friendly, creative, curious..."
          />
        </div>

        {/* 狀態顯示區域 - 移除分隔線效果 */}
        {status.type !== 'idle' && (
          <div className="text-sm">
            <div className="flex items-center gap-2">
              {status.type === 'uploading' && (
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
              )}
              <span className={`${
                status.type === 'uploading' ? 'text-blue-700' :
                status.type === 'success' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {status.message}
              </span>
            </div>
          </div>
        )}

        {/* 按鈕區域 */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!data.name.trim() || status.type === 'uploading'}
            className="px-4 py-1.5 bg-black/80 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.type === 'uploading' ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
} 