import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { redis } from '../config/redis';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';

export const Role = {
  STANDART_KULLANICI: 'STANDART_KULLANICI',
  ICERIK_YONETICI: 'ICERIK_YONETICI',
  BIRIM_YONETICI: 'BIRIM_YONETICI',
  GENEL_KOORDINATOR: 'GENEL_KOORDINATOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  PASSIVE: 'PASSIVE',
} as const;

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name, surname } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Bu e-posta adresi ile zaten kayıtlı bir hesap var.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = Role.STANDART_KULLANICI;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        surname,
        role: assignedRole,
        status: UserStatus.ACTIVE,
        disclaimerAccepted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        status: true,
        createdAt: true,
        disclaimerAccepted: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı kaydı başarıyla oluşturuldu.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const invalidCredentialsMsg = 'E-posta veya şifre hatalı.';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: invalidCredentialsMsg });
      return;
    }

    if (user.status === UserStatus.PASSIVE) {
      res.status(403).json({ success: false, message: 'Hesabınız pasif durumdadır. Lütfen yönetici ile iletişime geçiniz.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: invalidCredentialsMsg });
      return;
    }

    if (user.isTwoFactorEnabled) {
      const tempPayload = { userId: user.id, type: '2FA_TEMP' };
      const tempToken = jwt.sign(tempPayload, env.JWT_ACCESS_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
      res.json({
        success: true,
        message: '2 Adımlı doğrulama gerekli.',
        requires2FA: true,
        tempToken,
      });
      return;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      status: user.status as any,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Giriş başarılı.',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        status: user.status,
        disclaimerAccepted: user.disclaimerAccepted,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Yenileme jetonu (Refresh Token) bulunamadı.' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş yenileme jetonu.' });
      return;
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Yenileme jetonu bulunamadı veya süresi dolmuş.' });
      return;
    }

    // Yeniden Kullanım Tespiti (Automatic Reuse Detection): İptal edilmiş token tekrar kullanılırsa tüm oturumları sonlandır!
    if (savedToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: savedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      res.status(401).json({
        success: false,
        message: 'Güvenlik Uyarısı: İptal edilmiş bir yenileme jetonu tekrar kullanılmaya çalışıldı. Olası yetkisiz erişim nedeniyle tüm oturumlarınız kapatıldı.',
      });
      return;
    }

    if (savedToken.user.status === UserStatus.PASSIVE) {
      res.status(403).json({ success: false, message: 'Hesap pasif durumda.' });
      return;
    }

    const newPayload = {
      userId: savedToken.user.id,
      email: savedToken.user.email,
      role: savedToken.user.role as any,
      status: savedToken.user.status as any,
    };

    // Refresh Token Rotation: Eski token iptal edilir ve yeni bir refreshToken üretilir
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revokedAt: new Date() },
    });

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: savedToken.user.id,
        token: newRefreshToken,
        expiresAt: newExpiresAt,
      },
    });

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: savedToken.user.id,
        email: savedToken.user.email,
        name: savedToken.user.name,
        surname: savedToken.user.surname,
        role: savedToken.user.role,
        status: savedToken.user.status,
        disclaimerAccepted: savedToken.user.disclaimerAccepted,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }

    if (accessToken) {
      await redis.set(`bl_${accessToken}`, 'true', 15 * 60);
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        status: true,
        createdAt: true,
        disclaimerAccepted: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const acceptDisclaimer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yetkisiz erişim.' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { disclaimerAccepted: true },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        status: true,
        createdAt: true,
        disclaimerAccepted: true,
      },
    });

    res.json({ success: true, message: 'Sözleşme başarıyla onaylandı.', user });
  } catch (error) {
    next(error);
  }
};

export const verify2FALogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      res.status(400).json({ success: false, message: 'Geçersiz istek.' });
      return;
    }

    // Tek Kullanımlık 2FA Kontrolü (Replay Attack Koruması)
    const isAlreadyUsed = await redis.get(`used_2fa_${tempToken}`);
    if (isAlreadyUsed) {
      res.status(401).json({ success: false, message: 'Bu geçici doğrulama jetonu daha önce kullanılmış.' });
      return;
    }

    let payload: any;
    try {
      payload = jwt.verify(tempToken, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    } catch (e) {
      res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
      return;
    }

    if (payload.type !== '2FA_TEMP') {
      res.status(401).json({ success: false, message: 'Geçersiz 2FA geçici yetkilendirme jetonu.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      res.status(401).json({ success: false, message: 'Geçersiz 2FA durumu.' });
      return;
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Geçersiz doğrulama kodu.' });
      return;
    }

    // Başarılı doğrulama sonrası geçici jetonu kullanılmış olarak işaretle
    await redis.set(`used_2fa_${tempToken}`, 'true', 15 * 60);

    const userPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      status: user.status as any,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Giriş başarılı.',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        status: user.status,
        disclaimerAccepted: user.disclaimerAccepted,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generate2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      return;
    }

    if (user.isTwoFactorEnabled) {
      res.status(400).json({ success: false, message: '2FA zaten aktif.' });
      return;
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'BiFinans', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    res.json({ success: true, qrCodeUrl, secret });
  } catch (error) {
    next(error);
  }
};

export const enable2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ success: false, message: 'Önce 2FA kodu oluşturulmalıdır.' });
      return;
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Geçersiz doğrulama kodu.' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: true },
    });

    res.json({ success: true, message: '2 Adımlı Doğrulama başarıyla aktifleştirildi.' });
  } catch (error) {
    next(error);
  }
};

export const disable2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      res.status(400).json({ success: false, message: '2FA aktif değil.' });
      return;
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Geçersiz doğrulama kodu.' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null },
    });

    res.json({ success: true, message: '2 Adımlı Doğrulama başarıyla kapatıldı.' });
  } catch (error) {
    next(error);
  }
};
