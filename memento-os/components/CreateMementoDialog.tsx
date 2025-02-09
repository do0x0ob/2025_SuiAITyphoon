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
      </div>
    </div>
  );
} 