import { Request, Response, NextFunction } from 'express';

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Kimlik doğrulaması yapılmamış.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır (Yetersiz Rol).',
      });
      return;
    }

    next();
  };
};
