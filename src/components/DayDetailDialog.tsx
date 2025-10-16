import { DailyStats } from "@/types/transaction";
import { formatCurrency } from "@/utils/csvParser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TickerTradesDialog } from "./TickerTradesDialog";
import { useState } from "react";


interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayStats: DailyStats | null;
  date: string;
}

export const DayDetailDialog = ({
  open,
  onOpenChange,
  dayStats,
  date,
}: DayDetailDialogProps) => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showTickerDetails, setShowTickerDetails] = useState(false);

  if (!dayStats) return null;

  // Group transactions by ticker
  const tickerSummary = dayStats.transactions.reduce((acc, transaction) => {
    const match = transaction.marketName.match(/^(.+?)\s+converted at/);
    const tickerName = match ? match[1] : transaction.marketName;

    if (!acc[tickerName]) {
      acc[tickerName] = {
        ticker: tickerName,
        totalPL: 0,
        tradeCount: 0,
        totalPoints: 0,
      };
    }

    acc[tickerName].totalPL += transaction.plAmount;
    acc[tickerName].tradeCount += 1;
    
    // Calculate point difference for this trade
    try {
      const open = parseFloat(transaction.openLevel);
      const close = parseFloat(transaction.closeLevel);
      if (!isNaN(open) && !isNaN(close)) {
        acc[tickerName].totalPoints += Math.abs(close - open);
      }
    } catch (error) {
      // Skip if parsing fails
    }

    return acc;
  }, {} as Record<string, { ticker: string; totalPL: number; tradeCount: number; totalPoints: number }>);

  // Convert to array and sort by absolute P&L (highest impact first)
  const sortedTickers = Object.values(tickerSummary).sort(
    (a, b) => Math.abs(b.totalPL) - Math.abs(a.totalPL)
  );

  const handleTickerClick = (ticker: string) => {
    setSelectedTicker(ticker);
    setShowTickerDetails(true);
  };

  const handleBackToSummary = () => {
    setShowTickerDetails(false);
    setSelectedTicker(null);
  };

  const selectedTickerTrades = selectedTicker
    ? dayStats.transactions.filter(t => {
        const match = t.marketName.match(/^(.+?)\s+converted at/);
        const tickerName = match ? match[1] : t.marketName;
        return tickerName === selectedTicker;
      })
    : [];


  return (
    <>
      <Dialog open={open && !showTickerDetails} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] w-[95vw]">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-xl sm:text-2xl">
            Trading Details
          </DialogTitle>
          <div className="text-base text-muted-foreground mt-1">{date}</div>
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Total Trades: <span className="font-semibold">{dayStats.tradeCount}</span>
            </div>
            <div
              className={cn(
                "text-lg font-bold px-4 py-1 rounded-lg whitespace-nowrap",
                dayStats.totalPL > 0
                  ? "bg-profit-bg text-profit-text"
                  : "bg-loss-bg text-loss-text"
              )}
            >
              {formatCurrency(dayStats.totalPL)}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-280px)] pr-4">
          <div className="space-y-3">
            {sortedTickers.map((tickerData, index) => {
              const isProfit = tickerData.totalPL > 0;

              return (
                <div
                  key={`${tickerData.ticker}-${index}`}
                  onClick={() => handleTickerClick(tickerData.ticker)}
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02]",
                    isProfit
                      ? "bg-profit-bg/30 border-profit-bg hover:bg-profit-bg/40"
                      : "bg-loss-bg/30 border-loss-bg hover:bg-loss-bg/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                      {isProfit ? (
                        <TrendingUp className="w-5 h-5 text-profit-text flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-loss-text flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-semibold text-base truncate">
                          {tickerData.ticker}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {tickerData.tradeCount} {tickerData.tradeCount === 1 ? 'trade' : 'trades'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div
                        className={cn(
                          "font-bold text-lg sm:text-xl whitespace-nowrap",
                          isProfit ? "text-profit-text" : "text-loss-text"
                        )}
                      >
                        {formatCurrency(tickerData.totalPL)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tickerData.totalPoints.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    <TickerTradesDialog
      open={showTickerDetails}
      onOpenChange={(open) => {
        if (!open) handleBackToSummary();
      }}
      onBack={handleBackToSummary}
      ticker={selectedTicker || ""}
      trades={selectedTickerTrades}
      date={date}
    />
    </>
  );
};
