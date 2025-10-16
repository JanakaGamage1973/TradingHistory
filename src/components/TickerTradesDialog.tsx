import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/csvParser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";


interface TickerTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  ticker: string;
  trades: Transaction[];
  date: string;
}

export const TickerTradesDialog = ({
  open,
  onOpenChange,
  onBack,
  ticker,
  trades,
  date,
}: TickerTradesDialogProps) => {
  const totalPL = trades.reduce((sum, t) => sum + t.plAmount, 0);

  const calculateDurationMinutes = (openDateUtc: string, closeDateUtc: string): number => {
    try {
      const openTime = new Date(openDateUtc).getTime();
      const closeTime = new Date(closeDateUtc).getTime();
      const durationMs = closeTime - openTime;
      
      if (durationMs < 0) return 0;
      
      return durationMs / (1000 * 60); // Convert to minutes
    } catch (error) {
      return 0;
    }
  };

  const calculateDuration = (openDateUtc: string, closeDateUtc: string): string => {
    try {
      const openTime = new Date(openDateUtc).getTime();
      const closeTime = new Date(closeDateUtc).getTime();
      const durationMs = closeTime - openTime;
      
      if (durationMs < 0) return "-";
      
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
      
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } catch (error) {
      return "-";
    }
  };

  const calculatePointDifference = (openLevel: string, closeLevel: string): string => {
    try {
      const open = parseFloat(openLevel);
      const close = parseFloat(closeLevel);
      
      if (isNaN(open) || isNaN(close)) return "-";
      
      const diff = Math.abs(close - open);
      return diff.toFixed(1);
    } catch (error) {
      return "-";
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] w-[95vw]">
        <DialogHeader className="pr-8">
          <div className="flex items-center gap-2 pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0 overflow-hidden">
              <DialogTitle className="text-xl sm:text-2xl truncate">
                {ticker}
              </DialogTitle>
              <div className="text-sm text-muted-foreground truncate">{date}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Total Trades: <span className="font-semibold">{trades.length}</span>
            </div>
            <div
              className={cn(
                "text-lg font-bold px-4 py-1 rounded-lg whitespace-nowrap",
                totalPL > 0
                  ? "bg-profit-bg text-profit-text"
                  : "bg-loss-bg text-loss-text"
              )}
            >
              {formatCurrency(totalPL)}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-280px)] pr-4">
          <div className="space-y-2">
            {trades.map((transaction, index) => {
              const isProfit = transaction.plAmount > 0;

              return (
                <div
                  key={`${transaction.reference}-${index}`}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    isProfit
                      ? "bg-profit-bg/30 border-profit-bg"
                      : "bg-loss-bg/30 border-loss-bg"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {isProfit ? (
                          <TrendingUp className="w-4 h-4 text-profit-text" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-loss-text" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          Trade #{index + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="truncate">
                          <span className="opacity-70">Open:</span>{" "}
                          <span className="font-medium">{transaction.openLevel}</span>
                        </div>
                        <div className="truncate">
                          <span className="opacity-70">Close:</span>{" "}
                          <span className="font-medium">{transaction.closeLevel}</span>
                        </div>
                        <div className="truncate">
                          <span className="opacity-70">Size:</span>{" "}
                          <span className="font-medium">{transaction.size}</span>
                        </div>
                        <div className="truncate">
                          <span className="opacity-70">Period:</span>{" "}
                          <span className="font-medium">{calculateDuration(transaction.openDateUtc, transaction.dateUtc)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div
                        className={cn(
                          "font-bold text-lg whitespace-nowrap",
                          isProfit ? "text-profit-text" : "text-loss-text"
                        )}
                      >
                        {formatCurrency(transaction.plAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {calculatePointDifference(transaction.openLevel, transaction.closeLevel)}
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
  );
};
