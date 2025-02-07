'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import type { WindowName } from '../types';
import '@mysten/dapp-kit/dist/index.css';
import dynamic from 'next/dynamic';
import Window from '@/components/Window';
import Header from '@/components/Header';
import { retroButtonStyles } from '@/styles/components';
import PhoneBook from '@/components/PhoneBook';

// 動態加載僅在客戶端渲染的組件
const DesktopIcon = dynamic(() => import('@/components/DesktopIcon'), {
  ssr: false,
});

export default function Home() {
  // 計算視窗中心位置的函數
  const getCenterPosition = (width: number, height: number) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    return {
      x: Math.round((window.innerWidth - width) / 2),
      y: Math.round((window.innerHeight - height) / 2) - 60,
    };
  };

  // 修改 Memento 窗口的默認尺寸為 600x600
  const mementoSize = { width: 600, height: 600 };
  const defaultSize = { width: 500, height: 400 };

  const [openWindows, setOpenWindows] = useState<WindowName[]>(['memento']);
  const [activeWindow, setActiveWindow] = useState<WindowName | null>('memento');
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [windowPositions, setWindowPositions] = useState({
    memento: { x: 0, y: 0 },
    phonebook: { x: 150, y: 150 },
    eventbook: { x: 200, y: 200 },
    about: { x: 250, y: 250 },
    help: { x: 300, y: 300 },
  });
  const [windowSizes, setWindowSizes] = useState({
    memento: mementoSize,
    phonebook: defaultSize,
    eventbook: defaultSize,
    about: defaultSize,
    help: defaultSize,
  });

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
  const handleDragStart = (e: React.MouseEvent<Element>, windowName: WindowName) => {
    e.preventDefault();
    handleWindowActivate(windowName);
    setDraggingWindow(windowName);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = windowSizes[windowName].width;
      const windowHeight = windowSizes[windowName].height;
      const newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - windowWidth));
      const newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - windowHeight));
      setWindowPositions(prev => ({...prev, [windowName]: { x: newX, y: newY }}));
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
                      onDragStart={(e: React.MouseEvent<Element>, name: WindowName) => handleDragStart(e, name)}
                      onClick={() => handleWindowActivate('memento')}
                    >
                      <div className="p-4 h-full flex flex-col justify-between">
                        <div className="flex justify-center items-center flex-1">
                          <img 
                            src="/images/memento.png" 
                            alt="Memento"
                            className="w-[90%] h-auto memento-image"
                          />
                        </div>
                        <div className="flex justify-center mt-4">
                          <ConnectButton 
                            style={retroButtonStyles.button} 
                            onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
                            onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
                            connectText="Connect Wallet"
                            className="retro-button"
                          />
                        </div>
                      </div>
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
                      <div className="p-4">
                        <h2 className="text-xl font-medium mb-4">About Memento OS</h2>
                        <p className="text-gray-800">A web3 operating system for the modern age.</p>
                      </div>
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
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
}