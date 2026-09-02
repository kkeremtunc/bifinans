import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance';
import { SupportTicket } from '../types';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'Portföy Takibi',
  });

  const isManager = user?.role === 'BIRIM_YONETICI' || user?.role === 'SUPER_ADMIN';

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['tickets'],
    queryFn: async () => (await api.get('/tickets')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsModalOpen(false);
      setFormData({ subject: '', message: '', category: 'Portföy Takibi' });
      setErrorMsg(null);
      setSuccessMsg('Destek biletiniz başarıyla oluşturuldu ve yönetici ekibine iletildi!');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Destek bileti oluşturulurken bir hata oluştu.');
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) =>
      await api.put(`/tickets/${id}/respond`, { response, status: 'RESOLVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setReplyTicketId(null);
      setReplyText('');
      setSuccessMsg('Destek biletine yanıt başarıyla iletildi!');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Yanıtlama sırasında bir hata oluştu.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    createMutation.mutate(formData);
  };

  const handleReplySubmit = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    respondMutation.mutate({ id: ticketId, response: replyText });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Kullanıcı Destek Talepleri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isManager
              ? 'Birim yöneticisi paneli: Kullanıcılardan gelen teknik ve finansal destek biletlerini yönetin'
              : 'Destek biletlerinizi oluşturun ve yönetici yanıtlarını takip edin'}
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni Destek Bileti Oluştur
        </button>
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

      {/* Ticket List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="glass-card p-12 text-center text-slate-500">Destek biletleri yükleniyor...</div>
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      ticket.status === 'OPEN'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {ticket.status === 'OPEN' ? 'Yanıt Bekliyor' : 'Çözümlendi'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Kategori: {ticket.category}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {/* User Message */}
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
                {ticket.user && (
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    Gönderen: {ticket.user.name} {ticket.user.surname} ({ticket.user.email})
                  </div>
                )}
                <p className="leading-relaxed">{ticket.message}</p>
              </div>

              {/* Manager Response */}
              {ticket.response && (
                <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-1">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Birim Yöneticisi Yanıtı:
                  </div>
                  <p className="leading-relaxed">{ticket.response}</p>
                </div>
              )}

              {/* Manager Reply Form */}
              {isManager && !ticket.response && (
                <div className="pt-2">
                  {replyTicketId === ticket.id ? (
                    <form onSubmit={(e) => handleReplySubmit(e, ticket.id)} className="space-y-3">
                      <textarea
                        required
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Kullanıcıya yanıtınız..."
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={respondMutation.isPending}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {respondMutation.isPending ? 'Yanıtlanıyor...' : 'Yanıtı Gönder & Çözümle'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyTicketId(null)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-xl"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setReplyTicketId(ticket.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Bilete Yanıt Ver
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center text-slate-500">
            Kayıtlı destek bileti bulunmamaktadır.
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Yeni Destek Bileti</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Konu Başlığı</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Destek talebinizin konusu (en az 3 karakter)"
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
                  placeholder="Portföy Takibi, Bütçe, Hesap İşlemleri"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mesajınız</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detaylı açıklama yazınız (en az 10 karakter)..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-semibold text-xs shadow-lg shadow-blue-500/20"
                >
                  {createMutation.isPending ? 'Gönderiliyor...' : 'Bileti Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
