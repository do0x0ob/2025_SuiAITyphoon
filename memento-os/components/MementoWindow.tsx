import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect, useCallback } from 'react';
import { mintOS } from '@/utils/transactions';

// 模擬用的臨時類型
type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

// NFT 類型常量
const OS_TYPE = '0x0ae688e13bf8361b74153652fc5f95993341fd85a99aa4b6ba727add1e1754f1::memento::OS';

export default function MementoWindow() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [username, setUsername] = useState('');
  const [digest, setDigest] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // 將 checkNFTOwnership 提取出來以便重用
  const checkNFTOwnership = async () => {
    if (!currentAccount) {
      setWalletStatus('disconnected');
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
        setWalletStatus('connected-with-nft');
      } else {
        setWalletStatus('connected-no-nft');
      }
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setWalletStatus('connected-no-nft');
    }
  };

  const handleInitializeOS = async () => {
    if (!currentAccount?.address || !username.trim()) return;

    try {
      setIsMinting(true);
      const tx = await mintOS(username);

      await signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            await checkNFTOwnership(); // 重新檢查 NFT 狀態
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            setIsMinting(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleInitializeOS:', error);
      setIsMinting(false);
    }
  };

  // 定期檢查 NFT 所有權
  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!currentAccount) {
        setWalletStatus('disconnected');
        setIsMinting(false); // 重置 minting 狀態
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
          setWalletStatus('connected-with-nft');
          setIsMinting(false); // 重置 minting 狀態
        } else {
          setWalletStatus('connected-no-nft');
        }
      } catch (error) {
        console.error('Error checking NFT ownership:', error);
        setWalletStatus('connected-no-nft');
        setIsMinting(false); // 重置 minting 狀態
      }
    };

    // 初始檢查
    checkNFTOwnership();

    // 設置定期檢查
    const intervalId = setInterval(checkNFTOwnership, 3000);

    return () => clearInterval(intervalId);
  }, [currentAccount, suiClient]);

  // 添加鍵盤事件監聽
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (walletStatus !== 'connected-no-nft') return;
      
      if (e.key === 'Enter') {
        handleInitializeOS();
        return;
      }
      
      if (e.key === 'Backspace') {
        setUsername(prev => prev.slice(0, -1));
        return;
      }
      
      if (e.key.length === 1) {  // 單個字符
        setUsername(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [walletStatus, username]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMinting) {
        handleCancelMint();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isMinting]);

  // 添加取消 mint 的功能
  const handleCancelMint = () => {
    setIsMinting(false);
    setDigest('');
    setUsername('');
  };

  const handleCreateEvent = () => {
    console.log('Creating new event...', currentAccount?.address);
  };

  const handleCreateMemento = () => {
    console.log('Creating new memento...', currentAccount?.address);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connect Button 區域 - 減少底部 padding */}
      <div className="pt-6 px-4 flex justify-center">
        <ConnectButton 
          style={retroButtonStyles.button} 
          onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
          onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
          connectText="Connect Wallet"
          className="retro-button"
        />
      </div>

      {/* 主要內容區域 - 減少頂部 padding */}
      <div className="flex-1 px-4 pb-4">
        {walletStatus === 'disconnected' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-black/80 mb-8">
              <span>Welcome to Memento OS</span>
              <span className="cursor-blink">_</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please connect your wallet to continue</p>
          </div>
        )}

        {walletStatus === 'connected-no-nft' && (
          <div className="flex flex-col items-center justify-center h-full font-mono">
            {!isMinting ? (
              <>
                <div className="text-lg text-black/80 mb-4">
                  <span>Initializing Memory Space...</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-8">
                  <span>Please identify yourself to continue.</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm text-gray-500">Enter your name:</div>
                  <div className="flex items-center">
                    <span className="text-lg"> {username}</span>
                    <span className={`ml-1 inline-block w-2 h-5 bg-black ${isTyping ? 'animate-pulse' : 'animate-blink'}`}>
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-xs text-gray-400">
                  Press [Enter] to continue
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {!digest ? (
                  <>
                    <div className="text-lg text-black/80">
                      <span>Initializing Memory Space...</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      system {`>`} creating memory space for: {username}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg text-green-600">
                      <span>Memory Space Initialized</span>
                      <span className="cursor-blink">_</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      system {`>`} memory space created for: {username}
                    </div>
                    <div className="text-sm text-gray-500">
                      system {`>`} transaction digest:
                    </div>
                    <div className="text-sm font-mono break-all max-w-md text-gray-600">
                      {digest}
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                      Loading memory space...
                      <span className="cursor-blink">_</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {walletStatus === 'connected-with-nft' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-black/80 mb-2">
              <span>Memory Space Active</span>
              <span className="cursor-blink">_</span>
            </div>
            
            {/* 添加歡迎動畫 */}
            <div className="relative h-80">
              <img
                src="/welcome.gif"
                alt="Welcome Animation"
                className="memento-image w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>

            {/* 將按鈕移到這裡 */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Capture Memory
              </button>
              <button
                onClick={handleCreateMemento}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Create Memento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 