import { Router } from 'express';
import authRoutes from './auth.routes';
import budgetRoutes from './budget.routes';
import assetRoutes from './asset.routes';
import contentRoutes from './content.routes';
import ticketRoutes from './ticket.routes';
import adminRoutes from './admin.routes';
import marketRoutes from './market.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/budget', budgetRoutes);
router.use('/assets', assetRoutes);
router.use('/content', contentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/admin', adminRoutes);
router.use('/market', marketRoutes);

export default router;
