import { useState, useCallback, useMemo, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { CalendarView } from "@/components/CalendarView";
import { WeekView } from "@/components/WeekView";
import { YearView } from "@/components/YearView";
import { parseCSV, groupByMonth } from "@/utils/csvParser";
import { MonthlyStats, Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsDialog } from "@/components/SettingsDialog";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<Map<string, MonthlyStats> | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [activeView, setActiveView] = useState<"week" | "month" | "year">("month");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [verticalSpacing, setVerticalSpacing] = useState<number>(100);
  const [headerSpacing, setHeaderSpacing] = useState<number>(100);

  const marketNames = useMemo(() => {
    if (transactions.length === 0) return [];
    
    // Count trades per market
    const marketCounts = new Map<string, number>();
    transactions.forEach(t => {
      const match = t.marketName.match(/^(.+?)\s+converted at/);
      const cleanMarketName = match ? match[1] : t.marketName;
      marketCounts.set(cleanMarketName, (marketCounts.get(cleanMarketName) || 0) + 1);
    });
    
    // Sort by trade count (descending)
    return Array.from(marketCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([market]) => market);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedMarket === "all") return transactions;
    // Filter by extracted market name
    return transactions.filter(t => {
      const match = t.marketName.match(/^(.+?)\s+converted at/);
      const cleanMarketName = match ? match[1] : t.marketName;
      return cleanMarketName === selectedMarket;
    });
  }, [transactions, selectedMarket]);

  // Recompute monthly data when filtered transactions change
  const filteredMonthlyData = useMemo(() => {
    if (filteredTransactions.length === 0) return null;
    return groupByMonth(filteredTransactions);
  }, [filteredTransactions]);

  const sortedMonths = useMemo(() => {
    if (!filteredMonthlyData) return [];
    return Array.from(filteredMonthlyData.entries())
      .filter(([key]) => {
        const [year] = key.split("-").map(Number);
        return year === currentYear;
      })
      .sort((a, b) => {
        const [yearA, monthA] = a[0].split("-").map(Number);
        const [yearB, monthB] = b[0].split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      });
  }, [filteredMonthlyData, currentYear]);

  // Reset month index when sorted months change (e.g., when filter or year changes)
  useMemo(() => {
    if (sortedMonths.length > 0) {
      setCurrentMonthIndex(Math.min(currentMonthIndex, sortedMonths.length - 1));
    } else {
      setCurrentMonthIndex(0);
    }
  }, [sortedMonths]);

  // Load spacing settings from localStorage and listen for changes
  useEffect(() => {
    const savedSpacing = localStorage.getItem("verticalSpacing");
    const savedHeaderSpacing = localStorage.getItem("headerSpacing");
    
    if (savedSpacing) {
      setVerticalSpacing(parseInt(savedSpacing));
    }
    if (savedHeaderSpacing) {
      setHeaderSpacing(parseInt(savedHeaderSpacing));
    }

    const handleSpacingChange = (e: CustomEvent) => {
      setVerticalSpacing(e.detail);
    };

    const handleHeaderSpacingChange = (e: CustomEvent) => {
      setHeaderSpacing(e.detail);
    };

    window.addEventListener("verticalSpacingChange", handleSpacingChange as EventListener);
    window.addEventListener("headerSpacingChange", handleHeaderSpacingChange as EventListener);
    
    return () => {
      window.removeEventListener("verticalSpacingChange", handleSpacingChange as EventListener);
      window.removeEventListener("headerSpacingChange", handleHeaderSpacingChange as EventListener);
    };
  }, []);

  const handleFileLoad = useCallback((content: string) => {
    try {
      const parsedTransactions = parseCSV(content);
      
      setTransactions(parsedTransactions);
      setSelectedMarket("all");
      
      // Recompute monthly data when market filter changes
      const filtered = parsedTransactions;
      const grouped = groupByMonth(filtered);
      setMonthlyData(grouped);
      setCurrentMonthIndex(grouped.size - 1);
      
      // Set initial year to most recent transaction year
      if (parsedTransactions.length > 0) {
        const years = new Set(parsedTransactions.map(t => new Date(t.dateUtc).getFullYear()));
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        setCurrentYear(sortedYears[0]); // Set to most recent year
      }
      
      toast.success("CSV file loaded successfully!");
    } catch (error) {
      toast.error("Error parsing CSV file. Please check the format.");
      console.error(error);
    }
  }, []);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonthIndex((prev) => Math.min(sortedMonths.length - 1, prev + 1));
  }, [sortedMonths]);

  const handleUploadNew = useCallback(() => {
    setTransactions([]);
    setMonthlyData(null);
    setCurrentMonthIndex(0);
    setSelectedMarket("all");
  }, []);

  const handlePreviousYear = useCallback(() => {
    setCurrentYear(prev => prev - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentYear(prev => prev + 1);
  }, []);

  const handleMonthClick = useCallback((year: number, month: number) => {
    // Find the index of the clicked month in sortedMonths
    const monthKey = `${year}-${month}`;
    const monthIndex = sortedMonths.findIndex(([key]) => key === monthKey);
    
    if (monthIndex !== -1) {
      setCurrentYear(year);
      setCurrentMonthIndex(monthIndex);
      setActiveView("month");
    }
  }, [sortedMonths]);

  const handleWeekClick = useCallback((year: number, month: number) => {
    // Find the index of the clicked month in sortedMonths
    const monthKey = `${year}-${month}`;
    const monthIndex = sortedMonths.findIndex(([key]) => key === monthKey);
    
    if (monthIndex !== -1) {
      setCurrentYear(year);
      setCurrentMonthIndex(monthIndex);
      setActiveView("month");
    }
  }, [sortedMonths]);

  const availableYears = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    const years = new Set(filteredTransactions.map(t => new Date(t.dateUtc).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [filteredTransactions]);

  const hasNextYear = availableYears.length > 0 && currentYear < Math.max(...availableYears);
  const hasPreviousYear = availableYears.length > 0 && currentYear > Math.min(...availableYears);

  if (!filteredMonthlyData || sortedMonths.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground font-bold mb-2 tracking-tight leading-tight">
              Trading History
            </h1>
          </div>
          <div className="w-full max-w-2xl mx-auto">
            <FileUpload onFileLoad={handleFileLoad} />
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = sortedMonths[currentMonthIndex]?.[1] || sortedMonths[0]?.[1];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center" style={{
          paddingTop: `${8 * headerSpacing / 100 * 0.25}rem`,
        }}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground font-bold tracking-tight leading-tight px-4" style={{
            marginBottom: `${10 * headerSpacing / 100 * 0.25}rem`,
          }}>
            Trading History
          </h1>
          
          {/* Controls - Single Horizontal Line */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-3.5 px-2" style={{
            marginBottom: `${4 * verticalSpacing / 100 * 0.25}rem`,
          }}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleUploadNew}
              className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full border border-border/40 hover:border-border hover:bg-accent/5 transition-all duration-300 flex-shrink-0 shadow-sm"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5" />
            </Button>
            
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-[130px] sm:w-[180px] lg:w-[240px] h-12 sm:h-14 lg:h-16 rounded-full border border-border/40 text-xs sm:text-sm lg:text-base font-medium hover:border-border hover:bg-accent/5 transition-all duration-300 shadow-sm">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Markets</SelectItem>
                {marketNames.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={(year) => setCurrentYear(Number(year))}>
              <SelectTrigger className="w-[100px] sm:w-[120px] lg:w-[150px] h-12 sm:h-14 lg:h-16 rounded-full border border-border/40 text-xs sm:text-sm lg:text-base font-medium hover:border-border hover:bg-accent/5 transition-all duration-300 shadow-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <SettingsDialog />
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "week" | "month" | "year")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12 sm:h-14 lg:h-16 rounded-full p-1 bg-muted/30 border border-border/30" style={{
            marginBottom: `${8 * verticalSpacing / 100 * 0.25}rem`,
          }}>
            <TabsTrigger value="week" className="font-semibold rounded-full text-xs sm:text-sm lg:text-base data-[state=active]:bg-[hsl(240,20%,92%)] data-[state=active]:shadow-sm transition-all duration-300">Week</TabsTrigger>
            <TabsTrigger value="month" className="font-semibold rounded-full text-xs sm:text-sm lg:text-base data-[state=active]:bg-[hsl(240,20%,92%)] data-[state=active]:shadow-sm transition-all duration-300">Month</TabsTrigger>
            <TabsTrigger value="year" className="font-semibold rounded-full text-xs sm:text-sm lg:text-base data-[state=active]:bg-[hsl(240,20%,92%)] data-[state=active]:shadow-sm transition-all duration-300">Year</TabsTrigger>
          </TabsList>

        <TabsContent value="week">
          <WeekView
            transactions={filteredTransactions}
            currentYear={currentYear}
            onPreviousYear={handlePreviousYear}
            onNextYear={handleNextYear}
            hasNext={hasNextYear}
            hasPrevious={hasPreviousYear}
            onWeekClick={handleWeekClick}
          />
        </TabsContent>

        <TabsContent value="month">
          <CalendarView
            monthData={currentMonth}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            hasNext={currentMonthIndex < sortedMonths.length - 1}
            hasPrevious={currentMonthIndex > 0}
          />
        </TabsContent>

          <TabsContent value="year">
            <YearView
              transactions={filteredTransactions}
              currentYear={currentYear}
              onPreviousYear={handlePreviousYear}
              onNextYear={handleNextYear}
              hasNext={hasNextYear}
              hasPrevious={hasPreviousYear}
              onMonthClick={handleMonthClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
