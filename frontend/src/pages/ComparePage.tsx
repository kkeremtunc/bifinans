import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';
import { Scale, Bot, Check, X, TrendingUp, TrendingDown } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  currency: string;
  assetType: string;
}

export const ComparePage: React.FC = () => {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  
  const [report, setReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/market/prices');
        setAllAssets(res.data.data);
      } catch (err) {
        console.error('Failed to fetch assets', err);
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const toggleAsset = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(prev => prev.filter(s => s !== symbol));
    } else {
      if (selectedSymbols.length >= 4) {
        setError('En fazla 4 varlık karşılaştırabilirsiniz.');
        setTimeout(() => setError(null), 3000);
        return;
      }
      setSelectedSymbols(prev => [...prev, symbol]);
    }
    setReport('');
  };

  const getAnalysis = async () => {
    if (selectedSymbols.length < 2) {
      setError('Karşılaştırma için en az 2 varlık seçmelisiniz.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoadingReport(true);
    setError(null);
    try {
      const res = await api.post('/market/analyze-compare', { symbols: selectedSymbols });
      setReport(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Analiz alınırken bir hata oluştu.');
    } finally {
      setLoadingReport(false);
    }
  };

  const selectedAssetsData = selectedSymbols.map(sym => allAssets.find(a => a.symbol === sym)).filter(Boolean) as Asset[];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Varlık Karşılaştırma</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Piyasadaki varlıkları yan yana koyun ve yapay zeka ile analiz edin.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Varlık Seçimi (2-4 adet)
          </h2>
          {loadingAssets ? (
            <div className="text-xs text-slate-500 text-center py-4">Yükleniyor...</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {allAssets.map(asset => {
                const isSelected = selectedSymbols.includes(asset.symbol);
                return (
                  <div 
                    key={asset.symbol}
                    onClick={() => toggleAsset(asset.symbol)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-[10px] text-slate-500">{asset.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedAssetsData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedAssetsData.map(asset => (
                <div key={asset.symbol} className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center relative overflow-hidden group">
                   <button 
                      onClick={() => toggleAsset(asset.symbol)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                   </button>
                   <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{asset.symbol}</div>
                   <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                     {asset.price.toLocaleString('tr-TR')} {asset.currency === 'TRY' ? '₺' : '$'}
                   </div>
                   <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                     {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                     <span>%{Math.abs(asset.change24h)}</span>
                   </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl min-h-[300px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                 <Bot className="w-5 h-5 text-indigo-500" />
                 Yapay Zeka Karşılaştırması
               </h2>
               <button
                  onClick={getAnalysis}
                  disabled={selectedSymbols.length < 2 || loadingReport}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingReport ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analiz Ediliyor...
                    </>
                  ) : (
                    'Yapay Zekaya Danış'
                  )}
               </button>
             </div>

             <div className="flex-1">
                {loadingReport ? (
                  <div className="h-full flex flex-col items-center justify-center text-indigo-500 space-y-3 mt-10">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold animate-pulse">Varlıklar kıyaslanıyor...</p>
                  </div>
                ) : report ? (
                  <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans markdown-content">
                    {report}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
                    <Scale className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-xs">Karşılaştırmak istediğiniz varlıkları seçin ve analiz alın.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
