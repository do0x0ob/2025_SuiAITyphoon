import React from 'react';
import Image from 'next/image';

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  icon: string | React.ReactNode;  // 可以是圖片路徑或 React 組件
  iconType?: 'image' | 'component';  // 指定 icon 的類型
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  label, 
  onClick, 
  icon, 
  iconType = 'component' 
}) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer p-2 hover:bg-white hover:bg-opacity-20 rounded"
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
        {iconType === 'image' ? (
          <Image
            src={icon as string}
            alt={label}
            width={32}
            height={32}
          />
        ) : (
          <span className="text-2xl text-white">{icon}</span>
        )}
      </div>
      <span className="text-white mt-1 text-sm">{label}</span>
    </div>
  );
};

export default DesktopIcon;