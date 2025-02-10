import { useState } from 'react';
import { useOSObject } from '@/hooks/useOSObject';
import { uploadToWalrus } from '@/utils/walrus';
import { createMemento } from '@/utils/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

interface CreateMementoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MementoData) => void;
}

export interface MementoData {
  name: string;          // 必填：人物名稱
  description: string;   // 自由描述
  traits: string[];      // 關鍵特質（可選）
}

export default function CreateMementoDialog({ isOpen, onClose, onSubmit }: CreateMementoDialogProps) {
  const [data, setData] = useState<MementoData>({
    name: '',
    description: '',
    traits: []
  });
  const [status, setStatus] = useState<'idle' | 'uploading' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { osId, isLoading: isLoadingOS } = useOSObject();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleSubmit = async () => {
    if (!data.name.trim() || !osId) return;

    try {
      // 開始上傳到 Walrus
      setStatus('uploading');
      let blobId;
      try {
        const result = await uploadToWalrus(data);
        blobId = result.blobId;
        if (!blobId) {
          throw new Error('Failed to get blobId from Walrus');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to upload to Walrus');
        return; // 提早返回，不繼續執行後續操作
      }

      // 準備建立 Memento
      setStatus('creating');
      const tx = await createMemento(osId, data.name, blobId);

      await signAndExecute({
        transaction: tx as any,
        chain: 'sui:testnet',
      }, {
        onSuccess: () => {
          setStatus('success');
          setTimeout(() => {
            onClose();
            onSubmit(data);
          }, 2000);
        },
        onError: (error) => {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Transaction failed');
        }
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // 添加狀態顯示 UI
  const renderStatus = () => {
    switch (status) {
      case 'uploading':
        return <div className="text-sm text-gray-600">正在上傳數據...</div>;
      case 'creating':
        return <div className="text-sm text-gray-600">正在創建 Memento...</div>;
      case 'success':
        return <div className="text-sm text-green-600">Memento 創建成功！</div>;
      case 'error':
        return <div className="text-sm text-red-600">錯誤：{errorMessage}</div>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="p-4 font-mono">
      <div className="space-y-4">
        {/* 名稱輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Name:</div>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90"
            placeholder="Enter memento name..."
          />
        </div>

        {/* 描述輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Description:</div>
          <textarea
            value={data.description}
            onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full h-32 px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90 resize-none"
            placeholder="Describe your memento's personality and background..."
          />
        </div>

        {/* 特質輸入 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Traits (comma separated):</div>
          <input
            type="text"
            value={data.traits.join(', ')}
            onChange={(e) => setData(prev => ({ 
              ...prev, 
              traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            }))}
            className="w-full px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90"
            placeholder="friendly, creative, curious..."
          />
        </div>

        {/* 按鈕 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-black hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!data.name.trim()}
            className="px-4 py-1.5 bg-black text-white hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>

        {/* 狀態顯示 */}
        {renderStatus()}
      </div>
    </div>
  );
} 