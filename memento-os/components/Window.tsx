import React from 'react';
import type { WindowName } from '../types';

interface WindowProps {
  name: WindowName;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive?: boolean;
  resizable?: boolean;  // 新增縮放配置
  onClose: (name: WindowName) => void;
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  onResize?: (e: React.MouseEvent, name: WindowName) => void;
  onClick?: () => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({
  name,
  title,
  position,
  size,
  isActive,
  resizable = false,  // 默認不可縮放
  onClose,
  onDragStart,
  onResize,
  onClick,
  children,
}) => {
  const bgStyle = {
    backgroundColor: '#FFF5F5',  // 改為與主畫面相同的背景色
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      className={`absolute ${
        isActive ? 'z-50' : 'z-40'
      }`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: size ? `${size.width}px` : 'auto',
        minWidth: resizable ? '200px' : undefined,
        height: size ? `${size.height}px` : 'auto',
        minHeight: resizable ? '100px' : undefined,
        cursor: isActive ? 'grabbing' : 'default',
        boxShadow: isActive 
          ? '4px 4px 0 rgba(0,0,0,0.2), 8px 8px 0 rgba(0,0,0,0.1)'
          : '3px 3px 0 rgba(0,0,0,0.15), 6px 6px 0 rgba(0,0,0,0.1)',
        border: '1px solid rgba(0, 0, 0, 0.8)',
        ...bgStyle,
        position: 'absolute',
        resize: resizable ? 'both' : 'none',
        overflow: 'hidden',
      }}
      onClick={onClick}  // 新增：點擊事件處理
    >
      {/* 窗口標題欄 */}
      <div
        className="flex items-center cursor-grab relative"
        style={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
          backgroundColor: '#FFF5F5',  // 改為與主畫面相同的背景色
          height: '24px',
          minHeight: '24px',
          lineHeight: '24px',
        }}
        onMouseDown={(e) => {
          // 如果點擊的是關閉按鈕，不觸發拖動
          if ((e.target as HTMLElement).tagName === 'BUTTON') {
            return;
          }
          onDragStart(e, name);
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className="px-2 py-0 text-sm font-bold text-gray-900 hover:text-black leading-none ml-1 cursor-pointer"
          style={{ height: '24px', lineHeight: '24px' }}
        >
          ✕
        </button>
        <span 
          className="text-sm font-mono font-bold text-gray-900 uppercase tracking-wider leading-none absolute right-2"
          style={{ lineHeight: '24px' }}
        >
          {title}
        </span>
      </div>

      {/* 窗口內容 */}
      <div 
        className="text-gray-800 h-full"
        style={{ 
          ...bgStyle,
          paddingBottom: '1rem'  // 減少底部 padding
        }}
      >
        {children}
      </div>

      {/* 縮放控制點 */}
      {resizable && onResize && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.8) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            backgroundPosition: 'right bottom',
            touchAction: 'none',
            zIndex: 10,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResize(e, name);
          }}
        />
      )}
    </div>
  );
};

export default Window; 