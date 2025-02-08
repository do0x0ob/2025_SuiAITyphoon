import { useState, useEffect } from 'react';

export default function WalrusView() {
  const [blobId, setBlobId] = useState('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleFetch = async () => {
    if (!blobId.trim()) return;


    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }

    setIsLoading(true);
    setError('');
    try {
      const cleanBlobId = blobId.split('/').pop()?.replace('blob:', '') || blobId;
      const response = await fetch(`/api/walrus/blob/${cleanBlobId}`);
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const type = response.headers.get('Content-Type') || 'application/octet-stream';
      setContentType(type);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={blobId}
          onChange={(e) => setBlobId(e.target.value)}
          placeholder="Enter Blob ID"
          className="flex-1 px-3 py-1.5 border border-black/80 bg-white/70 focus:outline-none focus:bg-white/90 transition-colors"
        />
        <button
          onClick={handleFetch}
          disabled={!blobId.trim() || isLoading}
          className="px-4 py-1.5 bg-black/80 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="text-red-500 p-3">{error}</div>
        ) : isLoading ? (
          <div className="p-3">Loading...</div>
        ) : blobUrl ? (
          <img 
            src={blobUrl} 
            alt="Blob content"
            className="max-w-full h-auto"
          />
        ) : (
          <div className="p-3 text-gray-500">
            Enter a blob ID and click Fetch to view content
          </div>
        )}
      </div>
    </div>
  );
} 