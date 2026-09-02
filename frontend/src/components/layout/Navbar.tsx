import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { LogOut, User as UserIcon, ShieldCheck, Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { SettingsModal } from '../common/SettingsModal';
import { Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0d1322]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Hoş geldiniz, <span className="font-semibold text-slate-900 dark:text-white">{user?.name} {user?.surname}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          title="Temayı Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          title="Güvenlik Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Security / Role Indicator */}
        <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Güvenli Oturum (Dual-Token Auth)</span>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0]}{user?.surname?.[0]}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:text-rose-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-500/10 border border-slate-300 dark:border-slate-700/60 hover:border-rose-500/30 rounded-lg transition-colors"
            title="Güvenli Çıkış Yap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
};
