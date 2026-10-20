# BiFinans - Proje Geliştirme ve Ajan Yönetim Kuralları

Bu kurallar, **BiFinans (Borsa & Kişiselleştirilmiş Finans Portföy Takip Platformu)** projesinin modüler, güvenli, hatasız ve sürdürülebilir şekilde geliştirilmesi için tanımlanmıştır.

---

### 1. Model Seçim ve Kota Yönetimi Kuralı
Yeni bir aşamaya veya göreve geçmeden önce kullanıcıya en uygun modeli ve kota dostu yedeğini mutlaka hatırlat:

1. **Planlama, Dosya İnceleme, UI Taslakları ve Hızlı Görevler:**
   - **Öneri:** `Gemini 3.8 Flash (Low veya Medium)` *(Ultra hızlı, kotayı neredeyse hiç harcamaz).*

2. **Frontend, Backend Kodlama, API ve Prisma Veritabanı İşleri:**
   - **Birincil Öneri:** `Claude Sonnet 5.5 (Medium)`
   - **Kota Dostu / Hızlı Yedek:** `Gemini 3.8 Flash (High)` *(Claude kotasını korumak için mükemmel alternatif).*

3. **Kritik Finansal Mantık, Ağır Refactor ve Çözülemeyen Hatalar:**
   - **Birincil Öneri:** `Claude Opus 5.5 (Medium veya High)`
   - **Yedek:** `Claude Sonnet 5.5 (High)`

*Not: Claude kotasının kısıtlı olabileceği her durumda yedek olarak daima `Gemini 3.8 Flash` seçeneğini belirt.*

---

### 2. Dinamik Ajan Sistemi (İhtiyaca Göre Artıp Azalabilir)

Görevlerin karmaşıklığına göre aşağıdaki ajanlar **ihtiyaç duyuldukça devreye alınır veya devre dışı bırakılır**.

#### 🏛️ Çekirdek Ajanlar (Her Geliştirmede Aktif)
* **Ajan 1: Frontend & Finansal UI Ustası (React / Vite / Tailwind)**
  - Portföy ekranları, Recharts grafikleri, bütçe yönetimi, canlı piyasa ticker'ı ve profil sayfalarının duyarlı (responsive) ve şık (dark/light) geliştirilmesinden sorumludur.
  - İki yönlü hesaplama formlarını (miktar ↔ maliyet ↔ toplam tutar) akıcı ve reaktif kılar.
  - Gereksiz re-render'ları ve stil bozulmalarını önler.

* **Ajan 2: Backend & API Güvenlik Mimarı (Node.js / Express / Prisma / TypeScript)**
  - Port 5001 üzerinde koşan Express mimarisinden, Prisma (`dev.db`) modellerinden ve JWT/RBAC yetkilendirmesinden sorumludur.
  - Zod validasyonu, In-Memory/Redis token kara liste mekanizması ve audit loglama süreçlerini yönetir.
  - Port çakışmalarını önleyen Graceful Shutdown prensiplerine uyar.

* **Ajan 3: Hata, Tip ve Kalite Denetçisi (QA / Debugger & Reviewer)**
  - Frontend (`tsc && vite build`) ve Backend (`tsc`) derlemelerini sürekli doğrular.
  - API uç noktaları ile frontend modelleri (`types/index.ts`) arasındaki tip uyumsuzluklarını yakalar.
  - Finansal verilerde `NaN`, `null` veya hatalı virgül basamaklarını önler.

#### ⚡ Dinamik / İsteğe Bağlı Ajanlar (Gerektiğinde Çağrılır)
* **Ajan 4: Finans & Piyasa Veri Uzmanı (İsteğe Bağlı)**
  - BIST, Altın, Döviz ve Kripto canlı veri çekme servislerini (`marketDataService.ts`), cron periyotlarını ve kâr/zarar formüllerini optimize eder.
* **Ajan 5: Yapay Zeka & Prompt Mühendisi (İsteğe Bağlı)**
  - Google Gemini API (`@google/generative-ai`) entegrasyonu, finansal portföy yorumlama prompt'ları ve SPK yasal uyarı (disclaimer) akışlarını denetler.
* **Ajan 6: Admin & Django Entegratörü (İsteğe Bağlı)**
  - SQLite (`dev.db`) üzerinde çalışan Django Admin (`admin_panel`) model eşleştirmelerini, senkronizasyon script'lerini ve back-office panelini yönetir.

---

### 3. BiFinans Projesine Özel Kodlama & Güvenlik İlkeleri

1. **Finansal Hassasiyet:** Tüm parasal hesaplamalarda `toFixed(2)` formatı korunmalı, miktar/lot girişlerinde küsurat (`0.0001`) desteği sağlanmalıdır.
2. **Kesintisiz Çalışma (Fallback):** Redis kapalı olsa dahi `InMemoryCache` devrede olmalı; harici piyasa API'si yanıt vermese dahi mock/statik veriyle UI çökmemelidir.
3. **Yasal & Güvenlik Standardı:** Finansal tavsiye niteliğinde olmayan bilgilendirme uyarıları (Disclaimer), 2FA ve şifreli hesap silme güvenlik akışları korunmalıdır.

---

### 4. Görev Listesi ve Adım Adım İlerleme Kuralı (ZORUNLU)

1. **İşi Adımlara Böl:** Her görevin başında yapılacak işleri maddeler halinde `[ ]` (kontrol listesi) formatında çıkar.
2. **Tek Adım Kuralı:** Asla birden fazla adımı aynı anda yapma. Yalnızca sıradaki adımı tamamla.
3. **Tiki At ve Onay İste:** 
   - Biten adımın kutusunu işaretle: `[x]`.
   - Kullanıcıya mutlaka şu soruyu sorup bekle: *"Bu adım tamamlandı. Bir sonraki adıma devam edeyim mi?"*
4. **Onaysız Devam Etme:** Kullanıcı "devam et", "evet", "tamam" demeden asla yeni adıma veya koda geçme.