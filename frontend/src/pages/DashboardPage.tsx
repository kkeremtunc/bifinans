import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import {
  Wallet,
  TrendingUp,
  Percent,
  FileText,
  Users,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { SmartWizardCard } from '../components/common/SmartWizardCard';
import { OnboardingModal } from '../components/common/OnboardingModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: budgetSummary } = useQuery({
    queryKey: ['budgetSummary'],
    queryFn: async () => (await api.get('/budget/summary')).data.data,
    enabled: user?.role === 'STANDART_KULLANICI' || user?.role === 'SUPER_ADMIN',
  });

  const { data: portfolioSummary } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: async () => (await api.get('/assets/summary?inflation=45')).data.summary,
    enabled: user?.role === 'STANDART_KULLANICI' || user?.role === 'SUPER_ADMIN',
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: async () => (await api.get('/admin/analytics')).data.analytics,
    enabled: user?.role === 'GENEL_KOORDINATOR' || user?.role === 'SUPER_ADMIN',
  });

  const { data: contentData } = useQuery({
    queryKey: ['approvedContents'],
    queryFn: async () => (await api.get('/content')).data.data,
  });

  return (
    <div className="space-y-8">
      {/* Onboarding Tour Modal */}
      <OnboardingModal />

      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-100/90 dark:to-slate-900/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Rol Bazlı Canlı Yönetim Paneli</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              BiFinans'a Hoş geldiniz, {user?.name} {user?.surname}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Finansal durumunuzu, bütçenizi ve yapay zeka destekli piyasa analizlerini buradan takip edebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
              IP: 127.0.0.1 (Audit Logged)
            </span>
          </div>
        </div>
      </div>

      {/* GEMINI AI MARKET-WIDE ANALYSIS COMPACT BANNER */}
      <div className="bg-gradient-to-br from-indigo-100/60 dark:from-indigo-950/60 via-slate-50 dark:via-slate-900 to-purple-100/40 dark:to-purple-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 mt-1 md:mt-0">
            <Bot className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Gemini Yapay Zeka Akıllı Piyasa Taraması
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Yapay Zeka Canlı Piyasa Analizi & Önerileri</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Tüm Altın, Gümüş, Döviz, Kripto ve BIST kurları taranarak alım fırsatı sunan ve riskli olan varlıklar raporlanır.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/yapay-zeka-analiz')}
          className="relative z-10 cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <span>🤖 Derin Piyasa Öneri Raporunu Gör</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* SMART WIZARD RECOMMENDATION CARD */}
      {(user?.role === 'STANDART_KULLANICI' || user?.role === 'SUPER_ADMIN') && (
        <SmartWizardCard
          assetsCount={portfolioSummary?.totalAssetsCount || 0}
          assetTypesCount={Object.keys(portfolioSummary?.assetTypeDistribution || {}).length}
          transactionsCount={budgetSummary ? 1 : 0}
        />
      )}

      {/* STANDARD USER & SUPER ADMIN WIDGETS */}
      {(user?.role === 'STANDART_KULLANICI' || user?.role === 'SUPER_ADMIN') && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Kişisel Finans ve Portföy Özeti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Net Balance Card */}
            <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Bütçe Bakiyesi</span>
                  <InfoTooltip
                    term="Net Bütçe Bakiyesi"
                    definition="Aylık toplam gelirinizden toplam harcamalarınız çıkarıldıktan sonra elinizde kalan net nakit tutardır."
                  />
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₺{budgetSummary?.netBalance?.toLocaleString('tr-TR') || '0'}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Maaş ve temettü gelirleri dahil</span>
              </div>
            </div>

            {/* Total Portfolio Value */}
            <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Toplam Portföy Değeri</span>
                  <InfoTooltip
                    term="Portföy Değeri"
                    definition="Sahip olduğunuz tüm hisse, altın, fon ve döviz varlıklarınızın güncel piyasa fiyatları üzerinden toplam tutarıdır."
                  />
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₺{portfolioSummary?.currentValue?.toLocaleString('tr-TR') || '0'}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                <span>Net Kâr: ₺{portfolioSummary?.netProfit?.toLocaleString('tr-TR') || '0'}</span>
              </div>
            </div>

            {/* Nominal Return */}
            <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Nominal Portföy Getirisi</span>
                  <InfoTooltip
                    term="Nominal Getiri"
                    definition="Enflasyon hesaba katılmadan, yatırımınızın rakamsal olarak % kaç kâr/zarar ettiğini gösterir."
                  />
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                %{portfolioSummary?.nominalReturnPercent || '0'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Enflasyon öncesi kazanç</div>
            </div>

            {/* Enflasyondan Arındırılmış Reel Getiri */}
            <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/20 to-slate-50 dark:to-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Reel Getiri</span>
                  <InfoTooltip
                    term="Enflasyon Arındırılmış Reel Getiri"
                    definition="Yatırımınızın enflasyonu yendikten sonra paranıza kattığı GERÇEK satın alma gücü artışıdır. Gerçek kazancınızı bu oran gösterir."
                  />
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${(portfolioSummary?.realReturnPercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                %{portfolioSummary?.realReturnPercent || '0'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                %45 Yıllık enflasyon baz alınarak hesaplandı
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL COORDINATOR & SUPER ADMIN METRICS */}
      {(user?.role === 'GENEL_KOORDINATOR' || user?.role === 'SUPER_ADMIN') && analyticsData && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Üst Yönetim Metrikleri & Analitik
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Toplam Kullanıcı Sayısı</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.userMetrics.totalUsers}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Aktif Kullanıcı: {analyticsData.userMetrics.activeUsers}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Toplam Portföy Varlık Kalemi</div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{analyticsData.assetMetrics.totalAssetsCount}</div>
              <div className="text-xs text-slate-500 mt-2">Kullanıcıların takip ettiği varlık sayısı</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Sistem İşlem Sayısı</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analyticsData.financialMetrics.totalTransactionsCount}</div>
              <div className="text-xs text-slate-500 mt-2">Bütçe kayıt ve güncellemeleri</div>
            </div>
          </div>
        </div>
      )}

      {/* MARKET NEWS & BULLETINS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Yayındaki Finansal Bültenler & Piyasa Haberleri
          </h2>
          <Link to="/content" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contentData && contentData.length > 0 ? (
            contentData.map((item: any) => (
              <div key={item.id} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.summary}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                  <span>Yazar: {item.author ? `${item.author.name} ${item.author.surname}` : 'Editör'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Birim Onaylı
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
              Henüz onaylanmış bülten bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
