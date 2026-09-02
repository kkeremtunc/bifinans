import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosInstance.js';
import { BarChart3, Users, Wallet, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data.analytics,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Üst Yönetim & Genel Koordinatör Paneli</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          Sistem Analitiği ve Kullanıcı Metrikleri
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Platform geneli aktif kullanıcı sayıları, veri hacimleri ve sistem durumu özet raporu
        </p>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-slate-500">Analitik verileri yükleniyor...</div>
      ) : (
        <div className="space-y-8">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplam Kullanıcılar</span>
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {analytics?.userMetrics?.totalUsers || 0}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Aktif: {analytics?.userMetrics?.activeUsers || 0} kullanıcı
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pasif Kullanıcılar</span>
                <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {analytics?.userMetrics?.passiveUsers || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Onay bekleyen veya pasif</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Portföy Varlıkları</span>
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {analytics?.assetMetrics?.totalAssetsCount || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Takip edilen toplam varlık</div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bütçe Kayıt Hacmi</span>
                <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {analytics?.financialMetrics?.totalTransactionsCount || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Sistem içi işlem sayısı</div>
            </div>
          </div>

          {/* User Distribution by Role */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Rol Hiyerarşisi Dağılımı</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {analytics?.userMetrics?.usersByRole?.map((r: any) => (
                <div key={r.role} className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {r.role}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{r.count}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sistem Yetkilisi</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
