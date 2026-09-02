import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateRoleSchema } from '../validators/auth.schema';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get(
  '/audit-logs',
  requireRoles('SUPER_ADMIN'),
  logAudit('READ', 'AuditLog'),
  adminController.getAuditLogs
);

router.get(
  '/users',
  requireRoles('SUPER_ADMIN', 'GENEL_KOORDINATOR'),
  adminController.getUsers
);

router.put(
  '/users/role',
  requireRoles('SUPER_ADMIN'),
  validate(updateRoleSchema),
  logAudit('UPDATE', 'UserRoleStatus'),
  adminController.updateUserRoleAndStatus
);

router.get(
  '/analytics',
  requireRoles('GENEL_KOORDINATOR', 'SUPER_ADMIN'),
  logAudit('READ', 'SystemAnalytics'),
  adminController.getSystemAnalytics
);

export default router;
