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

export const deleteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.contentItem.delete({ where: { id } });
    res.json({ success: true, message: 'İçerik silindi.' });
  } catch (error) {
    next(error);
  }
};
