import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { PackingItem } from '../types';
import { Scale, AlertTriangle, Shirt, Smartphone, Bath, Shield, Package, ChevronRight, HelpCircle } from 'lucide-react';

interface PackingWeightChartProps {
  packing: PackingItem[];
  baggageWeights: Record<string, number>;
}

interface CategoryData {
  category: 'Clothing' | 'Toiletries' | 'Tech' | 'Essentials' | 'Other';
  weight: number;
  itemsCount: number;
}

const CATEGORIES = ['Clothing', 'Toiletries', 'Tech', 'Essentials', 'Other'] as const;

const CATEGORY_META = {
  Clothing: { color: '#ec4899', icon: Shirt, bg: 'bg-pink-500/10', border: 'border-pink-400/20', text: 'text-pink-400', hoverColor: '#f472b6' },
  Toiletries: { color: '#06b6d4', icon: Bath, bg: 'bg-cyan-500/10', border: 'border-cyan-400/20', text: 'text-cyan-400', hoverColor: '#22d3ee' },
  Tech: { color: '#3b82f6', icon: Smartphone, bg: 'bg-blue-500/10', border: 'border-blue-400/20', text: 'text-blue-400', hoverColor: '#60a5fa' },
  Essentials: { color: '#10b981', icon: Shield, bg: 'bg-emerald-500/10', border: 'border-emerald-400/20', text: 'text-emerald-400', hoverColor: '#34d399' },
  Other: { color: '#f59e0b', icon: Package, bg: 'bg-amber-500/10', border: 'border-amber-400/20', text: 'text-amber-400', hoverColor: '#fbbf24' }
};

export function getPackingCategory(label: string): 'Clothing' | 'Toiletries' | 'Tech' | 'Essentials' | 'Other' {
  const l = label.toLowerCase();
  
  if (
    l.includes('phone') || l.includes('charger') || l.includes('adapter') || l.includes('power bank') || 
    l.includes('camera') || l.includes('gopro') || l.includes('tablet') || l.includes('book') || 
    l.includes('e-reader') || l.includes('electronics') || l.includes('tech') || l.includes('battery') ||
    l.includes('laptop') || l.includes('kindle') || l.includes('plug')
  ) {
    return 'Tech';
  }
  
  if (
    l.includes('toiletry') || l.includes('toiletries') || l.includes('first-aid') || l.includes('sunscreen') || 
    l.includes('repellent') || l.includes('balm') || l.includes('antacid') || l.includes('digestive') || 
    l.includes('medical') || l.includes('medicine') || l.includes('cosmetics') || l.includes('hygiene') ||
    l.includes('toothbrush') || l.includes('shampoo') || l.includes('soap') || l.includes('paste') ||
    l.includes('cream') || l.includes('spray') || l.includes('brush')
  ) {
    return 'Toiletries';
  }
  
  if (
    l.includes('layer') || l.includes('jacket') || l.includes('socks') || l.includes('beanie') || 
    l.includes('gloves') || l.includes('boots') || l.includes('swimwear') || l.includes('clothing') || 
    l.includes('hat') || l.includes('sunglasses') || l.includes('scarf') || l.includes('sweater') || 
    l.includes('shoes') || l.includes('activewear') || l.includes('outfit') || l.includes('sandals') || 
    l.includes('clothes') || l.includes('wear') || l.includes('pants') || l.includes('shirt') || 
    l.includes('garment') || l.includes('fleece') || l.includes('parka') || l.includes('t-shirt') || 
    l.includes('jeans') || l.includes('coat') || l.includes('shorts') || l.includes('sneakers') ||
    l.includes('hoodie') || l.includes('cap')
  ) {
    return 'Clothing';
  }
  
  if (
    l.includes('passport') || l.includes('document') || l.includes('ticket') || l.includes('visa') || 
    l.includes('wallet') || l.includes('cash') || l.includes('card') || l.includes('id') ||
    l.includes('bag') || l.includes('daypack') || l.includes('crossbody') || l.includes('keys') ||
    l.includes('insurance') || l.includes('booking')
  ) {
    return 'Essentials';
  }
  
  return 'Other';
}

export const PackingWeightChart: React.FC<PackingWeightChartProps> = ({ packing, baggageWeights }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group items with calculated weights
  const itemsWithMeta = useMemo(() => {
    return packing.map(item => {
      const weight = baggageWeights[item.id] !== undefined ? baggageWeights[item.id] : 0.4;
      const category = getPackingCategory(item.label);
      return {
        ...item,
        weight,
        category
      };
    });
  }, [packing, baggageWeights]);

  // Aggregate category weight data
  const categoryData = useMemo(() => {
    const dataMap: Record<string, { weight: number; count: number }> = {
      Clothing: { weight: 0, count: 0 },
      Toiletries: { weight: 0, count: 0 },
      Tech: { weight: 0, count: 0 },
      Essentials: { weight: 0, count: 0 },
      Other: { weight: 0, count: 0 }
    };

    itemsWithMeta.forEach(item => {
      dataMap[item.category].weight += item.weight;
      dataMap[item.category].count += 1;
    });

    return CATEGORIES.map(category => ({
      category,
      weight: parseFloat(dataMap[category].weight.toFixed(1)),
      itemsCount: dataMap[category].count
    })).filter(d => d.weight > 0); // Only render categories that actually have weight!
  }, [itemsWithMeta]);

  const totalWeight = useMemo(() => {
    return categoryData.reduce((acc, d) => acc + d.weight, 0);
  }, [categoryData]);

  // D3 Pie Chart parameters
  const width = 160;
  const height = 160;
  const radius = Math.min(width, height) / 2;

  const pieSlices = useMemo(() => {
    const pie = d3.pie<CategoryData>()
      .value(d => d.weight)
      .sort(null);

    return pie(categoryData);
  }, [categoryData]);

  const arcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(42)
      .outerRadius(radius - 10)
      .cornerRadius(5)
      .padAngle(0.04);
  }, [radius]);

  const activeArcGenerator = useMemo(() => {
    return d3.arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(42)
      .outerRadius(radius - 4)
      .cornerRadius(6)
      .padAngle(0.03);
  }, [radius]);

  // Heavy items identify list (all items sorted descending by weight)
  const sortedHeavyItems = useMemo(() => {
    const list = [...itemsWithMeta].sort((a, b) => b.weight - a.weight);
    if (selectedCategory) {
      return list.filter(item => item.category === selectedCategory);
    }
    return list;
  }, [itemsWithMeta, selectedCategory]);

  const displayedCategory = selectedCategory || hoveredCategory;
  const displayedMeta = displayedCategory ? CATEGORY_META[displayedCategory as keyof typeof CATEGORY_META] : null;

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <Scale className="w-4 h-4" />
          <h4 className="font-display font-semibold text-sm">Baggage Weight distribution (D3 Pie Chart)</h4>
        </div>
        {totalWeight > 7.0 && (
          <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono uppercase font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Over limit
          </div>
        )}
      </div>

      {packing.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
          <Package className="w-8 h-8 opacity-40 text-slate-400" />
          <span>Add packing items below to visualize weight distribution.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left: D3 Pie Canvas */}
          <div className="md:col-span-4 flex flex-col items-center justify-center relative">
            <svg width={width} height={height} className="overflow-visible">
              <g transform={`translate(${width / 2}, ${height / 2})`}>
                {pieSlices.map((slice, i) => {
                  const categoryName = slice.data.category;
                  const meta = CATEGORY_META[categoryName];
                  const isHovered = hoveredCategory === categoryName;
                  const isSelected = selectedCategory === categoryName;
                  const isActive = isHovered || isSelected;

                  return (
                    <path
                      key={categoryName}
                      d={(isActive ? activeArcGenerator : arcGenerator)(slice) || undefined}
                      fill={isActive ? meta.hoverColor : meta.color}
                      className="transition-all duration-300 cursor-pointer origin-center"
                      style={{
                        filter: isActive ? `drop-shadow(0 0 6px ${meta.color}50)` : 'none',
                        opacity: hoveredCategory && !isActive ? 0.4 : 1,
                      }}
                      onMouseEnter={() => setHoveredCategory(categoryName)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (selectedCategory === categoryName) {
                          setSelectedCategory(null);
                        } else {
                          setSelectedCategory(categoryName);
                        }
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Inner Center Content */}
            <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Total</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {totalWeight.toFixed(1)} kg
              </span>
              <span className="text-[8px] text-slate-500 font-mono">/ 7.0 kg</span>
            </div>
          </div>

          {/* Middle: Custom Legend & Aggregations */}
          <div className="md:col-span-8 space-y-3.5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                Baggage Categories {selectedCategory ? '• Selected' : '• Hover/Click to filter'}
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const meta = CATEGORY_META[cat];
                  const data = categoryData.find(d => d.category === cat);
                  const weight = data ? data.weight : 0;
                  const itemsCount = data ? data.itemsCount : 0;
                  const percentage = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
                  const isSelected = selectedCategory === cat;

                  if (weight === 0) return null;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex flex-col text-left p-2 rounded-xl transition-all border ${
                        isSelected 
                          ? 'bg-white/[0.04] border-white/15 shadow-md shadow-indigo-500/5' 
                          : 'bg-white/[0.01] hover:bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0`} style={{ backgroundColor: meta.color }} />
                        <span className="text-[11px] font-medium text-slate-300 truncate">{cat}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1 justify-between w-full">
                        <span className="text-xs font-mono font-bold text-slate-100">{weight.toFixed(1)} kg</span>
                        <span className="text-[9px] font-mono text-slate-500">{percentage}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heavy Items Identification Module */}
      {packing.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">
                {selectedCategory ? `${selectedCategory} Items` : 'Heavy Items Priority List'} (Sorted Heavy to Light)
              </span>
            </div>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-[10px] text-slate-400 hover:text-white transition-all font-mono underline bg-transparent border-none outline-none"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {sortedHeavyItems.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic text-center py-2">No items found in this category.</p>
            ) : (
              sortedHeavyItems.map((item) => {
                const isHeavy = item.weight >= 0.8;
                const meta = CATEGORY_META[item.category];
                const Icon = meta.icon;

                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                      isHeavy 
                        ? 'bg-rose-500/[0.02] hover:bg-rose-500/[0.04] border-rose-500/15' 
                        : 'bg-white/[0.01] hover:bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1 rounded-lg shrink-0 ${meta.bg} ${meta.border}`}>
                        <Icon className={`w-3 h-3 ${meta.text}`} />
                      </div>
                      <span className="text-xs text-slate-200 truncate pr-2">{item.label}</span>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 capitalize">({item.category})</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isHeavy && (
                        <span className="text-[8px] font-mono uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">
                          Heavy Item
                        </span>
                      )}
                      <span className={`text-xs font-mono font-bold ${isHeavy ? 'text-rose-400' : 'text-slate-300'}`}>
                        {item.weight.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="flex items-center gap-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-2.5 text-[10px] text-slate-400 leading-normal">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              To remain compliant with cabin luggage constraints, reduce toiletries or wear heavy sweaters/boots on the plane! Hover/click slices of the pie chart above to isolate weight hotspots.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
