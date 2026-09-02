import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axiosInstance';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post('/auth/accept-disclaimer');
      onAccept();
    } catch (error) {
      console.error('Sözleşme onayı başarısız:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yasal Uyarı & Sorumluluk Reddi</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lütfen devam etmeden önce okuyup onaylayın.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p>
              BiFinans platformu üzerinde yer alan hiçbir analiz, tahmin ve grafik yatırım tavsiyesi değildir. Sitemizdeki kur değerlerinde ve piyasa verilerinde küçük farklılıklar veya gecikmeler olabilir.
            </p>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Platformumuzda sunulan yapay zeka destekli piyasa analizleri, geçmiş veriler ve genel istatistiksel modellere dayanmaktadır. Kesinlik taşımaz ve gelecekteki performansı garanti etmez.
            </p>
            <p>
              Yatırım kararlarınızdan doğabilecek her türlü kâr ve zarardan bizzat siz sorumlusunuz. BiFinans, verilerin doğruluğu veya yaşanabilecek veri kayıpları konusunda hiçbir hukuki sorumluluk kabul etmez.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/50 flex flex-col gap-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Okudum ve Kabul Ediyorum</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
