import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';
import { Sparkles, Bot, RefreshCw, UserCheck, Globe, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AiAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENEL' | 'BANA_OZEL'>('GENEL');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string>('');
  const [hasAssets, setHasAssets] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const fetchAnalysis = async (tab: 'GENEL' | 'BANA_OZEL', refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = tab === 'GENEL' ? '/market/analyze-all' : '/market/analyze-portfolio';
      const res = await api.get(`${endpoint}${refresh ? '?refresh=true' : ''}`);
      setReport(res.data.data);
      if (tab === 'BANA_OZEL') {
        setHasAssets(res.data.hasAssets !== false);
      } else {
        setHasAssets(true);
      }
      setUpdatedAt(new Date().toLocaleTimeString('tr-TR'));
    } catch (err: any) {
      console.error('Yapay zeka analiz hatası:', err);
      setError('Yapay zeka raporu alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(activeTab, false);
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Akıllı Finansal Asistan
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Yapay Zeka Piyasa & Portföy Raporu</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canlı kurlar üzerinden genel piyasa analizi ve kişisel portföy önerileri</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {updatedAt && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700">
              {updatedAt}
            </span>
          )}
          <button
            onClick={() => fetchAnalysis(activeTab, true)}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold text-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analiz Ediliyor...' : 'Analizi Yenile'}</span>
          </button>
        </div>
      </div>

      {/* Tab Selectors: Genel Piyasa Raporu vs Bana Özel Portföy Analizi */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('GENEL')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GENEL'
              ? 'bg-indigo-600 text-slate-900 dark:text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Genel Piyasa Taraması & Öneriler</span>
        </button>

        <button
          onClick={() => setActiveTab('BANA_OZEL')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BANA_OZEL'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>👤 Bana Özel Portföy Analizi & Tavsiyeleri</span>
        </button>
      </div>

      {/* Main Content Display Box */}
      <div className="bg-white dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-indigo-600 dark:text-indigo-400 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold animate-pulse">
              {activeTab === 'GENEL'
                ? 'Yapay zeka tüm canlı piyasa verilerini analiz ediyor...'
                : 'Yapay zeka kişisel portföyünüzü ve kâr/zarar performansınızı inceliyor...'}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-600 dark:text-rose-400 space-y-3">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => fetchAnalysis(activeTab, true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Tekrar Deneyin
            </button>
          </div>
        ) : !hasAssets && activeTab === 'BANA_OZEL' ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-4">
            <UserCheck className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400 opacity-60" />
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Portföyünüz Henüz Boş</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kişiselleştirilmiş yapay zeka tavsiyesi (neleri eklemeli, neleri satmalı) alabilmek için portföyünüze varlık ekleyin.
              </p>
            </div>
            <Link
              to="/assets"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-bold text-xs shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Portföyüme Varlık Ekle →</span>
            </Link>
          </div>
        ) : (
          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans space-y-4">
            {report}
          </div>
        )}
      </div>
    </div>
  );
};
