import { Request, Response, NextFunction } from 'express';
import { marketDataService } from '../services/marketDataService';

export const getMarketPrices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prices = await marketDataService.getAllPrices();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { symbol } = req.params;
    const { range } = req.query; // '1G', '1H', '1A', '1Y'
    
    if (!symbol || !range) {
      res.status(400).json({ success: false, message: 'Symbol and range are required' });
      return;
    }

    const history = await marketDataService.getHistoricalData(symbol, range as string);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketAIAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      res.status(400).json({ success: false, message: 'Symbol is required' });
      return;
    }

    const analysis = await marketDataService.getAIAnalysis(symbol);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketWideAIAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const analysis = await marketDataService.getMarketWideAIAnalysis(forceRefresh);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPortfolioAIAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const forceRefresh = req.query.refresh === 'true';
    const result = await marketDataService.getUserPortfolioAIAnalysis(userId, forceRefresh);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: result.report,
      hasAssets: result.hasAssets,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompareAssetsAIAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length < 2) {
      res.status(400).json({ success: false, message: 'En az 2 sembol (symbol) seçmelisiniz.' });
      return;
    }

    const analysis = await marketDataService.getCompareAssetsAIAnalysis(symbols);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
