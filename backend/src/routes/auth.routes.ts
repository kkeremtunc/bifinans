import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.schema';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), logAudit('CREATE', 'User'), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), logAudit('READ', 'UserAuth'), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.me);
router.post('/accept-disclaimer', authenticateToken, logAudit('UPDATE', 'UserDisclaimer'), authController.acceptDisclaimer);

router.post('/login/verify-2fa', authRateLimiter, logAudit('READ', 'UserAuth2FA'), authController.verify2FALogin);
router.post('/2fa/generate', authenticateToken, authController.generate2FA);
router.post('/2fa/enable', authenticateToken, logAudit('UPDATE', 'User2FAEnable'), authController.enable2FA);
router.post('/2fa/disable', authenticateToken, logAudit('UPDATE', 'User2FADisable'), authController.disable2FA);

export default router;
