import React, { useState, useMemo, useEffect } from 'react';
import { 
  Coins, 
  Wallet, 
  Info, 
  Landmark, 
  CreditCard, 
  AlertTriangle, 
  Scale, 
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { Destination, DayPlan } from '../types';
import { DossierData } from '../dossierGenerator';
import { playChime, fmtUSD } from '../utils';

interface VatRefundCalculatorProps {
  destination: Destination | null;
  dossierData: DossierData | null;
  itinerary: DayPlan[];
}

export const VatRefundCalculator: React.FC<VatRefundCalculatorProps> = ({ 
  destination, 
  dossierData, 
  itinerary 
}) => {
  // 1. Scan itinerary to compute a baseline shopping expense
  const baselineShopping = useMemo(() => {
    if (!itinerary) return 0;
    let sum = 0;
    itinerary.forEach(day => {
      ['Morning', 'Afternoon', 'Evening'].forEach(slotKey => {
        const slots = day.slots as any;
        if (slots && slots[slotKey]) {
          slots[slotKey].forEach((act: any) => {
            const title = (act.title || '').toLowerCase();
            const cat = (act.cat || '').toLowerCase();
            if (
              title.includes('shop') || title.includes('market') || title.includes('souvenir') || 
              title.includes('mall') || title.includes('boutique') || title.includes('gift') ||
              cat.includes('shop') || cat.includes('retail')
            ) {
              sum += act.cost || 0;
            }
          });
        }
      });
    });
    return sum;
  }, [itinerary]);

  // 2. User-adjustable shopping expense state, initialized with baseline if > 0, else a sensible default
  const [shoppingExpense, setShoppingExpense] = useState<number>(300);

  useEffect(() => {
    if (baselineShopping > 0) {
      setShoppingExpense(Math.round(baselineShopping));
    }
  }, [baselineShopping]);

  // 3. Tax calculations
  const refundRate = 0.12; // Standard tourist refund rate of 12%
  const refundAmount = useMemo(() => {
    return shoppingExpense * refundRate;
  }, [shoppingExpense]);

  // 4. Mathematical Comparison Metrics (Price Comparison Index) against global benchmarks
  const priceComparison = useMemo(() => {
    if (!destination) return { diningSpread: 0, transitSpread: 0 };
    // Let's base it on destination's cost index to make it realistic and mathematically consistent
    const costIdx = destination.costIndex || 1.0;
    
    // London Hub is typically high cost (cost index ~1.4)
    // Amsterdam Transit is medium-high (cost index ~1.2)
    const diningSpread = Math.round((costIdx - 1.4) * 50);
    const transitSpread = Math.round((costIdx - 1.1) * 45);

    return {
      diningSpread,
      transitSpread
    };
  }, [destination]);

  if (!destination) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-5 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Coins className="w-4 h-4" />
            <h4 className="font-display font-semibold text-sm">Financial Intelligence & VAT Refund</h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            Tourist Rate: {(refundRate * 100)}%
          </span>
        </div>

        {/* Dynamic Calculator Controls */}
        <div className="space-y-3 bg-white/[0.01] border border-white/5 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Est. Shopping Expenses</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">USD</span>
              <input 
                type="number"
                min="0"
                max="10000"
                value={shoppingExpense}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setShoppingExpense(val);
                }}
                className="w-20 bg-ink-950/80 border border-white/10 rounded px-2 py-0.5 text-right font-mono text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <input 
              type="range"
              min="0"
              max="2000"
              step="50"
              value={Math.min(2000, shoppingExpense)}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setShoppingExpense(val);
              }}
              className="w-full h-1 bg-ink-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>$0</span>
              {baselineShopping > 0 && (
                <span className="text-indigo-400 font-semibold">Itinerary Baseline: {fmtUSD(baselineShopping)}</span>
              )}
              <span>$2,000+</span>
            </div>
          </div>

          {/* Refund Result Output */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-slate-400">Est. VAT/GST Refund</span>
            </div>
            <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              +{fmtUSD(refundAmount)}
            </span>
          </div>
        </div>

        {/* Tourist Refund Validation Protocol & Steps */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Official Refund Validation Steps
          </span>
          <div className="text-[11px] text-slate-400 leading-relaxed bg-indigo-500/[0.02] border border-indigo-400/10 rounded-xl p-3 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
              <div>
                <span className="font-semibold text-slate-200 block">Request Tax-Free Form</span>
                <span>Ask the merchant for a Tax-Free Form at checkout. Ensure they seal standard invoices correctly.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
              <div>
                <span className="font-semibold text-slate-200 block">Get Customs Verification Stamp</span>
                <span>Present unopened goods, receipt, and form to Customs at departure airport before checking baggage.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
              <div>
                <span className="font-semibold text-slate-200 block">Collect Refund Cash or Credit</span>
                <span>Submit validated forms to the terminal agent or drop-box to process refund back to credit card.</span>
              </div>
            </div>
            {dossierData?.consumptionTaxProtocol && (
              <p className="text-[10px] text-slate-500 italic border-t border-white/5 pt-2 mt-2 leading-relaxed">
                ℹ️ <strong>Local Rule:</strong> {dossierData.consumptionTaxProtocol}
              </p>
            )}
          </div>
        </div>

        {/* Price Comparison Index Tag Matrix */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Price Comparison Index vs. Global Hubs
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Dining Spread</span>
              <div className="flex items-center gap-1.5 mt-1">
                {priceComparison.diningSpread <= 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className={`text-xs font-mono font-bold ${
                  priceComparison.diningSpread <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {priceComparison.diningSpread <= 0 ? '' : '+'}{priceComparison.diningSpread}%
                </span>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 font-medium">vs. London Hub</span>
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Transit Spread</span>
              <div className="flex items-center gap-1.5 mt-1">
                {priceComparison.transitSpread <= 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className={`text-xs font-mono font-bold ${
                  priceComparison.transitSpread <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {priceComparison.transitSpread <= 0 ? '' : '+'}{priceComparison.transitSpread}%
                </span>
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 font-medium">vs. Amsterdam Transit</span>
            </div>
          </div>
        </div>

        {/* Foreign Banking Dynamics & DCC Traps */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase font-bold">Avoid Merchant DCC Traps</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-2.5 space-y-1">
            <p>
              When paying with an international card, terminals often present a choice of paying in your home currency or local currency. 
              <strong> Dynamic Currency Conversion (DCC)</strong> adds a 5% to 8% markup. <strong>Always choose the local currency</strong> at the machine.
            </p>
            {dossierData?.foreignBankingDynamics && (
              <p className="text-[10px] text-slate-500 italic border-t border-white/5 pt-1 mt-1 font-sans">
                🏦 <strong>ATM & Card tips:</strong> {dossierData.foreignBankingDynamics}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
