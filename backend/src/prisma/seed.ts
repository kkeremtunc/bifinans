import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Database seeding initiated...');

  const passwordHash = await bcrypt.hash('123456', 10);

  const usersData = [
    {
      email: 'user@borsa.com',
      passwordHash,
      name: 'Ahmet',
      surname: 'Yılmaz',
      role: 'STANDART_KULLANICI',
      status: 'ACTIVE',
    },
    {
      email: 'icerik@borsa.com',
      passwordHash,
      name: 'Elif',
      surname: 'Kaya',
      role: 'ICERIK_YONETICI',
      status: 'ACTIVE',
    },
    {
      email: 'birim@borsa.com',
      passwordHash,
      name: 'Mehmet',
      surname: 'Demir',
      role: 'BIRIM_YONETICI',
      status: 'ACTIVE',
    },
    {
      email: 'koordinator@borsa.com',
      passwordHash,
      name: 'Selin',
      surname: 'Şahin',
      role: 'GENEL_KOORDINATOR',
      status: 'ACTIVE',
    },
    {
      email: 'admin@borsa.com',
      passwordHash,
      name: 'Kerem',
      surname: 'Yönetici',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  const standardUser = await prisma.user.findUnique({ where: { email: 'user@borsa.com' } });
  const contentUser = await prisma.user.findUnique({ where: { email: 'icerik@borsa.com' } });
  const unitManager = await prisma.user.findUnique({ where: { email: 'birim@borsa.com' } });

  if (standardUser) {
    const budgetItems = [
      {
        userId: standardUser.id,
        type: 'INCOME',
        category: 'Maaş',
        amount: 65000,
        description: 'Aylık net maaş ödemesi',
        date: new Date('2026-08-01'),
      },
      {
        userId: standardUser.id,
        type: 'INCOME',
        category: 'Temettü',
        amount: 8500,
        description: 'THYAO Temettü Geliri',
        date: new Date('2026-08-05'),
      },
      {
        userId: standardUser.id,
        type: 'EXPENSE',
        category: 'Kira',
        amount: 22000,
        description: 'Ağustos ev kirası',
        date: new Date('2026-08-02'),
      },
      {
        userId: standardUser.id,
        type: 'EXPENSE',
        category: 'Market & Gıda',
        amount: 14500,
        description: 'Aylık mutfak alışverişleri',
        date: new Date('2026-08-07'),
      },
      {
        userId: standardUser.id,
        type: 'EXPENSE',
        category: 'Fatura & Aidat',
        amount: 4200,
        description: 'Elektrik, Su, İnternet, Site Aidatı',
        date: new Date('2026-08-08'),
      },
    ];

    for (const item of budgetItems) {
      await prisma.budgetTransaction.create({ data: item });
    }

    const assetItems = [
      {
        userId: standardUser.id,
        assetType: 'BIST',
        symbol: 'THYAO',
        amount: 250,
        averageCost: 285.5,
        currentPrice: 342.0,
      },
      {
        userId: standardUser.id,
        assetType: 'BIST',
        symbol: 'GARAN',
        amount: 500,
        averageCost: 82.0,
        currentPrice: 115.5,
      },
      {
        userId: standardUser.id,
        assetType: 'ALTIN',
        symbol: 'GRAM_ALTIN',
        amount: 45,
        averageCost: 2450.0,
        currentPrice: 3120.0,
      },
      {
        userId: standardUser.id,
        assetType: 'KRIPTO',
        symbol: 'BTC',
        amount: 0.15,
        averageCost: 54000.0,
        currentPrice: 68500.0,
      },
      {
        userId: standardUser.id,
        assetType: 'DOVIZ',
        symbol: 'USD/TRY',
        amount: 3000,
        averageCost: 32.5,
        currentPrice: 36.8,
      },
    ];

    for (const item of assetItems) {
      await prisma.asset.create({ data: item });
    }

    await prisma.supportTicket.create({
      data: {
        userId: standardUser.id,
        subject: 'Reel getiri hesaplama sorusu',
        message: 'Portföyümdeki Altın varlığı için enflasyon oranını nereden güncelleyebilirim?',
        category: 'Portföy Takibi',
        status: 'OPEN',
      },
    });
  }

  if (contentUser && unitManager) {
    const contents = [
      {
        authorId: contentUser.id,
        title: '2026 Q3 Türkiye Piyasaları ve Enflasyon Beklentileri Bülteni',
        summary: 'BIST 100 endeksi, faiz kararları ve enflasyon arındırılmış reel getiri analizleri.',
        content: 'Merkez Bankası politika faiz kararları sonrasında hisse senedi piyasalarında ve tahvil getirilerinde önemli hareketlilik gözlendi...',
        category: 'Piyasa Bülteni',
        isApproved: true,
        approvedById: unitManager.id,
      },
      {
        authorId: contentUser.id,
        title: 'Kripto Varlıklarda Vergilendirme ve Yeni Regülasyonlar',
        summary: 'Kullanıcılarımızın portföy takibinde dikkat etmesi gereken mevzuat güncellemeleri.',
        content: 'Sermaye piyasası kurulunun yayınladığı yeni rehber uyarınca kripto varlık hizmet sağlayıcıları...',
        category: 'Mevzuat & Haber',
        isApproved: false,
      },
    ];

    for (const c of contents) {
      await prisma.contentItem.create({ data: c });
    }
  }

  if (standardUser) {
    await prisma.auditLog.create({
      data: {
        userId: standardUser.id,
        action: 'CREATE',
        targetEntity: 'BudgetTransaction',
        targetId: 'sample-id-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: 'Initial transaction created',
      },
    });
  }

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
