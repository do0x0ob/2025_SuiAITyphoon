'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// 動態加載僅在客戶端渲染的組件
const DesktopIcon = dynamic(() => import('@/components/DesktopIcon'), {
  ssr: false,
});

type WindowName = 'main' | 'about';

export default function Home() {
  const [openWindows, setOpenWindows] = useState<WindowName[]>(["main"]); // 預設窗口
  const [windowPositions, setWindowPositions] = useState<Record<WindowName, { x: number; y: number }>>({
    main: { x: 100, y: 100 },
    about: { x: 150, y: 150 }
  });
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 打開新的窗口
  const handleOpenWindow = (windowName: string) => {
    if (!openWindows.includes(windowName as WindowName)) {
      setOpenWindows([...openWindows, windowName as WindowName]);
    }
  };

  // 關閉窗口
  const handleCloseWindow = (windowName: string) => {
    setOpenWindows(openWindows.filter((name) => name !== windowName as WindowName));
  };

  // 模擬 Connect Wallet 功能
  const connectWallet = () => {
    console.log("Wallet connected!"); // 這裡可以替換為 Sui SDK 的集成邏輯
    alert("Wallet connected!");
  };

  // 開始拖動窗口
  const handleDragStart = (e: React.MouseEvent, windowName: string) => {
    setDraggingWindow(windowName as WindowName);
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

  return (
    <div
      className="relative w-full h-screen bg-blue-800 overflow-hidden"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      {/* 桌面背景 */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>

      {/* 桌面圖標 */}
      <div className="absolute top-4 right-4 flex flex-col gap-4">
        <DesktopIcon
          label="About"
          onClick={() => handleOpenWindow("about")}
          icon="?"
        />
      </div>

      {/* 窗口渲染 */}
      {openWindows.includes("main") && (
        <div
          className="absolute w-96 h-72 bg-white border border-gray-500 shadow-lg"
          style={{
            top: `${windowPositions.main.y}px`,
            left: `${windowPositions.main.x}px`,
            cursor: draggingWindow === 'main' ? 'grabbing' : 'default',
          }}
        >
          {/* 窗口標題欄 */}
          <div
            className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 cursor-grab"
            onMouseDown={(e) => handleDragStart(e, "main")}
          >
            <span>Main Window</span>
            <button
              className="text-red-500 font-bold"
              onClick={() => handleCloseWindow("main")}
            >
              X
            </button>
          </div>
          {/* 窗口內容 */}
          <div className="p-4">
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}

      {/* About 窗口 */}
      {openWindows.includes("about") && (
        <div
          className="absolute w-96 h-72 bg-white border border-gray-500 shadow-lg"
          style={{
            top: `${windowPositions.about.y}px`,
            left: `${windowPositions.about.x}px`,
            cursor: draggingWindow === 'about' ? 'grabbing' : 'default',
            zIndex: draggingWindow === 'about' ? 10 : 1,  // 添加 zIndex 確保拖動時在最上層
          }}
        >
          {/* 窗口標題欄 */}
          <div
            className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 cursor-grab"
            onMouseDown={(e) => handleDragStart(e, "about")}
          >
            <span>About Window</span>
            <button
              className="text-red-500 font-bold"
              onClick={() => handleCloseWindow("about")}
            >
              X
            </button>
          </div>
          {/* 窗口內容 */}
          <div className="p-4">
            <p className="text-gray-700">This is the About window content!</p>
          </div>
        </div>
      )}
    </div>
  );
}