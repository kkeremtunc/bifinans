import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosInstance.js';
import { AuditLog, User, Role, UserStatus } from '../types/index.js';
import { ShieldAlert, Users, Filter, CheckCircle2, ShieldCheck, Search, Activity, Plus, X } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'USERS'>('AUDIT');
  const [filterAction, setFilterAction] = useState<string>('');
  
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'STANDART_KULLANICI' as Role,
  });

  const { data: auditLogs, isLoading: isAuditLoading } = useQuery<AuditLog[]>({
    queryKey: ['auditLogs', filterAction],
    queryFn: async () => {
      const url = filterAction ? `/admin/audit-logs?action=${filterAction}` : '/admin/audit-logs';
      return (await api.get(url)).data.data;
    },
    enabled: activeTab === 'AUDIT',
  });

  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: async () => (await api.get('/admin/users')).data.data,
    enabled: activeTab === 'USERS',
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role, status }: { userId: string; role?: Role; status?: UserStatus }) =>
      await api.put('/admin/users/role', { userId, role, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserForm) => await api.post('/auth/register', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsCreateUserModalOpen(false);
      setNewUserForm({
        name: '',
        surname: '',
        email: '',
        password: '',
        role: 'STANDART_KULLANICI',
      });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu.');
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUserForm);
  };

  const actionColorMap: Record<string, string> = {
    CREATE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    READ: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    UPDATE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    DELETE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Süper Admin Özel Denetim Paneli</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          Audit Log İnceleme & Kullanıcı Rol Yönetimi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sistemde gerçekleşen tüm CRUD işlemlerini IP ve User-Agent detaylarıyla append-only olarak denetleyin
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'AUDIT' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Audit Log İnceleme Paneli (Append-Only)
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'USERS' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Kullanıcı & Rol Yönetim Paneli
        </button>
      </div>

      {/* AUDIT LOG TAB */}
      {activeTab === 'AUDIT' && (
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Sistem Güvenlik Logları
            </h2>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800"
              >
                <option value="">Tüm İşlemler</option>
                <option value="CREATE">CREATE (Oluşturma)</option>
                <option value="READ">READ (Okuma)</option>
                <option value="UPDATE">UPDATE (Güncelleme)</option>
                <option value="DELETE">DELETE (Silme)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Tarih / Saat</th>
                  <th className="py-3.5 px-6">Kullanıcı</th>
                  <th className="py-3.5 px-6">Eylem (Action)</th>
                  <th className="py-3.5 px-6">Hedef Varlık (Entity)</th>
                  <th className="py-3.5 px-6">IP Adresi</th>
                  <th className="py-3.5 px-6">User-Agent / Cihaz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {isAuditLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      Audit logları yükleniyor...
                    </td>
                  </tr>
                ) : auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-4 px-6 font-sans">
                        {log.user ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{log.user.name} {log.user.surname}</div>
                            <div className="text-[10px] text-slate-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Anonim / Sistem</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-sans">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${actionColorMap[log.action]}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-900 dark:text-white font-semibold">{log.targetEntity}</td>
                      <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400">{log.ipAddress}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      Kayıtlı audit log bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER & ROLE MANAGEMENT TAB */}
      {activeTab === 'USERS' && (
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sistem Kullanıcıları ve Yetki Düzenleme</h2>
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Yeni Kullanıcı Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Ad Soyad</th>
                  <th className="py-3.5 px-6">E-posta Adresi</th>
                  <th className="py-3.5 px-6">Aktif Rol (RBAC)</th>
                  <th className="py-3.5 px-6">Hesap Statüsü</th>
                  <th className="py-3.5 px-6">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Kullanıcılar yükleniyor...
                    </td>
                  </tr>
                ) : users && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        {u.name} {u.surname}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">{u.email}</td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateUserMutation.mutate({ userId: u.id, role: e.target.value as Role })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="STANDART_KULLANICI">STANDART_KULLANICI</option>
                          <option value="ICERIK_YONETICI">ICERIK_YONETICI</option>
                          <option value="BIRIM_YONETICI">BIRIM_YONETICI</option>
                          <option value="GENEL_KOORDINATOR">GENEL_KOORDINATOR</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={u.status}
                          onChange={(e) =>
                            updateUserMutation.mutate({ userId: u.id, status: e.target.value as UserStatus })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <option value="ACTIVE">AKTİF</option>
                          <option value="PASSIVE">PASİF</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Yeni Kullanıcı Oluştur</h3>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ad</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Soyad</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.surname}
                    onChange={(e) => setNewUserForm({ ...newUserForm, surname: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Şifre</label>
                <input
                  type="text"
                  required
                  placeholder="Kullanıcının giriş şifresi"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hesap Rolü</label>
                <select
                  required
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                >
                  <option value="STANDART_KULLANICI">STANDART_KULLANICI (Bütçe/Portföy)</option>
                  <option value="ICERIK_YONETICI">ICERIK_YONETICI (Sözlük Editörü)</option>
                  <option value="BIRIM_YONETICI">BIRIM_YONETICI (Destek Merkezi)</option>
                  <option value="GENEL_KOORDINATOR">GENEL_KOORDINATOR (Analiz)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Tam Yetki)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-semibold text-xs transition-colors"
                >
                  {createUserMutation.isPending ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
