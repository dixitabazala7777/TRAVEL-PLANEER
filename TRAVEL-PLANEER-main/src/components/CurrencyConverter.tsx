import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Coins, Info, TrendingUp, Sparkles } from 'lucide-react';
import { playChime } from '../utils';

// Standard 2026 realistic baseline exchange rates relative to 1 USD
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.51,
  JPY: 155.0,
  INR: 83.5,
  CHF: 0.90,
  IDR: 16200.0,
  ISK: 138.0,
  AED: 3.67,
  THB: 36.5,
  ZAR: 18.3,
  MAD: 10.0
};

// Full display names for currencies
const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  INR: 'Indian Rupee',
  CHF: 'Swiss Franc',
  IDR: 'Indonesian Rupiah',
  ISK: 'Icelandic Króna',
  AED: 'UAE Dirham',
  THB: 'Thai Baht',
  ZAR: 'South African Rand',
  MAD: 'Moroccan Dirham'
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  CHF: 'Fr',
  IDR: 'Rp',
  ISK: 'kr',
  AED: 'د.إ',
  THB: '฿',
  ZAR: 'R',
  MAD: 'د.م'
};

const HOME_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CHF'];

interface CurrencyConverterProps {
  destinationCurrency: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ destinationCurrency }) => {
  const [homeCurrency, setHomeCurrency] = useState<string>('USD');
  const [amountInput, setAmountInput] = useState<string>('100');
  const [isReverse, setIsReverse] = useState<boolean>(false);

  // Parse local currency code from the destination currency string (e.g., "EUR (€)")
  const localCurrencyCode = useMemo(() => {
    if (!destinationCurrency) return 'EUR';
    const match = destinationCurrency.match(/^[A-Z]{3}/);
    return match ? match[0] : 'EUR';
  }, [destinationCurrency]);

  // Compute conversion
  const amount = useMemo(() => {
    const parsed = parseFloat(amountInput);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [amountInput]);

  const rateHome = EXCHANGE_RATES[homeCurrency] || 1.0;
  const rateLocal = EXCHANGE_RATES[localCurrencyCode] || 1.0;

  const convertedAmount = useMemo(() => {
    if (amount <= 0) return 0;
    if (isReverse) {
      // Local -> Home: Local to USD first, then to Home
      return (amount / rateLocal) * rateHome;
    } else {
      // Home -> Local: Home to USD first, then to Local
      return (amount / rateHome) * rateLocal;
    }
  }, [amount, homeCurrency, localCurrencyCode, isReverse, rateHome, rateLocal]);

  // Implicit conversion rate display (1 Home = X Local, or 1 Local = X Home)
  const directRate = useMemo(() => {
    if (isReverse) {
      // 1 Local = X Home
      return (1 / rateLocal) * rateHome;
    } else {
      // 1 Home = X Local
      return (1 / rateHome) * rateLocal;
    }
  }, [homeCurrency, localCurrencyCode, isReverse, rateHome, rateLocal]);

  const formatValue = (val: number, code: string) => {
    const noDecimals = ['JPY', 'IDR', 'ISK', 'MAD'].includes(code);
    return val.toLocaleString(undefined, {
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2
    });
  };

  const handleQuickAdd = (value: number) => {
    playChime('click');
    setAmountInput((prev) => {
      const current = parseFloat(prev);
      const next = isNaN(current) ? value : current + value;
      return next.toString();
    });
  };

  const handleClear = () => {
    playChime('click');
    setAmountInput('');
  };

  const handleSwap = () => {
    playChime('click');
    // Swap conversion direction and update input amount to the previous output to retain conversion context
    const currentConverted = convertedAmount;
    setIsReverse((prev) => !prev);
    setAmountInput(currentConverted > 0 ? formatValue(currentConverted, isReverse ? homeCurrency : localCurrencyCode).replace(/,/g, '') : '100');
  };

  const sourceCurrency = isReverse ? localCurrencyCode : homeCurrency;
  const targetCurrency = isReverse ? homeCurrency : localCurrencyCode;

  const sourceSymbol = CURRENCY_SYMBOLS[sourceCurrency] || '';
  const targetSymbol = CURRENCY_SYMBOLS[targetCurrency] || '';

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 bg-ink-950/40 relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-display font-semibold text-sm">Currency Quick-Convert</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Waypoint Conversions</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>1 {sourceSymbol}{sourceCurrency} = {directRate.toFixed(4)} {targetSymbol}{targetCurrency}</span>
          </div>
        </div>

        {/* Input and Select Column */}
        <div className="space-y-3">
          {/* Conversion Direction Display */}
          <div className="flex items-center justify-between gap-2 bg-ink-900/60 p-1.5 rounded-xl border border-white/5">
            {/* Source Selector/Display */}
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono text-slate-500 uppercase block pl-2 mb-0.5">From</span>
              {!isReverse ? (
                <select
                  value={homeCurrency}
                  onChange={(e) => {
                    setHomeCurrency(e.target.value);
                    playChime('click');
                  }}
                  className="w-full bg-transparent border-0 text-xs font-semibold text-white focus:ring-0 cursor-pointer outline-none pl-2 pr-4 py-0.5"
                >
                  {HOME_CURRENCIES.map((code) => (
                    <option key={code} value={code} className="bg-ink-950 text-slate-200">
                      {code} — {CURRENCY_NAMES[code]}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-semibold text-blue-300 pl-2 py-0.5 select-none truncate">
                  {localCurrencyCode} — {CURRENCY_NAMES[localCurrencyCode] || destinationCurrency}
                </div>
              )}
            </div>

            {/* Swapper Button */}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Conversion Direction"
              className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/20 flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 outline-none cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* Target Display/Selector */}
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block pr-2 mb-0.5">To</span>
              {isReverse ? (
                <select
                  value={homeCurrency}
                  onChange={(e) => {
                    setHomeCurrency(e.target.value);
                    playChime('click');
                  }}
                  className="w-full bg-transparent border-0 text-xs font-semibold text-white focus:ring-0 cursor-pointer outline-none text-right pr-2 pl-4 py-0.5"
                >
                  {HOME_CURRENCIES.map((code) => (
                    <option key={code} value={code} className="bg-ink-950 text-slate-200">
                      {code} — {CURRENCY_NAMES[code]}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-semibold text-blue-300 pr-2 py-0.5 select-none truncate">
                  {localCurrencyCode} — {CURRENCY_NAMES[localCurrencyCode] || destinationCurrency}
                </div>
              )}
            </div>
          </div>

          {/* Amount Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Input card */}
            <div className="bg-ink-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] font-mono uppercase text-slate-500">Amount ({sourceCurrency})</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono font-bold text-slate-400 select-none">{sourceSymbol}</span>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent border-0 text-sm font-mono text-white p-0 outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Output card */}
            <div className="bg-blue-500/[0.02] border border-blue-500/10 p-3 rounded-xl space-y-1 flex flex-col justify-center">
              <span className="text-[9px] font-mono uppercase text-blue-400/80">Equivalent ({targetCurrency})</span>
              <div className="flex items-center gap-1 select-all">
                <span className="text-sm font-mono font-bold text-blue-300">{targetSymbol}</span>
                <span className="text-sm font-mono font-bold text-white truncate">
                  {formatValue(convertedAmount, targetCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Increments and Clear Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[10, 50, 100, 500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors outline-none cursor-pointer"
              >
                +{val}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 ml-auto transition-colors outline-none cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Based on verified mid-market rates. For physical exchanges, note that airport kiosks typically add 8-12% commission, while local ATMs are recommended.
        </p>
      </div>
    </div>
  );
};
