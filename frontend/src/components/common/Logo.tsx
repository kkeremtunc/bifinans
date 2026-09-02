import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = '', onClick }) => {
  return (
    <Link to="/" onClick={onClick} className={`flex items-center gap-2.5 group ${className}`}>
      {/* İkon Kutusu */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105 duration-300 shrink-0">
        <Activity className="w-6 h-6 text-white stroke-[2.5]" />
      </div>
      
      {/* Metin */}
      <span className="text-2xl font-black tracking-tight">
        <span className="text-slate-900 dark:text-white">Bi</span>
        <span className="text-blue-600 dark:text-blue-400">Finans</span>
      </span>
    </Link>
  );
};
