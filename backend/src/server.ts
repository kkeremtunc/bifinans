import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { startMarketDataCron } from './services/marketDataService';

const PORT = env.PORT || 5001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected via Prisma.');
  } catch (error) {
    console.warn('⚠️ Database connection warning via Prisma:', (error as Error).message);
  }

  // Start background live market data refresh cron loop
  startMarketDataCron();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Kişiselleştirilmiş Bütçe ve Yatırım Takip Platformu backend running on port ${PORT}`);
  });

  // Graceful Shutdown to completely fix EADDRINUSE (Port 5001) errors on dev reload
  const shutdown = () => {
    console.log('🛑 Arka plandaki sunucu düzgünce kapatılıyor (Graceful Shutdown)...');
    server.close(() => {
      console.log('✅ Sunucu bağlantıları kapatıldı. 5001 Portu serbest bırakıldı.');
      process.exit(0);
    });

    // Zorla kapatma (2 saniye içinde kapanmazsa)
    setTimeout(() => {
      console.error('⚠️ Sunucu kapanmaya yanıt vermedi, zorla kapatılıyor!');
      process.exit(1);
    }, 2000);
  };

  // Dinlenen sinyaller (Nodemon ve ts-node-dev restart sinyalleri)
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGUSR2', shutdown);
}

startServer();
