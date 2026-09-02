export type Role =
  | 'STANDART_KULLANICI'
  | 'ICERIK_YONETICI'
  | 'BIRIM_YONETICI'
  | 'GENEL_KOORDINATOR'
  | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'PASSIVE';

export type AssetType = 'BIST' | 'ALTIN' | 'GUMUS' | 'DOVIZ' | 'KRIPTO';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  disclaimerAccepted?: boolean;
  isTwoFactorEnabled?: boolean;
}

export interface Asset {
  id: string;
  userId: string;
  assetType: AssetType;
  symbol: string;
  amount: number;
  averageCost: number;
  currentPrice: number;
  createdAt: string;
}

export interface AssetPerformance extends Asset {
  totalCost: number;
  currentValue: number;
  nominalProfit: number;
  nominalReturnPercent: number;
  realReturnPercent: number;
}

export interface BudgetTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user?: {
    id: string;
    email: string;
    name: string;
    surname: string;
    role: Role;
  };
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  targetEntity: string;
  targetId: string | null;
  ipAddress: string;
  userAgent: string;
  details?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  authorId: string;
  author?: { name: string; surname: string };
  title: string;
  summary: string;
  content: string;
  category: string;
  isApproved: boolean;
  approvedById?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  user?: { name: string; surname: string; email: string };
  subject: string;
  message: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  response?: string;
  createdAt: string;
}
