export interface Transaction {
  textDate: string;
  summary: string;
  marketName: string;
  period: string;
  profitAndLoss: string;
  transactionType: string;
  reference: string;
  openLevel: string;
  closeLevel: string;
  size: string;
  currency: string;
  plAmount: number;
  cashTransaction: string;
  dateUtc: string;
  openDateUtc: string;
  currencyIsoCode: string;
}

export interface DailyStats {
  date: string;
  totalPL: number;
  tradeCount: number;
  transactions: Transaction[];
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalPL: number;
  days: Map<number, DailyStats>;
}
