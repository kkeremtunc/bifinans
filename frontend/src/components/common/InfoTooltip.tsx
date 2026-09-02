import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  term: string;
  definition: string;
  variant?: 'icon' | 'badge';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ term, definition, variant = 'icon' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center group">
      {variant === 'icon' ? (
        <button
          type="button"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:text-blue-400 transition-colors p-0.5 rounded-full ml-1.5 focus:outline-none"
          aria-label={`${term} hakkında bilgi`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 inline-flex items-center gap-1 ml-2"
        >
          <Info className="w-3 h-3" />
          Nedir?
        </span>
      )}

      {/* Popover Tooltip Box */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>{term}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{definition}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
        </div>
      )}
    </div>
  );
};
