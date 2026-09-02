import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Wallet, TrendingUp, CheckCircle, ChevronRight, X, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const storageKey = `onboarding_completed_${user?.id || 'guest'}`;

  useEffect(() => {
    if (user) {
      const isCompleted = localStorage.getItem(storageKey);
      if (!isCompleted) {
        setIsOpen(true);
      }
    }
  }, [user, storageKey]);

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  const handleResetTour = () => {
    setCurrentStep(1);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleResetTour}
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-semibold shadow-xl shadow-blue-500/30 flex items-center gap-2 border border-blue-400/30 transition-all hover:scale-105"
        title="Başlangıç Turunu Tekrar Başlat"
      >
        <Compass className="w-4 h-4" />
        <span>Rehber Turu</span>
      </button>
    );
  }

  const steps = [
    {
      title: 'BiFinans\'a Hoş Geldiniz! 🚀',
      description:
        'Finansal durumunuzu kontrol altına almak, harcamalarınızı yönetmek ve yatırımlarınızın gerçek (enflasyondan arındırılmış) getirisini görmek artık çok kolay.',
      icon: Sparkles,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: '1. Adım: Bütçe ve Harcama Yönetimi 💰',
      description:
        'Aylık maaş, temettü gibi gelirleriniz ile kira, fatura, market gibi giderlerinizi "Bütçe & Harcamalar" modülünden kolayca ekleyin. Nereye ne kadar harcadığınızı net görün.',
      icon: Wallet,
      color: 'from-purple-600 to-pink-600',
      actionText: 'Bütçe Paneline Git',
      actionPath: '/budget',
    },
    {
      title: '2. Adım: Yatırım ve Portföy Takibi 📈',
      description:
        'Hisse senedi (BIST), TEFAS yatırım fonu, Altın, Döviz ve Kripto varlıklarınızı ekleyin. Sistem enflasyon oranını otomatik hesaba katarak paranızın reel değer artışını hesaplar.',
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      actionText: 'Portföy Ekranına Git',
      actionPath: '/assets',
    },
    {
      title: 'Harika! Başlamaya Hazırsınız! 🎉',
      description:
        'Artık sistemin tüm özelliklerini keşfedebilirsiniz. Aklınıza takılan terimler için finansal sözlüğümüzü veya üst menüdeki rehberi inceleyebilirsiniz.',
      icon: CheckCircle,
      color: 'from-blue-600 to-emerald-600',
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 md:p-8 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Badge Indicator */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">İlk Başlangıç Rehberi</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono">
            {currentStep} / {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Main Step Content */}
        <div className="text-center space-y-4 py-2">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentStepData.color} flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20`}
          >
            <StepIcon className="w-8 h-8 text-slate-900 dark:text-white" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{currentStepData.title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{currentStepData.description}</p>
        </div>

        {/* Action button if present */}
        {currentStepData.actionPath && (
          <div className="text-center pt-1">
            <button
              onClick={() => {
                navigate(currentStepData.actionPath!);
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {currentStepData.actionText} →
            </button>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white disabled:opacity-30"
          >
            Önceki
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20"
            >
              Başlayalım! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
