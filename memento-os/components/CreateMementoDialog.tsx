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

  const handleSubmit = () => {
    if (data.name.trim()) {
      onSubmit(data);
      onClose();
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