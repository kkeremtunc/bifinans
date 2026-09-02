import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { redis } from '../config/redis';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Erişim jetonu (Access Token) bulunamadı. Lütfen giriş yapın.' });
    return;
  }

  const isBlacklisted = await redis.get(`bl_${token}`);
  if (isBlacklisted) {
    res.status(401).json({ success: false, message: 'Oturum sonlandırılmış veya geçersiz kılınmış.' });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş erişim jetonu.' });
    return;
  }

  // 2FA Geçici Jetonu ile yetkisiz erişimi engelleme (2FA Bypass Koruması)
  if ((payload as any).type === '2FA_TEMP' || !payload.role || !payload.status) {
    res.status(401).json({
      success: false,
      message: 'Tamamlanmamış oturum. Lütfen önce iki adımlı doğrulamayı (2FA) tamamlayınız.',
    });
    return;
  }

  if (payload.status === 'PASSIVE') {
    res.status(403).json({ success: false, message: 'Hesabınız pasif durumdadır. Yönetici onayı gereklidir.' });
    return;
  }

  req.user = payload;
  next();
};
