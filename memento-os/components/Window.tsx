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
  children
}) => {
  return (
    <div
      className="absolute bg-white border border-gray-500 shadow-lg"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isActive ? 'grabbing' : 'default',
        zIndex: isActive ? 10 : 1,
      }}
    >
      <div
        className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 cursor-grab"
        onMouseDown={(e) => onDragStart(e, name)}
      >
        <span>{title}</span>
        <button
          className="text-red-500 font-bold"
          onClick={() => onClose(name)}
        >
          X
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        {children}
      </div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => onResize(e, name, "se")}
      />
    </div>
  );
};

export default Window; 