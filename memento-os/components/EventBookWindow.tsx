import React, { useEffect, useState } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

interface Moment {
  title: string;
  description: string;
  image?: string;
  blobId?: string;
}

interface EventBookWindowProps {
  osId: string;
  onOpenImageView?: (image: string, title: string) => void;
}

const EventBookWindow: React.FC<EventBookWindowProps> = ({ osId, onOpenImageView }) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [copyTipIndex, setCopyTipIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchMoments = async () => {
      if (!currentAccount || !osId) return;

      try {
        const { data } = await suiClient.getObject({
          id: osId,
          options: { showContent: true }
        });

        if (!data?.content) throw new Error('OS not found');

        const momentsList = (data.content as any).fields.moments;
        
        const processedMoments = await Promise.all(
          momentsList.map(async (moment: any) => {
            const processedMoment: Moment = {
              title: moment.fields.title,
              description: moment.fields.description,
              blobId: moment.fields.image,
            };

            if (moment.fields.image) {
              try {
                const imageUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${moment.fields.image}`;
                processedMoment.image = imageUrl;
              } catch (error) {
                console.error('Error setting image URL:', error);
              }
            }

            return processedMoment;
          })
        );

        setMoments(processedMoments);
      } catch (error) {
        console.error('Error fetching moments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoments();
  }, [currentAccount, osId, suiClient]);

  const handleCopy = (index: number, title: string, description: string) => {
    navigator.clipboard.writeText(`${title}\n\n${description}`);
    setCopyTipIndex(index);
    setTimeout(() => setCopyTipIndex(null), 2000);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-medium mb-4">Event Book</h2>
      
      {isLoading ? (
        <div className="text-sm font-mono text-black/80">
          {`>`} Loading your moments
          <span className="animate-[blink_1s_infinite]">_</span>
        </div>
      ) : moments.length === 0 ? (
        <div className="text-sm text-gray-500">No moments captured yet.</div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4">
            {moments.map((moment, index) => (
              <div 
                key={index} 
                className={`border border-black/10 p-4 space-y-3 relative ${
                  moment.blobId 
                    ? 'hover:bg-black/5 transition-colors cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (moment.blobId && moment.image && onOpenImageView) {
                    onOpenImageView(moment.image, moment.title);
                  }
                }}
              >
                {moment.image && (
                  <div className="aspect-video relative overflow-hidden bg-black/5">
                    <img
                      src={moment.image}
                      alt={moment.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{moment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{moment.description}</p>
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(index, moment.title, moment.description);
                      }}
                      className="text-xs text-black/60 hover:text-black/80 p-1"
                      title="Copy text"
                    >
                      📋
                    </button>
                    {copyTipIndex === index && (
                      <div className="absolute bottom-full right-0 mb-1 px-2 py-1 text-xs bg-black/80 text-white rounded">
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBookWindow; 