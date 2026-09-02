import { z } from 'zod';

export const Role = {
  STANDART_KULLANICI: 'STANDART_KULLANICI',
  ICERIK_YONETICI: 'ICERIK_YONETICI',
  BIRIM_YONETICI: 'BIRIM_YONETICI',
  GENEL_KOORDINATOR: 'GENEL_KOORDINATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  role: z.enum(['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre alanı boş bırakılamaz'),
});

export const updateRoleSchema = z.object({
  userId: z.string().uuid('Geçerli kullanıcı ID giriniz'),
  role: z.enum(['STANDART_KULLANICI', 'ICERIK_YONETICI', 'BIRIM_YONETICI', 'GENEL_KOORDINATOR', 'SUPER_ADMIN']),
  status: z.enum(['ACTIVE', 'PASSIVE']).optional(),
});
