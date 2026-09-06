import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CloudRain, Thermometer, Calendar, HelpCircle, AlertCircle, Shirt, Wind, Sun, Snowflake, ShieldAlert, Umbrella } from 'lucide-react';
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

  // Determine outfit suggestions dynamically based on average high and max precipitation
  const outfitArchetypes = useMemo(() => {
    const temps = chartData.map(d => d.tempHigh);
    const precips = chartData.map(d => d.precip);
    const avgHigh = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 15;
    const maxPrecip = precips.length > 0 ? Math.max(...precips) : 20;

    if (maxPrecip > 50) {
      return {
        title: 'Wet Weather / Monsoon Mode',
        description: `With rain probability peaking at ${maxPrecip}%, gear that blocks water and dries instantly is vital.`,
        items: [
          {
            name: 'Full Waterproofing',
            desc: 'Breathable seam-sealed Gore-Tex shell, waterproof hiking shoes/boots, and water-repellent bags.',
            badge: 'Wet Weather Core',
            icon: 'rain'
          },
          {
            name: 'Humid Transit Casual',
            desc: 'Lightweight quick-dry synthetic tee, stretch-mesh shorts, and hydrophobic socks that won’t trap sweat.',
            badge: 'Fast-Dry Sport',
            icon: 'wind'
          },
          {
            name: 'Cozy Shelter Knitwear',
            desc: 'A warm fleece pullover or soft cotton knit for relaxing in local bistros or waiting out storms indoors.',
            badge: 'Cafe Comfort',
            icon: 'shirt'
          }
        ]
      };
    } else if (avgHigh > 24) {
      return {
        title: 'Warm Climate / Summer Mode',
        description: `Summery temperatures averaging a balmy ${avgHigh.toFixed(1)}°C call for breathable fabrics and active sun blocking.`,
        items: [
          {
            name: 'Summer Casual',
            desc: 'Linen shirts, cotton tees, ultra-breathable shorts, polarized sunglasses, and premium canvas sneakers.',
            badge: 'Sun & Breeze',
            icon: 'sun'
          },
          {
            name: 'UV Protection Gear',
            desc: 'Wide-brimmed adventure hat, UPF 50+ long-sleeved rash guard/trail shirt, and cooling microfiber neck gaiter.',
            badge: 'High UV Shield',
            icon: 'shield'
          },
          {
            name: 'Chilled Interior Cover',
            desc: 'A thin linen blazer, lightweight cardigan, or soft modal long-sleeve to survive heavily air-conditioned transit hubs.',
            badge: 'Indoor Transit',
            icon: 'shirt'
          }
        ]
      };
    } else if (avgHigh >= 12) {
      return {
        title: 'Mild Temperature / Temperate Mode',
        description: `Comfortable mild conditions around ${avgHigh.toFixed(1)}°C with notable day-to-night temperature swings.`,
        items: [
          {
            name: 'Light Layering',
            desc: 'Premium merino wool undershirt, structured denim or chore jacket, active-stretch chinos, and supportive sneakers.',
            badge: 'Comfort Versatility',
            icon: 'shirt'
          },
          {
            name: 'Smart Casual Dusk',
            desc: 'Medium-gauge knit sweater, light trench coat, tailored trousers, and leather chelsea boots for twilight strolls.',
            badge: 'Evening Rhythm',
            icon: 'wind'
          },
          {
            name: 'Windproof Daywear',
            desc: 'Packable windbreaker, performance activewear joggers, and casual trail-runners for outdoor viewpoints.',
            badge: 'Active Utility',
            icon: 'shield'
          }
        ]
      };
    } else {
      return {
        title: 'Cold Climate / Insulated Shield',
        description: `Brisk averages around ${avgHigh.toFixed(1)}°C require high-grade thermal shielding and windproof outer shells.`,
        items: [
          {
            name: 'Heavy Insulation',
            desc: 'Premium high-loft down parka, heavyweight thermal base layers (wool), thermal socks, and water-resistant winter boots.',
            badge: 'Sub-Zero Shield',
            icon: 'snow'
          },
          {
            name: 'Windproof Urban Chic',
            desc: 'Thick double-breasted wool overcoat, pure cashmere scarf, fleece-lined leather gloves, and windproof trousers.',
            badge: 'Metro Winter',
            icon: 'wind'
          },
          {
            name: 'Thermal Transit Gear',
            desc: 'Fleece-lined utility joggers, moisture-wicking athletic compression tops, and protective beanie.',
            badge: 'Warm Mobility',
            icon: 'shirt'
          }
        ]
      };
    }
  }, [chartData]);

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

      {/* 3 Outfit Archetypes Section (Feature 14 Expansion) */}
      <div className="mt-5 border-t border-white/5 pt-4 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Shirt className="w-4 h-4 text-pink-400" />
          <h5 className="font-display font-semibold text-xs uppercase tracking-wider font-bold">Dynamic Outfit Archetypes ({outfitArchetypes.title})</h5>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal mb-1.5">{outfitArchetypes.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {outfitArchetypes.items.map((item, idx) => {
            let IconComponent = Shirt;
            if (item.icon === 'rain') IconComponent = CloudRain;
            if (item.icon === 'wind') IconComponent = Wind;
            if (item.icon === 'sun') IconComponent = Sun;
            if (item.icon === 'shield') IconComponent = ShieldAlert;
            if (item.icon === 'snow') IconComponent = Snowflake;

            return (
              <div key={idx} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col justify-between space-y-2.5 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-400/10">
                      {item.badge}
                    </span>
                    <IconComponent className="w-4 h-4 text-slate-400" />
                  </div>
                  <h6 className="text-xs font-bold text-slate-200">{item.name}</h6>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
