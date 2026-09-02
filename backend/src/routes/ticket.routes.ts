import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTicketSchema, respondTicketSchema } from '../validators/ticket.schema';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ticketController.getTickets);
router.post('/', validate(createTicketSchema), logAudit('CREATE', 'SupportTicket'), ticketController.createTicket);
router.put(
  '/:id/respond',
  requireRoles('BIRIM_YONETICI', 'SUPER_ADMIN'),
  validate(respondTicketSchema),
  logAudit('UPDATE', 'SupportTicketRespond'),
  ticketController.respondTicket
);

export default router;
