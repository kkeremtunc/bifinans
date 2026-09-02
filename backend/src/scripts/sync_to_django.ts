import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// ==========================================
// DJANGO API AYARLARI (BURAYI GÜNCELLEYİN)
// ==========================================
const DJANGO_API_URL = 'http://localhost:8000/api/users/'; // Django'nun endpoint adresi
// Eğer Django API bir token bekliyorsa:
// const DJANGO_API_TOKEN = 'your-token-here';

async function syncUsersToDjango() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      console.log('Aktarılacak kullanıcı bulunamadı.');
      return;
    }

    console.log(`${users.length} adet kullanıcı bulundu. Django'ya aktarım başlıyor...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        // Django'ya gönderilecek JSON yapısı. 
        // Django modelinizin (örn: User) beklediği alanlara göre (first_name, last_name vb.) burayı değiştirebilirsiniz.
        const payload = {
          email: user.email,
          first_name: user.name, // Django genelde first_name bekler, değilse 'name' yapın
          last_name: user.surname,
          role: user.role,
          is_active: user.status === 'ACTIVE', // Django genelde is_active: boolean bekler
          // Şifreler hash'li olduğu için Django'da tekrar şifreleme gerekebilir veya rastgele bir şifre verebilirsiniz.
        };

        await axios.post(DJANGO_API_URL, payload, {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Token ${DJANGO_API_TOKEN}` // Gerekirse yorum satırını kaldırın
          }
        });
        
        console.log(`✅ BAŞARILI: ${user.email} -> Django'ya kaydedildi.`);
        successCount++;
      } catch (err: any) {
        console.error(`❌ HATA (${user.email}):`, err.response?.data || err.message);
        failCount++;
      }
    }

    console.log(`\n--- AKTARIM TAMAMLANDI ---`);
    console.log(`Toplam Başarılı: ${successCount}`);
    console.log(`Toplam Hatalı  : ${failCount}`);
    
  } catch (error) {
    console.error('Kritik bir hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUsersToDjango();
