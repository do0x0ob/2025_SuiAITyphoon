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
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e as unknown as React.MouseEvent)}
      className="group flex flex-col items-center w-full px-2 py-1 hover:bg-black/5 relative cursor-pointer"
    >
      <span className="text-3xl select-none">{icon}</span>
      <span 
        className="text-[8px] font-mono text-center text-black/80 whitespace-nowrap mt-0.5 select-none"
        style={{ 
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;