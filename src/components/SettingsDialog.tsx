import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";

interface ColorSettings {
  profitBg: string;
  profitText: string;
  profitBar: string;
  lossBg: string;
  lossText: string;
  lossBar: string;
  chartAxis: string;
}

const defaultLightColors: ColorSettings = {
  profitBg: "126 59% 90%",
  profitText: "135 53% 39%",
  profitBar: "135 53% 39%",
  lossBg: "0 68% 85%",
  lossText: "0 63% 54%",
  lossBar: "0 63% 54%",
  chartAxis: "240 5% 50%",
};

const defaultDarkColors: ColorSettings = {
  profitBg: "140 40% 20%",
  profitText: "120 50% 50%",
  profitBar: "120 50% 50%",
  lossBg: "0 50% 25%",
  lossText: "0 55% 65%",
  lossBar: "0 55% 65%",
  chartAxis: "240 5% 60%",
};

export const SettingsDialog = () => {
  const { theme, setTheme } = useTheme();
  const [lightColors, setLightColors] = useState<ColorSettings>(defaultLightColors);
  const [darkColors, setDarkColors] = useState<ColorSettings>(defaultDarkColors);
  const [barGap, setBarGap] = useState<number>(2);
  const [verticalSpacing, setVerticalSpacing] = useState<number>(100);
  const [headerSpacing, setHeaderSpacing] = useState<number>(100);

  useEffect(() => {
    const savedLightColors = localStorage.getItem("lightColors");
    const savedDarkColors = localStorage.getItem("darkColors");
    const savedBarGap = localStorage.getItem("barGap");
    const savedVerticalSpacing = localStorage.getItem("verticalSpacing");
    const savedHeaderSpacing = localStorage.getItem("headerSpacing");
    
    if (savedLightColors) {
      setLightColors(JSON.parse(savedLightColors));
    }
    if (savedDarkColors) {
      setDarkColors(JSON.parse(savedDarkColors));
    }
    if (savedBarGap) {
      setBarGap(parseInt(savedBarGap));
    }
    if (savedVerticalSpacing) {
      setVerticalSpacing(parseInt(savedVerticalSpacing));
    }
    if (savedHeaderSpacing) {
      setHeaderSpacing(parseInt(savedHeaderSpacing));
    }
  }, []);

  const applyColors = (colors: ColorSettings, isDark: boolean) => {
    const root = document.documentElement;
    const prefix = isDark ? '.dark' : ':root';
    
    if (isDark && !document.documentElement.classList.contains('dark')) return;
    if (!isDark && document.documentElement.classList.contains('dark')) return;

    root.style.setProperty('--profit-bg', colors.profitBg);
    root.style.setProperty('--profit-text', colors.profitText);
    root.style.setProperty('--profit-bar', colors.profitBar);
    root.style.setProperty('--loss-bg', colors.lossBg);
    root.style.setProperty('--loss-text', colors.lossText);
    root.style.setProperty('--loss-bar', colors.lossBar);
    root.style.setProperty('--chart-axis', colors.chartAxis);
  };

  const handleColorChange = (colorKey: keyof ColorSettings, value: string, isDark: boolean) => {
    const hslValue = hexToHSL(value);
    
    if (isDark) {
      const newColors = { ...darkColors, [colorKey]: hslValue };
      setDarkColors(newColors);
      localStorage.setItem("darkColors", JSON.stringify(newColors));
      applyColors(newColors, true);
    } else {
      const newColors = { ...lightColors, [colorKey]: hslValue };
      setLightColors(newColors);
      localStorage.setItem("lightColors", JSON.stringify(newColors));
      applyColors(newColors, false);
    }
  };

  const handleBarGapChange = (value: number[]) => {
    const newGap = value[0];
    setBarGap(newGap);
    localStorage.setItem("barGap", newGap.toString());
    window.dispatchEvent(new CustomEvent("barGapChange", { detail: newGap }));
  };

  const handleVerticalSpacingChange = (value: number[]) => {
    const newSpacing = value[0];
    setVerticalSpacing(newSpacing);
    localStorage.setItem("verticalSpacing", newSpacing.toString());
    window.dispatchEvent(new CustomEvent("verticalSpacingChange", { detail: newSpacing }));
  };

  const handleHeaderSpacingChange = (value: number[]) => {
    const newSpacing = value[0];
    setHeaderSpacing(newSpacing);
    localStorage.setItem("headerSpacing", newSpacing.toString());
    window.dispatchEvent(new CustomEvent("headerSpacingChange", { detail: newSpacing }));
  };

  const resetColors = () => {
    setLightColors(defaultLightColors);
    setDarkColors(defaultDarkColors);
    setBarGap(2);
    setVerticalSpacing(100);
    setHeaderSpacing(100);
    localStorage.removeItem("lightColors");
    localStorage.removeItem("darkColors");
    localStorage.removeItem("barGap");
    localStorage.removeItem("verticalSpacing");
    localStorage.removeItem("headerSpacing");
    applyColors(theme === "dark" ? defaultDarkColors : defaultLightColors, theme === "dark");
    window.dispatchEvent(new CustomEvent("barGapChange", { detail: 2 }));
    window.dispatchEvent(new CustomEvent("verticalSpacingChange", { detail: 100 }));
    window.dispatchEvent(new CustomEvent("headerSpacingChange", { detail: 100 }));
  };

  useEffect(() => {
    applyColors(theme === "dark" ? darkColors : lightColors, theme === "dark");
  }, [theme, lightColors, darkColors]);

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const hDecimal = h / 360;
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    
    let r, g, b;
    if (sDecimal === 0) {
      r = g = b = lDecimal;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal;
      const p = 2 * lDecimal - q;
      r = hue2rgb(p, q, hDecimal + 1/3);
      g = hue2rgb(p, q, hDecimal);
      b = hue2rgb(p, q, hDecimal - 1/3);
    }
    
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHSL = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16) / 255;
      g = parseInt(hex.slice(3, 5), 16) / 255;
      b = parseInt(hex.slice(5, 7), 16) / 255;
    }
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const currentColors = theme === "dark" ? darkColors : lightColors;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-full border border-border/40 hover:border-border hover:bg-accent/5 transition-all duration-300 flex-shrink-0 shadow-sm"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4 overflow-y-auto pr-2">
          <div>
            <Label className="text-base font-semibold mb-4 block">Theme</Label>
            <div className="flex gap-3">
              <Button 
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1 h-11"
              >
                Light
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1 h-11"
              >
                Dark
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block">
              Colors ({theme === "dark" ? "Dark" : "Light"} Mode)
            </Label>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Profit Colors</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Background</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.profitBg)}
                      onChange={(e) => handleColorChange("profitBg", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Text</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.profitText)}
                      onChange={(e) => handleColorChange("profitText", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Bars</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.profitBar)}
                      onChange={(e) => handleColorChange("profitBar", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Loss Colors</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Background</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.lossBg)}
                      onChange={(e) => handleColorChange("lossBg", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Text</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.lossText)}
                      onChange={(e) => handleColorChange("lossText", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Bars</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.lossBar)}
                      onChange={(e) => handleColorChange("lossBar", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Chart Colors</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Axis & Grid</Label>
                    <input
                      type="color"
                      value={hslToHex(currentColors.chartAxis)}
                      onChange={(e) => handleColorChange("chartAxis", e.target.value, theme === "dark")}
                      className="w-full h-12 rounded-lg cursor-pointer border-2 border-border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-4 block">Layout Settings</Label>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Header Section Spacing</Label>
                  <span className="text-sm text-muted-foreground">{headerSpacing}%</span>
                </div>
                <Slider
                  value={[headerSpacing]}
                  onValueChange={handleHeaderSpacingChange}
                  min={25}
                  max={200}
                  step={25}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust spacing around "Trading History" title
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Controls to Tabs Spacing</Label>
                  <span className="text-sm text-muted-foreground">{verticalSpacing}%</span>
                </div>
                <Slider
                  value={[verticalSpacing]}
                  onValueChange={handleVerticalSpacingChange}
                  min={25}
                  max={200}
                  step={25}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust spacing between buttons and Week/Month/Year tabs
                </p>
              </div>
            </div>
          </div>

          <Button onClick={resetColors} variant="outline" className="w-full h-11 mt-2">
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
