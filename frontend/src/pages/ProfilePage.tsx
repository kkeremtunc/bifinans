import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axiosInstance';
import { User, Shield, QrCode, CheckCircle, ShieldOff, AlertCircle, Trash2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    setIs2FAEnabled(user?.isTwoFactorEnabled || false);
  }, [user]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.post('/auth/2fa/generate');
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setSetupMode(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/2fa/enable', { token });
      setSuccess('2 Adımlı doğrulama başarıyla aktifleştirildi.');
      setIs2FAEnabled(true);
      setSetupMode(false);
      setQrCodeUrl(null);
      setSecret(null);
      setToken('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Geçersiz kod');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/2fa/disable', { token });
      setSuccess('2 Adımlı doğrulama başarıyla kapatıldı.');
      setIs2FAEnabled(false);
      setToken('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Geçersiz kod');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.delete('/auth/me', { data: { password: deletePassword } });
      setSuccess('Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hesap silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-900/20 via-slate-50 dark:via-slate-900 to-slate-100/90 dark:to-slate-900/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500/30 flex items-center justify-center font-bold text-3xl shrink-0 shadow-lg">
            {user?.name?.[0]}{user?.surname?.[0]}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {user?.name} {user?.surname}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
              <User className="w-4 h-4" /> {user?.email}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <span>Rol: {user?.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm flex gap-3 items-center">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Security Settings - 2FA */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0d1322]/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Güvenlik Ayarları (2FA)</h2>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm">
            {!setupMode && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {is2FAEnabled ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <ShieldOff className="w-5 h-5 text-slate-400" />}
                    <span>2 Adımlı Doğrulama (2FA)</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'}`}>
                    {is2FAEnabled ? 'AKTİF' : 'PASİF'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Google Authenticator kullanarak hesabınıza ekstra bir güvenlik katmanı ekleyin ve yetkisiz erişimleri engelleyin.
                </p>
              </>
            )}

            {!is2FAEnabled && !setupMode && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                2FA'yı Etkinleştir
              </button>
            )}

            {!is2FAEnabled && setupMode && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mx-auto w-fit shadow-md">
                  {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" /> : <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg"></div>}
                </div>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400 px-4">
                  Google Authenticator uygulamasını açın ve yukarıdaki QR kodu okutun.
                </p>
                
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono p-4 text-lg rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSetupMode(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleEnable}
                    disabled={token.length !== 6 || loading}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            )}

            {is2FAEnabled && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  2FA'yı devre dışı bırakmak için Authenticator uygulamanızdaki güncel 6 haneli kodu girin.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono p-4 text-lg rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  onClick={handleDisable}
                  disabled={token.length !== 6 || loading}
                  className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <ShieldOff className="w-5 h-5" />
                  Devre Dışı Bırak
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account */}
        <div className="glass-card p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-rose-500/10">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hesabı Kalıcı Olarak Sil</h2>
          </div>

          <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white/50 dark:bg-rose-900/10 shadow-sm h-[calc(100%-4rem)] flex flex-col justify-center">
            {!deleteMode ? (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">Tehlikeli Bölge</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                    Hesabınızı sildiğinizde, içerikleriniz hariç tüm kişisel verileriniz, portföyünüz ve bütçe geçmişiniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                  </p>
                </div>
                <button
                  onClick={() => setDeleteMode(true)}
                  className="w-full py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-colors shadow-md shadow-rose-500/20 flex justify-center items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hesabımı Kalıcı Olarak Sil
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 text-center">Silme işlemini onaylayın</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                  Lütfen işlemi onaylamak için mevcut şifrenizi girin.
                </p>
                
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Hesap Şifreniz"
                  className="w-full p-4 text-center rounded-xl bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteMode(false);
                      setDeletePassword('');
                    }}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || loading}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50"
                  >
                    Hesabı Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
