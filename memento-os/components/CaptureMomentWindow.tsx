import React, { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { createMoment } from '@/utils/transactions';

interface CaptureMomentWindowProps {
  osId: string;
}

const CaptureMomentWindow: React.FC<CaptureMomentWindowProps> = ({ osId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'creating' | 'done'>('idle');
  const [txDigest, setTxDigest] = useState<string>('');
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('Selected file:', selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCapture = async () => {
    if (!currentAccount) {
      console.error('No wallet connected');
      return;
    }

    if (!title.trim()) {
      console.error('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      let blobId: string | undefined;

      // 如果有上傳圖片，先上傳到 Walrus
      if (file) {
        console.log('Uploading file to Walrus...');
        setStatus('uploading');
        
        const formData = new FormData();
        formData.append('data', file);
        formData.append('epochs', '100');

        const response = await fetch('/api/walrus', {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
        
        if (!blobId) {
          console.error('Unexpected response structure:', result);
          throw new Error('Failed to get blob ID from response');
        }
        
        console.log('File uploaded successfully, blob_id:', blobId);
      }

      // 調用合約
      console.log('Creating moment with params:', {
        osId,
        title,
        description,
        date,
        blobId,
      });
      
      setStatus('creating');
      const tx = await createMoment(
        osId,
        title,
        description,
        date,
        blobId
      );

      console.log('Transaction built:', tx);
      
      try {
        await signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: (result) => {
              console.log('Transaction successful:', result);
              setTxDigest(result.digest);
              setStatus('done');
              
              // 清空表單
              setTitle('');
              setDescription('');
              setDate('');
              setFile(null);
            },
            onError: (error) => {
              console.error('Transaction failed:', error);
              setStatus('idle');
              throw error;
            }
          }
        );
      } catch (error) {
        console.error('Error creating moment:', error);
        setStatus('idle');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating moment:', error);
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Capture Your Moment</h2>
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 border border-black/80 bg-white/70 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Give your moment a title"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 border border-black/80 bg-white/70 h-24 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="What's special about this moment?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-black/80 bg-white/70 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="When did this moment happen?"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Capture Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="px-3 py-2 border border-black/80 bg-white/70 focus:outline-none focus:ring-2 focus:ring-black/20"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-mono">
            {status === 'uploading' && (
              <span className="text-black/80">
                {`>`} Crystallizing this moment in time
                <span className="animate-[blink_1s_infinite]">_</span>
              </span>
            )}
            {status === 'creating' && (
              <span className="text-black/80">
                {`>`} Creating your moment
                <span className="animate-[blink_1s_infinite]">_</span>
              </span>
            )}
            {status === 'done' && (
              <div className="flex flex-col gap-1">
                <span className="text-green-600">
                  {`>`} Moment captured successfully
                  <span className="animate-[blink_1s_infinite]">_</span>
                </span>
                <a 
                  href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-700 underline ml-4"
                >
                  view on explorer
                </a>
              </div>
            )}
          </div>
          <button
            onClick={handleCapture}
            disabled={!title.trim() || isLoading}
            className="px-6 py-2 bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span>Processing</span>
                <span className="animate-pulse">...</span>
              </span>
            ) : (
              'Capture'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureMomentWindow; 