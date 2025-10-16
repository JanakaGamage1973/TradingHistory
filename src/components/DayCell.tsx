import { DailyStats } from "@/types/transaction";
import { formatCurrency } from "@/utils/csvParser";
import { cn } from "@/lib/utils";

interface DayCellProps {
  day: number;
  stats?: DailyStats;
  onClick?: () => void;
}

export const DayCell = ({ day, stats, onClick }: DayCellProps) => {
  if (!stats) {
    return (
      <div className="aspect-square p-2 text-sm text-muted-foreground">
        {day}
      </div>
    );
  }

  const isProfit = stats.totalPL > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all cursor-pointer hover:scale-105",
        isProfit
          ? "bg-profit-bg text-profit-text"
          : "bg-loss-bg text-loss-text"
      )}
    >
      <div className="text-[0.6rem] sm:text-xs opacity-70 mb-0.5">{day}</div>
      <div className="font-bold text-[0.65rem] sm:text-sm leading-tight">{formatCurrency(stats.totalPL)}</div>
      <div className="text-[0.55rem] sm:text-xs opacity-70 mt-0.5">T:{stats.tradeCount}</div>
    </div>
  );
};
