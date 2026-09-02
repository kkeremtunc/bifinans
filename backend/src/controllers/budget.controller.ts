import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { category, type, startDate, endDate } = req.query;

    const whereClause: any = { userId };
    if (category) whereClause.category = String(category);
    if (type) whereClause.type = String(type);

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(String(startDate));
      if (endDate) whereClause.date.lte = new Date(String(endDate));
    }

    const transactions = await prisma.budgetTransaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { type, category, amount, description, date } = req.body;

    const transaction = await prisma.budgetTransaction.create({
      data: {
        userId,
        type,
        category,
        amount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({ success: true, message: 'İşlem eklendi.', data: transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.budgetTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Bütçe kalemi bulunamadı veya erişim yetkiniz yok.' });
      return;
    }

    const updated = await prisma.budgetTransaction.update({
      where: { id },
      data: req.body,
    });

    res.json({ success: true, message: 'İşlem güncellendi.', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.budgetTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Bütçe kalemi bulunamadı veya erişim yetkiniz yok.' });
      return;
    }

    await prisma.budgetTransaction.delete({ where: { id } });

    res.json({ success: true, message: 'İşlem silindi.' });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const transactions = await prisma.budgetTransaction.findMany({
      where: { userId },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((tx) => {
      if (!categoryBreakdown[tx.category]) {
        categoryBreakdown[tx.category] = { income: 0, expense: 0 };
      }

      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
        categoryBreakdown[tx.category].income += tx.amount;
      } else {
        totalExpense += tx.amount;
        categoryBreakdown[tx.category].expense += tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
