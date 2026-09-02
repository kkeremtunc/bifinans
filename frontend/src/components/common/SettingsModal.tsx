import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, QrCode, CheckCircle, ShieldOff, AlertCircle } from 'lucide-react';
import { api } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Güvenlik Ayarları</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hesabınızı güvende tutun</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm flex gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 2FA Status */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {!setupMode && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {is2FAEnabled ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <ShieldOff className="w-4 h-4 text-slate-400" />}
                    2 Adımlı Doğrulama (2FA)
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {is2FAEnabled ? 'AKTİF' : 'PASİF'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Google Authenticator kullanarak hesabınıza ekstra bir güvenlik katmanı ekleyin.
                </p>
              </>
            )}

            {!is2FAEnabled && !setupMode && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                2FA'yı Etkinleştir
              </button>
            )}

            {!is2FAEnabled && setupMode && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <div className="bg-white p-3 rounded-xl border border-slate-200 mx-auto w-fit shadow-sm">
                  {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" /> : <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg"></div>}
                </div>
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 px-4">
                  Google Authenticator uygulamasını açın ve yukarıdaki QR kodu okutun.
                </div>
                
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSetupMode(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleEnable}
                    disabled={token.length !== 6 || loading}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm disabled:opacity-50"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            )}

            {is2FAEnabled && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  2FA'yı devre dışı bırakmak için Authenticator uygulamanızdaki güncel kodu girin.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleDisable}
                  disabled={token.length !== 6 || loading}
                  className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <ShieldOff className="w-4 h-4" />
                  Devre Dışı Bırak
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
