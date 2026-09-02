import React from 'react';
import { AlertTriangle, Info, CheckCircle, FileText, X } from 'lucide-react';

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kapsamlı Kullanıcı Sözleşmesi</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">BiFinans Platformu Kullanım Koşulları ve Sorumluluk Reddi (YTD)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-600 dark:text-amber-400 block mb-1">YASAL UYARI (YTD)</strong>
              Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir.
            </p>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <section>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">1. Genel Hükümler</h3>
              <p>
                İşbu sözleşme, BiFinans platformunu (bundan böyle "Platform" olarak anılacaktır) kullanan tüm kullanıcılar için geçerlidir. Platforma kayıt olan her kullanıcı, bu sözleşmenin tüm maddelerini okumuş, anlamış ve kabul etmiş sayılır.
              </p>
            </section>

            <section>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">2. Verilerin Doğruluğu ve Gecikmeler</h3>
              <p>
                Platform üzerinde sunulan anlık kur değerleri, hisse senedi fiyatları, kripto para piyasası verileri ve yapay zeka tarafından sağlanan istatistiksel öngörüler, üçüncü taraf sağlayıcılardan elde edilmektedir. Verilerde yaşanabilecek gecikme, eksiklik veya yanlışlıklardan BiFinans sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">3. Yatırım Tavsiyesi Değildir (YTD)</h3>
              <p>
                BiFinans platformu içerisindeki hiçbir metin, grafik, analiz, haber veya yapay zeka öngörüsü kesinlikle <strong>Yatırım Tavsiyesi Değildir</strong>. Sunulan analizler tamamen genel eğilimleri ve istatistiksel modelleri yansıtır. Kullanıcıların, buradaki bilgilere dayanarak alacakları yatırım kararlarından doğacak her türlü maddi veya manevi kâr/zarar tamamen kendi sorumluluklarındadır.
              </p>
            </section>

            <section>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">4. Kullanıcı Sorumlulukları</h3>
              <p>
                Kullanıcı, hesap güvenliğini sağlamakla ve şifresini üçüncü şahıslarla paylaşmamakla yükümlüdür. Platformun yapay zeka (AI) destekli özelliklerini manipüle etmeye çalışmak veya sistemi yanıltıcı sorgular (SPAM) göndermek yasaktır.
              </p>
            </section>

            <section>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">5. Hizmetin Değiştirilmesi veya Durdurulması</h3>
              <p>
                BiFinans, önceden haber vermeksizin platformun bir kısmını veya tamamını değiştirme, ücretli hale getirme veya kalıcı olarak durdurma hakkını saklı tutar.
              </p>
            </section>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-1/3 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-semibold transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={onAccept}
            className="w-full sm:w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Tüm Koşulları Okudum ve Kabul Ediyorum</span>
          </button>
        </div>
      </div>
    </div>
  );
};
