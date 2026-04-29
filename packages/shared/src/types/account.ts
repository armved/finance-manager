export interface Account {
  id: string;
  name: string;
  currencyCode: string;
  adjustedBalance: number;
  adjustedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}
