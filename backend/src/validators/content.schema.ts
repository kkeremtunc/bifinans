import { z } from 'zod';

export const createContentSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  summary: z.string().min(5, 'Özet en az 5 karakter olmalıdır'),
  content: z.string().min(10, 'İçerik metni en az 10 karakter olmalıdır'),
  category: z.string().min(2, 'Kategori gereklidir'),
});

export const updateContentSchema = createContentSchema.partial();
