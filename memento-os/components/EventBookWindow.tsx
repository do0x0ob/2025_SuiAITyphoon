import React, { useEffect, useState } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

interface Moment {
  title: string;
  description: string;
  image?: string;
}

interface EventBookWindowProps {
  osId: string;
}

const EventBookWindow: React.FC<EventBookWindowProps> = ({ osId }) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchMoments = async () => {
      if (!currentAccount || !osId) return;

      try {
        // 獲取 OS 對象
        const { data } = await suiClient.getObject({
          id: osId,
          options: { showContent: true }
        });

        if (!data?.content) throw new Error('OS not found');

        // 解析 moments 數組
        const momentsList = (data.content as any).fields.moments;
        
        // 處理每個 moment
        const processedMoments = await Promise.all(
          momentsList.map(async (moment: any) => {
            const processedMoment: Moment = {
              title: moment.fields.title,
              description: moment.fields.description,
            };

            // 如果有 image blob_id，從 Walrus 獲取圖片
            if (moment.fields.image) {
              try {
                const response = await fetch(`/api/walrus/${moment.fields.image}`, {
                  method: 'GET',
                });
                
                if (response.ok) {
                  const imageBlob = await response.blob();
                  processedMoment.image = URL.createObjectURL(imageBlob);
                }
              } catch (error) {
                console.error('Error fetching image:', error);
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Event Book</h2>
      
      {isLoading ? (
        <div className="text-sm font-mono text-black/80">
          {`>`} Loading your moments
          <span className="animate-[blink_1s_infinite]">_</span>
        </div>
      ) : moments.length === 0 ? (
        <div className="text-sm text-gray-500">No moments captured yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {moments.map((moment, index) => (
            <div 
              key={index} 
              className="border border-black/10 p-4 space-y-3 hover:bg-black/5 transition-colors"
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventBookWindow; 