import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect, useCallback } from 'react';
import { mintOS } from '@/utils/transactions';
import CreateMementoDialog from './CreateMementoDialog';
import { WindowName } from '@/types';

// 模擬用的臨時類型
type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

// NFT 類型常量
const OS_TYPE = '0x0ae688e13bf8361b74153652fc5f95993341fd85a99aa4b6ba727add1e1754f1::memento::OS';

interface MementoWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  onCreateMemento: () => void;
}

export default function MementoWindow({ onDragStart, onCreateMemento }: MementoWindowProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [username, setUsername] = useState('');
  const [digest, setDigest] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [welcomeGifUrl, setWelcomeGifUrl] = useState<string>('');
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [gifError, setGifError] = useState<string>('');
  const [isCreateMementoOpen, setIsCreateMementoOpen] = useState(false);
  
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

  // 處理 Memento 創建
  const handleCreateMemento = useCallback((data: MementoData) => {
    console.log('Creating memento with data:', data);
    // TODO: 處理 memento 創建邏輯
  }, []);

  // 添加獲取 GIF 的 useEffect
  useEffect(() => {
    const fetchWelcomeGif = async () => {
      setIsGifLoading(true);
      setGifError('');
      
      try {
        const blobId = '6Ci8-LwW5w0rZ4f3FATjJm3-1YyApJL1eTfUGuZITLw';
        const response = await fetch(`/api/walrus/blob/${blobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load animation');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setWelcomeGifUrl(url);
      } catch (err) {
        console.error('Error loading welcome animation:', err);
        setGifError('Failed to load welcome animation');
      } finally {
        setIsGifLoading(false);
      }
    };

    fetchWelcomeGif();

    // 清理函數
    return () => {
      if (welcomeGifUrl) {
        URL.revokeObjectURL(welcomeGifUrl);
      }
    };
  }, []);

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
            
            <div className="relative h-80">
              {gifError ? (
                <div className="text-red-500 text-sm">{gifError}</div>
              ) : isGifLoading ? (
                <div className="text-gray-500">Loading welcome animation...</div>
              ) : welcomeGifUrl ? (
                <img
                  src={welcomeGifUrl}
                  alt="Welcome Animation"
                  className="memento-image w-full h-full object-contain border-black"
                />
              ) : null}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Capture Memory
              </button>
              <button
                onClick={onCreateMemento}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Create Memento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 添加 Dialog 組件 */}
      <CreateMementoDialog
        isOpen={isCreateMementoOpen}
        onClose={() => setIsCreateMementoOpen(false)}
        onSubmit={handleCreateMemento}
      />
    </div>
  );
}

// 添加類型定義（如果還沒有的話）
interface MementoData {
  name: string;
  description: string;
  traits: string[];
} 