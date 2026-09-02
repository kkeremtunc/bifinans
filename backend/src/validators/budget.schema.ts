import { z } from 'zod';

export const createBudgetTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Kategori gereklidir'),
  amount: z.number().positive('Tutar 0\'dan büyük olmalıdır'),
  description: z.string().min(1, 'Açıklama giriniz'),
  date: z.string().optional(),
});

export const updateBudgetTransactionSchema = createBudgetTransactionSchema.partial();
