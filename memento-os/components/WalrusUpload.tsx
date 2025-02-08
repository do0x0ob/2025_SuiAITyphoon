import { useState } from 'react';

export default function WalrusUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('data', file);
      formData.append('epochs', '1');

      const response = await fetch('/api/walrus', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setResponse(result.newlyCreated.blobObject.blobId);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="flex-1 px-3 py-1.5 border border-black/80 bg-white/70"
        />
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="px-4 py-1.5 bg-black/80 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Upload
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="p-3 bg-black/5 font-mono text-sm whitespace-pre-wrap">
          {response || 'Response will appear here...'}
        </pre>
      </div>
    </div>
  );
} 