import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Coins, User as UserIcon, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Role } from '../types/index.js';
import { AgreementModal } from '../components/common/AgreementModal';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    role: 'STANDART_KULLANICI' as Role,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await register(formData);
      setSuccess('Hesabınız başarıyla oluşturuldu. Giriş ekranına yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-xl shadow-blue-500/20 mb-2">
            <Coins className="w-6 h-6 text-slate-900 dark:text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Yeni Hesap Oluştur</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Platforma erişim sağlamak için bilgilerinizi giriniz</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Ad
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ahmet"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Soyad
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Yılmaz"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                E-posta Adresi
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ahmet@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Şifre
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>


            <label className="flex items-start gap-2 p-3 mt-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/50 hover:bg-slate-200/50 dark:bg-slate-800/50 transition-colors">
              <input
                type="checkbox"
                required
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.value === 'true' ? false : e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-white dark:bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                BiFinans platformu <button type="button" onClick={() => setIsAgreementOpen(true)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Kullanım Koşullarını ve Sorumluluk Reddi (YTD)</button> sözleşmesini okudum, anladım ve kabul ediyorum.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-semibold text-xs transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>

      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAccept={() => {
          setIsAgreed(true);
          setIsAgreementOpen(false);
        }}
      />
    </div>
  );
};
