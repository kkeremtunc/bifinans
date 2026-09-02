import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance.js';
import { BudgetTransaction, TransactionType } from '../types/index.js';
import {
  Wallet,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Filter,
  X,
  PieChart,
  Calendar,
} from 'lucide-react';

export const BudgetPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    type: 'EXPENSE' as TransactionType,
    category: 'Market',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { data: transactions, isLoading } = useQuery<BudgetTransaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => (await api.get('/budget')).data.data,
  });

  const { data: summary } = useQuery({
    queryKey: ['budgetSummary'],
    queryFn: async () => (await api.get('/budget/summary')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/budget', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      setIsModalOpen(false);
      setFormData({
        type: 'EXPENSE',
        category: 'Market',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/budget/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  const filteredTransactions = transactions?.filter((tx) => {
    if (filterType === 'INCOME') return tx.type === 'INCOME';
    if (filterType === 'EXPENSE') return tx.type === 'EXPENSE';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Bütçe ve Harcama Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Aylık gelir, gider ve bütçe kalemlerinizi kaydedin</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yeni İşlem Ekle
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Gelir</span>
            <ArrowUpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₺{summary?.totalIncome?.toLocaleString('tr-TR') || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Giren toplam nakit kaynaklar</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Gider</span>
            <ArrowDownCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            ₺{summary?.totalExpense?.toLocaleString('tr-TR') || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Harcanan toplam nakit</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Tasarruf / Bakiye</span>
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className={`text-2xl font-bold ${(summary?.netBalance || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ₺{summary?.netBalance?.toLocaleString('tr-TR') || '0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Aylık net kalan nakit bakiye</div>
        </div>
      </div>

      {/* Category Breakdown & Distribution */}
      {summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Kategori Bazlı Harcama ve Gelir Dağılımı
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(summary.categoryBreakdown as Record<string, { income: number; expense: number }>).map(([cat, val]) => (
              <div key={cat} className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                  <span>{cat}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    ₺{(val.expense || val.income).toLocaleString('tr-TR')}
                  </span>
                </div>
                {val.expense > 0 && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (val.expense / (summary.totalExpense || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                )}
                {val.income > 0 && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (val.income / (summary.totalIncome || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">İşlem Geçmişi</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'ALL' ? 'bg-blue-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterType('INCOME')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'INCOME' ? 'bg-emerald-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
            >
              Gelirler
            </button>
            <button
              onClick={() => setFilterType('EXPENSE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'EXPENSE' ? 'bg-rose-600 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
            >
              Giderler
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Tarih</th>
                <th className="py-3.5 px-6">Tür</th>
                <th className="py-3.5 px-6">Kategori</th>
                <th className="py-3.5 px-6">Açıklama</th>
                <th className="py-3.5 px-6 text-right">Tutar</th>
                <th className="py-3.5 px-6 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredTransactions && filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(tx.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4 px-6">
                      {tx.type === 'INCOME' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                          Gelir
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
                          Gider
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{tx.category}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{tx.description}</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 dark:text-white">
                      {tx.type === 'INCOME' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => deleteMutation.mutate(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="İşlemi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Kayıtlı işlem bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Yeni Bütçe Kalemi Ekle</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">İşlem Tipi</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as TransactionType;
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      category: newType === 'INCOME' ? 'Maaş' : 'Market'
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="EXPENSE">Gider (Harcama)</option>
                  <option value="INCOME">Gelir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  {formData.type === 'INCOME' ? (
                    <>
                      <option value="Maaş">Maaş</option>
                      <option value="Yatırım Getirisi">Yatırım Getirisi</option>
                      <option value="Kira Geliri">Kira Geliri</option>
                      <option value="Ek İş">Ek İş</option>
                      <option value="Diğer Gelirler">Diğer Gelirler</option>
                    </>
                  ) : (
                    <>
                      <option value="Market">Market & Gıda</option>
                      <option value="Fatura">Fatura</option>
                      <option value="Kira">Kira</option>
                      <option value="Ulaşım">Ulaşım</option>
                      <option value="Eğlence">Eğlence & Aktivite</option>
                      <option value="Sağlık">Sağlık</option>
                      <option value="Eğitim">Eğitim</option>
                      <option value="Giyim">Giyim</option>
                      <option value="Yemek">Dışarıda Yemek</option>
                      <option value="Kredi/Borç">Kredi Ödemesi</option>
                      <option value="Diğer Giderler">Diğer Giderler</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tutar (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kısa açıklama..."
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-colors"
                >
                  {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
