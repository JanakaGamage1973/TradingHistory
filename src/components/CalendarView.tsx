import { MonthlyStats } from "@/types/transaction";
import { DayCell } from "./DayCell";
import { DayDetailDialog } from "./DayDetailDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/csvParser";
import { useState } from "react";

interface CalendarViewProps {
  monthData: MonthlyStats;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const CalendarView = ({
  monthData,
  onPreviousMonth,
  onNextMonth,
  hasNext,
  hasPrevious,
}: CalendarViewProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const safeMonthIndex = Number.isFinite(Number((monthData as any)?.month))
    ? Math.min(11, Math.max(0, Number(monthData.month)))
    : 0;
  const safeYear = Number.isFinite(Number((monthData as any)?.year))
    ? Number(monthData.year)
    : new Date().getFullYear();

  const firstDayRaw = new Date(safeYear, safeMonthIndex, 1).getDay();
  const daysInMonthRaw = new Date(safeYear, safeMonthIndex + 1, 0).getDate();

  // Validate to prevent invalid array lengths (guard against NaN)
  const validFirstDay = Number.isFinite(firstDayRaw)
    ? Math.max(0, Math.min(6, firstDayRaw))
    : 0;
  const validDaysInMonth = Number.isFinite(daysInMonthRaw)
    ? Math.max(1, Math.min(31, daysInMonthRaw))
    : 30;

  const calendarDays: (number | null)[] = [
    ...Array(validFirstDay).fill(null),
    ...Array.from({ length: validDaysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (day: number) => {
    const dayStats = monthData.days.get(day);
    if (dayStats && dayStats.tradeCount > 0) {
      setSelectedDay(day);
      setDialogOpen(true);
    }
  };

  const selectedDayStats = selectedDay ? monthData.days.get(selectedDay) : null;
  const formattedDate = selectedDay
    ? `${MONTH_NAMES[safeMonthIndex]} ${selectedDay}, ${safeYear}`
    : "";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 bg-accent rounded-2xl p-3 sm:p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            disabled={!hasPrevious}
            className="hover:bg-background/50 h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">
              {MONTH_NAMES[safeMonthIndex]} {safeYear}
            </h2>
            <p className={cn(
              "text-sm sm:text-base font-semibold",
              monthData.totalPL > 0 ? "text-success-foreground" : "text-destructive-foreground"
            )}>
              Total: {formatCurrency(monthData.totalPL)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            disabled={!hasNext}
            className="hover:bg-background/50 h-10 w-10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2 tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div key={index}>
              {day ? (
                <DayCell 
                  day={day} 
                  stats={monthData.days.get(day)}
                  onClick={() => handleDayClick(day)}
                />
              ) : (
                <div className="aspect-square" />
              )}
            </div>
          ))}
        </div>
      </Card>

      <DayDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dayStats={selectedDayStats || null}
        date={formattedDate}
      />
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
