import { z } from 'zod';

export const createAssetSchema = z.object({
  assetType: z.enum(['BIST', 'ALTIN', 'GUMUS', 'DOVIZ', 'KRIPTO']),
  symbol: z.string().min(1, 'Sembol boş bırakılamaz (örn: THYAO, GARAN, BTC, USD)'),
  amount: z.number().positive('Miktar 0\'dan büyük olmalıdır'),
  averageCost: z.number().nonnegative('Maliyet 0 veya daha büyük olmalıdır'),
  currentPrice: z.number().nonnegative('Mevcut fiyat 0 veya daha büyük olmalıdır'),
});

export const updateAssetSchema = createAssetSchema.partial();
