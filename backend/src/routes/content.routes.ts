import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createContentSchema } from '../validators/content.schema';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view published/approved bulletins
router.get('/', contentController.getApprovedContents);

// Content Managers, Unit Managers, and Super Admin can view pending drafts queue
router.get(
  '/pending',
  requireRoles('ICERIK_YONETICI', 'BIRIM_YONETICI', 'SUPER_ADMIN'),
  contentController.getPendingContents
);

// Content Managers, Unit Managers, and Super Admin can create bulletin drafts
router.post(
  '/',
  requireRoles('ICERIK_YONETICI', 'BIRIM_YONETICI', 'SUPER_ADMIN'),
  validate(createContentSchema),
  logAudit('CREATE', 'ContentItem'),
  contentController.createContent
);

// Unit Managers and Super Admin can approve pending bulletins
router.put(
  '/:id/approve',
  requireRoles('BIRIM_YONETICI', 'SUPER_ADMIN'),
  logAudit('UPDATE', 'ContentItemApprove'),
  contentController.approveContent
);

// Unit Managers and Super Admin can unapprove bulletins back to draft (Symmetric Action)
router.put(
  '/:id/unapprove',
  requireRoles('BIRIM_YONETICI', 'SUPER_ADMIN'),
  logAudit('UPDATE', 'ContentItemUnapprove'),
  contentController.unapproveContent
);

// Content Managers, Unit Managers, and Super Admin can delete bulletins
router.delete(
  '/:id',
  requireRoles('ICERIK_YONETICI', 'BIRIM_YONETICI', 'SUPER_ADMIN'),
  logAudit('DELETE', 'ContentItem'),
  contentController.deleteContent
);

export default router;
