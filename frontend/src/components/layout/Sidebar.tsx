import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileText,
  HelpCircle,
  BarChart3,
  ShieldAlert,
  Coins,
  BookOpen,
  Sparkles,
  Activity,
  Scale,
} from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: Role[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Genel Bakış',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Canlı Piyasa & Kurlar',
    path: '/canli-piyasa',
    icon: Activity,
    roles: ['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Yapay Zeka Raporu',
    path: '/yapay-zeka-analiz',
    icon: Sparkles,
    roles: ['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Varlık Karşılaştırma',
    path: '/compare',
    icon: Scale,
    roles: ['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Bütçe & Harcamalar',
    path: '/budget',
    icon: Wallet,
    roles: ['STANDART_KULLANICI', 'SUPER_ADMIN'],
  },
  {
    title: 'Yatırım Portföyü',
    path: '/assets',
    icon: TrendingUp,
    roles: ['STANDART_KULLANICI', 'SUPER_ADMIN'],
  },
  {
    title: 'Finans Rehberi & Sözlük',
    path: '/rehber',
    icon: BookOpen,
    roles: ['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Piyasa Bülteni & İçerik',
    path: '/content',
    icon: FileText,
    roles: ['ICERIK_YONETICI', 'BIRIM_YONETICI', 'STANDART_KULLANICI', 'SUPER_ADMIN'],
  },
  {
    title: 'Destek Biletleri',
    path: '/tickets',
    icon: HelpCircle,
    roles: ['STANDART_KULLANICI', 'BIRIM_YONETICI', 'SUPER_ADMIN'],
  },
  {
    title: 'Sistem Analitiği',
    path: '/analytics',
    icon: BarChart3,
    roles: ['GENEL_KOORDINATOR', 'SUPER_ADMIN'],
  },
  {
    title: 'Audit Log & Yönetim',
    path: '/admin/audit',
    icon: ShieldAlert,
    roles: ['SUPER_ADMIN'],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const authorizedMenuItems = ALL_MENU_ITEMS.filter((item) => item.roles.includes(user.role));

  const roleLabelMap: Record<Role, { text: string; color: string }> = {
    STANDART_KULLANICI: { text: 'Standart Kullanıcı', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
    ICERIK_YONETICI: { text: 'İçerik Yöneticisi', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    BIRIM_YONETICI: { text: 'Birim Yöneticisi', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
    GENEL_KOORDINATOR: { text: 'Genel Koordinatör', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    SUPER_ADMIN: { text: 'Süper Admin', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Logo />
      </div>

      {/* User Role Badge */}
      <div className="p-4 mx-4 my-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Aktif Rol Yetkisi</div>
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${roleLabelMap[user.role].color}`}>
          {roleLabelMap[user.role].text}
        </span>
      </div>

      {/* Dynamic RBAC Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Erişilebilir Modüller
        </div>
        {authorizedMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm dark:shadow-md dark:shadow-blue-900/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 text-center">
        v1.0.0 Production Ready
      </div>
    </aside>
  );
};
