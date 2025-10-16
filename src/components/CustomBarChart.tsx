import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/csvParser";
import { useState, useRef, useEffect } from "react";

interface CustomBarChartProps {
  data: Array<{
    label: string | number;
    value: number;
  }>;
  height?: number;
  showLabels?: boolean;
  labelInterval?: number;
}

export const CustomBarChart = ({ 
  data, 
  height = 350,
  showLabels = true,
  labelInterval = 5
}: CustomBarChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const maxValue = Math.max(...data.map(d => Math.abs(d.value))) * 1.1 || 100;

  // Calculate bar width and gap dynamically based on container width and number of bars
  const calculateBarDimensions = () => {
    if (!containerWidth) return { barWidth: 20, gap: 8 };
    
    const numBars = data.length;
    const usableWidth = containerWidth - 40; // Reserve padding
    
    let barWidth, gap;
    
    if (numBars <= 7) {
      gap = Math.max(8, usableWidth / (numBars * 6));
      barWidth = Math.min(80, (usableWidth - gap * (numBars - 1)) / numBars);
    } else if (numBars <= 15) {
      gap = Math.max(6, usableWidth / (numBars * 8));
      barWidth = (usableWidth - gap * (numBars - 1)) / numBars;
    } else if (numBars <= 30) {
      gap = Math.max(4, usableWidth / (numBars * 10));
      barWidth = (usableWidth - gap * (numBars - 1)) / numBars;
    } else if (numBars <= 90) {
      gap = Math.max(2, usableWidth / (numBars * 12));
      barWidth = (usableWidth - gap * (numBars - 1)) / numBars;
    } else {
      gap = 1;
      barWidth = (usableWidth - gap * (numBars - 1)) / numBars;
    }
    
    barWidth = Math.max(2, barWidth);
    
    return { barWidth: Math.floor(barWidth), gap: Math.floor(gap) };
  };

  const { barWidth, gap } = calculateBarDimensions();

  // Determine label display frequency
  const shouldShowLabel = (index: number) => {
    if (data.length <= 7) return true;
    if (data.length <= 15) return index % 2 === 0 || index === 0;
    if (data.length <= 30) return index % 5 === 0 || index === 0;
    if (data.length <= 90) return index % 10 === 0 || index === 0;
    return index % 30 === 0 || index === 0;
  };

  const chartData = data.map(item => ({
    ...item,
    color: item.value >= 0 ? '#8FA883' : '#F59E42'
  }));

  return (
    <div ref={chartContainerRef} className="relative w-full" style={{ height: `${height}px` }}>
      <div 
        className="flex items-center justify-center" 
        style={{ 
          height: `${height}px`,
          gap: `${gap}px`
        }}
      >
        {chartData.map((item, index) => {
          const isPositive = item.value >= 0;
          const barHeight = (Math.abs(item.value) / maxValue) * (height / 2);
          const isHovered = hoveredIndex === index;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center h-full justify-center relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-16 bg-popover border border-border rounded-lg p-2 shadow-lg z-10 whitespace-nowrap">
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className={cn("text-xs font-medium", item.value > 0 ? "text-[#8FA883]" : "text-[#F59E42]")}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              )}
              
              <div className="relative flex flex-col items-center h-full">
                <div className="flex-1 flex flex-col justify-end items-center">
                  {/* Positive bar */}
                  {isPositive && (
                    <div 
                      className="rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: item.color,
                        height: `${barHeight}px`,
                        width: `${barWidth}px`,
                        borderRadius: `${barWidth / 2}px`
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col items-center">
                  {/* Negative bar */}
                  {!isPositive && (
                    <div 
                      className="rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: item.color,
                        height: `${barHeight}px`,
                        width: `${barWidth}px`,
                        borderRadius: `${barWidth / 2}px`
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Label */}
              {showLabels && shouldShowLabel(index) && barWidth > 8 && (
                <span className="text-gray-500 font-medium text-xs mt-2">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
