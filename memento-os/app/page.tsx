'use client';

import { useState, useEffect } from 'react';
import type { WindowName } from '../types';
import '@mysten/dapp-kit/dist/index.css';
import dynamic from 'next/dynamic';
import Window from '@/components/Window';
import Header from '@/components/Header';
import PhoneBook from '@/components/PhoneBook';
import WalrusUpload from '@/components/WalrusUpload';
import WalrusView from '@/components/WalrusView';
import AboutContent from '@/components/AboutContent';
import MementoWindow from '@/components/MementoWindow';
import CreateMementoDialog, { MementoData } from '@/components/CreateMementoDialog';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import CaptureMomentWindow from '@/components/CaptureMomentWindow';

// 動態加載僅在客戶端渲染的組件
const DesktopIcon = dynamic(() => import('@/components/DesktopIcon'), {
  ssr: false,
});

const defaultWindowSizes = {
  memento: { width: 500, height: 600 },
  phonebook: { width: 900, height: 600 },
  eventbook: { width: 400, height: 600 },
  about: { width: 540, height: 800 },
  help: { width: 500, height: 400 },
  walrusupload: { width: 540, height: 400 },
  walrusview: { width: 365, height: 446 },
  'memento-create': { width: 480, height: 520 },
  'capture-moment': { width: 480, height: 520 },
};

interface WindowState {
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
}

export default function Home() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  // 計算視窗中心位置的函數
  const getCenterPosition = (width: number, height: number) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    return {
      x: Math.round((window.innerWidth - width) / 2),
      y: Math.round((window.innerHeight - height) / 2) - 60,
    };
  };

  const mementoSize = { width: 600, height: 600 };
  const defaultSize = { width: 500, height: 400 };
  const aboutSize = { width: 540, height: 700 };

  const [openWindows, setOpenWindows] = useState<WindowName[]>(['memento']);
  const [activeWindow, setActiveWindow] = useState<WindowName | null>('memento');
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [windowPositions, setWindowPositions] = useState({
    memento: { x: 0, y: 0 },
    phonebook: { x: 150, y: 150 },
    eventbook: { x: 200, y: 200 },
    about: { x: 300, y: 100 },
    help: { x: 300, y: 300 },
    walrusupload: { x: 350, y: 350 },
    walrusview: { x: 400, y: 400 },
    'memento-create': { x: 250, y: 250 },
    'capture-moment': { x: 250, y: 250 },
  });
  const [windowSizes, setWindowSizes] = useState(defaultWindowSizes);
  const [isCreateMementoOpen, setIsCreateMementoOpen] = useState(false);
  const [windows, setWindows] = useState<Record<string, WindowState>>({});

  // 使用 useEffect 來設置 Memento 窗口的初始位置
  useEffect(() => {
    const centerPosition = getCenterPosition(mementoSize.width, mementoSize.height);
    setWindowPositions(prev => ({
      ...prev,
      memento: centerPosition,
    }));
  }, []); // 只在組件掛載時執行一次

  // 新增：處理窗口激活的函數
  const handleWindowActivate = (name: WindowName) => {
    setActiveWindow(name);
    setOpenWindows(prev => [...prev.filter(w => w !== name), name]);
  };

  // 修改打開窗口的處理函數
  const handleOpenWindow = (name: WindowName) => {
    // 先添加到打開列表中（如果還沒打開）
    if (!openWindows.includes(name)) {
      setOpenWindows(current => [...current, name]);
    }

    // 無論如何都要激活窗口
    handleWindowActivate(name);
    
    // 如果是 Memento 窗口，設置中心位置
    if (name === 'memento') {
      const centerPosition = getCenterPosition(mementoSize.width, mementoSize.height);
      setWindowPositions(prev => ({
        ...prev,
        memento: centerPosition,
      }));
    }
  };

  // 修改關閉窗口的處理函數
  const handleCloseWindow = (name: WindowName) => {
    setOpenWindows(prev => prev.filter(w => w !== name));
    if (activeWindow === name) {
      setActiveWindow(null);
    }
  };

  // 簡單的 Connect Wallet 功能
  const connectWallet = () => {
    console.log("Wallet connected!"); 
    alert("Wallet connected!");
  };

  // 修改拖動開始的處理函數
  const handleDragStart = (e: React.MouseEvent<Element>, windowName: string) => {
    e.preventDefault();
    handleWindowActivate(windowName as WindowName);
    setDraggingWindow(windowName as WindowName);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = windowSizes[windowName as WindowName].width;
      const windowHeight = windowSizes[windowName as WindowName].height;
      
      // 修改這裡：使用 document.documentElement.clientWidth 而不是 window.innerWidth
      const maxX = document.documentElement.clientWidth - windowWidth;
      const maxY = document.documentElement.clientHeight - windowHeight - 48; // 減去 header 高度
      
      const newX = Math.max(0, Math.min(e.clientX - offsetX, maxX));
      const newY = Math.max(0, Math.min(e.clientY - offsetY, maxY));
      
      setWindowPositions(prev => ({...prev, [windowName as WindowName]: { x: newX, y: newY }}));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
      setDraggingWindow(null);
      document.removeEventListener('mousemove', handleMouseMove);
    });
  };

  // 處理窗口縮放
  const handleResize = (e: React.MouseEvent, name: WindowName) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSizes[name].width;
    const startHeight = windowSizes[name].height;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setWindowSizes(prev => ({
        ...prev,
        [name]: {
          width: Math.max(200, startWidth + (e.clientX - startX)),
          height: Math.max(100, startHeight + (e.clientY - startY)),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 處理 Memento 創建
  const handleCreateMemento = (data: MementoData) => {
    console.log('Creating memento with data:', data);
    setIsCreateMementoOpen(false);
  };

  return (
    <>
      <Header />
      <div 
        className="relative w-full h-screen overflow-hidden pt-6 pb-6"
      >
        {/* 基礎背景 - 更淺的粉色 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: '#FFF5F5',
          }}
        />

        {/* 漸層效果 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(rgba(255, 228, 230, 0.4), rgba(255, 228, 230, 0.4))',
          }}
        />

        {/* 主要顆粒效果 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/grain.svg")',
            backgroundRepeat: 'repeat',
            backgroundSize: '120px 120px',
            opacity: 0.7,
            mixBlendMode: 'soft-light',
          }}
        />

        {/* 第二層顆粒效果 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/grain.svg")',
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px',
            opacity: 0.4,
            mixBlendMode: 'multiply',
          }}
        />

        {/* 主要內容容器 */}
        <div className="relative w-full h-full z-10">
          {/* 左側面板 */}
          <div 
            className="fixed left-0 top-6 bottom-0 w-16 bg-white/20 backdrop-blur-sm border-r border-black z-50 pointer-events-none"
            style={{ backgroundColor: 'rgba(255, 252, 250, 0.3)' }}
          >
            {/* 上方圖標 */}
            <div className="flex flex-col items-center gap-4 pt-4 pointer-events-auto">
              <DesktopIcon
                label="Memento"
                onClick={() => handleOpenWindow('memento')}
                icon="🎨"
              />
              <DesktopIcon
                label="Phone Book"
                onClick={() => handleOpenWindow("phonebook")}
                icon="📞"
              />
              <DesktopIcon
                label="Event Book"
                onClick={() => handleOpenWindow("eventbook")}
                icon="📅"
              />
              <DesktopIcon
                label="Upload"
                onClick={() => handleOpenWindow("walrusupload")}
                icon="📤"
              />
              <DesktopIcon
                label="View"
                onClick={() => handleOpenWindow("walrusview")}
                icon="📥"
              />
              <DesktopIcon
                label="Help"
                onClick={() => handleOpenWindow("help")}
                icon="❓"
              />
            </div>

            {/* 底部圖標 */}
            <div className="absolute bottom-4 w-full pointer-events-auto">
              <DesktopIcon
                label="About"
                onClick={() => handleOpenWindow("about")}
                icon="ℹ️"
              />
            </div>
          </div>

          {/* 主要內容區域 - 添加左側 padding 來為面板留出空間 */}
          <div className="pl-16 h-full relative">
            {/* 窗口渲染邏輯，根據 openWindows 的順序渲染 */}
            {openWindows.map(name => {
              switch(name) {
                case 'memento':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Memento"
                      position={windowPositions.memento}
                      size={windowSizes.memento}
                      isActive={activeWindow === 'memento'}
                      resizable={false}
                      onClose={(name: WindowName) => handleCloseWindow(name)}
                      onDragStart={(e: React.MouseEvent<Element>, name: string) => handleDragStart(e, name)}
                      onClick={() => handleWindowActivate('memento')}
                    >
                      <MementoWindow 
                        onDragStart={handleDragStart}
                        onCreateMemento={() => {
                          // 獲取 Memento 窗口的位置
                          const mementoPos = windowPositions.memento;
                          const mementoSize = windowSizes.memento;
                          // 設置新窗口位置在 Memento 右側偏上
                          setWindowPositions(prev => ({
                            ...prev,
                            'memento-create': {
                              x: mementoPos.x + mementoSize.width + 20, // Memento 右側 20px
                              y: mementoPos.y,  // 比 Memento 高 50px
                            }
                          }));
                          
                          setIsCreateMementoOpen(true);
                          handleWindowActivate('memento-create');
                        }}
                        onCaptureMoment={() => {
                          const mementoPos = windowPositions.memento;
                          const mementoSize = windowSizes.memento;
                          setWindowPositions(prev => ({
                            ...prev,
                            'capture-moment': {
                              x: mementoPos.x + mementoSize.width - 1000,
                              y: mementoPos.y,
                            }
                          }));
                          
                          handleWindowActivate('capture-moment');
                        }}
                      />
                    </Window>
                  );
                case 'phonebook':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="PhoneBook"
                      position={windowPositions.phonebook}
                      size={windowSizes.phonebook}
                      isActive={activeWindow === 'phonebook'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('phonebook')}
                    >
                      <PhoneBook />
                    </Window>
                  );
                case 'eventbook':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="EventBook"
                      position={windowPositions.eventbook}
                      size={windowSizes.eventbook}
                      isActive={activeWindow === 'eventbook'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('eventbook')}
                    >
                      <div className="p-4">
                        <h2 className="text-xl font-medium mb-4">Event Book</h2>
                        {/* Event Book 內容 */}
                      </div>
                    </Window>
                  );
                case 'about':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="About"
                      position={windowPositions.about}
                      size={windowSizes.about}
                      isActive={activeWindow === 'about'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('about')}
                    >
                      <AboutContent />
                    </Window>
                  );
                case 'help':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Help"
                      position={windowPositions.help}
                      size={windowSizes.help}
                      isActive={activeWindow === 'help'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('help')}
                    >
                      <div className="p-4">
                        <h2 className="text-xl font-medium mb-4">Help</h2>
                        {/* Help 內容 */}
                      </div>
                    </Window>
                  );
                case 'walrusupload':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Walrus Upload"
                      position={windowPositions.walrusupload}
                      size={windowSizes.walrusupload}
                      isActive={activeWindow === 'walrusupload'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('walrusupload')}
                    >
                      <WalrusUpload />
                    </Window>
                  );
                case 'walrusview':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Walrus View"
                      position={windowPositions.walrusview}
                      size={windowSizes.walrusview}
                      isActive={activeWindow === 'walrusview'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('walrusview')}
                    >
                      <WalrusView />
                    </Window>
                  );
                case 'capture-moment':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Capture Moment"
                      position={windowPositions['capture-moment']}
                      size={windowSizes['capture-moment']}
                      isActive={activeWindow === 'capture-moment'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('capture-moment')}
                    >
                      <CaptureMomentWindow />
                    </Window>
                  );
              }
            })}

            {isCreateMementoOpen && (
              <Window
                key="memento-create"
                name="memento-create"
                title="Create Memento"
                position={windowPositions['memento-create']}
                size={windowSizes['memento-create']}
                isActive={activeWindow === 'memento-create'}
                resizable={true}
                onClose={() => setIsCreateMementoOpen(false)}
                onDragStart={handleDragStart}
                onResize={handleResize}
                onClick={() => handleWindowActivate('memento-create')}
              >
                <CreateMementoDialog
                  isOpen={true}
                  onClose={() => setIsCreateMementoOpen(false)}
                  onSubmit={handleCreateMemento}
                  currentAddress={currentAccount?.address}
                />
              </Window>
            )}
          </div>
        </div>
      </div>
    </>
  );
}