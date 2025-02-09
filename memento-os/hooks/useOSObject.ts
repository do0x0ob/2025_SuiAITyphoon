import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { PACKAGE_ID } from '@/utils/transactions';

const OS_TYPE = `${PACKAGE_ID}::memento::OS`;

export function useOSObject() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [osId, setOsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOSObject = async () => {
      if (!currentAccount) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: OS_TYPE
          },
          options: {
            showType: true,
          }
        });

        if (objects && objects.length > 0) {
          setOsId(objects[0].data?.objectId || null);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch OS object');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOSObject();
  }, [currentAccount, suiClient]);

  return { osId, isLoading, error };
} 