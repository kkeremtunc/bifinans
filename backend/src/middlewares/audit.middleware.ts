import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const logAudit = (action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', targetEntity: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const ipAddress =
          (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const userId = req.user?.userId || null;
        const targetId = (req.params.id as string) || (req.body?.id as string) || null;
        const details = JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          query: req.query,
          statusCode: res.statusCode,
        });

        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              targetEntity,
              targetId,
              ipAddress,
              userAgent,
              details,
            },
          })
          .catch((err) => {
            console.error('Audit log write error:', err);
          });
      }
    });

    next();
  };
};
