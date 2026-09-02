/**
 * Finansal Hesaplamalar ve Enflasyon / Reel Getiri Modülü
 */

export interface AssetPerformance {
  symbol: string;
  assetType: string;
  amount: number;
  averageCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  nominalProfit: number;
  nominalReturnPercent: number;
  realReturnPercent: number;
}

/**
 * Nominal Getiri Oranı (%)
 * Formula: ((CurrentPrice - AverageCost) / AverageCost) * 100
 */
export const calculateNominalReturn = (averageCost: number, currentPrice: number): number => {
  if (averageCost <= 0) return 0;
  return ((currentPrice - averageCost) / averageCost) * 100;
};

/**
 * Enflasyondan Arındırılmış Reel Getiri Oranı (%)
 * Formula: ((1 + NominalReturnDecimal) / (1 + InflationRateDecimal) - 1) * 100
 * @param nominalReturnPercent % cinsinden (ör. %25 ise 25)
 * @param annualInflationPercent % cinsinden yıllık enflasyon (ör. %45 ise 45)
 */
export const calculateRealReturn = (
  nominalReturnPercent: number,
  annualInflationPercent: number = 45
): number => {
  const rNominal = nominalReturnPercent / 100;
  const rInflation = annualInflationPercent / 100;

  if (1 + rInflation === 0) return 0;

  const realReturnDecimal = (1 + rNominal) / (1 + rInflation) - 1;
  return realReturnDecimal * 100;
};

/**
 * Varlık Performans Analiz Raporu Oluşturma
 */
export const calculateAssetPerformance = (
  asset: {
    id?: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    symbol: string;
    assetType: string;
    amount: number;
    averageCost: number;
    currentPrice: number;
  },
  inflationRate: number = 45
): any => {
  const totalCost = asset.amount * asset.averageCost;
  const currentValue = asset.amount * asset.currentPrice;
  const nominalProfit = currentValue - totalCost;
  const nominalReturnPercent = calculateNominalReturn(asset.averageCost, asset.currentPrice);
  const realReturnPercent = calculateRealReturn(nominalReturnPercent, inflationRate);

  return {
    ...asset,
    totalCost,
    currentValue,
    nominalProfit,
    nominalReturnPercent: Number(nominalReturnPercent.toFixed(2)),
    realReturnPercent: Number(realReturnPercent.toFixed(2)),
  };
};
