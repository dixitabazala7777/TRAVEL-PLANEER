import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudRain, Thermometer, Calendar, HelpCircle, AlertCircle } from 'lucide-react';
import { playChime } from '../utils';

interface WeatherTrendChartProps {
  destinationName: string;
  travelMonth: number; // 0-indexed (0 = Jan, 11 = Dec)
}

interface WeatherDayData {
  day: string;
  tempHigh: number;
  tempLow: number;
  precip: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WeatherTrendChart: React.FC<WeatherTrendChartProps> = ({ destinationName, travelMonth }) => {
  const [useFahrenheit, setUseFahrenheit] = useState<boolean>(false);

  // Generate realistic 7-day seasonal weather trends based on city and chosen month
  const chartData = useMemo<WeatherDayData[]>(() => {
    const name = destinationName.toLowerCase();
    const m = travelMonth;

    // Baselines: average high, average low, average rain probability for this city & month
    let baseHigh = 20;
    let baseLow = 10;
    let baseRain = 20; // % chance of rain

    if (name.includes('tokyo')) {
      // Tokyo monthly temp profiles
      const monthlyHighs = [10, 10, 14, 19, 23, 26, 29, 31, 28, 22, 17, 12];
      const monthlyLows = [2, 3, 5, 10, 15, 19, 23, 24, 21, 15, 9, 4];
      const monthlyRains = [20, 25, 40, 45, 45, 60, 55, 45, 60, 50, 30, 20];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    } else if (name.includes('paris')) {
      // Paris monthly temp profiles
      const monthlyHighs = [8, 9, 13, 16, 20, 23, 26, 26, 22, 17, 11, 8];
      const monthlyLows = [3, 3, 5, 7, 11, 14, 16, 16, 13, 10, 6, 4];
      const monthlyRains = [45, 40, 40, 45, 45, 40, 35, 40, 40, 45, 45, 50];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    } else if (name.includes('reykjavik')) {
      // Reykjavik subpolar profiles
      const monthlyHighs = [2, 3, 4, 6, 10, 12, 14, 14, 11, 7, 4, 2];
      const monthlyLows = [-2, -2, -1, 1, 4, 7, 9, 9, 6, 2, 0, -2];
      const monthlyRains = [65, 60, 65, 55, 50, 50, 55, 60, 65, 70, 60, 65];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    } else if (name.includes('cairo')) {
      // Cairo desert profiles
      const monthlyHighs = [19, 21, 24, 29, 33, 35, 36, 35, 33, 30, 25, 20];
      const monthlyLows = [10, 11, 13, 16, 19, 22, 23, 24, 22, 20, 16, 12];
      const monthlyRains = [10, 8, 5, 2, 1, 0, 0, 0, 0, 2, 5, 8];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    } else if (name.includes('sydney')) {
      // Sydney southern hemisphere (warmest Jan-Feb, coolest Jul-Aug)
      const monthlyHighs = [27, 27, 26, 23, 20, 18, 17, 18, 21, 23, 24, 26];
      const monthlyLows = [19, 19, 18, 15, 12, 10, 9, 10, 12, 14, 16, 18];
      const monthlyRains = [40, 45, 50, 45, 40, 45, 35, 30, 30, 35, 40, 35];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    } else {
      // Generic template with mild variations
      const monthlyHighs = [12, 14, 17, 20, 24, 28, 30, 29, 25, 20, 15, 12];
      const monthlyLows = [4, 5, 8, 11, 14, 18, 20, 19, 16, 11, 7, 4];
      const monthlyRains = [30, 30, 35, 40, 35, 30, 25, 30, 35, 40, 35, 30];
      baseHigh = monthlyHighs[m];
      baseLow = monthlyLows[m];
      baseRain = monthlyRains[m];
    }

    // Generate 7 days with minor deterministic fluctuations (seeded by destination and month)
    const seedString = `${destinationName}-${m}`;
    let seedVal = 0;
    for (let i = 0; i < seedString.length; i++) {
      seedVal += seedString.charCodeAt(i);
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return daysOfWeek.map((dayName, idx) => {
      // Simple pseudo-random variations based on the seed
      const tempDeltaHigh = Math.sin(seedVal + idx) * 3;
      const tempDeltaLow = Math.cos(seedVal + idx) * 2;
      const rainDelta = Math.sin(seedVal * 1.5 + idx * 2) * 15;

      const tempHigh = parseFloat((baseHigh + tempDeltaHigh).toFixed(1));
      const tempLow = parseFloat((baseLow + tempDeltaLow).toFixed(1));
      const precip = Math.max(0, Math.min(100, Math.round(baseRain + rainDelta)));

      return {
        day: `${dayName}`,
        tempHigh,
        tempLow,
        precip
      };
    });
  }, [destinationName, travelMonth]);

  // Convert Celsius to Fahrenheit helper
  const toFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);

  // Map data to display either °C or °F
  const formattedChartData = useMemo(() => {
    return chartData.map(d => ({
      ...d,
      High: useFahrenheit ? toFahrenheit(d.tempHigh) : d.tempHigh,
      Low: useFahrenheit ? toFahrenheit(d.tempLow) : d.tempLow,
      Precipitation: d.precip
    }));
  }, [chartData, useFahrenheit]);

  const handleUnitToggle = () => {
    playChime('click');
    setUseFahrenheit(prev => !prev);
  };

  const currentMonthName = MONTH_NAMES[travelMonth];

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 bg-ink-950/40 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-400/20">
              <CloudRain className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm">7-Day Weather & Climate Trend</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                Trend for {destinationName} in {currentMonthName}
              </p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center bg-ink-900/60 rounded-lg p-0.5 border border-white/5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { if (useFahrenheit) handleUnitToggle(); }}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer outline-none ${
                !useFahrenheit ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => { if (!useFahrenheit) handleUnitToggle(); }}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer outline-none ${
                useFahrenheit ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="w-full h-[220px] pr-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#94a3b8" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit={useFahrenheit ? "°F" : "°C"}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#60a5fa" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#090d16', 
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend 
                verticalAlign="top" 
                height={32} 
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="High" 
                name={`High (${useFahrenheit ? '°F' : '°C'})`}
                stroke="#fb923c" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="Low" 
                name={`Low (${useFahrenheit ? '°F' : '°C'})`}
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="Precipitation" 
                name="Rain Prob. (%)"
                stroke="#3b82f6" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weather Advice/Tip */}
      <div className="mt-3 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex items-start gap-2.5">
        <Thermometer className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">Seasonal Pattern:</span> Temperature fluctuation remains standard for the {currentMonthName} climate. Precipitation ranges up to {Math.max(...chartData.map(d => d.precip))}% probability. Take layered gear!
        </div>
      </div>
    </div>
  );
};
