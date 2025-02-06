import React from 'react';

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  icon: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, onClick, icon }) => {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer p-2 hover:bg-white hover:bg-opacity-20 rounded"
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-2xl">
        {icon}
      </div>
      <span className="text-white mt-1">{label}</span>
    </div>
  );
};

export default DesktopIcon;