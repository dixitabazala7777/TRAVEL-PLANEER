import { Activity, DayPlan, Destination, PackingItem } from './types';
import { ACTIVITY_POOL, PACKING_BASE, PACKING_CLIMATE, PACKING_STYLE } from './data';

export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateItinerary(
  destination: Destination,
  days: number,
  selectedStyles: string[],
  seedSuffix = ''
): DayPlan[] {
  const styles = selectedStyles.length > 0 ? selectedStyles : ['culture'];
  const rand = seededRandom(hashStr(destination.id + styles.slice().sort().join(',') + days + seedSuffix));
  const slots = ['Morning', 'Afternoon', 'Evening'] as const;

  return Array.from({ length: days }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const daySlots: DayPlan['slots'] = { Morning: [], Afternoon: [], Evening: [] };

    slots.forEach((slot, slotIndex) => {
      const style = styles[(day + slotIndex) % styles.length];
      const pool = ACTIVITY_POOL[style]?.filter(activity => activity.slot === slot) || [];
      const template = pool[Math.floor(rand() * pool.length)] || ACTIVITY_POOL[style]?.[0];
      if (!template) return;

      const activity: Activity = {
        id: `${day}-${slot}-${template.cat}-${Math.floor(rand() * 100000)}`,
        title: template.t.replace('{name}', destination.name),
        slot,
        cat: template.cat,
        style,
        cost: Math.round(template.cost * destination.costIndex),
        done: false
      };
      daySlots[slot].push(activity);
    });

    return { day, slots: daySlots };
  });
}

export function buildPackingList(destination: Destination, selectedStyles: string[]): PackingItem[] {
  const styleItems = selectedStyles.flatMap(style => PACKING_STYLE[style] || []);
  return Array.from(new Set([
    ...PACKING_BASE,
    ...(PACKING_CLIMATE[destination.climate] || []),
    ...styleItems
  ])).map((label, index) => ({
    id: `pack-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    label,
    checked: false,
    custom: false
  }));
}

export function fmtUSD(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function playChime(type: 'success' | 'click' | 'warning') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      // Upbeat melodic ascending major chord
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } else if (type === 'click') {
      // Soft organic water-droplet click
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'warning') {
      // Dual-tone low frequency chime alert
      const now = ctx.currentTime;
      [220, 222].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      });
    }
  } catch (e) {
    // Avoid interrupting on browser interaction constraint errors
  }
}

