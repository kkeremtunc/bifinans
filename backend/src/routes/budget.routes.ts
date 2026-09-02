import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBudgetTransactionSchema, updateBudgetTransactionSchema } from '../validators/budget.schema';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', budgetController.getTransactions);
router.get('/summary', budgetController.getSummary);
router.post('/', validate(createBudgetTransactionSchema), logAudit('CREATE', 'BudgetTransaction'), budgetController.createTransaction);
router.put('/:id', validate(updateBudgetTransactionSchema), logAudit('UPDATE', 'BudgetTransaction'), budgetController.updateTransaction);
router.delete('/:id', logAudit('DELETE', 'BudgetTransaction'), budgetController.deleteTransaction);

export default router;
