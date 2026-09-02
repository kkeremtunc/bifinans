import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import {
  Activity,
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Zap,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MarketPriceItem {
  symbol: string;
  name: string;
  assetType: 'BIST' | 'ALTIN' | 'GUMUS' | 'DOVIZ' | 'KRIPTO';
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  currency: string;
  updatedAt: string;
  source: string;
}

export const LiveMarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TÜMÜ');
  const [sortConfig, setSortConfig] = useState<{ key: keyof MarketPriceItem; direction: 'asc' | 'desc' } | null>(null);

  const { data: prices, isLoading, dataUpdatedAt } = useQuery<MarketPriceItem[]>({
    queryKey: ['marketPricesPage'],
    queryFn: async () => {
      const { data } = await api.get('/market/prices');
      return data.data;
    },
    refetchInterval: 15000, // 15 seconds optimized smooth live updates!
    staleTime: 10000, // 10s caching to eliminate UI lag/flicker
  });

  const handleSort = (key: keyof MarketPriceItem) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'desc') {
        setSortConfig({ key, direction: 'asc' });
      } else {
        setSortConfig(null); // Third click: reset to default
      }
    } else {
      setSortConfig({ key, direction: 'desc' }); // First click: highest first
    }
  };

  const categories = [
    { key: 'TÜMÜ', label: 'Tüm Piyasalar' },
    { key: 'DOVIZ', label: 'Döviz Kurları' },
    { key: 'ALTIN', label: 'Altın Piyasası' },
    { key: 'GUMUS', label: 'Gümüş Piyasası' },
    { key: 'KRIPTO', label: 'Kripto Paralar' },
    { key: 'BIST', label: 'BIST Hisseleri & Endeks' },
  ];

  const filteredPrices = prices
    ? prices
        .filter((item) => {
          const matchesSearch =
            item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCat = selectedCategory === 'TÜMÜ' || item.assetType === selectedCategory;
          return matchesSearch && matchesCat;
        })
        .sort((a, b) => {
          if (!sortConfig) return 0;
          const { key, direction } = sortConfig;
          const aVal = a[key] ?? 0;
          const bVal = b[key] ?? 0;
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  const renderSortIcon = (key: keyof MarketPriceItem) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="inline w-3 h-3 ml-1 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ChevronDown className="inline w-3 h-3 ml-1 text-emerald-600 dark:text-emerald-400" />
    );
  };

  const categoryColorMap: Record<string, string> = {
    DOVIZ: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    ALTIN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    GUMUS: 'bg-slate-400/10 text-slate-600 dark:text-slate-300 border-slate-400/20',
    KRIPTO: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    BIST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Canlı Piyasa Akış Ekranı</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Anlık Piyasa Kurları ve Canlı Değişimler
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Döviz, Altın, Kripto ve BIST hisselerinin gerçek zamanlı fiyat hareketlerini ve 24s değişimlerini takip edin
          </p>
        </div>

        {/* Live sync indicator badge & AI Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/yapay-zeka-analiz')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>🤖 Yapay Zeka Piyasa Raporu</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Son Akış Zamanı</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('tr-TR') : 'Yükleniyor...'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sembol veya varlık adı ara (Örn: USD/TRY, GRAM_ALTIN, GRAM_GUMUS, BTC, THYAO)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Market Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Canlı Fiyat Akış Tablosu ({filteredPrices.length})
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Akıcı Canlı Güncelleme
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Varlık / Sembol</th>
                <th className="py-4 px-6">Piyasa Türü</th>
                <th 
                  className="py-4 px-6 text-right cursor-pointer hover:text-slate-900 dark:text-white select-none transition-colors"
                  onClick={() => handleSort('price')}
                >
                  Canlı Fiyat {renderSortIcon('price')}
                </th>
                <th 
                  className="py-4 px-6 text-right cursor-pointer hover:text-slate-900 dark:text-white select-none transition-colors"
                  onClick={() => handleSort('change24h')}
                >
                  24s Değişim (%) {renderSortIcon('change24h')}
                </th>
                <th 
                  className="py-4 px-6 text-right cursor-pointer hover:text-slate-900 dark:text-white select-none transition-colors"
                  onClick={() => handleSort('high24h')}
                >
                  Günün En Yükseği {renderSortIcon('high24h')}
                </th>
                <th 
                  className="py-4 px-6 text-right cursor-pointer hover:text-slate-900 dark:text-white select-none transition-colors"
                  onClick={() => handleSort('low24h')}
                >
                  Günün En Düşüğü {renderSortIcon('low24h')}
                </th>
                <th className="py-4 px-6">Veri Kaynağı</th>
                <th className="py-4 px-6 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Canlı piyasa verileri çekiliyor...
                  </td>
                </tr>
              ) : filteredPrices.length > 0 ? (
                filteredPrices.map((item) => {
                  const isPositive = item.change24h >= 0;
                  return (
                    <tr 
                      key={item.symbol} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/canli-piyasa/${item.symbol.replace('/', '-')}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.symbol}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.name}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            categoryColorMap[item.assetType] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.assetType}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white text-sm font-mono">
                        {item.currency === 'TRY' ? '₺' : '$'}
                        {item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}
                          {item.change24h}%
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-slate-600 dark:text-slate-300">
                        {item.high24h
                          ? `${item.currency === 'TRY' ? '₺' : '$'}${item.high24h.toLocaleString('tr-TR')}`
                          : '-'}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-slate-500 dark:text-slate-400">
                        {item.low24h
                          ? `${item.currency === 'TRY' ? '₺' : '$'}${item.low24h.toLocaleString('tr-TR')}`
                          : '-'}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                          {item.source}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/assets', { state: { addSymbol: item.symbol, addAssetType: item.assetType } });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-semibold transition-all"
                        >
                          <Plus className="w-3 h-3" /> Portföye Ekle
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Aramanızla eşleşen canlı kur bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
