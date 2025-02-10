import React from 'react';

const CaptureMomentWindow: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Capture Moment</h2>
      <div className="flex flex-col gap-4">
        {/* 這裡添加 Capture Moment 的內容 */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              className="px-3 py-1.5 border border-black/80 bg-white/70"
              placeholder="Enter moment title"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="px-3 py-1.5 border border-black/80 bg-white/70 h-24"
              placeholder="Describe this moment..."
            />
          </div>
        </div>

        <button
          className="px-4 py-1.5 bg-black/80 text-white hover:bg-black"
        >
          Capture
        </button>
      </div>
    </div>
  );
};

export default CaptureMomentWindow; 