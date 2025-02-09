import { ConnectButton, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect } from 'react';

// 模擬用的臨時類型
type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

// NFT 類型常量
const OS_TYPE = '0x6d12afb8e563ba48b4a6e91a44c7d53752c25965e98ce00e332e3f7ef43243be::memento::OS';

export default function MementoWindow() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');

  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!currentAccount) {
        setWalletStatus('disconnected');
        return;
      }

      try {
        // 查詢用戶擁有的指定類型的對象
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: OS_TYPE
          },
          options: {
            showType: true,
          }
        });

        // 如果找到至少一個對象，表示用戶擁有 NFT
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

    checkNFTOwnership();
  }, [currentAccount, suiClient]);

  const handleInitializeOS = () => {
    console.log('Initializing OS...', currentAccount?.address);
  };

  const handleCreateEvent = () => {
    console.log('Creating new event...', currentAccount?.address);
  };

  const handleCreateMemento = () => {
    console.log('Creating new memento...', currentAccount?.address);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connect Button 區域 - 始終顯示在頂部 */}
      <div className="p-4 flex justify-center">
        <ConnectButton 
          style={retroButtonStyles.button} 
          onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
          onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
          connectText="Connect Wallet"
          className="retro-button"
        />
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 p-4">
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
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-black/80 mb-8">
              <span>Initialize Your Digital Memory Space</span>
              <span className="cursor-blink">_</span>
            </div>
            <button
              onClick={handleInitializeOS}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Create Your Memory Space
            </button>
          </div>
        )}

        {walletStatus === 'connected-with-nft' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-black/80 mb-8">
              <span>Memory Space Active</span>
              <span className="cursor-blink">_</span>
            </div>
          </div>
        )}
      </div>

      {/* 底部按鈕區域 - 只在有 NFT 時顯示 */}
      {walletStatus === 'connected-with-nft' && (
        <div className="p-8 flex justify-center gap-4">
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
      )}
    </div>
  );
} 