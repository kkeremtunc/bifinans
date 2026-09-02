import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(3, 'Konu başlığı giriniz'),
  message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır'),
  category: z.string().min(2, 'Kategori seçiniz'),
});

export const respondTicketSchema = z.object({
  response: z.string().min(2, 'Yanıt metni boş bırakılamaz'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
});
