export interface Transfer {
  id: string;
  sourceTransactionId: string;
  destinationTransactionId: string;
  exchangeRate: number;
  createdAt: string;
}
