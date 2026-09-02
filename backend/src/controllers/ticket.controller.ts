import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const isManager = role === 'BIRIM_YONETICI' || role === 'SUPER_ADMIN' || role === 'GENEL_KOORDINATOR';
    const whereClause = isManager ? {} : { userId };

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, surname: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { subject, message, category } = req.body;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        category,
      },
    });

    res.status(201).json({ success: true, message: 'Destek biletiniz oluşturuldu.', data: ticket });
  } catch (error) {
    next(error);
  }
};

export const respondTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    const existing = await prisma.supportTicket.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Destek bileti bulunamadı.' });
      return;
    }

    // Zaten kapatılmış biletlere yanıt verilemez
    if (existing.status === 'CLOSED') {
      res.status(400).json({ success: false, message: 'Kapatılmış (CLOSED) biletler tekrar yanıtlanamaz.' });
      return;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        response,
        status: status || 'RESOLVED',
      },
    });

    res.json({ success: true, message: 'Destek biletine yanıt verildi.', data: updated });
  } catch (error) {
    next(error);
  }
};
