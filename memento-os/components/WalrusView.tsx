import { useState, useEffect } from 'react';

export default function WalrusView() {
  const [blobId, setBlobId] = useState('');
  const [response, setResponse] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFetch = async () => {
    if (!blobId.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/walrus/${encodeURIComponent(blobId)}`);
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      // 創建 blob URL 來顯示圖片
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResponse(url);
      setContentType('image/jpeg');  // 或根據實際情況設置
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化十六進制轉儲
  const formatHexDump = (hex: string) => {
    const bytes = hex.split(' ');
    const lines = [];
    const bytesPerLine = 16;

    for (let i = 0; i < bytes.length; i += bytesPerLine) {
      const lineBytes = bytes.slice(i, i + bytesPerLine);
      const address = i.toString(16).padStart(8, '0');
      const hexPart = lineBytes.join(' ').padEnd(bytesPerLine * 3 - 1, ' ');
      const asciiPart = lineBytes
        .map(byte => {
          const code = parseInt(byte, 16);
          return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
        })
        .join('');

      lines.push(`${address}  ${hexPart}  |${asciiPart}|`);
    }

    return lines.join('\n');
  };

  // 清理 blob URL
  const cleanupBlobUrl = () => {
    if (response && contentType && (contentType.includes('image/') || contentType.includes('svga87'))) {
      URL.revokeObjectURL(response);
    }
  };

  // 組件卸載時清理
  useEffect(() => {
    return () => cleanupBlobUrl();
  }, []);

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
          Fetch
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="text-red-500 p-3">{error}</div>
        ) : contentType.includes('image/') ? (
          <img 
            src={response} 
            alt="Blob content"
            className="max-w-full h-auto"
          />
        ) : contentType.includes('svga87') ? (
          <div className="relative w-full h-full">
            <object
              data={response}
              type="image/svg+xml"
              className="w-full h-full"
            >
              SVG not supported
            </object>
          </div>
        ) : (
          <pre className="p-3 bg-black/5 font-mono text-sm whitespace-pre-wrap">
            {response || 'Response will appear here...'}
          </pre>
        )}
      </div>
    </div>
  );
} 