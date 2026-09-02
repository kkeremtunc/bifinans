import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosInstance';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export interface MarketPriceItem {
  symbol: string;
  name: string;
  assetType: string;
  price: number;
  change24h: number;
  currency: string;
  updatedAt: string;
}

export const MarketTicker: React.FC = () => {
  const navigate = useNavigate();
  const { data: prices, isLoading } = useQuery<MarketPriceItem[]>({
    queryKey: ['marketPrices'],
    queryFn: async () => {
      const { data } = await api.get('/market/prices');
      return data.data;
    },
    refetchInterval: 15000, // 15s smooth performance interval
    staleTime: 10000, // 10s caching eliminates UI lag
  });

  if (isLoading && !prices) {
    return (
      <div className="h-10 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 text-xs text-slate-500">
        Canlı piyasa verileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b101d] border-b border-slate-200 dark:border-slate-800/80 py-2 px-4 md:px-6 overflow-x-auto select-none no-scrollbar">
      <div className="flex items-center gap-6 min-w-max">
        {/* Live Indicator */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase">CANLI PİYASA</span>
          <RefreshCw className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-1" />
        </div>

        {/* Ticker Cards */}
        {prices &&
          prices.map((item) => {
            const isPositive = item.change24h >= 0;
            return (
              <div 
                key={item.symbol} 
                className="flex items-center gap-2.5 text-xs font-mono cursor-pointer hover:bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded transition-colors"
                onClick={() => navigate(`/canli-piyasa/${item.symbol.replace('/', '-')}`)}
              >
                <span className="font-bold text-slate-900 dark:text-white font-sans">{item.symbol}</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">
                  {item.currency === 'TRY' ? '₺' : '$'}
                  {item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}
                  {item.change24h}%
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};
