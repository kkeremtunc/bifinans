import { Router } from 'express';
import { getMarketPrices, getMarketHistory, getMarketAIAnalysis, getMarketWideAIAnalysis, getUserPortfolioAIAnalysis, getCompareAssetsAIAnalysis } from '../controllers/market.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for market ticker
router.get('/prices', getMarketPrices);
router.get('/history/:symbol', getMarketHistory);
router.get('/analyze-all', getMarketWideAIAnalysis);
router.get('/analyze-portfolio', authenticateToken, getUserPortfolioAIAnalysis);
router.get('/analyze/:symbol', getMarketAIAnalysis);
router.post('/analyze-compare', authenticateToken, getCompareAssetsAIAnalysis);

export default router;
