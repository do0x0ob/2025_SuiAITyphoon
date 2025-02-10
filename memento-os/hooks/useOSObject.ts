import { useEffect, useState, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

const OS_TYPE = `${PACKAGE_ID}::memento::OS`;

export function useOSObject() {
  const [osId, setOsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const fetchOSObject = useCallback(async () => {
    if (!currentAccount) {
      setOsId(null);
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

      setOsId(objects && objects.length > 0 ? objects[0].data?.objectId || null : null);
    } catch (error) {
      console.error('Error fetching OS object:', error);
      setOsId(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount?.address, suiClient]);

  useEffect(() => {
    fetchOSObject();
  }, [fetchOSObject]);

  return { osId, isLoading, refetch: fetchOSObject };
} 