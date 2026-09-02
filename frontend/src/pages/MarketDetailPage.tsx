import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import ReactMarkdown from 'react-markdown';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  Info,
  Clock,
  Sparkles,
  Bot,
  RefreshCw
} from 'lucide-react';
import { MarketPriceItem } from './LiveMarketPage';

type TimeRange = '1G' | '1H' | '1A' | '1Y';

export const MarketDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1A');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState<string | null>(null);

  // Decode the URL symbol (e.g. USD-TRY -> USD/TRY)
  const actualSymbol = symbol ? symbol.replace('-', '/') : '';

  const { data: prices, isLoading } = useQuery<MarketPriceItem[]>({
    queryKey: ['marketPricesDetail'],
    queryFn: async () => {
      const { data } = await api.get('/market/prices');
      return data.data;
    },
  });

  const asset = prices?.find((p) => p.symbol === actualSymbol);

  const isPositive = asset ? asset.change24h >= 0 : true;
  const currencySymbol = asset?.currency === 'TRY' ? '₺' : '$';

  // Query 1-Year History from API to compute real performance metrics for 1W, 1M, 1Y
  const { data: yearHistoryRaw = [] } = useQuery<{ time: number; price: number }[]>({
    queryKey: ['marketHistory1Y', actualSymbol],
    queryFn: async () => {
      const { data } = await api.get(`/market/history/${encodeURIComponent(actualSymbol || '')}?range=1Y`);
      return data.data || [];
    },
    enabled: !!actualSymbol,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate true performance changes directly from API history
  let realWeeklyChange = asset ? asset.change24h : 0;
  let realMonthlyChange = asset ? asset.change24h : 0;
  let realYearlyChange = asset ? asset.change24h : 0;

  if (asset && yearHistoryRaw.length > 0) {
    const currentP = asset.price;
    const firstP = yearHistoryRaw[0].price;
    realYearlyChange = firstP > 0 ? ((currentP - firstP) / firstP) * 100 : 0;

    const monthAgoIndex = Math.max(0, yearHistoryRaw.length - 30);
    const monthP = yearHistoryRaw[monthAgoIndex].price;
    realMonthlyChange = monthP > 0 ? ((currentP - monthP) / monthP) * 100 : 0;

    const weekAgoIndex = Math.max(0, yearHistoryRaw.length - 7);
    const weekP = yearHistoryRaw[weekAgoIndex].price;
    realWeeklyChange = weekP > 0 ? ((currentP - weekP) / weekP) * 100 : 0;
  }

  // Fetch Chart Data for selected range from API
  const { data: chartData = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['marketHistory', actualSymbol, selectedRange],
    queryFn: async () => {
      const { data } = await api.get(`/market/history/${encodeURIComponent(actualSymbol || '')}?range=${selectedRange}`);
      
      // Format timestamps into readable labels based on range
      return data.data.map((point: any) => {
        const pointTime = new Date(point.time);
        let timeLabel = '';
        if (selectedRange === '1G') {
          timeLabel = pointTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (selectedRange === '1H') {
          timeLabel = pointTime.toLocaleDateString('tr-TR', { weekday: 'short', hour: '2-digit' });
        } else if (selectedRange === '1A') {
          timeLabel = pointTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        } else if (selectedRange === '1Y') {
          timeLabel = pointTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return {
          ...point,
          time: timeLabel,
        };
      });
    },
    enabled: !!actualSymbol,
    staleTime: 5 * 60 * 1000,
  });

  const handleAiAnalysis = async () => {
    if (!actualSymbol) return;
    setIsAiLoading(true);
    setAiAnalysisText(null);
    try {
      const { data } = await api.get(`/market/analyze/${encodeURIComponent(actualSymbol)}`);
      setAiAnalysisText(data.data);
    } catch (error) {
      console.error(error);
      setAiAnalysisText("❌ **Hata:** Yapay zeka ile iletişim kurulamadı. Sunucu bağlantınızı veya API anahtarınızı kontrol edin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-slate-500 dark:text-slate-400 font-medium">Piyasa verileri yükleniyor...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Varlık Bulunamadı</h2>
        <p>Aradığınız "{actualSymbol}" sembolüne ait veri bulunamadı.</p>
        <button onClick={() => navigate('/canli-piyasa')} className="mt-6 text-emerald-600 dark:text-emerald-400 hover:underline">
          Canlı Piyasalara Dön
        </button>
      </div>
    );
  }

  const ranges = [
    { key: '1G', label: '1 Gün' },
    { key: '1H', label: '1 Hafta' },
    { key: '1A', label: '1 Ay' },
    { key: '1Y', label: '1 Yıl' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/canli-piyasa')}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Piyasalara Dön
      </button>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{asset.symbol}</h1>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {asset.assetType}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">{asset.name}</p>
        </div>

        <button
          onClick={handleAiAnalysis}
          disabled={isAiLoading}
          className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
          <span>Yapay Zeka Analizi İste</span>
        </button>

        <div className="text-left md:text-right">
          <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white font-mono mb-2">
            {currencySymbol}{asset.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${
            isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{asset.change24h}% (24s)
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigate('/assets', { state: { addSymbol: asset.symbol, addAssetType: asset.assetType } })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> Bu Varlığı Portföyüme Ekle
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Fiyat Grafiği
          </h2>
          
          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            {ranges.map(range => (
              <button
                key={range.key}
                onClick={() => setSelectedRange(range.key as TimeRange)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  selectedRange === range.key 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts AreaChart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[400px] flex items-center justify-center">
          {isHistoryLoading ? (
            <div className="text-slate-500 dark:text-slate-400">Geçmiş veriler internetten çekiliyor...</div>
          ) : chartData.length === 0 ? (
            <div className="text-slate-500">Bu varlık türü için internetten detaylı geçmiş grafik verisi sağlanamıyor.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${currencySymbol}${value.toLocaleString('tr-TR', {maximumFractionDigits: 0})}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Fiyat']}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                isAnimationActive={false}
              />
              <Area 
                type="linear" 
                dataKey="price" 
                stroke={isPositive ? '#10b981' : '#f43f5e'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {(isAiLoading || aiAnalysisText) && (
        <div className="mt-8 bg-gradient-to-br from-indigo-100/40 dark:from-indigo-900/20 to-purple-100/40 dark:to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Yapay Zeka Uzman Analizi</h3>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-slate-600 dark:text-slate-300 prose-headings:text-indigo-700 dark:text-indigo-300 prose-a:text-indigo-600 dark:text-indigo-400 prose-strong:text-slate-900 dark:text-white">
            {isAiLoading ? (
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 animate-pulse py-4">
                <Sparkles className="w-5 h-5" />
                <span>Gemini verileri analiz ediyor, lütfen bekleyin...</span>
              </div>
            ) : (
              <ReactMarkdown>{aiAnalysisText || ''}</ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '24 Saatlik En Yüksek', value: asset.high24h ? `${currencySymbol}${asset.high24h.toLocaleString('tr-TR')}` : '-', icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
          { label: '24 Saatlik En Düşük', value: asset.low24h ? `${currencySymbol}${asset.low24h.toLocaleString('tr-TR')}` : '-', icon: <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" /> },
          { label: 'Veri Kaynağı', value: asset.source, icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" /> },
          { label: 'Son Güncellenme', value: new Date(asset.updatedAt).toLocaleTimeString('tr-TR'), icon: <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-300 dark:border-slate-700/50">
              {stat.icon}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Performance Cards */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Tarihsel Performans Özeti</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Haftalık Değişim', val: realWeeklyChange },
          { title: 'Aylık Değişim', val: realMonthlyChange },
          { title: 'Yıllık Değişim', val: realYearlyChange }
        ].map((perf, idx) => {
          const isPerfPos = perf.val >= 0;
          return (
            <div key={idx} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full ${isPerfPos ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">{perf.title}</div>
              <div className={`text-3xl font-bold flex items-center gap-2 ${isPerfPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPerfPos ? '+' : ''}{perf.val.toFixed(2)}%
                {isPerfPos ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
