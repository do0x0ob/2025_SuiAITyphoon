import React from 'react';
import type { WindowName } from '../types';

interface WindowProps {
  name: WindowName;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive: boolean;
  onClose: (name: WindowName) => void;
  onDragStart: (e: React.MouseEvent, name: WindowName) => void;
  onResize: (e: React.MouseEvent, name: WindowName, direction: string) => void;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Window: React.FC<WindowProps> = ({
  name,
  title,
  position,
  size,
  isActive,
  onClose,
  onDragStart,
  onResize,
  children,
  onClick,
}) => {
  return (
    <div
      className={`absolute bg-white rounded-lg shadow-lg border border-gray-200 ${
        isActive ? 'z-50' : 'z-40'
      }`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: size ? `${size.width}px` : 'auto',
        height: size ? `${size.height}px` : 'auto',
        cursor: isActive ? 'grabbing' : 'default',
      }}
      onClick={onClick}
    >
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg cursor-grab"
        onMouseDown={(e) => onDragStart(e, name)}
      >
        <span className="text-sm font-mono text-gray-700">{title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
        >
          ✕
        </button>
      </div>
      <div className="p-4 bg-white rounded-b-lg">
        {children}
      </div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize(e, name, "se");
        }}
        style={{
          background: 'transparent',
          touchAction: 'none',
        }}
      />
    </div>
  );
};

export default Window; 