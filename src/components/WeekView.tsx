import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/csvParser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";


interface WeekViewProps {
  transactions: Transaction[];
  currentYear: number;
  onPreviousYear: () => void;
  onNextYear: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onWeekClick?: (year: number, month: number) => void;
}

export const WeekView = ({
  transactions,
  currentYear,
  onPreviousYear,
  onNextYear,
  hasNext,
  hasPrevious,
  onWeekClick,
}: WeekViewProps) => {
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const weekData = useMemo(() => {
    // Calculate all weeks in the year
    const weeks = Array.from({ length: 52 }, (_, weekIndex) => {
      const weekNumber = weekIndex + 1;
      
      // Get all transactions for this week
      const weekTransactions = transactions.filter(t => {
        const date = new Date(t.dateUtc);
        return date.getFullYear() === currentYear && getWeekNumber(date) === weekNumber;
      });
      
      const totalPL = weekTransactions.reduce((sum, t) => sum + t.plAmount, 0);
      
      // Get the month from the first transaction of the week
      const firstTransaction = weekTransactions.length > 0 
        ? new Date(weekTransactions[0].dateUtc).getMonth()
        : null;
      
      return {
        weekNumber,
        totalPL,
        tradeCount: weekTransactions.length,
        transactions: weekTransactions,
        month: firstTransaction,
      };
    });
    
    return weeks;
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{currentYear}</h2>
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

        {/* Week label */}
        <div className="text-center mb-5">
          <h3 className="text-base sm:text-lg font-semibold tracking-wider text-muted-foreground">WEEK</h3>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-6 gap-2">
          {weekData.map((week) => (
            <div
              key={week.weekNumber}
              onClick={() => week.tradeCount > 0 && week.month !== null && onWeekClick?.(currentYear, week.month)}
              className={cn(
                "aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all",
                week.tradeCount > 0
                  ? week.totalPL > 0
                    ? "bg-profit-bg text-profit-text cursor-pointer hover:scale-105"
                    : "bg-loss-bg text-loss-text cursor-pointer hover:scale-105"
                  : "bg-muted/30"
              )}
            >
              <div className="text-[0.6rem] sm:text-xs opacity-70 mb-0.5">{week.weekNumber}</div>
              {week.tradeCount > 0 ? (
                <>
                  <div className="font-bold text-[0.65rem] sm:text-sm leading-tight">{formatCurrency(week.totalPL)}</div>
                  <div className="text-[0.55rem] sm:text-xs opacity-70 mt-0.5">T:{week.tradeCount}</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
