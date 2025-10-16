import { Transaction, DailyStats, MonthlyStats } from "@/types/transaction";

export const parseCSV = (csvText: string): Transaction[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].replace(/^\uFEFF/, '').split(','); // Remove BOM if present
  
  const transactions: Transaction[] = [];
  const seenReferences = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < 16) continue;
    
    const reference = values[6];
    
    // Skip duplicate trades based on reference
    if (seenReferences.has(reference)) {
      continue;
    }
    seenReferences.add(reference);
    
    transactions.push({
      textDate: values[0],
      summary: values[1],
      marketName: values[2],
      period: values[3],
      profitAndLoss: values[4],
      transactionType: values[5],
      reference: reference,
      openLevel: values[7],
      closeLevel: values[8],
      size: values[9],
      currency: values[10],
      plAmount: parseFloat(values[11].replace(/[^0-9.-]/g, '')) || 0,
      cashTransaction: values[12],
      dateUtc: values[13],
      openDateUtc: values[14],
      currencyIsoCode: values[15],
    });
  }
  
  return transactions;
};

export const groupByMonth = (transactions: Transaction[]): Map<string, MonthlyStats> => {
  const monthlyData = new Map<string, MonthlyStats>();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.dateUtc);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const monthKey = `${year}-${month}`;
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        year,
        month,
        totalPL: 0,
        days: new Map(),
      });
    }
    
    const monthData = monthlyData.get(monthKey)!;
    
    if (!monthData.days.has(day)) {
      monthData.days.set(day, {
        date: transaction.dateUtc,
        totalPL: 0,
        tradeCount: 0,
        transactions: [],
      });
    }
    
    const dayData = monthData.days.get(day)!;
    dayData.totalPL += transaction.plAmount;
    dayData.tradeCount += 1;
    dayData.transactions.push(transaction);
    
    monthData.totalPL += transaction.plAmount;
  });
  
  return monthlyData;
};

export const formatCurrency = (amount: number): string => {
  const roundedAmount = Math.ceil(amount);
  const absAmount = Math.abs(roundedAmount);
  if (absAmount >= 1000) {
    return `${roundedAmount < 0 ? '-' : ''}$${Math.ceil(absAmount / 1000)}k`;
  }
  return `${roundedAmount < 0 ? '-' : ''}$${absAmount}`;
};
