/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  MapPin,
  CalendarRange,
  Wallet,
  Sparkles,
  Tags,
  Navigation,
  Route,
  PieChart,
  Backpack,
  CheckCircle2,
  Check,
  Shuffle,
  Plus,
  X,
  Lock,
  Calendar,
  Coins,
  Languages,
  ShieldCheck,
  Sunrise,
  Sun,
  Moon,
  Landmark,
  Palmtree,
  Utensils,
  Users,
  MountainSnow
} from 'lucide-react';

import { Destination, DayPlan, Activity, PackingItem, BudgetTier } from './types';
import {
  DESTINATIONS,
  STYLES,
  ACTIVITY_POOL,
  PACKING_BASE,
  PACKING_CLIMATE,
  PACKING_STYLE
} from './data';
import { seededRandom, hashStr, fmtUSD } from './utils';

const TIER_BASE = { budget: 55, moderate: 130, luxury: 320 };
const TIER_SPLIT = {
  budget: { Accommodation: 0.35, Food: 0.28, Activities: 0.20, Transport: 0.17 },
  moderate: { Accommodation: 0.42, Food: 0.25, Activities: 0.20, Transport: 0.13 },
  luxury: { Accommodation: 0.50, Food: 0.22, Activities: 0.18, Transport: 0.10 }
};

export default function App() {
  // --- Form parameters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [days, setDays] = useState(5);
  const [tier, setTier] = useState<BudgetTier>('moderate');
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set(['culture']));
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Output state ---
  const [hasGenerated, setHasGenerated] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [packing, setPacking] = useState<PackingItem[]>([]);
  const [packingInput, setPackingInput] = useState('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'packing'>('itinerary');

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // --- Dynamic suggestion filtering ---
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    
    // Don't show suggestions if the query exactly matches selected destination
    if (destination && `${destination.name}, ${destination.country}`.toLowerCase() === q) {
      return [];
    }

    return DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery, destination]);

  // Close suggestions on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Travel style selection helper ---
  const handleToggleStyle = (styleId: string) => {
    setSelectedStyles(prev => {
      const next = new Set(prev);
      if (next.has(styleId)) {
        if (next.size > 1) {
          next.delete(styleId);
        }
      } else {
        next.add(styleId);
      }
      return next;
    });
  };

  // --- Core activity generator ---
  const makeActivity = (
    tpl: any,
    style: string,
    dest: Destination,
    day: number,
    slot: 'Morning' | 'Afternoon' | 'Evening'
  ): Activity => {
    const costMult = dest.costIndex;
    const randomId = Math.floor(Math.random() * 100000);
    return {
      id: `${day}-${slot}-${tpl.cat}-${randomId}`,
      title: tpl.t.replace('{name}', dest.name),
      slot,
      cat: tpl.cat,
      style,
      cost: Math.round(tpl.cost * costMult),
      done: false
    };
  };

  // --- Plan trigger ---
  const handlePlanTrip = () => {
    if (!destination) return;
    setHasGenerated(true);
    setActiveDay(0);

    const dest = destination;
    const selectedStyleList: string[] = Array.from(selectedStyles);
    const seed = hashStr(dest.id + selectedStyleList.sort().join(',') + days);
    const rand = seededRandom(seed);

    const newItinerary: DayPlan[] = [];

    for (let day = 1; day <= days; day++) {
      const slots: DayPlan['slots'] = { Morning: [], Afternoon: [], Evening: [] };
      (['Morning', 'Afternoon', 'Evening'] as const).forEach(slot => {
        const slotIdx = ['Morning', 'Afternoon', 'Evening'].indexOf(slot);
        // rotate through styles so variety spreads across the trip
        const style = selectedStyleList[(day + slotIdx) % selectedStyleList.length] || selectedStyleList[0];
        const pool = ACTIVITY_POOL[style]?.filter(a => a.slot === slot) || [];
        const pick = pool[Math.floor(rand() * pool.length)] || ACTIVITY_POOL[style]?.[0];
        if (pick) {
          slots[slot].push(makeActivity(pick, style, dest, day, slot));
        }
      });
      newItinerary.push({ day, slots });
    }

    setItinerary(newItinerary);

    // Build packing checklist
    const climateItems = PACKING_CLIMATE[dest.climate] || [];
    const baseItems = [...PACKING_BASE, ...climateItems];
    const styleItemsSet = new Set<string>();
    selectedStyleList.forEach(s => {
      (PACKING_STYLE[s] || []).forEach(item => styleItemsSet.add(item));
    });

    const combinedPacking = Array.from(new Set([...baseItems, ...Array.from(styleItemsSet)])).map(label => ({
      id: `pack-${Math.random().toString(36).substring(2, 9)}`,
      label,
      checked: false,
      custom: false
    }));

    setPacking(combinedPacking);
    setActiveTab('itinerary');

    // Smooth scroll down to results section
    setTimeout(() => {
      const resultsSec = document.getElementById('results-section');
      if (resultsSec) {
        resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // --- Dynamic adjustment for duration slider ---
  const handleDaysSliderChange = (newDays: number) => {
    setDays(newDays);
    if (hasGenerated && destination) {
      setItinerary(prev => {
        const cur = prev.length;
        if (newDays > cur) {
          const d = destination;
          const selectedStyleList: string[] = Array.from(selectedStyles);
          const seed = hashStr(d.id + selectedStyleList.sort().join(',') + newDays + '-ext');
          const rand = seededRandom(seed);
          const addedPlans: DayPlan[] = [];

          for (let day = cur + 1; day <= newDays; day++) {
            const slots: DayPlan['slots'] = { Morning: [], Afternoon: [], Evening: [] };
            (['Morning', 'Afternoon', 'Evening'] as const).forEach(slot => {
              const slotIdx = ['Morning', 'Afternoon', 'Evening'].indexOf(slot);
              const style = selectedStyleList[(day + slotIdx) % selectedStyleList.length] || selectedStyleList[0];
              const pool = ACTIVITY_POOL[style]?.filter(a => a.slot === slot) || [];
              const pick = pool[Math.floor(rand() * pool.length)] || ACTIVITY_POOL[style]?.[0];
              if (pick) {
                slots[slot].push(makeActivity(pick, style, d, day, slot));
              }
            });
            addedPlans.push({ day, slots });
          }
          return [...prev, ...addedPlans];
        } else if (newDays < cur) {
          const truncated = prev.slice(0, newDays);
          if (activeDay >= newDays) {
            setActiveDay(newDays - 1);
          }
          return truncated;
        }
        return prev;
      });
    }
  };

  // --- Swapping a single item ---
  const handleSwapActivity = (dayIdx: number, slot: 'Morning' | 'Afternoon' | 'Evening', actId: string) => {
    if (!destination) return;
    const dest = destination;

    setItinerary(prev => {
      return prev.map((dayPlan, idx) => {
        if (idx !== dayIdx) return dayPlan;

        const updatedSlots = { ...dayPlan.slots };
        updatedSlots[slot] = updatedSlots[slot].map(act => {
          if (act.id !== actId) return act;

          const pool = ACTIVITY_POOL[act.style]?.filter(t => t.slot === slot) || [];
          const candidates = pool.filter(t => t.t.replace('{name}', dest.name) !== act.title);
          const pick = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];

          if (pick) {
            return makeActivity(pick, act.style, dest, dayPlan.day, slot);
          }
          return act;
        });

        return { ...dayPlan, slots: updatedSlots };
      });
    });
  };

  // --- Check activity off ---
  const handleToggleActivity = (dayIdx: number, slot: 'Morning' | 'Afternoon' | 'Evening', actId: string) => {
    setItinerary(prev => {
      return prev.map((dayPlan, idx) => {
        if (idx !== dayIdx) return dayPlan;
        const updatedSlots = { ...dayPlan.slots };
        updatedSlots[slot] = updatedSlots[slot].map(act => {
          if (act.id !== actId) return act;
          return { ...act, done: !act.done };
        });
        return { ...dayPlan, slots: updatedSlots };
      });
    });
  };

  // --- Calculate Itinerary completion details ---
  const completionStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    itinerary.forEach(d => {
      (['Morning', 'Afternoon', 'Evening'] as const).forEach(slot => {
        const list = d.slots[slot];
        list.forEach(act => {
          total++;
          if (act.done) completed++;
        });
      });
    });
    return { total, completed };
  }, [itinerary]);

  // --- Budget Estimations & Donut Geometry ---
  const budgetStats = useMemo(() => {
    const costMult = destination?.costIndex || 1.0;
    const baseDailyRate = TIER_BASE[tier] * costMult;
    const totalAmount = baseDailyRate * days;
    const splitMap = TIER_SPLIT[tier];

    const colors: Record<string, string> = {
      Accommodation: '#34D5A4', // Emerald 400
      Food: '#38BDF8',          // Sky 400
      Activities: '#F5B942',    // Amber 400
      Transport: '#F87171'      // Red 400
    };

    const textColors: Record<string, string> = {
      Accommodation: 'text-emerald-400',
      Food: 'text-sky-400',
      Activities: 'text-amber-400',
      Transport: 'text-rose-400'
    };

    const bgColors: Record<string, string> = {
      Accommodation: 'bg-emerald-400',
      Food: 'bg-sky-400',
      Activities: 'bg-amber-400',
      Transport: 'bg-rose-400'
    };

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const breakdowns = (Object.entries(splitMap) as [string, number][]).map(([catName, percent]) => {
      const amount = totalAmount * percent;
      const strokeDash = circumference * percent;
      const strokeOffset = -accumulatedOffset;
      accumulatedOffset += strokeDash;

      return {
        name: catName,
        percent,
        amount,
        color: colors[catName],
        textColor: textColors[catName],
        bgColor: bgColors[catName],
        strokeDashArray: `${strokeDash} ${circumference}`,
        strokeDashOffset: strokeOffset
      };
    });

    return {
      totalAmount,
      baseDailyRate,
      breakdowns
    };
  }, [destination, days, tier]);

  // --- Packing Item additions ---
  const handleAddPackingItem = () => {
    const label = packingInput.trim();
    if (!label) return;

    setPacking(prev => [
      ...prev,
      {
        id: `custom-pack-${Math.random().toString(36).substring(2, 9)}`,
        label,
        checked: false,
        custom: true
      }
    ]);
    setPackingInput('');
  };

  const handleTogglePacking = (id: string) => {
    setPacking(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  const handleDeletePacking = (id: string) => {
    setPacking(prev => prev.filter(p => p.id !== id));
  };

  const packingCompletedCount = useMemo(() => packing.filter(p => p.checked).length, [packing]);

  // Lookup helper for lucide-react icons based on string style
  const getStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'MountainSnow': return <MountainSnow className="w-3.5 h-3.5" />;
      case 'Landmark': return <Landmark className="w-3.5 h-3.5" />;
      case 'Palmtree': return <Palmtree className="w-3.5 h-3.5" />;
      case 'Utensils': return <Utensils className="w-3.5 h-3.5" />;
      case 'Users': return <Users className="w-3.5 h-3.5" />;
      default: return <Compass className="w-3.5 h-3.5" />;
    }
  };

  const getSlotIcon = (slot: 'Morning' | 'Afternoon' | 'Evening') => {
    switch (slot) {
      case 'Morning': return <Sunrise className="w-4 h-4 text-blue-400" />;
      case 'Afternoon': return <Sun className="w-4 h-4 text-blue-400" />;
      case 'Evening': return <Moon className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="text-slate-200 antialiased min-h-screen flex flex-col justify-between">
      <div>
        {/* ============ NAVIGATION ============ */}
        <header className="sticky top-0 z-40 border-b border-white/5 glass">
          <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-glow">
                <Compass className="w-4.5 h-4.5 text-ink-950" style={{ width: '18px', height: '18px' }} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">Waypoint</span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-blue-400/70 border border-blue-400/20 rounded-full px-2.5 py-0.5 ml-1">
                AI Planner
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span className="hidden md:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                No API key required
              </span>
            </div>
          </div>
        </header>

        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grain-grid pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-14 pb-10 relative">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400 mb-3">Plan · Simulate · Depart</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight">
                Your next trip, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">plotted in seconds.</span>
              </h1>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                Set your coordinates. Waypoint builds a day-by-day itinerary, live budget model, and a climate-aware packing list — no sign-in, no API keys, fully offline logic.
              </p>
            </div>

            {/* Dashboard Panel */}
            <div className="mt-9 glass rounded-2xl shadow-panel p-5 md:p-7 relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Destination input */}
                <div className="lg:col-span-4 relative" ref={suggestionsRef}>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Destination
                  </label>
                  <input
                    id="destInput"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      if (destination) setDestination(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search a city — try 'Tokyo'"
                    className="w-full bg-ink-900/70 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:outline-none transition"
                  />
                  
                  {/* Suggestion dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 z-30 mt-2 glass rounded-xl overflow-hidden shadow-panel max-h-64 overflow-y-auto border border-white/10"
                      >
                        {suggestions.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setDestination(d);
                              setSearchQuery(`${d.name}, ${d.country}`);
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left border-b border-white/5 last:border-b-0"
                          >
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-sm text-slate-200 font-medium">{d.name}</span>
                            <span className="text-xs text-slate-500">{d.country}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Duration Slider */}
                <div className="lg:col-span-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-blue-400" /> Duration —{' '}
                    <span className="text-blue-300 font-semibold">{days} days</span>
                  </label>
                  <div className="mt-4">
                    <input
                      id="daysRange"
                      type="range"
                      min="1"
                      max="14"
                      value={days}
                      onChange={(e) => handleDaysSliderChange(parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer"
                      style={{
                        '--val': `${((days - 1) / 13) * 100}%`
                      } as CSSProperties}
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
                      <span>1 day</span>
                      <span>14 days</span>
                    </div>
                  </div>
                </div>

                {/* Budget Tier buttons */}
                <div className="lg:col-span-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" /> Budget tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['budget', 'moderate', 'luxury'] as const).map((tierName) => (
                      <button
                        key={tierName}
                        type="button"
                        onClick={() => setTier(tierName)}
                        className={`flex flex-col items-center gap-1 border rounded-xl py-2.5 bg-ink-900/60 hover:border-white/25 transition-all outline-none ${
                          tier === tierName
                            ? 'border-blue-400/50 bg-blue-500/10 text-blue-300 shadow-glow'
                            : 'border-white/10 text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-all ${
                            tier === tierName ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className="text-[11px] font-medium capitalize">{tierName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="lg:col-span-2 flex flex-col justify-end">
                  <button
                    id="generateBtn"
                    onClick={handlePlanTrip}
                    disabled={!destination}
                    className="w-full h-[46px] rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-ink-950 font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-glow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Sparkles className="w-4 h-4" /> Plan trip
                  </button>
                </div>
              </div>

              {/* Travel style chips */}
              <div className="mt-6 pt-5 border-t border-white/8">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5 text-blue-400" /> Travel style — <span className="text-slate-600 normal-case">pick one or more</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((style) => {
                    const isActive = selectedStyles.has(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleToggleStyle(style.id)}
                        className={`flex items-center gap-1.5 border rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 outline-none ${
                          isActive
                            ? 'border-blue-400/60 bg-blue-500/15 text-blue-300 shadow-[0_4px_12px_rgba(59,130,246,0.15)]'
                            : 'border-white/10 text-slate-400 bg-ink-900/60 hover:border-white/20'
                        }`}
                      >
                        {getStyleIcon(style.icon)}
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ EMPTY STATE ============ */}
        {!hasGenerated && (
          <div className="max-w-7xl mx-auto px-5 md:px-8 pb-24">
            <div className="glass rounded-2xl p-14 text-center flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="compass-ring animate-spin-slower absolute inset-0" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="46" stroke="url(#gradring)" strokeWidth="1.2" strokeDasharray="4 7" />
                  <defs>
                    <linearGradient id="gradring" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <Navigation className="w-9 h-9 text-blue-400 animate-float" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">No coordinates set yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Search a destination above, tune your duration, budget, and style, then hit{' '}
                <span className="text-blue-400">Plan trip</span> to generate your itinerary.
              </p>
            </div>
          </div>
        )}

        {/* ============ RESULTS MODULE ============ */}
        {hasGenerated && destination && (
          <main id="results-section" className="max-w-7xl mx-auto px-5 md:px-8 pb-24">
            {/* Destination Showcase Card */}
            <section className="relative rounded-2xl overflow-hidden shadow-panel mb-8 border border-white/5">
              <div className="h-72 md:h-80 w-full relative">
                <img
                  src={destination.img}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-transparent to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300 mb-1">
                    {destination.country}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                    {destination.name}
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: <Calendar className="w-3.5 h-3.5 text-blue-400" />, label: 'Best time', value: destination.bestTime },
                    { icon: <Coins className="w-3.5 h-3.5 text-blue-400" />, label: 'Currency', value: destination.currency },
                    { icon: <Languages className="w-3.5 h-3.5 text-blue-400" />, label: 'Language', value: destination.language },
                    { icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />, label: 'Safety score', value: `${destination.safety}/100` }
                  ].map((fact, idx) => (
                    <div key={idx} className="glass rounded-xl px-3.5 py-2.5 min-w-[128px] border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-wide mb-1">
                        {fact.icon}
                        {fact.label}
                      </div>
                      <div className="text-xs text-white font-semibold truncate">
                        {fact.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Panel Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: <Route className="w-3.5 h-3.5" /> },
                { id: 'budget', label: 'Budget', icon: <PieChart className="w-3.5 h-3.5" /> },
                { id: 'packing', label: 'Packing list', icon: <Backpack className="w-3.5 h-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`border text-sm font-medium rounded-full px-5 py-2.5 flex items-center gap-1.5 transition-all whitespace-nowrap outline-none ${
                    activeTab === tab.id
                      ? 'border-blue-400/40 bg-blue-500/10 text-blue-300 shadow-[0_2px_10px_rgba(59,130,246,0.1)]'
                      : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ===== ITINERARY TAB PANEL ===== */}
            {activeTab === 'itinerary' && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Day-by-day itinerary</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tap the circle to check off an activity. Use <span className="text-slate-400">Swap</span> to select another stop.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {completionStats.completed} / {completionStats.total} complete
                    </span>
                  </div>
                </div>

                {/* Day selector tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {itinerary.map((dayPlan, i) => (
                    <button
                      key={dayPlan.day}
                      onClick={() => setActiveDay(i)}
                      className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-all duration-250 outline-none ${
                        i === activeDay
                          ? 'border-blue-400/60 bg-blue-500/10 text-blue-300 shadow-glow'
                          : 'border-white/10 text-slate-500 hover:border-white/25 hover:text-slate-300'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase tracking-wide">Day</span>
                      <span className="font-display text-lg font-bold">{dayPlan.day}</span>
                    </button>
                  ))}
                </div>

                {/* Activities lists */}
                {itinerary[activeDay] && (
                  <div className="space-y-6">
                    {(['Morning', 'Afternoon', 'Evening'] as const).map((slot) => {
                      const acts = itinerary[activeDay].slots[slot] || [];
                      return (
                        <div key={slot} className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            {getSlotIcon(slot)}
                            <span className="text-xs font-mono uppercase tracking-widest font-semibold">{slot}</span>
                            <span className="flex-1 h-px bg-white/8"></span>
                          </div>
                          
                          <div className="space-y-3">
                            {acts.map((act) => {
                              // Compute colored classes based on category
                              let catColors = 'text-sky-400 border-sky-400/30 bg-sky-400/10';
                              if (act.cat === 'Adventure') catColors = 'text-amber-400 border-amber-400/30 bg-amber-400/10';
                              else if (act.cat === 'Relaxation') catColors = 'text-blue-400 border-blue-400/30 bg-blue-400/10';
                              else if (act.cat === 'Foodie') catColors = 'text-rose-400 border-rose-400/30 bg-rose-400/10';
                              else if (act.cat === 'Family') catColors = 'text-violet-400 border-violet-400/30 bg-violet-400/10';

                              return (
                                <div
                                  key={act.id}
                                  className={`glass rounded-xl p-4 flex items-start gap-3.5 hover:border-white/20 transition-all ${
                                    act.done ? 'opacity-40' : ''
                                  }`}
                                >
                                  {/* Completion circular checkbox */}
                                  <button
                                    onClick={() => handleToggleActivity(activeDay, slot, act.id)}
                                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all outline-none ${
                                      act.done
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-slate-500 hover:border-blue-400'
                                    }`}
                                  >
                                    {act.done && <Check className="w-3 h-3 text-ink-950 stroke-[3]" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className={`text-sm font-medium text-slate-100 leading-snug ${
                                        act.done ? 'line-through text-slate-500' : ''
                                      }`}>
                                        {act.title}
                                      </p>
                                      <span className="shrink-0 text-xs font-mono text-slate-400 font-semibold">
                                        {fmtUSD(act.cost)}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`text-[10px] font-mono uppercase tracking-wide border rounded-full px-2.5 py-0.5 ${catColors}`}>
                                        {act.cat}
                                      </span>
                                      <button
                                        onClick={() => handleSwapActivity(activeDay, slot, act.id)}
                                        className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition ml-auto outline-none"
                                      >
                                        <Shuffle className="w-3 h-3" /> Swap
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            )}

            {/* ===== BUDGET TAB PANEL ===== */}
            {activeTab === 'budget' && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Live budget estimator</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Recalculates instantly with trip length and budget tier.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                  {/* Left Column: Interactive Donut */}
                  <div className="lg:col-span-4 glass rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5">
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        {/* Background ring */}
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#121A2E" strokeWidth="13" />
                        {/* Interactive Segments */}
                        {budgetStats.breakdowns.map((seg, index) => (
                          <circle
                            key={index}
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="13"
                            strokeLinecap="round"
                            strokeDasharray={seg.strokeDashArray}
                            strokeDashoffset={seg.strokeDashOffset}
                            className="transition-all duration-300"
                          />
                        ))}
                      </svg>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Total Est</span>
                        <span className="font-display text-2xl font-bold text-white">
                          {fmtUSD(budgetStats.totalAmount)}
                        </span>
                        <span className="text-[11px] text-blue-400/80 font-mono font-medium mt-0.5">
                          {fmtUSD(budgetStats.baseDailyRate)} / day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Breakdown Cards */}
                  <div className="lg:col-span-8 glass rounded-2xl p-6 space-y-5 border border-white/5">
                    {budgetStats.breakdowns.map((seg, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-200 font-medium">
                            <span className={`w-2.5 h-2.5 rounded-full ${seg.bgColor}`}></span>
                            {seg.name}
                          </span>
                          <span className="font-mono text-sm text-slate-300 font-medium">
                            {fmtUSD(seg.amount)}{' '}
                            <span className="text-slate-500 text-xs ml-1">· {Math.round(seg.percent * 100)}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-ink-950 overflow-hidden">
                          <div className={`h-full rounded-full ${seg.bgColor}`} style={{ width: `${seg.percent * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ===== PACKING TAB PANEL ===== */}
            {activeTab === 'packing' && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Smart packing checklist</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Auto-built from <span className="text-blue-400 capitalize">{destination.climate}</span> climate and selected styles.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {packingCompletedCount} / {packing.length} packed
                  </span>
                </div>

                <div className="glass rounded-2xl p-5 md:p-6 space-y-6 border border-white/5">
                  {/* Input form */}
                  <div className="flex gap-2">
                    <input
                      value={packingInput}
                      onChange={(e) => setPackingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddPackingItem();
                      }}
                      placeholder="Add a custom item…"
                      className="flex-1 bg-ink-900/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-500 focus:border-blue-400/50 focus:outline-none transition-all"
                    />
                    <button
                      onClick={handleAddPackingItem}
                      className="shrink-0 rounded-xl px-5 bg-blue-500/15 border border-blue-400/30 text-blue-300 hover:bg-blue-500/25 transition-all flex items-center gap-1.5 text-sm font-semibold outline-none"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* List grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {packing.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 glass rounded-xl px-4 py-3 group hover:border-white/15 transition-all border border-white/5"
                      >
                        {/* Mini Checkbox */}
                        <button
                          onClick={() => handleTogglePacking(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all outline-none ${
                            item.checked
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-slate-500 hover:border-blue-400'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 text-ink-950 stroke-[3.5]" />}
                        </button>
                        
                        <span className={`text-sm flex-1 truncate select-none ${
                          item.checked ? 'text-slate-500 line-through' : 'text-slate-200'
                        }`}>
                          {item.label}
                        </span>

                        <button
                          onClick={() => handleDeletePacking(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-150 outline-none p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </main>
        )}
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-ink-950/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-mono">
          <span>Waypoint — client-side trip simulation, zero external calls.</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" /> No data leaves your browser
          </span>
        </div>
      </footer>
    </div>
  );
}
