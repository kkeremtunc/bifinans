import React from 'react';
import { Lightbulb, ArrowRight, TrendingUp, Wallet, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartWizardCardProps {
  assetsCount?: number;
  assetTypesCount?: number;
  transactionsCount?: number;
}

export const SmartWizardCard: React.FC<SmartWizardCardProps> = ({
  assetsCount = 0,
  assetTypesCount = 0,
  transactionsCount = 0,
}) => {
  const navigate = useNavigate();

  let title = 'Akıllı Başlangıç Önerisi';
  let message = '';
  let buttonText = '';
  let buttonPath = '';
  let icon = Lightbulb;

  if (assetsCount === 0 && transactionsCount === 0) {
    title = '💡 İlk Adımı Atın!';
    message = 'Henüz bir varlık veya harcama eklemediniz. Başlamak için hemen ilk bütçe kaleminizi veya yatırımınızı sisteme girin.';
    buttonText = 'İlk İşlemini Ekle';
    buttonPath = '/budget';
    icon = Wallet;
  } else if (assetsCount === 0) {
    title = '💡 Portföyünüzü Oluşturun!';
    message = 'Bütçenizi oluşturdunuz! Şimdi elinizdeki hisse, altın, fon veya döviz varlıklarınızı girerek enflasyon getirisini takip edin.';
    buttonText = 'Varlık Ekle';
    buttonPath = '/assets';
    icon = TrendingUp;
  } else if (assetTypesCount <= 1) {
    title = '💡 Varlık Çeşitlendirme Uyarısı';
    message = 'Tüm birikiminiz tek bir varlık türünde bulunuyor. Risklerinizi dağıtmak için farklı yatırım araçlarını (Hisse, Altın, Fon vb.) inceleyebilirsiniz.';
    buttonText = 'Portföyü Çeşitlendir';
    buttonPath = '/assets';
    icon = TrendingUp;
  } else {
    title = '💡 Günün Finansal İpucu';
    message = '50/30/20 kuralıyla bütçenizin %50\'sini ihtiyaçlara, %30\'unu isteklerinize ve %20\'sini yatırımlara ayırarak finansal özgürlüğe ulaşabilirsiniz.';
    buttonText = 'Finans Sözlüğünü Oku';
    buttonPath = '/rehber';
    icon = BookOpen;
  }

  const IconComponent = icon;

  return (
    <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50 dark:from-amber-950/20 via-slate-50 dark:via-slate-900 to-slate-100/90 dark:to-slate-900/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start md:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 mt-0.5 md:mt-0">
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">{message}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(buttonPath)}
        className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-105"
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
