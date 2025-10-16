import { Card } from "@/components/ui/card";
import { CustomBarChart } from "./CustomBarChart";

interface PnLChartProps {
  data: Array<{
    label: string | number;
    value: number;
    high?: number;
    low?: number;
    open?: number;
    close?: number;
  }>;
  title?: string;
}

export const PnLChart = ({ data, title = "Aggregate PnL vs Date" }: PnLChartProps) => {
  return (
    <Card className="p-4 sm:p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      </div>
      
      <div className="w-full">
        <CustomBarChart 
          data={data} 
          height={300}
          showLabels={true}
          labelInterval={data.length > 30 ? 5 : 3}
        />
      </div>
    </Card>
  );
};
