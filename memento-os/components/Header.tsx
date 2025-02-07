import { useEffect, useState } from 'react';

const Header = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // 更新時間
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      // 更新日期
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      setCurrentDate(`${year}/${month}/${day}`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-6 backdrop-blur-md border-b border-black/80 flex items-center justify-between px-3"
      style={{ 
        zIndex: 1000,
        backgroundColor: '#FFF5F5'
      }}
    >
      <button 
        className="text-xs font-mono font-bold hover:text-gray-600 transition-colors cursor-pointer"
        onClick={() => {/* 待實現 */}}
      >
        Memento OS
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold">{currentDate}</span>
        <div className="h-3 border-l border-black/80"></div>
        <span className="text-xs font-mono font-bold">{currentTime}</span>
      </div>
    </div>
  );
};

export default Header; 