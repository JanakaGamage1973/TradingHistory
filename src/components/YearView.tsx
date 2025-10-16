import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/csvParser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";


interface YearViewProps {
  transactions: Transaction[];
  currentYear: number;
  onPreviousYear: () => void;
  onNextYear: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onMonthClick?: (year: number, month: number) => void;
}

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const YearView = ({
  transactions,
  currentYear,
  onPreviousYear,
  onNextYear,
  hasNext,
  hasPrevious,
  onMonthClick,
}: YearViewProps) => {
  const yearData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.dateUtc);
        return date.getFullYear() === currentYear && date.getMonth() === i;
      });
      
      const totalPL = monthTransactions.reduce((sum, t) => sum + t.plAmount, 0);
      
      return {
        month: i,
        totalPL,
        tradeCount: monthTransactions.length,
        transactions: monthTransactions,
      };
    });
    
    const yearTotal = months.reduce((sum, month) => sum + month.totalPL, 0);
    
    return { months, yearTotal };
  }, [transactions, currentYear]);


  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 bg-accent rounded-2xl p-3 sm:p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousYear}
            disabled={!hasPrevious}
            className="hover:bg-background/50 h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">{currentYear}</h2>
            <p className={cn(
              "text-sm sm:text-base font-semibold",
              yearData.yearTotal > 0 ? "text-success-foreground" : "text-destructive-foreground"
            )}>
              Total: {formatCurrency(yearData.yearTotal)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextYear}
            disabled={!hasNext}
            className="hover:bg-background/50 h-10 w-10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Month label */}
        <div className="text-center mb-5">
          <h3 className="text-base sm:text-lg font-semibold tracking-wider text-muted-foreground">MONTH</h3>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {yearData.months.map((month) => (
            <div
              key={month.month}
              onClick={() => month.tradeCount > 0 && onMonthClick?.(currentYear, month.month)}
              className={cn(
                "aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all",
                month.tradeCount > 0
                  ? month.totalPL > 0
                    ? "bg-profit-bg text-profit-text cursor-pointer hover:scale-105"
                    : "bg-loss-bg text-loss-text cursor-pointer hover:scale-105"
                  : "bg-muted/30"
              )}
            >
              {month.tradeCount > 0 ? (
                <>
                  <div className="text-[0.6rem] sm:text-xs font-bold mb-0.5">{MONTH_NAMES[month.month]}</div>
                  <div className="font-bold text-[0.65rem] sm:text-sm leading-tight">{formatCurrency(month.totalPL)}</div>
                  <div className="text-[0.55rem] sm:text-xs opacity-70 mt-0.5">T:{month.tradeCount}</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">{month.month + 1}</div>
              )}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
