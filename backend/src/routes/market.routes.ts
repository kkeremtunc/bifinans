import { Router } from 'express';
import { getMarketPrices, getMarketHistory, getMarketAIAnalysis, getMarketWideAIAnalysis, getUserPortfolioAIAnalysis, getCompareAssetsAIAnalysis } from '../controllers/market.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for market ticker (login sayfasındaki ticker için gerekli)
router.get('/prices', getMarketPrices);

// Authenticated endpoints - AI analiz ve geçmiş veriler giriş yapılmadan erişilemez
router.get('/history/:symbol', authenticateToken, getMarketHistory);
router.get('/analyze-all', authenticateToken, getMarketWideAIAnalysis);
router.get('/analyze-portfolio', authenticateToken, getUserPortfolioAIAnalysis);
router.get('/analyze/:symbol', authenticateToken, getMarketAIAnalysis);
router.post('/analyze-compare', authenticateToken, getCompareAssetsAIAnalysis);

export default router;
