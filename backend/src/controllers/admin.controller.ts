import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { action, entity, userId, limit = '50', page = '1' } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const whereClause: any = {};
    if (action) whereClause.action = String(action);
    if (entity) whereClause.targetEntity = String(entity);
    if (userId) whereClause.userId = String(userId);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, email: true, name: true, surname: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleAndStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role, status } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      return;
    }

    // 1. Kendi yetkisini düşürme veya kendi hesabını pasife alma koruması (Self-lockout)
    if (req.user?.userId === userId) {
      if (role && role !== 'SUPER_ADMIN') {
        res.status(400).json({ success: false, message: 'Güvenlik kuralı: Kendi Süper Admin rolünüzü kaldıramazsınız.' });
        return;
      }
      if (status && status === 'PASSIVE') {
        res.status(400).json({ success: false, message: 'Güvenlik kuralı: Kendi hesabınızı pasife alamazsınız.' });
        return;
      }
    }

    // 2. Sistemdeki son aktif Süper Admin'in düşürülmesini veya pasife alınmasını engelle
    if (targetUser.role === 'SUPER_ADMIN' && ((role && role !== 'SUPER_ADMIN') || (status && status === 'PASSIVE'))) {
      const activeSuperAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      });
      if (activeSuperAdminCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Sistemde en az 1 aktif Süper Admin bulunmalıdır. Son Süper Admin rolü düşürülemez veya pasife alınamaz.',
        });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        role: true,
        status: true,
      },
    });

    res.json({ success: true, message: 'Kullanıcı yetkileri güncellendi.', data: user });
  } catch (error) {
    next(error);
  }
};

export const getSystemAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalAssets,
      totalTransactions,
      usersByRole,
      budgetStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.asset.count(),
      prisma.budgetTransaction.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      prisma.budgetTransaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      analytics: {
        userMetrics: {
          totalUsers,
          activeUsers,
          passiveUsers: totalUsers - activeUsers,
          usersByRole: usersByRole.map((u) => ({ role: u.role, count: u._count.id })),
        },
        assetMetrics: {
          totalAssetsCount: totalAssets,
        },
        financialMetrics: {
          totalTransactionsCount: totalTransactions,
          budgetTotals: budgetStats.map((b) => ({ type: b.type, totalAmount: b._sum.amount || 0 })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
