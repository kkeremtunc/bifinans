import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Lock, Mail, AlertCircle, Coins, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (step === 'LOGIN') {
        const res = await login(email, password);
        if (res.requires2FA) {
          setTempToken(res.tempToken);
          setStep('2FA');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (!tempToken) return;
        await verify2FA(tempToken, twoFactorCode);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo className="scale-125 mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Kişiselleştirilmiş Finans ve Portföy Yönetimi</p>
        </div>

        {/* Card Form */}
        <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Sisteme Giriş Yap
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 'LOGIN' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@borsa.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                  Google Authenticator Kodu
                </label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setStep('LOGIN'); setTempToken(null); setTwoFactorCode(''); }}
                  className="mt-4 text-xs text-slate-500 hover:text-blue-500 text-center w-full"
                >
                  Geri Dön
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'İşleniyor...' : (step === 'LOGIN' ? 'Giriş Yap' : 'Doğrula ve Giriş Yap')}
            </button>
          </form>



          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Kayıt Olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
