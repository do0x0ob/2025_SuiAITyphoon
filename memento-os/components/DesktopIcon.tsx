import React from 'react';
import Image from 'next/image';

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  icon: string;
}

const DesktopIcon = ({ label, onClick, icon }: DesktopIconProps) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log('DesktopIcon clicked:', label); // 添加日誌
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={onClick}
      className="relative group w-full flex justify-center py-1 cursor-pointer"
    >
      <span className="text-3xl select-none">{icon}</span>
      
      {/* 氣泡提示 */}
      <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-[10px] font-mono rounded 
        whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
        style={{ 
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default DesktopIcon;