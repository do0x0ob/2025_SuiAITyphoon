import React from 'react';
import Image from 'next/image';

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  icon: string | React.ReactNode;  // 可以是圖片路徑或 React 組件
  iconType?: 'image' | 'component' | 'emoji';  // 指定 icon 的類型
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  label, 
  onClick, 
  icon, 
  iconType = 'emoji' 
}) => {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer p-2"
      onClick={onClick}
    >
      {iconType === 'emoji' ? (
        <div className="text-2xl">{icon}</div>
      ) : iconType === 'image' ? (
        <Image
          src={icon as string}
          alt={label}
          width={32}
          height={32}
        />
      ) : (
        <span className="text-2xl text-white">{icon}</span>
      )}
      <span className="text-xs font-mono text-gray-800 font-medium">
        {label}
      </span>
    </div>
  );
};

export default DesktopIcon;