import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import { ContentItem } from '../types';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const ContentPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING'>('APPROVED');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Piyasa Bülteni',
  });

  const isContentManager = user?.role === 'ICERIK_YONETICI' || user?.role === 'SUPER_ADMIN' || user?.role === 'BIRIM_YONETICI';
  const isUnitManager = user?.role === 'BIRIM_YONETICI' || user?.role === 'SUPER_ADMIN';

  const { data: approvedContents } = useQuery<ContentItem[]>({
    queryKey: ['approvedContents'],
    queryFn: async () => (await api.get('/content')).data.data,
  });

  const { data: pendingContents } = useQuery<ContentItem[]>({
    queryKey: ['pendingContents'],
    queryFn: async () => (await api.get('/content/pending')).data.data,
    enabled: isContentManager,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/content', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pendingContents'] });
      setIsModalOpen(false);
      setFormData({ title: '', summary: '', content: '', category: 'Piyasa Bülteni' });
      setErrorMsg(null);
      setSuccessMsg('Bülten başlığı ve taslağı başarıyla oluşturuldu! Birim Yöneticisi onayına iletildi.');
      setActiveTab('PENDING'); // Automatically switch to pending tab so user sees their new draft!
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Bülten oluşturulurken bir hata oluştu.');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => await api.put(`/content/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedContents'] });
      queryClient.invalidateQueries({ queryKey: ['pendingContents'] });
      setSuccessMsg('Finansal bülten başarıyla onaylandı ve yayına alındı!');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Bülten onaylanırken bir hata oluştu.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedContents'] });
      queryClient.invalidateQueries({ queryKey: ['pendingContents'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Finansal Bülten ve Piyasa İçerik Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Finansal analizler, piyasa bültenleri ve yönetici onay mekanizması
          </p>
        </div>

        {isContentManager && (
          <button
            onClick={() => {
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Bülten Taslağı Oluştur
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      {isContentManager && (
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'APPROVED' ? 'bg-blue-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Yayındaki Bültenler
          </button>

          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors relative ${
              activeTab === 'PENDING' ? 'bg-amber-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Onay Bekleyen Taslaklar
            {pendingContents && pendingContents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-slate-900 dark:text-white text-[10px] font-bold">
                {pendingContents.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Content Grid */}
      {activeTab === 'APPROVED' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedContents && approvedContents.length > 0 ? (
            approvedContents.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{item.summary}</p>
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Yazar: {item.author ? `${item.author.name} ${item.author.surname}` : 'İçerik Editörü'}</span>
                  {isUnitManager && (
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 glass-card p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              Yayında bülten bulunmamaktadır.
            </div>
          )}
        </div>
      ) : (
        /* PENDING APPROVAL QUEUE */
        <div className="space-y-4">
          {pendingContents && pendingContents.length > 0 ? (
            pendingContents.map((item) => (
              <div key={item.id} className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      ONAY BEKLİYOR
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• Kategori: {item.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{item.summary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isUnitManager ? (
                    <button
                      onClick={() => approveMutation.mutate(item.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {approveMutation.isPending ? 'Onaylanıyor...' : 'Bülteni Onayla ve Yayınla'}
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                      Birim Yöneticisi Onayı Bekleniyor
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              Onay bekleyen bülten taslağı bulunmuyor.
            </div>
          )}
        </div>
      )}

      {/* New Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Finansal Bülten Taslağı Hazırla
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Bülten Başlığı</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: BIST 100 Haftalık Analiz Raporu"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Piyasa Bülteni, Mevzuat & Haber, Kripto Analiz"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Özet Metni</label>
                <input
                  type="text"
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Kısa özet..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Detaylı İçerik</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Finans bülten detayları..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-1/2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 dark:text-white font-semibold text-xs shadow-lg shadow-purple-500/20"
                >
                  {createMutation.isPending ? 'Gönderiliyor...' : 'Onaya Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
