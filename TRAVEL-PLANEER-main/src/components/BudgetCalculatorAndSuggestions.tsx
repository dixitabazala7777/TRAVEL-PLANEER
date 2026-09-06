import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Sparkles, DollarSign, Utensils, Compass, MapPin, 
  Clock, Coins, ExternalLink, Info, RefreshCw, Sliders, CheckCircle2, 
  PiggyBank, Percent, AlertCircle, HelpCircle, FileText, ChevronDown, ChevronUp, Plane, Building, ShoppingBag, Landmark
} from 'lucide-react';
import { playChime } from '../utils';

interface BudgetCalculatorAndSuggestionsProps {
  destinationId: string | undefined;
  destinationName: string | undefined;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  travelStyles: string[];
  travelMonthNum: number; // 0-indexed
  days: number;
  travelersCount: number;
  baseEstimatedAmount: number; // The pre-calculated trip estimate
}

interface CustomExpense {
  id: string;
  title: string;
  category: 'Accommodation' | 'Food' | 'Activities' | 'Transport' | 'Souvenirs' | 'Other';
  cost: number;
  quantity: number;
  isPaid: boolean;
}

interface SuggestedPlace {
  name: string;
  category: string;
  description: string;
  estimatedCost: string;
  recommendedTime: string;
  addressOrArea: string;
}

interface PlacesSuggestionsResponse {
  places: SuggestedPlace[];
  budgetTip: string;
  citations?: { title: string; uri: string }[];
}

export const BudgetCalculatorAndSuggestions: React.FC<BudgetCalculatorAndSuggestionsProps> = ({
  destinationId,
  destinationName,
  budgetTier,
  travelStyles,
  travelMonthNum,
  days,
  travelersCount,
  baseEstimatedAmount,
}) => {
  // --- 1. Custom Expenses Calculator State ---
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>(() => {
    try {
      const stored = localStorage.getItem(`waypoint_custom_expenses_${destinationId || 'default'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<'Accommodation' | 'Food' | 'Activities' | 'Transport' | 'Souvenirs' | 'Other'>('Activities');
  const [expCost, setExpCost] = useState<number | ''>('');
  const [expQty, setExpQty] = useState<number>(1);
  const [isFilterPaid, setIsFilterPaid] = useState<'all' | 'unpaid' | 'paid'>('all');

  // --- 2. AI Places & Sights Suggestion State ---
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlacesSuggestionsResponse | null>(() => {
    try {
      const stored = localStorage.getItem(`waypoint_suggestions_${destinationId || 'default'}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Save custom expenses to localStorage when changed
  useEffect(() => {
    localStorage.setItem(
      `waypoint_custom_expenses_${destinationId || 'default'}`,
      JSON.stringify(customExpenses)
    );
  }, [customExpenses, destinationId]);

  // Handle adding a custom expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expCost === '' || expCost <= 0) return;

    const newExpense: CustomExpense = {
      id: Math.random().toString(36).substring(2, 9),
      title: expTitle.trim(),
      category: expCategory,
      cost: Number(expCost),
      quantity: expQty,
      isPaid: false
    };

    setCustomExpenses(prev => [...prev, newExpense]);
    setExpTitle('');
    setExpCost('');
    setExpQty(1);
    playChime('click');
  };

  // Delete custom expense
  const handleDeleteExpense = (id: string) => {
    setCustomExpenses(prev => prev.filter(item => item.id !== id));
    playChime('click');
  };

  // Toggle paid status
  const handleTogglePaid = (id: string) => {
    setCustomExpenses(prev => prev.map(item => 
      item.id === id ? { ...item, isPaid: !item.isPaid } : item
    ));
    playChime('click');
  };

  // Clear all custom expenses
  const handleClearAllExpenses = () => {
    if (confirm('Are you sure you want to clear all custom expenses?')) {
      setCustomExpenses([]);
      playChime('click');
    }
  };

  // Compute aggregated custom costs
  const customCostsMetrics = useMemo(() => {
    let total = 0;
    let paidTotal = 0;
    const byCategory: Record<string, number> = {
      Accommodation: 0,
      Food: 0,
      Activities: 0,
      Transport: 0,
      Souvenirs: 0,
      Other: 0
    };

    customExpenses.forEach(item => {
      const itemCost = item.cost * item.quantity;
      total += itemCost;
      if (item.isPaid) {
        paidTotal += itemCost;
      }
      byCategory[item.category] += itemCost;
    });

    return {
      total,
      paidTotal,
      unpaidTotal: total - paidTotal,
      byCategory
    };
  }, [customExpenses]);

  // Total trip cost (base automated estimate + custom expenses)
  const combinedTotalCost = baseEstimatedAmount + customCostsMetrics.total;

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return customExpenses.filter(item => {
      if (isFilterPaid === 'paid') return item.isPaid;
      if (isFilterPaid === 'unpaid') return !item.isPaid;
      return true;
    });
  }, [customExpenses, isFilterPaid]);

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Accommodation':
        return <Building className="w-3.5 h-3.5" />;
      case 'Food':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'Activities':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Transport':
        return <Plane className="w-3.5 h-3.5" />;
      case 'Souvenirs':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      default:
        return <Coins className="w-3.5 h-3.5" />;
    }
  };

  // Category color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Accommodation': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Food': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'Activities': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Transport': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Souvenirs': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Fetch AI Places & Activities suggestions grounded in search
  const handleFetchSuggestions = async () => {
    if (!destinationName) return;
    setLoadingSuggestions(true);
    setSuggestionsError(null);
    playChime('click');

    try {
      const response = await fetch('/api/places-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destination: destinationName,
          budgetTier,
          travelStyles,
          month: months[travelMonthNum]
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to scan places suggestions.');
      }

      setSuggestions(data);
      localStorage.setItem(`waypoint_suggestions_${destinationId || 'default'}`, JSON.stringify(data));
      playChime('success');
    } catch (err: any) {
      console.error(err);
      setSuggestionsError(err.message || 'Error occurred while contacting local intelligence.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div id="budget-calc-and-sights-wrapper" className="space-y-8 mt-6">
      <div className="h-[1px] bg-white/5" />

      {/* Main Grid for Custom Calculator & Places suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE BUDGET CALCULATOR */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                Interactive Custom Expense Ledger
              </h4>
              <p className="text-[11px] text-slate-500">
                Log custom purchases, plane tickets, or activities to compute a granular budget breakdown.
              </p>
            </div>
            {customExpenses.length > 0 && (
              <button 
                type="button"
                onClick={handleClearAllExpenses}
                className="text-[10px] font-mono text-rose-400/80 hover:text-rose-400 hover:underline outline-none transition cursor-pointer"
              >
                Clear Ledger
              </button>
            )}
          </div>

          {/* Quick Expense Form */}
          <form onSubmit={handleAddExpense} className="glass rounded-xl p-4 border border-white/5 grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 sm:col-span-5 space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Expense Description
              </label>
              <input
                type="text"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. Louvre Guided Ticket"
                required
                className="w-full bg-ink-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500/50 focus:bg-ink-950/90 transition-all outline-none"
              />
            </div>

            <div className="col-span-6 sm:col-span-3 space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e: any) => setExpCategory(e.target.value)}
                className="w-full bg-ink-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-emerald-500/50 transition-all outline-none"
              >
                <option value="Accommodation">Accommodation</option>
                <option value="Food">Food / Dining</option>
                <option value="Activities">Activities</option>
                <option value="Transport">Transport</option>
                <option value="Souvenirs">Souvenirs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-3 sm:col-span-2 space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Cost ($)
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={expCost}
                onChange={(e) => setExpCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="45"
                required
                className="w-full bg-ink-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500/50 transition-all outline-none"
              />
            </div>

            <div className="col-span-3 sm:col-span-1 space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Qty
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={expQty}
                onChange={(e) => setExpQty(parseInt(e.target.value) || 1)}
                className="w-full bg-ink-950/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center focus:border-emerald-500/50 transition-all outline-none"
              />
            </div>

            <div className="col-span-12 sm:col-span-1 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-8 sm:h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center transition-all cursor-pointer outline-none"
                title="Add to ledger"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Combined Cost Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Ledger Total</span>
              <span className="text-sm font-semibold text-white mt-1">
                ${customCostsMetrics.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Settle Paid</span>
              <span className="text-sm font-semibold text-emerald-400 mt-1">
                ${customCostsMetrics.paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Due Unpaid</span>
              <span className="text-sm font-semibold text-amber-400 mt-1">
                ${customCostsMetrics.unpaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Ledger Listing and Filters */}
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-semibold text-slate-300">
                Ledger Entries ({filteredExpenses.length})
              </span>
              
              <div className="flex gap-1 bg-ink-950/80 p-0.5 rounded border border-white/5">
                {(['all', 'unpaid', 'paid'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { playChime('click'); setIsFilterPaid(mode); }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold transition outline-none cursor-pointer ${
                      isFilterPaid === mode 
                        ? 'bg-white/10 text-white' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {filteredExpenses.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                {filteredExpenses.map((item) => {
                  const subtotal = item.cost * item.quantity;
                  return (
                    <div 
                      key={item.id} 
                      className={`px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-all group ${
                        item.isPaid ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checked Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleTogglePaid(item.id)}
                          className="shrink-0 text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${item.isPaid ? 'text-emerald-400' : 'text-slate-600'}`} />
                        </button>

                        <div className="min-w-0">
                          <p className={`text-xs font-medium text-slate-200 truncate ${item.isPaid ? 'line-through text-slate-500' : ''}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[8px] font-mono px-1 rounded uppercase tracking-wider flex items-center gap-0.5 ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ${item.cost.toFixed(2)} × {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-slate-200 font-semibold">
                          ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(item.id)}
                          className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all outline-none"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono italic">
                No items found matching the ledger filters.
              </div>
            )}
          </div>

          {/* Integrated Ledger + Core Estimation Total */}
          <div className="border border-emerald-500/10 bg-emerald-500/[0.01] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Combined Estimate (Core + Ledger)</span>
              <p className="text-xs text-slate-400 leading-normal">
                Sum of regional automated parameters combined with your custom ledger declarations.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-slate-500 block">Grand Total</span>
              <span className="text-xl font-mono font-bold text-white">
                ${combinedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {travelersCount > 1 && (
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  ${(combinedTotalCost / travelersCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / person
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI PLACES & SIGHTS SUGGESTIONS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Budget-Aligned Local Places Advisor
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Scan Google Search dynamically for trending attractions, local dining, and hidden spots matching a <strong>{budgetTier}</strong> budget and <strong>{travelStyles.join(', ')}</strong> preferences.
            </p>
          </div>

          {/* Scan Button Action */}
          {!suggestions && !loadingSuggestions && (
            <div className="glass rounded-xl p-6 text-center space-y-4 border border-white/5">
              <Compass className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">Generate Budget-Tailored Insights</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Triggers an intelligent web grounded lookup for spots matching your {budgetTier} budget in {destinationName}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFetchSuggestions}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg px-4 py-2 text-xs flex items-center gap-1.5 mx-auto transition cursor-pointer outline-none"
              >
                <Sparkles className="w-3.5 h-3.5" /> Scan Sights & Spots
              </button>
            </div>
          )}

          {/* Loading state */}
          {loadingSuggestions && (
            <div className="glass rounded-xl p-8 text-center space-y-4 border border-blue-500/20 bg-blue-500/[0.02] animate-pulse">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest block">GOOGLE SEARCH COGNITION ACTIVE</span>
                <p className="text-xs text-slate-300">Extracting trending local sights, food joints, and free attractions...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {suggestionsError && (
            <div className="border border-rose-500/20 bg-rose-500/[0.03] p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono uppercase text-rose-400 tracking-wider">Advisor Interrupted</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{suggestionsError}</p>
              </div>
            </div>
          )}

          {/* Display suggestions */}
          {!loadingSuggestions && suggestions && (
            <div className="space-y-4">
              
              {/* Specialized Tip */}
              {suggestions.budgetTip && (
                <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Local Savings Tip</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed italic font-medium">
                      "{suggestions.budgetTip}"
                    </p>
                  </div>
                </div>
              )}

              {/* Places List */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {suggestions.places && suggestions.places.map((place, index) => (
                  <div 
                    key={index} 
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">{place.name}</h5>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5 block font-bold uppercase">
                            {place.category} {place.addressOrArea ? `• ${place.addressOrArea}` : ''}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.25 rounded shrink-0">
                          {place.estimatedCost}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {place.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-white/[0.01] border border-white/5 rounded px-2 py-1 self-start">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Best visit: {place.recommendedTime}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Citations/Links */}
              {suggestions.citations && suggestions.citations.length > 0 && (
                <div className="space-y-2 mt-4">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Grounding Sources</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.citations.slice(0, 4).map((cite, idx) => (
                      <a
                        key={idx}
                        href={cite.uri}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => playChime('click')}
                        className="inline-flex items-center gap-1 text-[9px] font-mono text-blue-400 hover:text-blue-300 bg-blue-500/5 border border-blue-400/5 hover:border-blue-400/15 px-2 py-0.5 rounded transition"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[120px]">{cite.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleFetchSuggestions}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition outline-none cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Sights & Insights
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
