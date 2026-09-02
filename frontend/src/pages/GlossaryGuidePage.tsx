import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Coins,
} from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  category: 'Borsa & Hisse' | 'Yatırım Fonları' | 'Bütçe & Harcama' | 'Risk & Getiri' | 'Güvenlik';
  simpleDefinition: string;
  detailedExplanation: string;
  example: string;
}

const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: 'bist',
    term: 'BIST (Borsa İstanbul)',
    category: 'Borsa & Hisse',
    simpleDefinition: 'Türkiye’deki şirketlerin hisse senetlerinin alınıp satıldığı resmi borsa piyasasıdır.',
    detailedExplanation:
      'Şirketler sermaye bulmak için hisselerini halka açar. Yatırımcılar da bu hisseleri alarak şirketin küçük bir ortağı olurlar. Şirket kâr ettikçe hisse değeri artabilir veya temettü (kâr payı) ödeyebilir.',
    example: 'Örnek: THYAO (Türk Hava Yolları) hissesi aldığınızda şirketin büyümesine ortak olursunuz.',
  },
  {
    id: 'tefas',
    term: 'TEFAS (Yatırım Fonları Platformu)',
    category: 'Yatırım Fonları',
    simpleDefinition: 'Profesyonel portföy yöneticileri tarafından yönetilen yatırım fonlarının tek bir yerden alınıp satıldığı devlet güvenceli platformdur.',
    detailedExplanation:
      'Borsayı tek tek takip etmek istemeyenler için uzmanların seçtiği hisse, altın veya döviz sepetlerine (fonlara) yatırım yapma imkanı sunar.',
    example: 'Örnek: Bir fon aldığınızda içinde 30 farklı hisse senedi ve altın bulunabilir.',
  },
  {
    id: 'portfoy',
    term: 'Portföy',
    category: 'Risk & Getiri',
    simpleDefinition: 'Sahip olduğunuz tüm yatırım varlıklarının (hisse, altın, mevduat, kripto) toplam sepetidir.',
    detailedExplanation:
      'Tek bir yatırım aracına bağlı kalmak risklidir. Tüm yumurtaları aynı sepete koymamak prensibine portföy denir.',
    example: 'Örnek: %40 Altın, %30 Hisse Senedi, %30 Döviz içeren harmanlanmış yatırım sepeti.',
  },
  {
    id: 'reel-getiri',
    term: 'Enflasyondan Arındırılmış Kazanç (Reel Getiri)',
    category: 'Risk & Getiri',
    simpleDefinition: 'Yatırımınızın enflasyonu yendikten sonra paranıza kattığı GERÇEK satın alma gücü artışıdır.',
    detailedExplanation:
      'Paranız %30 değer kazanmış olabilir ama yıllık enflasyon %40 ise paranız aslında erimiştir. Reel getiri formülü: ((1 + Nominal Getiri) / (1 + Enflasyon)) - 1',
    example: 'Örnek: %50 kazandınız ama enflasyon %40 ise reel (gerçek) kazancınız yaklaşık %7.1’dir.',
  },
  {
    id: 'nominal-getiri',
    term: 'Nominal Getiri',
    category: 'Risk & Getiri',
    simpleDefinition: 'Enflasyon hesaba katılmadan, paranızın rakamsal olarak ne kadar arttığını gösteren ham kazançtır.',
    detailedExplanation:
      '100 TL yatırıp 130 TL aldığınızda nominal getiriniz %30’dur.',
    example: 'Örnek: Cüzdanınızdaki 100.000 TL’nin 120.000 TL olması (%20 Nominal Getiri).',
  },
  {
    id: 'ortalama-maliyet',
    term: 'Ortalama Alış Maliyeti',
    category: 'Borsa & Hisse',
    simpleDefinition: 'Farklı zamanlarda ve farklı fiyatlardan aldığınız bir varlığın adet başına düşen ortalama birim fiyatıdır.',
    detailedExplanation:
      'Fiyat düştükçe parça parça alım yaparak ortalama maliyetinizi düşürebilirsiniz (DCA stratejisi).',
    example: 'Örnek: 100 TL’den 1 hisse, sonra 80 TL’den 1 hisse aldınız. Ortalama maliyetiniz (100+80)/2 = 90 TL olur.',
  },
  {
    id: 'varlik-cesitlendirme',
    term: 'Varlık Çeşitlendirmesi (Diversification)',
    category: 'Risk & Getiri',
    simpleDefinition: 'Paranızı tek bir yere yatırmak yerine farklı sektör ve araçlara dağıtarak riski azaltma yöntemidir.',
    detailedExplanation:
      'Hisse piyasası düşerken altın yükselebilir. Çeşitlendirme yapan yatırımcı büyük çöküşlerden korunur.',
    example: 'Örnek: Sadece tek bir hisse almak yerine teknoloji, sanayi, altın ve döviz arasında bölüştürmek.',
  },
  {
    id: 'rule-50-30-20',
    term: '50/30/20 Bütçe Kuralı',
    category: 'Bütçe & Harcama',
    simpleDefinition: 'Aylık net gelirinizi 3 ana kategoriye bölerek yönetmenizi sağlayan dünyaca ünlü finans kuralıdır.',
    detailedExplanation:
      '• %50 İhtiyaçlar (Kira, Fatura, Mutfak)\n• %30 İstekler (Eğlence, Hobiler, Tatil)\n• %20 Yatırım & Birikim (Gelecek güvencesi)',
    example: 'Örnek: 50.000 TL maaşın 25.000 TL’si ihtiyaca, 15.000 TL’si eğlenceye, 10.000 TL’si yatırıma ayrılır.',
  },
  {
    id: 'dual-token',
    term: 'Dual-Token Güvenlik Mimarisi',
    category: 'Güvenlik',
    simpleDefinition: 'Sisteme giriş yaptığınızda şifrenizi çalınmaya karşı koruyan çift anahtarlı güvenlik teknolojisidir.',
    detailedExplanation:
      'Kısa süreli erişim anahtarı (Access Token) bellekte saklanır. Uzun süreli oturum anahtarı (Refresh Token) ise tarayıcının korumalı HttpOnly çerezinde saklanır.',
    example: 'Örnek: Banka uygulamalarında tek kullanımlık SMS şifresi ile oturum sürdürme mantığına benzer.',
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'Borsaya ve yatırıma yeni başlayan biri nereden başlamalı?',
    answer:
      'İlk adım olarak acil durum fonu oluşturmalısınız (3-6 aylık gideriniz kadar birikim). Ardından tüm paranızla tek seferde almak yerine her ay düzenli küçük miktarlarla çeşitlendirilmiş bir portföy (Hisse + Altın + Fon) oluşturarak uzun vadeli düşünmelisiniz.',
  },
  {
    question: 'Aylık bütçe yaparken 50/30/20 kuralı nasıl uygulanır?',
    answer:
      'Maaşınız yattığı an ilk olarak %20’lik kısmı yatırım hesabınıza aktarın (Kendinize ilk ödemeyi yapın). Kalan %50 ile zorunlu fatura ve kira ödemelerinizi yapın. Kalan %30 ise kişisel harcamalarınız içindir.',
  },
  {
    question: 'Enflasyona karşı birikimlerimi nasıl koruyabilirim?',
    answer:
      'Paranızı mevduat veya nakitte tutmak enflasyon karşısında değer kaybettirir. Enflasyonun üzerinde getiri sağlama potansiyeli olan hisse senetleri, gayrimenkul/hisse ağırlıklı yatırım fonları ve altın gibi reel varlıklara yatırım yapmalısınız.',
  },
  {
    question: 'BiFinans platformundaki verilerimin güvenliği nasıl sağlanıyor?',
    answer:
      'Sistemimiz Dual-Token Auth teknolojisi, IP tabanlı rate limiting ve her işlemi kayıt altına alan silinemez Audit Log yapısıyla korunur. Şifreleriniz bcrypt algoritmalarıyla kırılması imkansız şekilde hash’lenir.',
  },
];

export const GlossaryGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GLOSSARY' | 'FAQ'>('GLOSSARY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const categories = ['Tümü', 'Borsa & Hisse', 'Yatırım Fonları', 'Bütçe & Harcama', 'Risk & Getiri', 'Güvenlik'];

  const filteredTerms = GLOSSARY_DATA.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eğitici Finansal Okuryazarlık Rehberi</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Finans Terimleri Sözlüğü & Başlangıç Rehberi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Karmaşık finans kavramlarını herkesin anlayabileceği en yalın dille öğrenin, bütçenizi bilinçle yönetin
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('GLOSSARY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'GLOSSARY'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Finansal Terimler Sözlüğü ({GLOSSARY_DATA.length})
        </button>

        <button
          onClick={() => setActiveTab('FAQ')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'FAQ'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Nereden Başlamalıyım? & SSS
        </button>
      </div>

      {/* GLOSSARY TAB */}
      {activeTab === 'GLOSSARY' && (
        <div className="space-y-6">
          {/* Search and Category Filters */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Terim veya kelime ara (Örn: Reel Getiri, Portföy, 50/30/20)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 font-semibold mr-1">Kategoriler:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold'
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((term) => (
                <div
                  key={term.id}
                  className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      {term.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{term.term}</h3>

                  <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold leading-relaxed bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    💡 Kısaca: {term.simpleDefinition}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{term.detailedExplanation}</p>

                  {term.example && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      {term.example}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 glass-card p-12 text-center text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-800">
                Aradığınız terim bulunamadı. Lütfen başka bir arama kelimesi deneyin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ & STARTING GUIDE TAB */}
      {activeTab === 'FAQ' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Sıkça Sorulan Sorular & Başlangıç Rehberi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Yatırım yolculuğunda en çok merak edilen konular ve pratik öneriler
            </p>

            <div className="space-y-3 pt-2">
              {FAQ_DATA.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs md:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 bg-slate-950/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
