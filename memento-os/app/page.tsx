'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ConnectButton } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import Window from '@/components/Window';
import type { WindowName } from '../types';

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
      y: Math.round((window.innerHeight - height) / 2),
    };
  };

  // 修改 Memento 窗口的默認尺寸為 600x600
  const mementoSize = { width: 600, height: 600 };

  const [openWindows, setOpenWindows] = useState<string[]>(['memento']);
  const [activeWindow, setActiveWindow] = useState<string>('memento');  // 新增：追蹤當前活動窗口
  const [draggingWindow, setDraggingWindow] = useState<string | null>(null);
  const [windowPositions, setWindowPositions] = useState({
    memento: { x: 0, y: 0 },  // 初始值設為 0，後面會更新
    about: { x: 150, y: 150 },
    files: { x: 200, y: 200 },
  });
  const [windowSizes, setWindowSizes] = useState({
    memento: mementoSize,
    about: { width: 400, height: 300 },
    files: { width: 500, height: 400 },
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
  const handleWindowActivate = (name: string) => {
    setActiveWindow(name);
    
    // 將當前窗口移到陣列末尾（最上層）
    setOpenWindows(prev => [
      ...prev.filter(w => w !== name),
      name
    ]);
  };

  // 修改打開窗口的處理函數
  const handleOpenWindow = (name: string) => {
    if (openWindows.includes(name)) {
      setOpenWindows(openWindows.filter(window => window !== name));
      if (draggingWindow === name) {
        setDraggingWindow(null);
      }
    } else {
      setOpenWindows([...openWindows, name]);
      // 如果是打開 Memento 窗口，重新計算中心位置
      if (name === 'memento') {
        const centerPosition = getCenterPosition(mementoSize.width, mementoSize.height);
        setWindowPositions(prev => ({
          ...prev,
          memento: centerPosition,
        }));
      }
    }
  };

  // 修改關閉窗口的處理函數
  const handleCloseWindow = (name: string) => {
    setOpenWindows(openWindows.filter(window => window !== name));
    if (draggingWindow === name) {
      setDraggingWindow(null);
    }
  };

  // 簡單的 Connect Wallet 功能
  const connectWallet = () => {
    console.log("Wallet connected!"); 
    alert("Wallet connected!");
  };

  // 修改拖動開始的處理函數
  const handleDragStart = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    handleWindowActivate(name);  // 激活窗口
    setDraggingWindow(name);
    
    const startX = e.clientX - windowPositions[name as keyof typeof windowPositions].x;
    const startY = e.clientY - windowPositions[name as keyof typeof windowPositions].y;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setWindowPositions(prev => ({
        ...prev,
        [name]: {
          x: e.clientX - startX,
          y: e.clientY - startY,
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingWindow(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 拖動窗口過程
  const handleDragMove = (e: React.MouseEvent) => {
    if (draggingWindow) {
      const newX = e.clientX - windowPositions[draggingWindow as WindowName].x;
      const newY = e.clientY - windowPositions[draggingWindow as WindowName].y;

      // 確保窗口不超出瀏覽器邊界
      const clampedX = Math.max(0, Math.min(window.innerWidth - 384, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - 288, newY));

      setWindowPositions(prev => ({
        ...prev,
        [draggingWindow]: { x: clampedX, y: clampedY }
      }));
    }
  };

  // 停止拖動窗口
  const handleDragEnd = () => {
    setDraggingWindow(null);
  };

  // 處理窗口縮放
  const handleResize = (e: React.MouseEvent, name: string) => {
    e.preventDefault();  // 防止默認拖動行為
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSizes[name as keyof typeof windowSizes].width;
    const startHeight = windowSizes[name as keyof typeof windowSizes].height;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();  // 防止默認拖動行為
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
    <div className="relative w-full h-screen overflow-hidden">
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
      <div 
        className="relative w-full h-full z-10"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
      >
        {/* 桌面圖標 */}
        <div className="absolute top-4 right-4 flex flex-col gap-6">
          <DesktopIcon
            label="Memento"
            onClick={() => handleOpenWindow("memento")}
            icon="🎨"
          />
          <DesktopIcon
            label="About"
            onClick={() => handleOpenWindow("about")}
            icon="ℹ️"
          />
          <DesktopIcon
            label="Files"
            onClick={() => handleOpenWindow("files")}
            icon="📁"
          />
        </div>

        {/* 修改窗口渲染邏輯，根據 openWindows 的順序渲染 */}
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
                  onClose={handleCloseWindow}
                  onDragStart={handleDragStart}
                  onClick={() => handleWindowActivate('memento')}  // 新增：點擊事件
                >
                  <div className="p-4">
                    <ConnectButton />
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
                  resizable={false}
                  onClose={handleCloseWindow}
                  onDragStart={handleDragStart}
                  onClick={() => handleWindowActivate('about')}  // 新增：點擊事件
                >
                  <div className="p-4">
                    <h2 className="text-xl font-medium text-gray-900 mb-4">About Memento OS</h2>
                    <p className="text-gray-800">A web3 operating system for the modern age.</p>
                  </div>
                </Window>
              );
            case 'files':
              return (
                <Window
                  key={name}
                  name={name}
                  title="Files"
                  position={windowPositions.files}
                  size={windowSizes.files}
                  isActive={activeWindow === 'files'}
                  resizable={true}
                  onClose={handleCloseWindow}
                  onDragStart={handleDragStart}
                  onResize={handleResize}
                  onClick={() => handleWindowActivate('files')}  // 新增：點擊事件
                >
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-2 hover:bg-black/5 cursor-pointer">
                        <span className="text-2xl">📄</span>
                        <span className="text-xs mt-1">Document.txt</span>
                      </div>
                      <div className="flex flex-col items-center p-2 hover:bg-black/5 cursor-pointer">
                        <span className="text-2xl">📁</span>
                        <span className="text-xs mt-1">Projects</span>
                      </div>
                    </div>
                  </div>
                </Window>
              );
          }
        })}
      </div>
    </div>
  );
}