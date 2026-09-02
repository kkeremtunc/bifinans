import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import { AssetPerformance, AssetType } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Activity,
  Trash2,
  X,
  RefreshCw,
  Sparkles,
  Info,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { InfoTooltip } from '../components/common/InfoTooltip';
import { MarketPriceItem } from './LiveMarketPage';
import { Link, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  ALTIN: '#f59e0b',
  GUMUS: '#94a3b8',
  DOVIZ: '#10b981',
  KRIPTO: '#a855f7',
  BIST: '#3b82f6',
};

const PREDEFINED_ASSETS: Record<AssetType, { symbol: string; name: string }[]> = {
  ALTIN: [
    { symbol: 'GRAM_ALTIN', name: 'Gram Altın (24 Ayar)' },
    { symbol: 'CEYREK_ALTIN', name: 'Çeyrek Altın (Yeni)' },
    { symbol: 'TAM_ALTIN', name: 'Tam Altın (Ziynet)' },
    { symbol: 'ONS_ALTIN', name: 'Ons Altın ($)' },
  ],
  GUMUS: [
    { symbol: 'GRAM_GUMUS', name: 'Gram Gümüş (24 Ayar Saf)' },
    { symbol: 'ONS_GUMUS', name: 'Ons Gümüş ($)' },
  ],
  DOVIZ: [
    { symbol: 'USD/TRY', name: 'Dolar (USD / TL)' },
    { symbol: 'EUR/TRY', name: 'Euro (EUR / TL)' },
    { symbol: 'GBP/TRY', name: 'İngiliz Sterlini (GBP / TL)' },
    { symbol: 'CHF/TRY', name: 'İsviçre Frangı (CHF / TL)' },
  ],
  KRIPTO: [
    { symbol: 'BTC', name: 'Bitcoin (BTC)' },
    { symbol: 'ETH', name: 'Ethereum (ETH)' },
    { symbol: 'SOL', name: 'Solana (SOL)' },
    { symbol: 'XRP', name: 'Ripple (XRP)' },
    { symbol: 'DOGE', name: 'Dogecoin (DOGE)' },
  ],
  BIST: [
    { symbol: 'THYAO', name: 'Türk Hava Yolları (THYAO)' },
    { symbol: 'GARAN', name: 'Garanti BBVA (GARAN)' },
    { symbol: 'EREGL', name: 'Ereğli Demir Çelik (EREGL)' },
    { symbol: 'ASELS', name: 'Aselsan (ASELS)' },
    { symbol: 'KCHOL', name: 'Koç Holding (KCHOL)' },
    { symbol: 'BIST100', name: 'BIST 100 Endeksi (BIST100)' },
  ],
};

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props || {};
  if (typeof cx !== 'number' || typeof cy !== 'number' || typeof midAngle !== 'number') return null;

  const numPercent = Number(percent);
  if (isNaN(numPercent) || numPercent <= 0) return null;

  const pct = numPercent > 1 ? numPercent : numPercent * 100;
  if (isNaN(pct) || pct < 3) return null;

  const RADIAN = Math.PI / 180;
  const radius = Number(innerRadius || 0) + (Number(outerRadius || 0) - Number(innerRadius || 0)) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-bold fill-white font-mono"
    >
      %{pct.toFixed(1)}
    </text>
  );
};

export const AssetPage: React.FC = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inflationRate, setInflationRate] = useState<number>(45);

  // State for Sell / Reduce Asset Modal
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedAssetToSell, setSelectedAssetToSell] = useState<AssetPerformance | null>(null);
  const [sellAmountInput, setSellAmountInput] = useState<string>('');

  const [formData, setFormData] = useState({
    assetType: 'ALTIN' as AssetType,
    symbol: 'GRAM_ALTIN',
    isCustomSymbol: false,
    customSymbolInput: '',
    amount: '',
    averageCost: '',
  });

  useEffect(() => {
    if (location.state?.addSymbol && location.state?.addAssetType) {
      setFormData(prev => ({
        ...prev,
        assetType: location.state.addAssetType,
        symbol: location.state.addSymbol,
        isCustomSymbol: false,
      }));
      setIsModalOpen(true);
      // Temizleyelim ki sayfa yenilenince tekrar açılmasın
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Query Live Market Prices (Auto Refetch every 15 seconds)
  const { data: marketPrices } = useQuery<MarketPriceItem[]>({
    queryKey: ['marketPricesPage'],
    queryFn: async () => (await api.get('/market/prices')).data.data,
    refetchInterval: 15000,
  });

  // Query User Portfolio Assets with Live Updates (15s)
  const { data: assets, isLoading, dataUpdatedAt } = useQuery<AssetPerformance[]>({
    queryKey: ['assets', inflationRate],
    queryFn: async () => (await api.get(`/assets?inflation=${inflationRate}`)).data.data,
    refetchInterval: 15000,
  });

  // Query Portfolio Performance Summary
  const { data: summary } = useQuery({
    queryKey: ['portfolioSummary', inflationRate],
    queryFn: async () => (await api.get(`/assets/summary?inflation=${inflationRate}`)).data.summary,
    refetchInterval: 15000,
  });

  // Whenever assetType or symbol changes in the modal form, auto fill current live price as default purchase price!
  useEffect(() => {
    const currentSymbol = formData.isCustomSymbol ? formData.customSymbolInput : formData.symbol;
    if (currentSymbol && marketPrices) {
      const matched = marketPrices.find(p => p.symbol === currentSymbol);
      if (matched && matched.price) {
        setFormData(prev => ({ ...prev, averageCost: matched.price.toString() }));
      }
    }
  }, [formData.assetType, formData.symbol, formData.isCustomSymbol, formData.customSymbolInput, marketPrices]);

  const handleAssetTypeChange = (newType: AssetType) => {
    const defaultAsset = PREDEFINED_ASSETS[newType]?.[0]?.symbol || '';
    setFormData(prev => ({
      ...prev,
      assetType: newType,
      symbol: defaultAsset,
      isCustomSymbol: false,
      customSymbolInput: '',
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
      setIsModalOpen(false);
      setFormData({
        assetType: 'ALTIN',
        symbol: 'GRAM_ALTIN',
        isCustomSymbol: false,
        customSymbolInput: '',
        amount: '',
        averageCost: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => await api.put(`/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
      setSellModalOpen(false);
      setSelectedAssetToSell(null);
      setSellAmountInput('');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      alert('Güncelleme sırasında bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
      setSellModalOpen(false);
      setSelectedAssetToSell(null);
      setSellAmountInput('');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      alert('Silme sırasında bir hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetToSell) return;

    const normalizedInput = sellAmountInput.replace(',', '.');
    const soldAmount = parseFloat(normalizedInput);
    if (isNaN(soldAmount) || soldAmount <= 0) return;

    const remainingAmount = selectedAssetToSell.amount - soldAmount;

    if (remainingAmount <= 0.0001) {
      // Sold out completely -> Delete record
      deleteMutation.mutate(selectedAssetToSell.id);
    } else {
      // Sold partial amount -> Update remaining amount
      updateMutation.mutate({
        id: selectedAssetToSell.id,
        data: { amount: remainingAmount },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSymbol = formData.isCustomSymbol ? formData.customSymbolInput.trim().toUpperCase() : formData.symbol;
    const cost = parseFloat(formData.averageCost);

    createMutation.mutate({
      assetType: formData.assetType,
      symbol: finalSymbol,
      amount: parseFloat(formData.amount),
      averageCost: cost,
      currentPrice: cost,
    });
  };

  const assetTypeColorMap: Record<AssetType, string> = {
    BIST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    ALTIN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    GUMUS: 'bg-slate-400/10 text-slate-600 dark:text-slate-300 border-slate-400/20',
    DOVIZ: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    KRIPTO: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const activeSymbol = formData.isCustomSymbol ? formData.customSymbolInput : formData.symbol;
  const currentLiveMarketItem = marketPrices?.find(p => p.symbol === activeSymbol);

  // Compute category percentage shares for pie chart widget
  const totalPortfolioVal = assets ? assets.reduce((sum, a) => sum + a.currentValue, 0) : 0;
  const categoryTotals: Record<string, number> = {};
  if (assets) {
    assets.forEach(a => {
      categoryTotals[a.assetType] = (categoryTotals[a.assetType] || 0) + a.currentValue;
    });
  }

  const categoryNameMap: Record<string, string> = {
    ALTIN: 'Altın Piyasası',
    GUMUS: 'Gümüş Piyasası',
    DOVIZ: 'Döviz Kurları',
    KRIPTO: 'Kripto Paralar',
    BIST: 'BIST Hisseleri',
  };

  const pieData = Object.entries(categoryTotals).map(([type, value]) => ({
    name: categoryNameMap[type] || type,
    value,
    percent: totalPortfolioVal > 0 ? ((value / totalPortfolioVal) * 100).toFixed(1) : '0',
    type,
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Yatırım Portföyü ve Canlı Kazanç Takibi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Altın, Gümüş, Döviz, Hisse ve Kripto yatırımlarınızın anlık piyasa fiyatları ile canlı kâr/zarar durumunu takip edin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <span className="text-slate-500 dark:text-slate-400">Canlı Fiyat Akışı:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('tr-TR') : 'Canlı'}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Hızlı Varlık Ekle
          </button>
        </div>
      </div>

      {/* Inflation Adjuster Control Widget */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 dark:from-slate-900 via-slate-100 dark:via-slate-900 to-emerald-50 dark:to-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
              Enflasyon Arındırma Parametresi
              <InfoTooltip
                term="Enflasyon Parametresi"
                definition="Reel getiri hesabında baz alınan yıllık enflasyon oranıdır. Enflasyonun üzerinde kazanç sağlayıp sağlamadığınızı belirler."
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reel getiri hesabı için baz alınacak yıllık enflasyon oranı</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Yıllık Enflasyon Oranı (%):</label>
          <input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            className="w-24 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold text-center"
          />
        </div>
      </div>

      {/* Portfolio Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center">
            Toplam Yatırım Maliyeti
            <InfoTooltip
              term="Alış Maliyeti"
              definition="Portföyünüzdeki tüm varlıkları satın alırken ödediğiniz toplam anapara tutarıdır."
            />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ₺{summary?.totalCost?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Ödenen toplam anapara</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center">
            Güncel Canlı Değer
            <InfoTooltip
              term="Güncel Değer"
              definition="Varlıklarınızın bugünkü anlık piyasa fiyatları üzerinden toplam canlı değeri."
            />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₺{summary?.currentValue?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className={`text-xs font-bold mt-1 ${(summary?.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            Kâr/Zarar: {(summary?.netProfit || 0) >= 0 ? '+' : ''}₺{summary?.netProfit?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center">
            Net Kazanç / Getiri (%)
            <InfoTooltip
              term="Getiri Oranı"
              definition="Satın alma maliyetinize göre elde ettiğiniz yüzdesel canlı net kâr/zarar oranıdır."
            />
          </div>
          <div className={`text-2xl font-bold flex items-center gap-1.5 ${(summary?.nominalReturnPercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {(summary?.nominalReturnPercent || 0) >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {(summary?.nominalReturnPercent || 0) >= 0 ? '+' : ''}%{summary?.nominalReturnPercent || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Canlı piyasa getirisi</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-emerald-950/20">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center">
            Reel Getiri (Enflasyon Sonrası)
            <InfoTooltip
              term="Reel Getiri"
              definition="Yatırımınızın enflasyondan arındırılmış GERÇEK alım gücü artış oranıdır."
            />
          </div>
          <div className={`text-2xl font-bold ${(summary?.realReturnPercent || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {(summary?.realReturnPercent || 0) >= 0 ? '+' : ''}%{summary?.realReturnPercent || '0'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Satın alma gücü değişimi</div>
        </div>
      </div>

      {/* PORTFOLIO ASSET DISTRIBUTION PERCENTAGE PIE CHART WIDGET */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Portföy Varlık Dağılımı & Yüzdelik Pastası (% Distribution)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Varlıklarınızın kategorilerine göre toplam portföy içindeki canlı yüzdelik payı</p>
            </div>
          </div>

          <Link
            to="/yapay-zeka-analiz"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Yapay Zeka Raporunu İncele →</span>
          </Link>
        </div>

        {pieData && pieData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Recharts Pie Chart (5 Cols) */}
            <div className="lg:col-span-5 h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.type] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₺${Number(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 'Toplam Değer']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Toplam Değer</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">₺{totalPortfolioVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Category Percent Progress Bars & Legend (7 Cols) */}
            <div className="lg:col-span-7 space-y-3">
              {pieData.map((item) => (
                <div key={item.type} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[item.type] || '#64748b' }}></div>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500 dark:text-slate-400">₺{item.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        %{item.percent}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%`, backgroundColor: COLORS[item.type] || '#64748b' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Grafik oluşturmak için portföyünüze varlık ekleyin.
          </div>
        )}
      </div>

      {/* Asset List Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Portföydeki Canlı Varlıklarım
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Fiyatlar ve kâr/zarar canlı güncellenmektedir
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Varlık Türü</th>
                <th className="py-3.5 px-6">Varlık Adı / Kod</th>
                <th className="py-3.5 px-6">Miktar</th>
                <th className="py-3.5 px-6 text-right">Alış Fiyatı (Maliyet)</th>
                <th className="py-3.5 px-6 text-right">Güncel Canlı Fiyat</th>
                <th className="py-3.5 px-6 text-right">Mevcut Toplam Değer</th>
                <th className="py-3.5 px-6 text-right">Net Kâr / Zarar</th>
                <th className="py-3.5 px-6 text-right">Getiri (%)</th>
                <th className="py-3.5 px-6 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Portföy verileri canlı çekiliyor...
                  </td>
                </tr>
              ) : assets && assets.length > 0 ? (
                assets.map((asset) => {
                  const netProfitVal = asset.currentValue - asset.totalCost;
                  const isProfit = netProfitVal >= 0;

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${assetTypeColorMap[asset.assetType]}`}>
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{asset.symbol}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono font-semibold">
                        {asset.amount.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 dark:text-slate-400 font-mono">
                        ₺{asset.averageCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right font-mono">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          ₺{asset.currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white font-mono">
                        ₺{asset.currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-4 px-6 text-right font-bold font-mono ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isProfit ? '+' : ''}₺{netProfitVal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-4 px-6 text-right font-bold ${asset.nominalReturnPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {asset.nominalReturnPercent >= 0 ? '+' : ''}%{asset.nominalReturnPercent}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => {
                            setSelectedAssetToSell(asset);
                            setSellAmountInput('');
                            setSellModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 flex items-center gap-1.5 text-xs font-semibold mx-auto"
                          title="Varlık Sat / Miktar Eksilt"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Sat / Eksilt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <div>Portföyünüzde henüz kaydedilmiş varlık bulunmuyor.</div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      + Hemen İlk Varlığını Ekle
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Easy Add Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Portföye Yeni Varlık Ekle
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Canlı kurlar otomatik çekilir, miktarı girmeniz yeterlidir</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. Varlık Türü */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">1. Varlık Türü (Kategori)</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => handleAssetTypeChange(e.target.value as AssetType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALTIN">🥇 Altın</option>
                  <option value="GUMUS">🥈 Gümüş</option>
                  <option value="DOVIZ">💵 Döviz (Dolar, Euro, Sterlin vb.)</option>
                  <option value="KRIPTO">🪙 Kripto Varlık (BTC, ETH, SOL vb.)</option>
                  <option value="BIST">📈 BIST Hisse Senedi & Endeks</option>
                </select>
              </div>

              {/* 2. Varlık Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">2. Eklemek İstediğiniz Varlık</label>
                {!formData.isCustomSymbol ? (
                  <select
                    value={formData.symbol}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setFormData(prev => ({ ...prev, isCustomSymbol: true, customSymbolInput: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, symbol: e.target.value }));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    {PREDEFINED_ASSETS[formData.assetType]?.map((item) => (
                      <option key={item.symbol} value={item.symbol}>
                        {item.name}
                      </option>
                    ))}
                    <option value="CUSTOM">✏️ Özel / Listede Olmayan Kod Gir...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Sembol girin (Örn: SASA, AKBNK)"
                      value={formData.customSymbolInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, customSymbolInput: e.target.value.toUpperCase() }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs uppercase focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isCustomSymbol: false }))}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Listeye Dön
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Miktar (Gram / Adet) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">3. Miktar (Gram / Adet / Lot)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Örn: 10 gram veya 5 adet"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* 4. Birim Alış Fiyatı */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">4. Birim Alış Fiyatı (₺)</label>
                  {currentLiveMarketItem && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Sitedeki Canlı Kur: ₺{currentLiveMarketItem.price.toLocaleString('tr-TR')}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.averageCost}
                  onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  💡 Sitedeki anlık kur otomatik dolduruldu. Varlığı geçmişte farklı fiyattan aldıysanız bu değeri değiştirebilirsiniz.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.amount || !formData.averageCost}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Portföye Ekleniyor...' : 'Portföyüme Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELL / REDUCE ASSET MODAL */}
      {sellModalOpen && selectedAssetToSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Varlık Sat / Miktar Eksilt</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Portföyünüzdeki varlığı sattığınız miktar kadar azaltın</p>
                </div>
              </div>

              <button
                onClick={() => setSellModalOpen(false)}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Asset Info summary card */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Seçili Varlık:</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedAssetToSell.symbol} ({selectedAssetToSell.assetType})</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mevcut Miktarınız:</span>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{selectedAssetToSell.amount.toLocaleString('tr-TR')}</div>
              </div>
            </div>

            <form onSubmit={handleSellSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Satılan Miktar (Gram veya Adet):
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="Örn: 5 veya 5.5"
                  value={sellAmountInput}
                  onChange={(e) => setSellAmountInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Quick Percent Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold shrink-0">Hızlı Oran:</span>
                <button
                  type="button"
                  onClick={() => setSellAmountInput((selectedAssetToSell.amount * 0.25).toFixed(2))}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono transition-all"
                >
                  %25 Sat
                </button>
                <button
                  type="button"
                  onClick={() => setSellAmountInput((selectedAssetToSell.amount * 0.50).toFixed(2))}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono transition-all"
                >
                  %50 Sat
                </button>
                <button
                  type="button"
                  onClick={() => setSellAmountInput((selectedAssetToSell.amount * 0.75).toFixed(2))}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono transition-all"
                >
                  %75 Sat
                </button>
                <button
                  type="button"
                  onClick={() => setSellAmountInput(selectedAssetToSell.amount.toString())}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold font-mono transition-all"
                >
                  Tümünü Sat
                </button>
              </div>

              {/* Live Preview Calculation */}
              {sellAmountInput && !isNaN(parseFloat(sellAmountInput)) && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tahmini Satış Geliri:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₺{(parseFloat(sellAmountInput) * selectedAssetToSell.currentPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Satış Sonrası Kalan Miktar:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{Math.max(0, selectedAssetToSell.amount - parseFloat(sellAmountInput)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSellModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending || deleteMutation.isPending ? 'İşleniyor...' : 'Satışı Onayla & Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
