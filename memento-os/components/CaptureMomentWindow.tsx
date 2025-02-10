import React, { useState } from 'react';

const CaptureMomentWindow: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Capture Moment</h2>
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Image (optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="px-3 py-1.5 border border-black/80 bg-white/70"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-6 py-1.5 bg-black/80 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? 'Capturing...' : 'Capture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureMomentWindow; 