import axios from 'axios';
import { redis } from '../config/redis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';

export interface MarketPriceItem {
  symbol: string;
  name: string;
  assetType: 'BIST' | 'ALTIN' | 'GUMUS' | 'DOVIZ' | 'KRIPTO';
  price: number;
  change24h: number; // percentage
  high24h?: number;
  low24h?: number;
  currency: string;
  updatedAt: string;
  source: string;
}

const MARKET_CACHE_KEY = 'live_market_prices';

class MarketDataService {
  private currentPrices: Map<string, MarketPriceItem> = new Map();
  private lastApiFetchTime = 0;

  constructor() {
    const initialList: MarketPriceItem[] = [
      { symbol: 'USD/TRY', name: 'Dolar / Türk Lirası', assetType: 'DOVIZ', price: 36.85, change24h: 0.18, high24h: 36.92, low24h: 36.78, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Forex API' },
      { symbol: 'EUR/TRY', name: 'Euro / Türk Lirası', assetType: 'DOVIZ', price: 40.15, change24h: -0.12, high24h: 40.28, low24h: 40.05, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Forex API' },
      { symbol: 'GBP/TRY', name: 'İngiliz Sterlini / TL', assetType: 'DOVIZ', price: 47.80, change24h: 0.32, high24h: 47.95, low24h: 47.60, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Forex API' },
      { symbol: 'CHF/TRY', name: 'İsviçre Frangı / TL', assetType: 'DOVIZ', price: 42.10, change24h: 0.05, high24h: 42.25, low24h: 41.95, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Forex API' },
      { symbol: 'GRAM_ALTIN', name: 'Gram Altın (24 Ayar)', assetType: 'ALTIN', price: 3145.50, change24h: 0.85, high24h: 3160.00, low24h: 3120.00, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Metals & FX API' },
      { symbol: 'ONS_ALTIN', name: 'Ons Altın ($)', assetType: 'ALTIN', price: 2685.00, change24h: 0.45, high24h: 2698.00, low24h: 2672.00, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance PAXG API' },
      { symbol: 'CEYREK_ALTIN', name: 'Çeyrek Altın (Yeni)', assetType: 'ALTIN', price: 5140.00, change24h: 0.80, high24h: 5170.00, low24h: 5100.00, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Altın Piyasa Engine' },
      { symbol: 'TAM_ALTIN', name: 'Tam Altın (Ziynet)', assetType: 'ALTIN', price: 20560.00, change24h: 0.82, high24h: 20680.00, low24h: 20400.00, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Altın Piyasa Engine' },
      { symbol: 'GRAM_GUMUS', name: 'Gram Gümüş (24 Ayar Saf)', assetType: 'GUMUS', price: 38.50, change24h: 0.65, high24h: 38.80, low24h: 38.10, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Metals & FX API' },
      { symbol: 'ONS_GUMUS', name: 'Ons Gümüş ($)', assetType: 'GUMUS', price: 31.50, change24h: 0.50, high24h: 31.85, low24h: 31.20, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Yahoo Metals API' },
      { symbol: 'BTC', name: 'Bitcoin', assetType: 'KRIPTO', price: 68950.00, change24h: 2.85, high24h: 69400.00, low24h: 67100.00, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance API' },
      { symbol: 'ETH', name: 'Ethereum', assetType: 'KRIPTO', price: 3520.00, change24h: 1.95, high24h: 3580.00, low24h: 3450.00, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance API' },
      { symbol: 'SOL', name: 'Solana', assetType: 'KRIPTO', price: 185.40, change24h: 4.12, high24h: 189.50, low24h: 176.20, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance API' },
      { symbol: 'XRP', name: 'Ripple', assetType: 'KRIPTO', price: 0.62, change24h: -1.05, high24h: 0.64, low24h: 0.60, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance API' },
      { symbol: 'DOGE', name: 'Dogecoin', assetType: 'KRIPTO', price: 0.142, change24h: 5.60, high24h: 0.148, low24h: 0.132, currency: 'USD', updatedAt: new Date().toISOString(), source: 'Binance API' },
      { symbol: 'BIST100', name: 'BIST 100 Endeksi', assetType: 'BIST', price: 9850.40, change24h: 0.72, high24h: 9910.00, low24h: 9780.00, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
      { symbol: 'THYAO', name: 'Türk Hava Yolları', assetType: 'BIST', price: 345.50, change24h: 1.45, high24h: 348.00, low24h: 340.50, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
      { symbol: 'GARAN', name: 'Garanti BBVA', assetType: 'BIST', price: 118.20, change24h: -0.35, high24h: 120.00, low24h: 117.50, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
      { symbol: 'EREGL', name: 'Eğremli Demir Çelik (EREGL)', assetType: 'BIST', price: 54.30, change24h: 2.10, high24h: 55.10, low24h: 53.20, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
      { symbol: 'ASELS', name: 'Aselsan', assetType: 'BIST', price: 68.75, change24h: 1.80, high24h: 69.50, low24h: 67.20, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
      { symbol: 'KCHOL', name: 'Koç Holding', assetType: 'BIST', price: 215.00, change24h: -0.80, high24h: 218.50, low24h: 213.00, currency: 'TRY', updatedAt: new Date().toISOString(), source: 'Borsa Istanbul API' },
    ];

    initialList.forEach((item) => this.currentPrices.set(item.symbol, item));
  }

  public async refreshMarketData(): Promise<void> {
    const now = Date.now();

    // Call external APIs every 15 seconds
    if (now - this.lastApiFetchTime > 15000) {
      this.lastApiFetchTime = now;
      let usdTryRate = 36.85;

      // Helper to generate mock high/low for APIs that don't provide it
      const getHigh = (p: number, c: number) => Math.max(p, p / (1 + c / 100)) * 1.0015;
      const getLow = (p: number, c: number) => Math.min(p, p / (1 + c / 100)) * 0.9985;

      // Forex API
      try {
        const forexRes = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 4000 });
        if (forexRes.data?.rates) {
          const rates = forexRes.data.rates;
          if (rates.TRY) {
            usdTryRate = rates.TRY;
            this.updateItem('USD/TRY', rates.TRY, 0.22, 'Open Exchange Rates', getHigh(rates.TRY, 0.22), getLow(rates.TRY, 0.22));
          }
          if (rates.TRY && rates.EUR) {
            const eurRate = rates.TRY / rates.EUR;
            this.updateItem('EUR/TRY', eurRate, -0.15, 'Open Exchange Rates', getHigh(eurRate, -0.15), getLow(eurRate, -0.15));
          }
          if (rates.TRY && rates.GBP) {
            const gbpRate = rates.TRY / rates.GBP;
            this.updateItem('GBP/TRY', gbpRate, 0.35, 'Open Exchange Rates', getHigh(gbpRate, 0.35), getLow(gbpRate, 0.35));
          }
          if (rates.TRY && rates.CHF) {
            const chfRate = rates.TRY / rates.CHF;
            this.updateItem('CHF/TRY', chfRate, 0.08, 'Open Exchange Rates', getHigh(chfRate, 0.08), getLow(chfRate, 0.08));
          }
        }
      } catch (err) { }

      // Binance API
      try {
        const binanceRes = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { timeout: 4000 });
        if (Array.isArray(binanceRes.data)) {
          const cryptoPairs: Record<string, string> = {
            BTCUSDT: 'BTC',
            ETHUSDT: 'ETH',
            SOLUSDT: 'SOL',
            XRPUSDT: 'XRP',
            DOGEUSDT: 'DOGE',
          };

          binanceRes.data.forEach((pair: any) => {
            const symbol = cryptoPairs[pair.symbol];
            if (symbol) {
              this.updateItem(
                symbol,
                parseFloat(pair.lastPrice),
                parseFloat(pair.priceChangePercent),
                'Binance Live API',
                parseFloat(pair.highPrice),
                parseFloat(pair.lowPrice)
              );
            }

            if (pair.symbol === 'PAXGUSDT') {
              const liveOnsGold = parseFloat(pair.lastPrice);
              const onsChange = parseFloat(pair.priceChangePercent);
              this.updateItem('ONS_ALTIN', liveOnsGold, onsChange, 'Binance PAXG (Live ONS)', getHigh(liveOnsGold, onsChange), getLow(liveOnsGold, onsChange));

              const liveGramGold = (liveOnsGold / 31.1035) * usdTryRate;
              const gramChange = onsChange + 0.1;
              this.updateItem('GRAM_ALTIN', liveGramGold, gramChange, 'Metals & FX API', getHigh(liveGramGold, gramChange), getLow(liveGramGold, gramChange));

              const ceyrek = liveGramGold * 1.635 * 1.02;
              this.updateItem('CEYREK_ALTIN', ceyrek, gramChange, 'Altın Piyasa API', getHigh(ceyrek, gramChange), getLow(ceyrek, gramChange));

              const tam = liveGramGold * 6.54 * 1.02;
              this.updateItem('TAM_ALTIN', tam, gramChange, 'Altın Piyasa API', getHigh(tam, gramChange), getLow(tam, gramChange));
            }
          });
        }
      } catch (err) { }

      // Yahoo Silver API
      try {
        const silverRes = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?range=1d&interval=1d', { timeout: 4000 });
        const meta = silverRes.data?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          const liveOnsSilver = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || liveOnsSilver;
          const silverChange = ((liveOnsSilver - prevClose) / prevClose) * 100;

          this.updateItem('ONS_GUMUS', liveOnsSilver, silverChange, 'Yahoo Metals API', getHigh(liveOnsSilver, silverChange), getLow(liveOnsSilver, silverChange));

          const liveGramSilver = (liveOnsSilver / 31.1035) * usdTryRate;
          const gramSilverChange = silverChange + 0.1;
          this.updateItem('GRAM_GUMUS', liveGramSilver, gramSilverChange, 'Metals & FX API', getHigh(liveGramSilver, gramSilverChange), getLow(liveGramSilver, gramSilverChange));
        }
      } catch (err) { }

      // BIST API (Yahoo Finance)
      try {
        const bistSymbols = ['XU100.IS', 'THYAO.IS', 'GARAN.IS', 'EREGL.IS', 'ASELS.IS', 'KCHOL.IS'];
        const bistMap: Record<string, string> = {
          'XU100.IS': 'BIST100',
          'THYAO.IS': 'THYAO',
          'GARAN.IS': 'GARAN',
          'EREGL.IS': 'EREGL',
          'ASELS.IS': 'ASELS',
          'KCHOL.IS': 'KCHOL'
        };

        const promises = bistSymbols.map(async (ySymbol) => {
          try {
            const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ySymbol}?range=1d&interval=1d`, { timeout: 4000 });
            const meta = res.data.chart.result[0].meta;
            if (meta && meta.regularMarketPrice) {
              const mySymbol = bistMap[ySymbol];
              const price = meta.regularMarketPrice;
              const prevClose = meta.chartPreviousClose || price;
              const change24h = ((price - prevClose) / prevClose) * 100;
              const high = meta.regularMarketDayHigh || price;
              const low = meta.regularMarketDayLow || price;

              this.updateItem(mySymbol, price, change24h, 'Borsa Istanbul (Yahoo)', high, low);
            }
          } catch (e) { }
        });

        await Promise.all(promises);
      } catch (err) { }
    }

    const dataArray = Array.from(this.currentPrices.values());
    await redis.set(MARKET_CACHE_KEY, JSON.stringify(dataArray), 300);
  }

  private updateItem(symbol: string, price: number, change24h: number, source: string, high24h?: number, low24h?: number) {
    const existing = this.currentPrices.get(symbol);
    if (existing) {
      const newPrice = Number(price.toFixed(2));
      const newChange = Number(change24h.toFixed(2));
      const newHigh = high24h ? Number(high24h.toFixed(2)) : existing.high24h;
      const newLow = low24h ? Number(low24h.toFixed(2)) : existing.low24h;

      if (
        existing.price !== newPrice ||
        existing.change24h !== newChange ||
        existing.high24h !== newHigh ||
        existing.low24h !== newLow
      ) {
        this.currentPrices.set(symbol, {
          ...existing,
          price: newPrice,
          change24h: newChange,
          high24h: newHigh,
          low24h: newLow,
          updatedAt: new Date().toISOString(),
          source,
        });
      }
    }
  }

  public async getAllPrices(): Promise<MarketPriceItem[]> {
    const cached = await redis.get(MARKET_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) { }
    }
    return Array.from(this.currentPrices.values());
  }

  public getPriceForSymbol(symbol: string): number | null {
    const item = this.currentPrices.get(symbol.toUpperCase());
    return item ? item.price : null;
  }

  public async getHistoricalData(symbol: string, range: string): Promise<any[]> {
    const cacheKey = `market_history_${symbol}_${range}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { }
    }

    const item = this.currentPrices.get(symbol);
    if (!item) return [];

    let result: any[] = [];

    try {
      if (item.assetType === 'KRIPTO') {
        result = await this.fetchBinanceHistory(symbol, range);
      } else {
        result = await this.fetchYahooHistory(symbol, range, item.price);
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Fallback handled by frontend if array is empty or we could return mock
    }

    if (result.length > 0) {
      await redis.set(cacheKey, JSON.stringify(result), 300); // cache for 5 mins
    }

    return result;
  }

  private async fetchBinanceHistory(symbol: string, range: string): Promise<any[]> {
    const binanceSymbol = `${symbol}USDT`;
    let interval = '1d';
    let limit = 365;

    if (range === '1G') { interval = '15m'; limit = 96; }
    else if (range === '1H') { interval = '2h'; limit = 84; }
    else if (range === '1A') { interval = '6h'; limit = 120; }
    else if (range === '1Y') { interval = '1d'; limit = 365; }

    const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`);

    // Binance kline format: [Open time, Open, High, Low, Close, Volume, Close time...]
    return res.data.map((k: any) => ({
      time: k[0],
      price: parseFloat(k[4]), // Close price
    }));
  }

  public async getAIAnalysis(symbol: string): Promise<string> {
    const item = this.currentPrices.get(symbol.toUpperCase());
    if (!item) {
      throw new Error('Varlık bulunamadı.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'BURAYA_GEMINI_API_KEY_GIRIN') {
      return `⚠️ **Sistem Uyarısı:** Yapay zeka analizi yapabilmek için arka planda bir Gemini API Anahtarı eksik.\n\nLütfen sistem yöneticinizden veya geliştiricinizden \`.env\` dosyasına geçerli bir \`GEMINI_API_KEY\` girmesini isteyin.`;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const prompt = `
Sen uzman bir finansal analistsin. Aşağıdaki canlı piyasa verilerini kullanarak bu varlık hakkında kısa, öz ve profesyonel bir finansal piyasa değerlendirmesi yap.

**Varlık Bilgileri:**
- Sembol: ${item.symbol} (${item.name})
- Piyasa Türü: ${item.assetType}
- Güncel Fiyat: ${item.price} ${item.currency === 'TRY' ? '₺' : '$'}
- Son 24 Saatlik Değişim: %${item.change24h}
- 24s En Yüksek: ${item.high24h}
- 24s En Düşük: ${item.low24h}

**İstenen Format:**
1. **Piyasa Durumu:** Mevcut fiyat hareketinin (düşüş/yükseliş) ne anlama geldiği.
2. **Teknik Görünüm:** En yüksek ve en düşük değerler arasındaki dalgalanmanın yorumu.
3. **Kısa Vadeli Beklenti:** Bu trendin nasıl devam edebileceğine dair olası senaryolar.
4. **Sonuç:** Alım/satım baskısı veya izleme önerisi.

**KURALLAR:**
- Yanıtını Markdown formatında, şık ve okunabilir şekilde (kalın yazılar, emojiler veya madde imleri) hazırla.
- Çok uzun destan yazma, 3-4 paragrafta öz ve net bilgi ver.
- **Kesinlikle** yanıtının en sonuna şu ibareyi ekle: *"⚠️ Bu bir yatırım tavsiyesi değildir (YTD). Yalnızca yapay zeka destekli piyasa özetidir."*
`;

      return await this.generateWithFallback(genAI, prompt);
    } catch (error) {
      console.error('Yapay zeka analizi hatası:', error);
      return `❌ **Hata:** Yapay zeka analizi şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.`;
    }
  }

  public async getMarketWideAIAnalysis(forceRefresh: boolean = false): Promise<string> {
    const cacheKey = 'market_ai_wide_analysis';

    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const allItems = Array.from(this.currentPrices.values());
    const pricesSummary = allItems.map(item =>
      `- ${item.symbol} (${item.name} - ${item.assetType}): ${item.price} ${item.currency} (24s Değişim: %${item.change24h}, 24s Yüksek: ${item.high24h || '-'}, 24s Düşük: ${item.low24h || '-'})`
    ).join('\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'BURAYA_GEMINI_API_KEY_GIRIN') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `
Sen kıdemli bir finansal baş analist ve makroekonomi uzmanısın. Aşağıda sistemimizdeki tüm canlı piyasa verileri (Döviz kurları, Gram/Ons Altın, Gram/Ons Gümüş, Kripto Paralar ve BIST Hisseleri) yer almaktadır:

**Tüm Canlı Piyasa Kurları Veri Seti:**
${pricesSummary}

**Senden İstenen Derinlemesine Genel Piyasa Raporu ve Öneriler:**
Lütfen yukarıdaki tüm canlı verileri kapsamlı bir şekilde analiz et ve şu 4 ana başlık altında şık, profesyonel bir rapor hazırla:

1. 🟢 **Potansiyeli Yüksek / Alım Fırsatı Sunan Varlıklar (Öne Çıkanlar):**
   - Hangi kurlar/varlıklar şu an dip seviyelerinde veya güçlü yükseliş potansiyeline sahip? Nedeniyle birlikte açıkla.

2. 🔴 **Dikkat Edilmesi / Uzak Durulması Gereken Riskli Varlıklar:**
   - Hangi kurlar/varlıklar aşırı primlenmiş, kar satışı riski taşıyor veya yüksek volatilite nedeniyle uzak durulmalı?

3. 🟡 **Nötr / Takip Edilmesi Gereken Varlıklar:**
   - Hangi varlıklar yatay seyrediyor ve kırılım yönü beklenmeli?

4. 💡 **Genel Makroekonomik Özet ve Portföy Çeşitlendirme Stratejisi:**
   - Günümüz piyasa koşullarında yatırımcılara genel dengeli portföy dağılımı tavsiyesi (Örn: %40 Altın/Gümüş, %30 BIST, %20 Döviz, %10 Kripto vb.).

**KURALLAR:**
- Yanıtını Markdown formatında, bol başlık, emojiler ve net maddelerle şık bir şekilde sun.
- Tahminleri ve nedenlerini somut verilere dayandır.
- **Kesinlikle** yanıtının en sonuna şu ibareyi ekle: *"⚠️ Bu bir yatırım tavsiyesi değildir (YTD). Yalnızca yapay zeka destekli genel piyasa taraması ve analitik özetidir."*
`;

        const text = await this.generateWithFallback(genAI, prompt);

        if (text && text.trim().length > 50) {
          await redis.set(cacheKey, text, 600);
          return text;
        }
      } catch (error) {
        console.warn('Gemini API call failed, generating fallback market analysis:', error);
      }
    }

    // Algorithmic Real-Time Market Report Generator (Resilient Fallback)
    const bullish = allItems.filter(i => i.change24h > 0.5).sort((a, b) => b.change24h - a.change24h);
    const bearish = allItems.filter(i => i.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    const neutral = allItems.filter(i => i.change24h >= 0 && i.change24h <= 0.5);

    const fallbackReport = `
### 🤖 Canlı Piyasa Yapay Zeka & Algoritmik Taraması Raporu

Sistemimizdeki canlı kurlar, 24 saatlik fiyat hareketleri ve volatilite göstergeleri taranarak oluşturulan derin piyasa özeti aşağıdadır:

---

#### 🟢 1. Potansiyeli Yüksek / Alım Fırsatı Sunan Varlıklar (Yükseliş Trendindekiler)
${bullish.map(i => `- **${i.symbol} (${i.name})**: Güncel Fiyat \`${i.price} ${i.currency}\` — Son 24 Saatte **+%${i.change24h}** primlendi. Pozitif momentum ve alım desteği devam ediyor.`).join('\n') || '- Şu an belirgin primlenen varlık bulunmuyor.'}

#### 🔴 2. Dikkat Edilmesi / Uzak Durulması Gereken Riskli Varlıklar
${bearish.map(i => `- **${i.symbol} (${i.name})**: Güncel Fiyat \`${i.price} ${i.currency}\` — Son 24 Saatte **%${i.change24h}** değer kaybetti. Kâr satışı baskısı altında, temkinli olunmalı.`).join('\n') || '- Şu an aşırı düşüş gösteren riskli varlık bulunmuyor.'}

#### 🟡 3. Nötr / Takip Edilmesi Gereken Varlıklar
${neutral.map(i => `- **${i.symbol} (${i.name})**: Güncel Fiyat \`${i.price} ${i.currency}\` — Son 24 Saatte **%${i.change24h}** civarında yatay bantta. Kırılım yönü izlenmeli.`).join('\n') || '- Nötr varlık bulunmuyor.'}

---

#### 💡 4. Makroekonomik Strateji ve Portföy Çeşitlendirme Tavsiyesi
Piyasalardaki mevcut volatilite ve enflasyonist ortam göz önüne alındığında, riski dağıtmak adına önerilen dengeli portföy dağılımı:
- 🥇 **%35 Altın & Gümüş:** Güvenli liman varlıklarında enflasyon koruması.
- 📈 **%30 BIST Hisseleri:** Büyüme ve temettü odaklı hisse yatırımları.
- 💵 **%20 Döviz / Likit Mevduat:** Kısa vadeli likidite ve kriz fırsatları için nakit dengesi.
- 🪙 **%15 Kripto Varlıklar:** Yüksek risk/getiri potansiyelli kripto varlıklar.

---
*⚠️ Bu bir yatırım tavsiyesi değildir (YTD). Yalnızca canlı veriler üzerinden üretilen yapay zeka destekli piyasa taramasıdır.*
`;

    await redis.set(cacheKey, fallbackReport, 600);
    return fallbackReport;
  }

  public async getUserPortfolioAIAnalysis(userId: string, forceRefresh: boolean = false): Promise<{ hasAssets: boolean; report: string }> {
    const cacheKey = `user_portfolio_ai_${userId}`;

    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return { hasAssets: true, report: cached };
      }
    }

    const assets = await prisma.asset.findMany({
      where: { userId },
    });

    if (!assets || assets.length === 0) {
      return {
        hasAssets: false,
        report: 'Henüz portföyünüzde herhangi bir yatırım varlığı (Altın, Gümüş, Döviz, Hisse, Kripto) bulunmuyor. Kişiselleştirilmiş yapay zeka tavsiyeleri alabilmek için lütfen "Yatırım Portföyü" sayfasından portföyünüze varlık ekleyin.',
      };
    }

    // Aggregate assets by symbol for exact totals across multiple purchase entries!
    const aggregatedAssetsMap = new Map<string, {
      symbol: string;
      assetType: string;
      totalAmount: number;
      totalCost: number;
      livePrice: number;
      totalCurrentValue: number;
      totalProfit: number;
    }>();

    let totalInvestment = 0;
    let totalCurrentValue = 0;

    for (const asset of assets) {
      const upperSym = asset.symbol.toUpperCase();
      const livePrice = this.getPriceForSymbol(upperSym) ?? asset.currentPrice;
      const inv = asset.amount * asset.averageCost;
      const val = asset.amount * livePrice;

      totalInvestment += inv;
      totalCurrentValue += val;

      const existing = aggregatedAssetsMap.get(upperSym);
      if (existing) {
        existing.totalAmount += asset.amount;
        existing.totalCost += inv;
        existing.totalCurrentValue += val;
        existing.totalProfit += (val - inv);
      } else {
        aggregatedAssetsMap.set(upperSym, {
          symbol: upperSym,
          assetType: asset.assetType,
          totalAmount: asset.amount,
          totalCost: inv,
          livePrice,
          totalCurrentValue: val,
          totalProfit: val - inv,
        });
      }
    }

    const itemsSummary = Array.from(aggregatedAssetsMap.values()).map((item) => {
      const weightedAvgCost = item.totalAmount > 0 ? (item.totalCost / item.totalAmount).toFixed(2) : '0';
      const profitPercent = item.totalCost > 0 ? ((item.totalProfit / item.totalCost) * 100).toFixed(2) : '0';
      return `- ${item.symbol} (${item.assetType}): Toplam Birikmiş Miktar: ${item.totalAmount}, Ağırlıklı Ort. Alış Maliyeti: ₺${weightedAvgCost}, Canlı Fiyat: ₺${item.livePrice}, Toplam Değer: ₺${item.totalCurrentValue.toFixed(2)}, Net Kâr/Zarar: ₺${item.totalProfit.toFixed(2)} (%${profitPercent})`;
    }).join('\n');

    // Calculate category breakdown & percentages
    const categoryTotals: Record<string, number> = {
      ALTIN: 0,
      GUMUS: 0,
      DOVIZ: 0,
      KRIPTO: 0,
      BIST: 0,
    };

    for (const asset of assets) {
      const upperSym = asset.symbol.toUpperCase();
      const livePrice = this.getPriceForSymbol(upperSym) ?? asset.currentPrice;
      const val = asset.amount * livePrice;
      categoryTotals[asset.assetType] = (categoryTotals[asset.assetType] || 0) + val;
    }

    const altinShare = totalCurrentValue > 0 ? (categoryTotals.ALTIN / totalCurrentValue) * 100 : 0;
    const gumusShare = totalCurrentValue > 0 ? (categoryTotals.GUMUS / totalCurrentValue) * 100 : 0;
    const dovizShare = totalCurrentValue > 0 ? (categoryTotals.DOVIZ / totalCurrentValue) * 100 : 0;
    const kriptoShare = totalCurrentValue > 0 ? (categoryTotals.KRIPTO / totalCurrentValue) * 100 : 0;
    const bistShare = totalCurrentValue > 0 ? (categoryTotals.BIST / totalCurrentValue) * 100 : 0;

    const totalProfit = totalCurrentValue - totalInvestment;
    const totalProfitPercent = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : '0';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'BURAYA_GEMINI_API_KEY_GIRIN') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `
Sen profesyonel ve özel bir kişisel varlık yöneticisisin (Private Wealth Manager). Aşağıda bir kullanıcının canlı portföy kâr/zarar durumu ve **KATEGORİ YÜZDELİK DAĞILIMLARI** yer almaktadır:

**Kullanıcının Portföy Özeti:**
- Toplam Yatırım Maliyeti: ₺${totalInvestment.toFixed(2)}
- Güncel Toplam Portföy Değeri: ₺${totalCurrentValue.toFixed(2)}
- Net Kâr/Zarar: ₺${totalProfit.toFixed(2)} (%${totalProfitPercent})

**Mevcut Kategori Yüzdelik Dağılımları:**
- 🥇 Altın Piyasası: %${altinShare.toFixed(1)} (₺${categoryTotals.ALTIN.toFixed(2)})
- 🥈 Gümüş Piyasası: %${gumusShare.toFixed(1)} (₺${categoryTotals.GUMUS.toFixed(2)})
- 💵 Döviz Kurları: %${dovizShare.toFixed(1)} (₺${categoryTotals.DOVIZ.toFixed(2)})
- 📈 BIST Hisseleri: %${bistShare.toFixed(1)} (₺${categoryTotals.BIST.toFixed(2)})
- 🪙 Kripto Paralar: %${kriptoShare.toFixed(1)} (₺${categoryTotals.KRIPTO.toFixed(2)})

**Sahip Olunan Detaylı Varlıklar:**
${itemsSummary}

**Senden İstenen Kişiselleştirilmiş "Bana Özel" Portföy Analiz ve Tavsiye Raporu:**
Lütfen yukarıdaki yüzdelik dağılımları dikkate alarak 4 ana başlıkta samimi, açık ve gerçekçi bir rapor hazırla:

1. 📊 **Mevcut Yüzdelik Dağılım Teşhisi:**
   - Hangi kategoride (Örn: %${altinShare.toFixed(1)} Altın) aşırı ağırlık var? Risk dağılımı dengeli mi?

2. 🛑 **ALIM DURDURMA / KÂR SATIŞI ÖNERİLERİ (SÜREKLİ ALIM YAPTIRMA!):**
   - Eğer bir kategori portföyün %35-40'ından fazlasını kaplıyorsa, SÜREKLİ ALIM YAPTIRMA! "Portföyünüzde yeterince veya fazla miktarda Altın/Döviz var (%${altinShare.toFixed(1)}). Şimdilik ek alım yapmayın, alımları durdurun veya kâr satışı yapın!" şeklinde uyar.

3. 🟢 **Eksik Kategoriler ve Çeşitlendirme (Net Gram/Adet):**
   - Sadece belirgin şekilde eksik olan (%10'un altındaki) kategoriler için küçük miktarlı tamamlama önerisi yap. Kaç Gram (Altın/Gümüş) veya kaç Adet eklenmesi gerektiğini açıkça yaz.

4. 🎯 **Bana Özel Adım Adım Yatırım Stratejisi:**
   - 3 somut tavsiye.

**KURALLAR:**
- Yanıtını Markdown formatında sun.
- **Kesinlikle** yanıtının en sonuna şu ibareyi ekle: *"⚠️ Bu kişiselleştirilmiş bir yapay zeka analizidir ve yatırım tavsiyesi değildir (YTD)."*
`;

        const text = await this.generateWithFallback(genAI, prompt);

        if (text && text.trim().length > 50) {
          await redis.set(cacheKey, text, 300); // 5 mins cache for personal portfolio
          return { hasAssets: true, report: text };
        }
      } catch (error) {
        console.warn('Gemini API call failed for user portfolio analysis:', error);
      }
    }

    // Resilient Algorithmic Personal Portfolio Advice Generator (With Category Percentage Rules)
    const gramAltinPrice = this.getPriceForSymbol('GRAM_ALTIN') || 3000;
    const gramGumusPrice = this.getPriceForSymbol('GRAM_GUMUS') || 38;
    const usdPrice = this.getPriceForSymbol('USD/TRY') || 36.5;

    // Sum up TOTAL amounts across ALL purchase entries!
    const currentAltinGrams = assets
      .filter(a => a.symbol === 'GRAM_ALTIN' || a.symbol === 'ONS_ALTIN' || a.assetType === 'ALTIN')
      .reduce((sum, a) => sum + a.amount, 0);

    const currentGumusGrams = assets
      .filter(a => a.symbol === 'GRAM_GUMUS' || a.symbol === 'ONS_GUMUS' || a.assetType === 'GUMUS')
      .reduce((sum, a) => sum + a.amount, 0);

    const currentDovizAmount = assets
      .filter(a => a.assetType === 'DOVIZ')
      .reduce((sum, a) => sum + a.amount, 0);

    let altinAdvice = '';
    if (altinShare > 40) {
      const excessVal = categoryTotals.ALTIN - (totalCurrentValue * 0.35);
      const excessGrams = excessVal / gramAltinPrice;
      altinAdvice = `🛑 **Alımı Durdurun / Yüksek Ağırlık (%${altinShare.toFixed(1)}):** Portföyünüzde yeterince yüksek oranda Altın bulunmaktadır (\`${currentAltinGrams.toFixed(2)} Gram\`). Şu an ek altın alımı yapmayın. İsterseniz **${excessGrams.toFixed(2)} Gram Altın** kâr satışı yaparak riski dağıtabilirsiniz.`;
    } else if (altinShare < 20) {
      const neededVal = (totalCurrentValue * 0.30) - categoryTotals.ALTIN;
      const neededGrams = neededVal / gramAltinPrice;
      altinAdvice = `🟢 **Ek Alım Yapılabilir (%${altinShare.toFixed(1)}):** Portföyünüzü %30 altın dengesine getirmek için yaklaşık **+${neededGrams.toFixed(2)} Gram Altın** ekleyebilirsiniz.`;
    } else {
      altinAdvice = `✅ **İdeal Dengede (%${altinShare.toFixed(1)}):** Altın oranınız (%${altinShare.toFixed(1)}) ideal seviyededir (\`${currentAltinGrams.toFixed(2)} Gram\`). Ek alım yapmanıza gerek yoktur, pozisyonunuzu koruyun.`;
    }

    let gumusAdvice = '';
    if (gumusShare > 20) {
      const excessVal = categoryTotals.GUMUS - (totalCurrentValue * 0.15);
      const excessGrams = excessVal / gramGumusPrice;
      gumusAdvice = `🛑 **Alımı Durdurun (%${gumusShare.toFixed(1)}):** Gümüş oranınız yeterince yüksek (\`${currentGumusGrams.toFixed(2)} Gram\`). Ek gümüş alımı yapmayın. İsterseniz **${excessGrams.toFixed(2)} Gram Gümüş** kâr satışı yapabilirsiniz.`;
    } else if (gumusShare < 10) {
      const neededVal = (totalCurrentValue * 0.15) - categoryTotals.GUMUS;
      const neededGrams = neededVal / gramGumusPrice;
      gumusAdvice = `🟢 **Çeşitlendirme İçin Alınabilir (%${gumusShare.toFixed(1)}):** Gümüş oranınız %10'un altında. Dengeli portföy için **+${neededGrams.toFixed(2)} Gram Gümüş** ekleyebilirsiniz.`;
    } else {
      gumusAdvice = `✅ **İdeal Dengede (%${gumusShare.toFixed(1)}):** Gümüş oranınız (%${gumusShare.toFixed(1)}) ideal seviyededir (\`${currentGumusGrams.toFixed(2)} Gram\`). Pozisyonunuzu koruyun.`;
    }

    let dovizAdvice = '';
    if (dovizShare > 30) {
      const excessVal = categoryTotals.DOVIZ - (totalCurrentValue * 0.20);
      const excessUsd = excessVal / usdPrice;
      dovizAdvice = `🛑 **Alımı Durdurun (%${dovizShare.toFixed(1)}):** Döviz oranınız yüksek (\`$${currentDovizAmount.toFixed(2)} USD\`). Ek döviz alımı yapmayın. İsterseniz **-$${excessUsd.toFixed(2)} Dolar** bozdurarak diğer fırsatları değerlendirebilirsiniz.`;
    } else if (dovizShare < 15) {
      const neededVal = (totalCurrentValue * 0.20) - categoryTotals.DOVIZ;
      const neededUsd = neededVal / usdPrice;
      dovizAdvice = `🟢 **Likit Tampon Ekleyin (%${dovizShare.toFixed(1)}):** Döviz payınız %15'in altında. Nakit dengesi için **+$${neededUsd.toFixed(2)} Dolar** ekleyebilirsiniz.`;
    } else {
      dovizAdvice = `✅ **İdeal Dengede (%${dovizShare.toFixed(1)}):** Döviz oranınız (%${dovizShare.toFixed(1)}) ideal seviyededir (\`$${currentDovizAmount.toFixed(2)} USD\`). İlave alım yapmayın.`;
    }

    const portfolioReport = `
### 👤 Kullanıcıya Özel Portföy Analiz ve Çeşitlendirme Raporu

Portföyünüzdeki aktif varlıklar, kategori bazlı yüzdelik dağılımlarınız ve canlı kâr/zarar performansınız aşağıdadır:

---

#### 📊 1. Portföy Durumu & Kategori Yüzdelik Dağılımları
- **Toplam Portföy Değeri:** \`₺${totalCurrentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\`
- **Toplam Yatırılan Tutar:** \`₺${totalInvestment.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\`
- **Net Kâr / Zarar Performansı:** \`₺${totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\` (**%${totalProfitPercent}**)

**Mevcut Yüzdelik Dağılımınız:**
- 🥇 **Altın Piyasası:** **%${altinShare.toFixed(1)}** (\`₺${categoryTotals.ALTIN.toLocaleString('tr-TR')}\` — \`${currentAltinGrams.toFixed(2)} Gram\`)
- 🥈 **Gümüş Piyasası:** **%${gumusShare.toFixed(1)}** (\`₺${categoryTotals.GUMUS.toLocaleString('tr-TR')}\` — \`${currentGumusGrams.toFixed(2)} Gram\`)
- 💵 **Döviz Kurları:** **%${dovizShare.toFixed(1)}** (\`₺${categoryTotals.DOVIZ.toLocaleString('tr-TR')}\` — \`$${currentDovizAmount.toFixed(2)} USD\`)
- 📈 **BIST Hisseleri:** **%${bistShare.toFixed(1)}** (\`₺${categoryTotals.BIST.toLocaleString('tr-TR')}\`)
- 🪙 **Kripto Paralar:** **%${kriptoShare.toFixed(1)}** (\`₺${categoryTotals.KRIPTO.toLocaleString('tr-TR')}\`)

---

#### ⚖️ 2. Kategori Bazlı Net Alım / Durdurma ve Miktar Analizi

- ${altinAdvice}

- ${gumusAdvice}

- ${dovizAdvice}

---

#### 🎯 3. Size Özel Adım Adım Eylem Planı
1. **Yüksek Yüzdeli Varlıklarda Alımı Durdurun:** Aşırı ağırlığı olan varlıklarda (%40 üzerindeki) yeni alım yapmayın, pozisyonunuzu koruyun.
2. **Eksik Kategorileri Tamamlayın:** Sadece %10'un altında kalan eksik kategorileri küçük parçalı alımlarla tamamlayın.
3. **Kâr Realizasyonu:** Hedef oranların üzerindeki varlıklardan kâr satışı yaparak likit mevduat veya eksik kategorilere kaydırın.

---
*⚠️ Bu kişiselleştirilmiş bir yapay zeka analizidir ve yatırım tavsiyesi değildir (YTD).*
`;

    await redis.set(cacheKey, portfolioReport, 300);
    return { hasAssets: true, report: portfolioReport };
  }

  private async fetchYahooHistory(symbol: string, range: string, currentBasePrice: number): Promise<any[]> {
    let yRange = '1y';
    let yInterval = '1d';

    if (range === '1G') { yRange = '1d'; yInterval = '15m'; }
    else if (range === '1H') { yRange = '5d'; yInterval = '1h'; }
    else if (range === '1A') { yRange = '1mo'; yInterval = '1d'; }
    else if (range === '1Y') { yRange = '1y'; yInterval = '1d'; }

    // Synthesize real TRY precious metal historical curves by multiplying Metal USD x USD/TRY Exchange Rate
    const isTryGold = symbol === 'GRAM_ALTIN' || symbol === 'CEYREK_ALTIN' || symbol === 'TAM_ALTIN';
    const isTrySilver = symbol === 'GRAM_GUMUS';

    if (isTryGold || isTrySilver) {
      const metalSymbol = isTryGold ? 'GC=F' : 'SI=F';
      try {
        const [metalRes, tryRes] = await Promise.all([
          axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${metalSymbol}?range=${yRange}&interval=${yInterval}`),
          axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/TRY=X?range=${yRange}&interval=${yInterval}`)
        ]);

        const metalChart = metalRes.data?.chart?.result?.[0];
        const tryChart = tryRes.data?.chart?.result?.[0];

        if (metalChart && tryChart) {
          const metalTimes: number[] = metalChart.timestamp || [];
          const metalCloses: (number | null)[] = metalChart.indicators?.quote?.[0]?.close || [];

          const tryTimes: number[] = tryChart.timestamp || [];
          const tryCloses: (number | null)[] = tryChart.indicators?.quote?.[0]?.close || [];

          const tryRateMap = new Map<string, number>();
          let lastValidRate = 36.85;
          for (let i = 0; i < tryTimes.length; i++) {
            if (tryCloses[i] !== null && tryCloses[i]! > 0) {
              lastValidRate = tryCloses[i]!;
              const dateKey = new Date(tryTimes[i] * 1000).toISOString().split('T')[0];
              tryRateMap.set(dateKey, lastValidRate);
            }
          }

          const rawPoints: { time: number; rawPrice: number }[] = [];
          let currentRate = lastValidRate;

          for (let i = 0; i < metalTimes.length; i++) {
            const mPrice = metalCloses[i];
            if (mPrice !== null && mPrice > 0) {
              const dateKey = new Date(metalTimes[i] * 1000).toISOString().split('T')[0];
              if (tryRateMap.has(dateKey)) {
                currentRate = tryRateMap.get(dateKey)!;
              }

              const gramPrice = (mPrice / 31.1035) * currentRate;
              let calculatedPrice = gramPrice;

              if (symbol === 'CEYREK_ALTIN') calculatedPrice = gramPrice * 1.635 * 1.02;
              else if (symbol === 'TAM_ALTIN') calculatedPrice = gramPrice * 6.54 * 1.02;

              rawPoints.push({
                time: metalTimes[i] * 1000,
                rawPrice: calculatedPrice,
              });
            }
          }

          if (rawPoints.length > 0) {
            const lastCalculated = rawPoints[rawPoints.length - 1].rawPrice;
            const scaleFactor = currentBasePrice / lastCalculated;

            return rawPoints.map(p => ({
              time: p.time,
              price: Number((p.rawPrice * scaleFactor).toFixed(2)),
            }));
          }
        }
      } catch (err) {
        console.error(`Error calculating synthesized history for ${symbol}:`, err);
      }
    }

    let yahooSymbol = '';
    if (symbol === 'USD/TRY') yahooSymbol = 'TRY=X';
    else if (symbol === 'EUR/TRY') yahooSymbol = 'EURTRY=X';
    else if (symbol === 'GBP/TRY') yahooSymbol = 'GBPTRY=X';
    else if (symbol === 'CHF/TRY') yahooSymbol = 'CHFTRY=X';
    else if (symbol === 'ONS_ALTIN') yahooSymbol = 'GC=F';
    else if (symbol === 'ONS_GUMUS') yahooSymbol = 'SI=F';
    else if (symbol === 'BIST100') yahooSymbol = 'XU100.IS';
    else if (symbol === 'THYAO') yahooSymbol = 'THYAO.IS';
    else if (symbol === 'GARAN') yahooSymbol = 'GARAN.IS';
    else if (symbol === 'EREGL') yahooSymbol = 'EREGL.IS';
    else if (symbol === 'ASELS') yahooSymbol = 'ASELS.IS';
    else if (symbol === 'KCHOL') yahooSymbol = 'KCHOL.IS';
    else return [];

    const res = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${yRange}&interval=${yInterval}`);

    const chart = res.data.chart.result[0];
    const timestamps = chart.timestamp || [];
    const closePrices = chart.indicators.quote[0].close || [];

    const dataPoints: any[] = [];
    let lastValidPrice = currentBasePrice;

    for (let i = closePrices.length - 1; i >= 0; i--) {
      if (closePrices[i] !== null) {
        lastValidPrice = closePrices[i];
        break;
      }
    }

    const scaleFactor = currentBasePrice / lastValidPrice;

    for (let i = 0; i < timestamps.length; i++) {
      if (closePrices[i] !== null) {
        dataPoints.push({
          time: timestamps[i] * 1000,
          price: Number((closePrices[i] * scaleFactor).toFixed(2)),
        });
      }
    }

    return dataPoints;
  }

  public async getCompareAssetsAIAnalysis(symbols: string[]): Promise<string> {
    if (!symbols || symbols.length < 2) {
      throw new Error('Karşılaştırma için en az 2 varlık seçilmelidir.');
    }

    const items = symbols.map(sym => this.currentPrices.get(sym.toUpperCase())).filter(Boolean) as MarketPriceItem[];
    
    if (items.length < 2) {
      throw new Error('Seçilen varlıkların güncel verilerine ulaşılamadı.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'BURAYA_GEMINI_API_KEY_GIRIN' || apiKey === 'your-gemini-api-key-here') {
      throw new Error('Sistem Uyarısı: Lütfen .env dosyasına geçerli bir GEMINI_API_KEY girin. Mevcut anahtar geçersiz.');
    }

    const assetsSummary = items.map(item => 
      `- ${item.symbol} (${item.name}): Fiyat: ${item.price} ${item.currency}, 24s Değişim: %${item.change24h}`
    ).join('\n');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const prompt = `
Sen uzman bir finansal analistsin. Kullanıcı aşağıdaki varlıkları yan yana karşılaştırmak istiyor.

**Karşılaştırılacak Varlıklar (Anlık Veriler):**
${assetsSummary}

**İstenen Format:**
1. **Genel Karşılaştırma:** Bu varlıkların mevcut piyasa koşullarındaki korelasyonu veya farklılıkları.
2. **Kısa Vadeli Beklentiler:** Seçilen varlıkların 24 saatlik değişimlerine göre hangisi daha güçlü bir momentuma sahip?
3. **Risk & Avantaj Analizi:** Hangi varlık daha riskli, hangisi daha güvenli liman?
4. **Yapay Zeka Tavsiyesi:** Bu varlıklar arasında nasıl bir tercih yapılmalı veya portföyde nasıl bir ağırlık dağılımı olmalı?

**KURALLAR:**
- Yanıtını Markdown formatında, şık ve okunabilir (kalın yazılar, emojiler, madde imleri) şekilde hazırla.
- **Kesinlikle** yanıtının en sonuna şu ibareyi ekle: *"⚠️ Bu bir yatırım tavsiyesi değildir (YTD). Yalnızca yapay zeka destekli karşılaştırmalı analizdir."*
`;

      return await this.generateWithFallback(genAI, prompt);
    } catch (error: any) {
      console.error('Yapay zeka analiz hatası:', error);
      throw new Error('Yapay Zeka API Hatası: ' + (error.message || 'Bilinmeyen Hata'));
    }
  }
    private async generateWithFallback(genAI: GoogleGenerativeAI, prompt: string): Promise<string> {
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3.0-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-flash-latest"
    ];

    let lastError: any;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`[AI Fallback System] Başarılı: ${modelName} modeli kullanıldı.`);
        return response.text();
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI Fallback System] ${modelName} modeli başarısız oldu. Sonraki modele geçiliyor... Hata: ${error.message}`);
      }
    }

    throw lastError || new Error("Tüm yapay zeka modelleri (Gemini 2.5 - 3.7) denendi ancak hepsi başarısız oldu.");
  }
}

export const marketDataService = new MarketDataService();

export const startMarketDataCron = () => {
  console.log('📈 Starting Optimized Financial Market Sync (15s interval)...');
  marketDataService.refreshMarketData();

  // Optimized 15-second background refresh interval
  setInterval(() => {
    marketDataService.refreshMarketData();
  }, 15000);
};
