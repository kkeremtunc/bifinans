import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { calculateAssetPerformance } from '../utils/financialCalculations';
import { marketDataService } from '../services/marketDataService';

export const getAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const inflationRate = Number(req.query.inflation) || 45;

    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Match with Live Market Data Service current prices if available!
    const evaluatedAssets = assets.map((asset) => {
      const livePrice = marketDataService.getPriceForSymbol(asset.symbol);
      const updatedAsset = {
        ...asset,
        currentPrice: livePrice !== null ? livePrice : asset.currentPrice,
      };
      return calculateAssetPerformance(updatedAsset, inflationRate);
    });

    res.json({ success: true, data: evaluatedAssets, raw: assets });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { assetType, symbol, amount, averageCost, currentPrice } = req.body;

    const upperSymbol = symbol.toUpperCase();
    const livePrice = marketDataService.getPriceForSymbol(upperSymbol);

    const asset = await prisma.asset.create({
      data: {
        userId,
        assetType,
        symbol: upperSymbol,
        amount,
        averageCost,
        currentPrice: livePrice !== null ? livePrice : (currentPrice ?? averageCost),
      },
    });

    res.status(201).json({ success: true, message: 'Yatırım varlığı portföye eklendi.', data: asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Varlık bulunamadı veya erişim yetkiniz yok.' });
      return;
    }

    const { assetType, symbol, amount, averageCost, currentPrice } = req.body;

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(assetType !== undefined && { assetType }),
        ...(symbol !== undefined && { symbol: String(symbol).toUpperCase() }),
        ...(amount !== undefined && { amount }),
        ...(averageCost !== undefined && { averageCost }),
        ...(currentPrice !== undefined && { currentPrice }),
      },
    });

    res.json({ success: true, message: 'Varlık güncellendi.', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Varlık bulunamadı veya erişim yetkiniz yok.' });
      return;
    }

    await prisma.asset.delete({ where: { id } });

    res.json({ success: true, message: 'Varlık portföyden çıkarıldı.' });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const inflationRate = Number(req.query.inflation) || 45;

    const assets = await prisma.asset.findMany({ where: { userId } });

    let totalCost = 0;
    let currentValue = 0;

    const assetTypeDistribution: Record<string, { cost: number; value: number; count: number }> = {};

    assets.forEach((asset) => {
      const livePrice = marketDataService.getPriceForSymbol(asset.symbol);
      const updatedAsset = {
        ...asset,
        currentPrice: livePrice !== null ? livePrice : asset.currentPrice,
      };

      const perf = calculateAssetPerformance(updatedAsset, inflationRate);
      totalCost += perf.totalCost;
      currentValue += perf.currentValue;

      if (!assetTypeDistribution[asset.assetType]) {
        assetTypeDistribution[asset.assetType] = { cost: 0, value: 0, count: 0 };
      }

      assetTypeDistribution[asset.assetType].cost += perf.totalCost;
      assetTypeDistribution[asset.assetType].value += perf.currentValue;
      assetTypeDistribution[asset.assetType].count += 1;
    });

    const netProfit = currentValue - totalCost;
    const nominalReturnPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const realReturnPercent = totalCost > 0 ? ((1 + nominalReturnPercent / 100) / (1 + inflationRate / 100) - 1) * 100 : 0;

    res.json({
      success: true,
      summary: {
        totalAssetsCount: assets.length,
        totalCost,
        currentValue,
        netProfit,
        nominalReturnPercent: Number(nominalReturnPercent.toFixed(2)),
        realReturnPercent: Number(realReturnPercent.toFixed(2)),
        inflationRateUsed: inflationRate,
        assetTypeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
