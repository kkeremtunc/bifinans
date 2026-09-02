import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const getApprovedContents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contents = await prisma.contentItem.findMany({
      where: { isApproved: true },
      include: { author: { select: { name: true, surname: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: contents });
  } catch (error) {
    next(error);
  }
};

export const getPendingContents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contents = await prisma.contentItem.findMany({
      where: { isApproved: false },
      include: { author: { select: { name: true, surname: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: contents });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorId = req.user!.userId;
    const { title, summary, content, category } = req.body;

    const item = await prisma.contentItem.create({
      data: {
        authorId,
        title,
        summary,
        content,
        category,
        isApproved: false,
      },
    });

    res.status(201).json({ success: true, message: 'Finansal bülten taslağı oluşturuldu ve onaya gönderildi.', data: item });
  } catch (error) {
    next(error);
  }
};

export const approveContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const approverId = req.user!.userId;

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Bülten içeriği bulunamadı.' });
      return;
    }

    // Çıkar Çatışması Önleme: Yazar kendi bültenini tek başına onaylayamaz (Separation of Duties)
    if (existing.authorId === approverId) {
      res.status(403).json({
        success: false,
        message: 'Güvenlik Kuralı: Kendi oluşturduğunuz bülteni kendiniz onaylayamazsınız. Farklı bir yöneticinin onayı gereklidir.',
      });
      return;
    }

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        isApproved: true,
        approvedById: approverId,
      },
    });

    res.json({ success: true, message: 'Finansal bülten onaylandı ve yayına alındı.', data: item });
  } catch (error) {
    next(error);
  }
};

export const unapproveContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Bülten içeriği bulunamadı.' });
      return;
    }

    if (!existing.isApproved) {
      res.status(400).json({ success: false, message: 'Bu bülten zaten onaylanmamış / taslak durumundadır.' });
      return;
    }

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        isApproved: false,
        approvedById: null,
      },
    });

    res.json({ success: true, message: 'Bülten onaydan geri çekildi ve taslak durumuna alındı.', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const existing = await prisma.contentItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Bülten içeriği bulunamadı.' });
      return;
    }

    // ICERIK_YONETICI yetki kısıtı: Yalnızca kendi yazdığı ve henüz onaylanmamış taslakları silebilir
    if (currentUser.role === 'ICERIK_YONETICI') {
      if (existing.authorId !== currentUser.userId) {
        res.status(403).json({
          success: false,
          message: 'Yetkisiz İşlem: İçerik yöneticileri yalnızca kendi hazırladıkları içerikleri silebilir.',
        });
        return;
      }

      if (existing.isApproved) {
        res.status(403).json({
          success: false,
          message: 'Yetkisiz İşlem: Onaylanmış ve yayına alınmış bültenleri yalnızca Birim Yöneticisi veya Süper Admin silebilir.',
        });
        return;
      }
    }

    await prisma.contentItem.delete({ where: { id } });
    res.json({ success: true, message: 'İçerik silindi.' });
  } catch (error) {
    next(error);
  }
};
