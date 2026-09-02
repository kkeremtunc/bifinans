import { Router } from 'express';
import * as assetController from '../controllers/asset.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAssetSchema, updateAssetSchema } from '../validators/asset.schema';
import { logAudit } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', assetController.getAssets);
router.get('/summary', assetController.getPortfolioSummary);
router.post('/', validate(createAssetSchema), logAudit('CREATE', 'Asset'), assetController.createAsset);
router.put('/:id', validate(updateAssetSchema), logAudit('UPDATE', 'Asset'), assetController.updateAsset);
router.delete('/:id', logAudit('DELETE', 'Asset'), assetController.deleteAsset);

export default router;
