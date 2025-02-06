'use client';

import { useState } from 'react';
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
  const [openWindows, setOpenWindows] = useState<WindowName[]>(["memento"]); // 預設窗口
  const [windowPositions, setWindowPositions] = useState<Record<WindowName, { x: number; y: number }>>({
    memento: { x: 100, y: 100 },
    about: { x: 150, y: 150 },
    files: { x: 200, y: 100 },
    browser: { x: 250, y: 100 }
  });
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [windowSizes, setWindowSizes] = useState<Record<WindowName, { width: number; height: number }>>({
    memento: { width: 384, height: 288 },
    about: { width: 384, height: 288 },
    files: { width: 384, height: 288 },
    browser: { width: 384, height: 288 }
  });
  const [activeWindow, setActiveWindow] = useState<WindowName | null>("memento");

  // 處理窗口激活
  const handleWindowActivate = (windowName: WindowName) => {
    setActiveWindow(windowName);
  };

  // 修改打開窗口的處理函數
  const handleOpenWindow = (windowName: string) => {
    if (openWindows.includes(windowName as WindowName)) {
      setOpenWindows(openWindows.filter(name => name !== windowName as WindowName));
      setActiveWindow(null);
    } else {
      setOpenWindows([...openWindows, windowName as WindowName]);
      setActiveWindow(windowName as WindowName);
    }
  };

  // 修改關閉窗口的處理函數
  const handleCloseWindow = (windowName: string) => {
    setOpenWindows(openWindows.filter((name) => name !== windowName as WindowName));
    if (activeWindow === windowName) {
      setActiveWindow(null);
    }
  };

  // 簡單的 Connect Wallet 功能
  const connectWallet = () => {
    console.log("Wallet connected!"); 
    alert("Wallet connected!");
  };

  // 修改拖動開始的處理函數
  const handleDragStart = (e: React.MouseEvent, windowName: string) => {
    setDraggingWindow(windowName as WindowName);
    setActiveWindow(windowName as WindowName);
    setDragOffset({
      x: e.clientX - windowPositions[windowName as WindowName].x,
      y: e.clientY - windowPositions[windowName as WindowName].y,
    });
  };

  // 拖動窗口過程
  const handleDragMove = (e: React.MouseEvent) => {
    if (draggingWindow) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

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
  const handleResize = (e: React.MouseEvent, windowName: WindowName, direction: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSizes[windowName].width;
    const startHeight = windowSizes[windowName].height;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) {
        newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      }
      if (direction.includes('s')) {
        newHeight = Math.min(600, Math.max(200, startHeight + deltaY));
      }

      setWindowSizes(prev => ({
        ...prev,
        [windowName]: { width: newWidth, height: newHeight }
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
      {/* 基礎背景 - 純粉色 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#FEE2E2',
        }}
      />

      {/* 漸層效果 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(rgba(252, 213, 206, 0.3), rgba(252, 213, 206, 0.3))',
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
            icon="/file.svg"
            iconType="image"
          />
          <DesktopIcon
            label="Browser"
            onClick={() => handleOpenWindow("browser")}
            icon="/globe.svg"
            iconType="image"
          />
        </div>

        {/* Memento 窗口 */}
        {openWindows.includes("memento") && (
          <Window
            name="memento"
            title="Memento"
            position={windowPositions.memento}
            size={windowSizes.memento}
            isActive={activeWindow === 'memento'}
            onClose={handleCloseWindow}
            onDragStart={handleDragStart}
            onResize={handleResize}
            onClick={() => handleWindowActivate("memento")}
          >
            <div className="p-4">
              <ConnectButton />
            </div>
          </Window>
        )}

        {/* About 窗口 */}
        {openWindows.includes("about") && (
          <Window
            name="about"
            title="About"
            position={windowPositions.about}
            size={windowSizes.about}
            isActive={activeWindow === 'about'}
            onClose={handleCloseWindow}
            onDragStart={handleDragStart}
            onResize={handleResize}
            onClick={() => handleWindowActivate("about")}
          >
            <div className="p-4">
              <h2 className="text-xl mb-4">About Memento OS</h2>
              <p>A web3 operating system for the modern age.</p>
            </div>
          </Window>
        )}
      </div>
    </div>
  );
}