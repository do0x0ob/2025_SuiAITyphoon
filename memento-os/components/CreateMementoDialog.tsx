import { useState } from 'react';

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

export default function CreateMementoDialog({ isOpen, onClose, onSubmit }: CreateMementoDialogProps) {
  const [data, setData] = useState<MementoData>({
    name: '',
    description: '',
    traits: []
  });

  // 修改 traits 處理方法
  const [traitsInput, setTraitsInput] = useState('');  // 新增狀態來存儲原始輸入

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

  const handleSubmit = async () => {
    if (!data.name.trim()) return;

    try {
      console.log('開始建立 Memento...');
      
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

      // 2. 轉換為 Buffer
      const metadataString = JSON.stringify(metadata, null, 2);
      const metadataBuffer = Buffer.from(metadataString, 'utf-8');

      // 3. 上傳到 Walrus
      const formData = new FormData();
      const blob = new Blob([metadataBuffer], { type: 'application/json' });
      formData.append('data', blob, 'memento.json');
      formData.append('epochs', '100');

      console.log('開始上傳到 Walrus...');
      
      const response = await fetch('/api/walrus', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Walrus 上傳成功:', result);

      // 4. 調用 onSubmit 並關閉對話框
      onSubmit({
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        traits: data.traits.filter(Boolean)
      });
      
      onClose();
    } catch (error) {
      console.error('建立 Memento 失敗:', error);
      // TODO: 添加錯誤提示 UI
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

        {/* 特質輸入 - 修改後的版本 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">Traits (separate with comma):</div>
          <input
            type="text"
            value={traitsInput}  // 使用 traitsInput 而不是 traits.join(',')
            onChange={handleTraitsChange}
            className="w-full px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90"
            placeholder="friendly, creative, curious..."
          />
        </div>

        {/* 只保留 Create 按鈕 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={!data.name.trim()}
            className="px-4 py-1.5 bg-black text-white hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
} 