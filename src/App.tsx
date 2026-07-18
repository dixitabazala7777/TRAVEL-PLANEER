/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  MapPin,
  Map,
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
  MountainSnow,
  Share2,
  Download,
  Copy,
  FileText,
  Clock,
  AlertTriangle,
  Scale,
  Printer,
  Info,
  Globe,
  Zap,
  Award,
  CloudLightning,
  Volume2,
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  Leaf,
  HelpCircle,
  Heart
} from 'lucide-react';

import { Destination, DayPlan, Activity, PackingItem, BudgetTier } from './types';
import { CurrencyConverter } from './components/CurrencyConverter';
import { WeatherTrendChart } from './components/WeatherTrendChart';
import { ActivityMapModal } from './components/ActivityMapModal';
import {
  DESTINATIONS,
  STYLES,
  ACTIVITY_POOL,
  PACKING_BASE,
  PACKING_CLIMATE,
  PACKING_STYLE
} from './data';
import { seededRandom, hashStr, fmtUSD, playChime } from './utils';
import { generateDossierData, generateDossierTextString, getChaosBuffer } from './dossierGenerator';

const TIER_BASE = { budget: 55, moderate: 130, luxury: 320 };
const TIER_SPLIT = {
  budget: { Accommodation: 0.35, Food: 0.28, Activities: 0.20, Transport: 0.17 },
  moderate: { Accommodation: 0.42, Food: 0.25, Activities: 0.20, Transport: 0.13 },
  luxury: { Accommodation: 0.50, Food: 0.22, Activities: 0.18, Transport: 0.10 }
};

export default function App() {
  // --- Form parameters (cached via LocalStorage for Offline Cache Engine) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [destination, setDestination] = useState<Destination | null>(() => {
    try {
      const stored = localStorage.getItem('waypoint_destination');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [days, setDays] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_days');
    return stored ? parseInt(stored, 10) : 5;
  });
  const [tier, setTier] = useState<BudgetTier>(() => {
    const stored = localStorage.getItem('waypoint_tier');
    return (stored as BudgetTier) || 'moderate';
  });
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('waypoint_selectedStyles');
      return stored ? new Set(JSON.parse(stored)) : new Set(['culture']);
    } catch { return new Set(['culture']); }
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- Output state (cached via LocalStorage for Offline Cache Engine) ---
  const [hasGenerated, setHasGenerated] = useState<boolean>(() => {
    const stored = localStorage.getItem('waypoint_hasGenerated');
    return stored === 'true';
  });
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamedDaysCount, setStreamedDaysCount] = useState<number>(100);
  const [streamedChecklistCount, setStreamedChecklistCount] = useState<number>(100);
  const [itinerary, setItinerary] = useState<DayPlan[]>(() => {
    try {
      const stored = localStorage.getItem('waypoint_itinerary');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [activeDay, setActiveDay] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_activeDay');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [packing, setPacking] = useState<PackingItem[]>(() => {
    try {
      const stored = localStorage.getItem('waypoint_packing');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [packingInput, setPackingInput] = useState('');
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'packing' | 'insights' | 'dossier'>('itinerary');

  // --- 15 Hackathon Features States ---
  const [homeTimezone, setHomeTimezone] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_homeTimezone');
    return stored ? parseFloat(stored) : -5; // Default home offset (e.g. EST/NYC)
  });
  const [passportExpiry, setPassportExpiry] = useState<string>(() => {
    return localStorage.getItem('waypoint_passportExpiry') || '';
  });
  const [travelersCount, setTravelersCount] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_travelersCount');
    return stored ? parseInt(stored, 10) : 1;
  });
  const [customCostBuffer, setCustomCostBuffer] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_customCostBuffer');
    return stored ? parseFloat(stored) : 0;
  });
  const [bingoState, setBingoState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('waypoint_bingoState');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [baggageWeights, setBaggageWeights] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('waypoint_baggageWeights');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [travelMonth, setTravelMonth] = useState<number>(() => {
    const stored = localStorage.getItem('waypoint_travelMonth');
    return stored ? parseInt(stored, 10) : new Date().getMonth();
  });

  // For Time-of-Day Dynamic UI Lighting Glows
  const [hoverSlot, setHoverSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | null>(null);

  // For Cultural Etiquette Flip-Cards
  const [flippedCard, setFlippedCard] = useState<Record<string, boolean>>({});

  // For Interactive Activity Maps
  const [mapActivity, setMapActivity] = useState<Activity | null>(null);

  // For saved favorites
  const [favorites, setFavorites] = useState<{ activity: Activity; dayNum: number; slotName: 'Morning' | 'Afternoon' | 'Evening' }[]>(() => {
    try {
      const stored = localStorage.getItem('waypoint_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Synchronize to LocalStorage (Native Browser LocalStorage Cache Engine)
  useEffect(() => {
    localStorage.setItem('waypoint_destination', destination ? JSON.stringify(destination) : '');
    localStorage.setItem('waypoint_days', days.toString());
    localStorage.setItem('waypoint_tier', tier);
    localStorage.setItem('waypoint_selectedStyles', JSON.stringify(Array.from(selectedStyles)));
    localStorage.setItem('waypoint_hasGenerated', hasGenerated.toString());
    localStorage.setItem('waypoint_itinerary', JSON.stringify(itinerary));
    localStorage.setItem('waypoint_activeDay', activeDay.toString());
    localStorage.setItem('waypoint_packing', JSON.stringify(packing));
    localStorage.setItem('waypoint_homeTimezone', homeTimezone.toString());
    localStorage.setItem('waypoint_passportExpiry', passportExpiry);
    localStorage.setItem('waypoint_travelersCount', travelersCount.toString());
    localStorage.setItem('waypoint_customCostBuffer', customCostBuffer.toString());
    localStorage.setItem('waypoint_bingoState', JSON.stringify(bingoState));
    localStorage.setItem('waypoint_baggageWeights', JSON.stringify(baggageWeights));
    localStorage.setItem('waypoint_travelMonth', travelMonth.toString());
    localStorage.setItem('waypoint_favorites', JSON.stringify(favorites));
  }, [
    destination,
    days,
    tier,
    selectedStyles,
    hasGenerated,
    itinerary,
    activeDay,
    packing,
    homeTimezone,
    passportExpiry,
    travelersCount,
    customCostBuffer,
    bingoState,
    baggageWeights,
    travelMonth,
    favorites
  ]);

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

  // --- Travel Style Vibe Match Score Memo ---
  const vibeMatchScore = useMemo(() => {
    if (!destination) return 0;
    const stylesArr = Array.from(selectedStyles);
    if (stylesArr.length === 0) return 50;
    const weights = destination.archetypeWeights || {};
    let total = 0;
    stylesArr.forEach(st => {
      total += weights[st] !== undefined ? weights[st] : 60;
    });
    return Math.round(total / stylesArr.length);
  }, [destination, selectedStyles]);

  // --- Dynamic AI Dossier Memo ---
  const dossierData = useMemo(() => {
    if (!destination) return null;
    return generateDossierData(destination, days, vibeMatchScore, tier, itinerary);
  }, [destination, days, vibeMatchScore, tier, itinerary]);

  // --- Eco Metrics & Carbon Estimator Memo ---
  const ecoMetrics = useMemo(() => {
    if (!destination) return { co2: 0, tips: [] };
    let multiplier = 1.0;
    if (selectedStyles.has('luxury')) multiplier += 0.4;
    if (selectedStyles.has('adventure')) multiplier -= 0.15;
    if (selectedStyles.has('relaxation')) multiplier -= 0.1;

    const co2 = parseFloat((days * 0.12 * multiplier).toFixed(2));
    const tips = [
      "Opt for electric/hybrid public transport or walking instead of private taxis.",
      "Support local agroforestry or certified carbon-offset projects in the region.",
      "Conserve water & refuse daily hotel towel washes to decrease laundry energy."
    ];
    return { co2, tips };
  }, [destination, days, selectedStyles]);

  // --- Passport Countdown Status Memo ---
  const passportStatus = useMemo(() => {
    if (!passportExpiry) return { entered: false, valid: true, monthsRemaining: 0 };
    const today = new Date();
    const expiry = new Date(passportExpiry);
    const diffTime = expiry.getTime() - today.getTime();
    if (isNaN(diffTime)) return { entered: false, valid: true, monthsRemaining: 0 };
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const monthsRemaining = diffDays / 30.4;
    return {
      entered: true,
      valid: monthsRemaining >= 6,
      monthsRemaining: parseFloat(monthsRemaining.toFixed(1))
    };
  }, [passportExpiry]);

  // --- Timezone Diff & Jet Lag Mitigation Memo ---
  const timezoneDiff = useMemo(() => {
    if (!destination) return 0;
    // We assume destination.timezoneOffset exists or fallback to +1 (Paris) or +9 (Tokyo)
    const destOffset = destination.timezoneOffset !== undefined ? destination.timezoneOffset : 1;
    return destOffset - homeTimezone;
  }, [destination, homeTimezone]);

  const jetLagTips = useMemo(() => {
    const diff = timezoneDiff;
    if (diff === 0) {
      return [
        { title: "No Time Shift", desc: "No rhythm adjustments needed! Keep your normal schedule." },
        { title: "Stay Hydrated", desc: "Standard hydration during flight prevents altitude fatigue." },
        { title: "Stretch Daily", desc: "Do light morning stretching to stay energized and loose." }
      ];
    }
    const dir = diff > 0 ? 'ahead' : 'behind';
    const absDiff = Math.abs(diff);

    if (diff > 0) {
      return [
        { title: "Morning Sunlight Exposure", desc: `Get bright light between 7:00 AM - 11:00 AM local time to advance your biological clock.` },
        { title: "Keep Naps Short", desc: `Avoid sleeping past 3:00 PM local time on arrival. Keep naps strictly under 25 minutes.` },
        { title: "Evening Bedtime Signal", desc: `Minimize screen exposure and use warm lighting starting at 8:00 PM local time.` }
      ];
    } else {
      return [
        { title: "Afternoon Sunlight Delay", desc: `Seek bright sunshine in the late afternoon (4:00 PM - 7:00 PM) to delay sleep urge.` },
        { title: "Limit Early Light", desc: `Avoid bright blue/white lighting when waking up during the first two mornings.` },
        { title: "High-Protein Breakfasts", desc: `Eat a rich breakfast on waking to jumpstart metabolism and establish a new day routine.` }
      ];
    }
  }, [timezoneDiff]);

  // --- Historical Weather Disruption Risk Gauge ---
  const weatherRisk = useMemo(() => {
    if (!destination) return { risk: 10, label: 'Low', color: 'text-emerald-400', desc: 'Optimal sightseeing indices.' };
    const m = travelMonth; // 0-indexed (Jan=0, Dec=11)
    let risk = 15;
    let desc = "Optimal, stable seasonal weather indexes. Standard packing applies.";
    
    if (destination.name.includes('Tokyo')) {
      if (m === 8 || m === 9) { // Sep, Oct (typhoon season)
        risk = 78;
        desc = "Typhoon Risk Alert! Elevated regional wind and heavy precipitation indices. Keep an sturdy wind-vented umbrella on hand.";
      } else if (m === 6 || m === 7) { // Jul, Aug (extreme humidity)
        risk = 52;
        desc = "High heat and humidity index. Stay hydrated and schedule outdoor walks for early morning.";
      } else {
        risk = 12;
      }
    } else if (destination.name.includes('Paris')) {
      if (m === 11 || m === 0 || m === 1) { // Winter
        risk = 58;
        desc = "Winter freeze indices. Risk of travel delays due to heavy frost or light snow. Dress in dense heat-tech layers.";
      } else if (m === 6 || m === 7) { // Mid summer crowds/heat
        risk = 30;
        desc = "Summer peak temperatures. High sightseeing volume at historic queues. Book museum cards in advance.";
      } else {
        risk = 8;
      }
    } else if (destination.name.includes('Reykjavik')) {
      if (m <= 2 || m >= 10) { // Nov-Mar severe winter
        risk = 84;
        desc = "Severe Winter Alert! Strong Arctic windstorms, dense blizzards, and short daylight (4 hrs). Guided glacier tours highly recommended.";
      } else {
        risk = 35;
        desc = "Cool winds. Sightseeing conditions are stable, but waterproof windbreakers are essential year-round.";
      }
    } else if (destination.name.includes('Cairo')) {
      if (m >= 5 && m <= 8) { // Jun-Sep heat
        risk = 88;
        desc = "Excessive Heat Alert! Midday temperatures routinely spike above 40°C. Refrain from desert hikes between 11:00 AM and 3:00 PM.";
      } else {
        risk = 15;
        desc = "Pleasant winter warmth. Golden hours are spectacular; dry desert climate.";
      }
    } else if (destination.name.includes('Sydney')) {
      if (m === 11 || m === 0 || m === 1) { // Summer heatwaves
        risk = 48;
        desc = "High ultraviolet radiation index and summer heat waves. Apply SPF 50+ broad-spectrum lotion hourly.";
      } else if (m >= 5 && m <= 7) { // Winter rain
        risk = 32;
        desc = "Mild southern winter. Periodic rain showers; light sweater recommended.";
      }
    }
    
    let label = 'Low';
    let color = 'text-emerald-400';
    let bg = 'bg-emerald-500/10 border-emerald-500/20';
    if (risk >= 70) {
      label = 'Severe Warning';
      color = 'text-rose-400';
      bg = 'bg-rose-500/10 border-rose-500/20';
    } else if (risk >= 40) {
      label = 'Elevated Risk';
      color = 'text-amber-400';
      bg = 'bg-amber-500/10 border-amber-500/20';
    }
    
    return { risk, label, color, bg, desc };
  }, [destination, travelMonth]);

  // --- Solo-Traveler Emergency Hotlines ---
  const localEmergency = useMemo(() => {
    if (!destination) return { police: '911', ambulance: '911', fire: '911', consulate: 'Main Embassy Desk' };
    const country = destination.country.toLowerCase();
    if (country.includes('japan')) {
      return { police: '110', ambulance: '119', fire: '119', consulate: 'Tokyo Consular Services (Minato District)' };
    } else if (country.includes('france')) {
      return { police: '17', ambulance: '15', fire: '18', consulate: 'Paris Central Consulate (8th Arrondissement)' };
    } else if (country.includes('egypt')) {
      return { police: '122', ambulance: '123', fire: '180', consulate: 'Cairo Embassy Ward (Garden City)' };
    } else if (country.includes('iceland')) {
      return { police: '112', ambulance: '112', fire: '112', consulate: 'Reykjavik Mission Office (Laufasvegur)' };
    } else if (country.includes('australia')) {
      return { police: '000', ambulance: '000', fire: '000', consulate: 'Sydney Consular Post (Martin Place)' };
    } else if (country.includes('united states') || country.includes('usa')) {
      return { police: '911', ambulance: '911', fire: '911', consulate: 'International Delegate Support Desk' };
    }
    return { police: '112', ambulance: '112', fire: '112', consulate: 'Local Diplomatic Quarters' };
  }, [destination]);

  // --- Phonetic Survival Phrases ---
  const survivalPhrases = useMemo(() => {
    if (!destination) return [];
    const lang = destination.language.toLowerCase();
    if (lang.includes('french')) {
      return [
        { en: "Hello / Good day", original: "Bonjour", phonetic: "bohn-zhoor" },
        { en: "Thank you very much", original: "Merci beaucoup", phonetic: "mair-see boh-koo" },
        { en: "Where is the bathroom?", original: "Où sont les toilettes?", phonetic: "oo sohng ley twah-let" },
        { en: "How much is this?", original: "C'est combien?", phonetic: "say kohm-byahng" },
        { en: "Please", original: "S'il vous plaît", phonetic: "seel voo play" }
      ];
    } else if (lang.includes('japanese')) {
      return [
        { en: "Hello / Good day", original: "こんにちは", phonetic: "kon-nee-chee-wah" },
        { en: "Thank you", original: "ありがとうございます", phonetic: "ah-ree-gah-toh go-zah-ee-mass" },
        { en: "Where is the toilet?", original: "トイレはどこですか？", phonetic: "toy-reh wah doh-koh dess-kah" },
        { en: "How much is this?", original: "これはいくらですか？", phonetic: "koh-reh wah ee-koo-rah dess-kah" },
        { en: "Please (order)", original: "これをお願いします", phonetic: "koh-reh oh oh-neg-guy-shee-mass" }
      ];
    } else if (lang.includes('spanish')) {
      return [
        { en: "Hello", original: "Hola", phonetic: "oh-lah" },
        { en: "Thank you", original: "Muchas gracias", phonetic: "moo-chas grah-syahs" },
        { en: "Where is the restroom?", original: "¿Dónde está el baño?", phonetic: "dohn-deh ess-tah el bah-nyoh" },
        { en: "How much is this?", original: "¿Cuánto cuesta esto?", phonetic: "kwahn-toh kwess-tah ess-toh" },
        { en: "Please", original: "Por favor", phonetic: "por fah-bor" }
      ];
    } else if (lang.includes('arabic')) {
      return [
        { en: "Hello", original: "مرحباً", phonetic: "mar-ha-ban" },
        { en: "Thank you", original: "شكراً جزيلاً", phonetic: "shoo-kran ja-zee-lan" },
        { en: "Where is the toilet?", original: "أين الحمام؟", phonetic: "ay-na al-ham-mam" },
        { en: "How much is this?", original: "بكم هذا؟", phonetic: "bi-kam ha-da" },
        { en: "Please", original: "من فضلك", phonetic: "min fad-lak" }
      ];
    }
    return [
      { en: "Hello / Good day", original: "Hello", phonetic: "Heh-loh" },
      { en: "Thank you", original: "Thank you", phonetic: "Thank yoo" },
      { en: "Where is the toilet?", original: "Where is the bathroom?", phonetic: "Wair iz the bath-room" },
      { en: "How much is this?", original: "How much is this?", phonetic: "How much iz this" },
      { en: "Please", original: "Please", phonetic: "Pleez" }
    ];
  }, [destination]);

  // --- Cultural Etiquette Flashcards ---
  const etiquetteCards = useMemo(() => {
    if (!destination) return [];
    const country = destination.country.toLowerCase();
    if (country.includes('japan')) {
      return [
        { title: 'Greeting Gesture', do: 'Bow slightly (15°-30° angle). Keep hands at your sides.', dont: 'Do not hug or shake hands firmly unless initiated.' },
        { title: 'Dining Manners', do: 'Slurp noodles to indicate deliciousness. Lift small rice bowls closer.', dont: 'Do not stick chopsticks vertically into a bowl of rice.' },
        { title: 'Public Etiquette', do: 'Keep phones on silent in trains and speak in low tones.', dont: 'Do not walk while actively eating or drinking street snacks.' }
      ];
    } else if (country.includes('france')) {
      return [
        { title: 'Greeting Gesture', do: 'Say "Bonjour" or "Bonsoir" immediately upon entering shops.', dont: 'Do not wave or call servers with "Garçon!".' },
        { title: 'Dining Manners', do: 'Keep both hands on the table (not on your lap). Place bread beside plate.', dont: 'Do not cut lettuce leaves with a knife (fold them with fork).' },
        { title: 'Social Cues', do: 'Try to speak a few words of French before asking for English.', dont: 'Do not speak loudly in quiet bakeries or cafes.' }
      ];
    } else if (country.includes('egypt')) {
      return [
        { title: 'Greeting Gesture', do: 'Offer a friendly, warm handshake with your right hand.', dont: 'Do not use your left hand for eating or handing objects.' },
        { title: 'Dress Code', do: 'Dress conservatively (shoulders and knees covered in public).', dont: 'Do not wear revealing clothes outside tourist beach resorts.' },
        { title: 'Dining Manners', do: 'Leave a small spoonful of food on your plate to show hospitality.', dont: 'Do not shake salt/pepper onto food before tasting it.' }
      ];
    }
    return [
      { title: 'Greeting Gesture', do: 'Maintain friendly eye contact and use a light, respectful handshake.', dont: 'Do not point with your index finger; use an open palm instead.' },
      { title: 'Dining Manners', do: 'Tip appropriately in accordance with local customs (typically 10-15%).', dont: 'Do not chew loudly or rest elbows heavily on narrow dinner tables.' },
      { title: 'Cultural Dress', do: 'Research holy sites beforehand and dress modestly to show respect.', dont: 'Do not photograph military, government, or airport borders.' }
    ];
  }, [destination]);

  // --- Baggage Weight Allowance & Packing Optimizer ---
  const totalBaggageWeight = useMemo(() => {
    return packing.reduce((acc, item) => {
      const wt = baggageWeights[item.id] !== undefined ? baggageWeights[item.id] : 0.4; // default 0.4kg
      return acc + wt;
    }, 0);
  }, [packing, baggageWeights]);

  const handleChangeWeight = (itemId: string, diff: number) => {
    const curWeight = baggageWeights[itemId] !== undefined ? baggageWeights[itemId] : 0.4;
    const nextWeight = Math.max(0.1, Math.min(5.0, parseFloat((curWeight + diff).toFixed(1))));
    setBaggageWeights(prev => ({
      ...prev,
      [itemId]: nextWeight
    }));
    playChime('click');
  };

  // --- Gamified Travel Bingo Challenges & Handler ---
  const bingoChallenges = useMemo(() => {
    if (!destination) return [];
    // Custom 3x3 layout challenges based on the destination's custom bingo rules or general
    const destBingo = destination.bingo || [];
    const defaults = [
      "Learn 3 local survival phrases",
      "Taste a regional street fruit or snack",
      "Ride the local public transit network",
      "Snap a sunset picture of a landmark",
      "Perfect the local greeting gesture",
      "Discover an authentic hand-crafted token",
      "Wander into a quiet, non-touristy lane",
      "Pay exactly using local coins/notes",
      "Order the most famous traditional national dish"
    ];
    return Array.from({ length: 9 }).map((_, idx) => {
      const label = destBingo[idx] || defaults[idx];
      const ids = ['phrase', 'fruit', 'transit', 'photo', 'gesture', 'souvenir', 'offbeat', 'currency', 'dish'];
      return {
        id: ids[idx],
        label
      };
    });
  }, [destination]);

  const handleToggleBingo = (challengeId: string) => {
    setBingoState(prev => {
      const next = { ...prev, [challengeId]: !prev[challengeId] };
      const count = Object.values(next).filter(Boolean).length;
      if (count === 9) {
        playChime('success');
      } else {
        playChime('click');
      }
      return next;
    });
  };

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

    // Trigger AI Model Streaming Simulation
    setIsStreaming(true);
    setStreamedDaysCount(0);
    setStreamedChecklistCount(0);
    playChime('success');

    let currentDay = 0;
    const dayInterval = setInterval(() => {
      currentDay++;
      setStreamedDaysCount(currentDay);
      if (currentDay >= days) {
        clearInterval(dayInterval);
        setIsStreaming(false);
      }
    }, 450);

    let currentChecklist = 0;
    const totalPackingLength = combinedPacking.length;
    const packingInterval = setInterval(() => {
      currentChecklist += 2;
      setStreamedChecklistCount(Math.min(totalPackingLength, currentChecklist));
      if (currentChecklist >= totalPackingLength) {
        clearInterval(packingInterval);
      }
    }, 90);

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

          // Stagger the addition of new days via simulation
          setIsStreaming(true);
          setStreamedDaysCount(cur);
          let currentStep = cur;
          const extInterval = setInterval(() => {
            currentStep++;
            setStreamedDaysCount(currentStep);
            if (currentStep >= newDays) {
              clearInterval(extInterval);
              setIsStreaming(false);
            }
          }, 450);

          return [...prev, ...addedPlans];
        } else if (newDays < cur) {
          const truncated = prev.slice(0, newDays);
          if (activeDay >= newDays) {
            setActiveDay(newDays - 1);
          }
          setStreamedDaysCount(newDays);
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

  // --- Toggle activity as favorite ---
  const handleToggleFavorite = (activity: Activity, dayNum: number, slotName: 'Morning' | 'Afternoon' | 'Evening') => {
    playChime('click');
    setFavorites(prev => {
      const exists = prev.some(item => item.activity.id === activity.id);
      if (exists) {
        return prev.filter(item => item.activity.id !== activity.id);
      } else {
        return [...prev, { activity, dayNum, slotName }];
      }
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
    const totalAmount = (baseDailyRate * days) + customCostBuffer;
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
  }, [destination, days, tier, customCostBuffer]);

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

  // --- Export & Sharing handlers ---
  const [copied, setCopied] = useState(false);

  const generateTextSummary = () => {
    if (!destination || !dossierData) return '';
    return generateDossierTextString(dossierData, destination);
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyTextSummary = () => {
    const text = generateTextSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const handleDownloadTextSummary = () => {
    if (!destination) return;
    const text = generateTextSummary();
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const filename = `Waypoint_Itinerary_${destination.name.replace(/\s+/g, '_')}.txt`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadJSON = () => {
    if (!destination) return;
    const exportData = {
      app: 'Waypoint',
      timestamp: new Date().toISOString(),
      destination: {
        name: destination.name,
        country: destination.country,
        bestTime: destination.bestTime,
        currency: destination.currency,
        language: destination.language,
        safety: destination.safety,
        climate: destination.climate
      },
      durationDays: days,
      budgetTier: tier,
      budgetBreakdown: {
        totalAmount: budgetStats.totalAmount,
        baseDailyRate: budgetStats.baseDailyRate,
        breakdown: budgetStats.breakdowns.map(b => ({ name: b.name, percent: b.percent, amount: b.amount }))
      },
      travelStyles: STYLES.filter(s => selectedStyles.has(s.id)).map(s => s.label),
      itinerary: itinerary.map(d => ({
        day: d.day,
        slots: {
          Morning: d.slots.Morning.map(a => ({ title: a.title, category: a.cat, cost: a.cost, checked: a.done })),
          Afternoon: d.slots.Afternoon.map(a => ({ title: a.title, category: a.cat, cost: a.cost, checked: a.done })),
          Evening: d.slots.Evening.map(a => ({ title: a.title, category: a.cat, cost: a.cost, checked: a.done }))
        }
      })),
      packingList: packing.map(p => ({ item: p.label, checked: p.checked, custom: p.custom }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const filename = `Waypoint_Trip_${destination.name.replace(/\s+/g, '_')}.json`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white flex flex-wrap items-center gap-x-3 gap-y-1">
                    {destination.name}
                  </h2>
                  {/* Travel Style Vibe Compatibility Matcher */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full text-xs font-mono text-blue-300">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
                      <span>Vibe Match Score:</span>
                      <span className="font-bold text-white text-sm">{vibeMatchScore}%</span>
                    </div>
                    <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 rounded-full transition-all duration-500" style={{ width: `${vibeMatchScore}%` }} />
                    </div>
                  </div>
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

            {/* Smart Traveler Advisory Metric Grid */}
            <section id="traveler-advisory" className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-red-500/[0.03] p-5 md:p-6 mb-8 shadow-[0_0_20px_rgba(245,158,11,0.03)] backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/5 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-400/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white tracking-wide">Smart Traveler Advisory</h4>
                  <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Real-time localized security & etiquette report</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Cultural Etiquette */}
                <div className="bg-ink-950/40 border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Languages className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">Cultural Etiquette</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {destination.culturalEtiquette || "Please greet shopkeepers and follow local customs."}
                  </p>
                </div>

                {/* Local Scam to Avoid */}
                <div className="bg-ink-950/40 border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">Local Scams to Avoid</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {destination.localScamToAvoid || "Be cautious of unlicensed transportation or overly helpful strangers."}
                  </p>
                </div>

                {/* Emergency Hotline */}
                <div className="bg-ink-950/40 border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">Emergency Contacts</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {destination.emergencyHotline || "Local Police/Medical services can be reached via 112 / 911."}
                  </p>
                </div>
              </div>
            </section>

            {/* Export and Actions Bar */}
            <div className="glass rounded-xl p-4 mb-8 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-400/20 shrink-0">
                  <Share2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">Export Trip Details</span>
                  <span className="text-xs text-slate-400 block mt-0.5">Save your itinerary, budget, and checklist offline</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btnCopySummary"
                  onClick={handleCopyTextSummary}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition outline-none"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
                <button
                  id="btnDownloadTxt"
                  onClick={handleDownloadTextSummary}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition outline-none"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Download TXT
                </button>
                <button
                  id="btnDownloadJson"
                  onClick={handleDownloadJSON}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition outline-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON
                </button>
                <button
                  id="btnPrintDossier"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-400/20 flex items-center gap-1.5 transition outline-none"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Dossier
                </button>
              </div>
            </div>

            {/* Panel Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: <Route className="w-3.5 h-3.5" /> },
                { id: 'budget', label: 'Budget & Splits', icon: <PieChart className="w-3.5 h-3.5" /> },
                { id: 'packing', label: 'Packing list', icon: <Backpack className="w-3.5 h-3.5" /> },
                { id: 'insights', label: 'Local Insights', icon: <Globe className="w-3.5 h-3.5" /> },
                { id: 'dossier', label: 'Adaptive AI Dossier', icon: <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" /> }
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column (8/12 width on desktop): Day selector & Slots list with lighting glows */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">Day-by-day itinerary</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Tap the circle to check off an activity. Use <span className="text-slate-400">Swap</span> to select another stop.
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-ink-900 px-3 py-1.5 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
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
                          type="button"
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

                    {/* Activities slots with Time-of-Day Dynamic Lighting Glows */}
                    {itinerary[activeDay] && (
                      <div className="space-y-6">
                        {(['Morning', 'Afternoon', 'Evening'] as const).map((slot) => {
                          const acts = itinerary[activeDay].slots[slot] || [];
                          const isHovered = hoverSlot === slot;
                          
                          // Dynamic style for time-of-day ambient glow
                          let glowClasses = 'border-white/5 shadow-none';
                          if (isHovered) {
                            if (slot === 'Morning') {
                              glowClasses = 'border-amber-400/30 bg-amber-500/[0.02] shadow-[0_0_35px_rgba(251,191,36,0.06)]';
                            } else if (slot === 'Afternoon') {
                              glowClasses = 'border-sky-400/30 bg-sky-500/[0.02] shadow-[0_0_35px_rgba(56,189,248,0.06)]';
                            } else if (slot === 'Evening') {
                              glowClasses = 'border-violet-400/30 bg-violet-500/[0.02] shadow-[0_0_35px_rgba(139,92,246,0.06)]';
                            }
                          }

                          return (
                            <div
                              key={slot}
                              onMouseEnter={() => setHoverSlot(slot)}
                              onMouseLeave={() => setHoverSlot(null)}
                              className={`p-5 rounded-2xl border transition-all duration-300 ${glowClasses}`}
                            >
                              <div className="flex items-center gap-2 text-slate-400 mb-4">
                                {getSlotIcon(slot)}
                                <span className="text-xs font-mono uppercase tracking-widest font-semibold">{slot}</span>
                                <span className="flex-1 h-px bg-white/5"></span>
                                {isHovered && (
                                  <span className="text-[10px] font-mono text-blue-400 animate-pulse">
                                    {slot === 'Morning' && '☀ Golden hour theme'}
                                    {slot === 'Afternoon' && '☁ Daybreak blue theme'}
                                    {slot === 'Evening' && '☾ Midnight glow theme'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-3">
                                {acts.length === 0 ? (
                                  <p className="text-xs text-slate-600 italic py-2">No scheduled activities for this slot.</p>
                                ) : (
                                  acts.map((act) => {
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
                                        <button
                                          type="button"
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
                                            {!act.done && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  playChime('click');
                                                  setMapActivity(act);
                                                }}
                                                className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer outline-none"
                                              >
                                                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                                                <span>Show on Map</span>
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleToggleFavorite(act, itinerary[activeDay].day, slot)}
                                              className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium transition cursor-pointer outline-none text-slate-400 hover:text-rose-400 group"
                                            >
                                              <Heart
                                                className={`w-3.5 h-3.5 transition-all ${
                                                  favorites.some(f => f.activity.id === act.id)
                                                    ? 'fill-rose-500 text-rose-500 scale-110'
                                                    : 'text-slate-500 group-hover:text-rose-400'
                                                }`}
                                              />
                                              <span className={favorites.some(f => f.activity.id === act.id) ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'}>
                                                {favorites.some(f => f.activity.id === act.id) ? 'Saved' : 'Save'}
                                              </span>
                                            </button>
                                            <span className="shrink-0 text-xs font-mono text-slate-400 font-semibold">
                                              {fmtUSD(act.cost)}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] font-mono uppercase tracking-wide border rounded-full px-2.5 py-0.5 ${catColors}`}>
                                              {act.cat}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleSwapActivity(activeDay, slot, act.id)}
                                              className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition ml-auto outline-none"
                                            >
                                              <Shuffle className="w-3 h-3" /> Swap
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Chaos Buffer (Plan B) Live Adaptive Card */}
                        <div className="mt-6 border border-amber-500/25 bg-amber-500/[0.02] rounded-2xl p-5 shadow-[0_0_25px_rgba(245,158,11,0.03)] backdrop-blur-md">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">CHAOS BUFFER (Plan B)</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 self-start">Self-Healing Loop</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed mt-2.5 font-medium">
                                {getChaosBuffer(destination, activeDay + 1)}
                              </p>
                              
                              <div className="flex items-center justify-end gap-3 mt-4 pt-3.5 border-t border-white/5">
                                <span className="text-[10px] font-mono text-slate-500">Disruptions? Swap active afternoon slot:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playChime('success');
                                    setItinerary(prev => {
                                      return prev.map((dayPlan, idx) => {
                                        if (idx !== activeDay) return dayPlan;
                                        const updatedSlots = { ...dayPlan.slots };
                                        
                                        // Take the afternoon activity and swap it with a new Plan B activity
                                        const originalAct = updatedSlots.Afternoon?.[0];
                                        const planBTitle = `Alternative: ${getChaosBuffer(destination, activeDay + 1).replace('Rain forecast? ', '').replace('If ', '').split(', ')[0] || 'Covered tour options'}`;
                                        
                                        const planBActivity: Activity = {
                                          id: `chaos_${Date.now()}`,
                                          title: planBTitle,
                                          slot: 'Afternoon',
                                          cost: originalAct ? Math.round(originalAct.cost * 0.8) : 25,
                                          done: false,
                                          style: 'culture',
                                          cat: 'Relaxation'
                                        };
                                        
                                        updatedSlots.Afternoon = [planBActivity];
                                        return { ...dayPlan, slots: updatedSlots };
                                      });
                                    });
                                  }}
                                  className="px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 hover:border-amber-400/40 rounded-lg transition-all outline-none"
                                >
                                  ☄ Swap to Plan B
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (4/12 width on desktop): Jet Lag Circadian Assistant & Gamified Travel Bingo */}
                  <div className="lg:col-span-4 space-y-6">

                    {/* Saved Favorites Quick Access Panel */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2 text-white">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                          <h4 className="font-display font-semibold text-sm">Saved Favorites</h4>
                        </div>
                        {favorites.length > 0 && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold">
                            {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {favorites.length === 0 ? (
                          <div className="text-center py-6 px-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              No favorited activities yet. Click the <Heart className="w-3 h-3 text-slate-500 inline mx-0.5" /> icon on any activity in your itinerary to save it here for quick access.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                            {favorites.map(({ activity, dayNum, slotName }) => {
                              let catColors = 'text-sky-400 border-sky-400/30 bg-sky-400/5';
                              if (activity.cat === 'Adventure') catColors = 'text-amber-400 border-amber-400/30 bg-amber-400/5';
                              else if (activity.cat === 'Relaxation') catColors = 'text-blue-400 border-blue-400/30 bg-blue-400/5';
                              else if (activity.cat === 'Foodie') catColors = 'text-rose-400 border-rose-400/30 bg-rose-400/5';
                              else if (activity.cat === 'Family') catColors = 'text-violet-400 border-violet-400/30 bg-violet-400/5';

                              return (
                                <div 
                                  key={activity.id}
                                  className="bg-ink-950/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2 hover:border-white/10 transition group"
                                >
                                  <div className="flex items-start justify-between gap-2.5">
                                    <div className="min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          playChime('click');
                                          // Navigate to the day of this activity!
                                          const dayIndex = itinerary.findIndex(d => d.day === dayNum);
                                          if (dayIndex !== -1) {
                                            setActiveDay(dayIndex);
                                          }
                                        }}
                                        className="text-xs font-semibold text-slate-200 hover:text-blue-400 text-left transition outline-none block line-clamp-2"
                                        title="Click to jump to this day"
                                      >
                                        {activity.title}
                                      </button>
                                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                                        Day {dayNum} • {slotName}
                                      </span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                                      {fmtUSD(activity.cost)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                                    <span className={`text-[9px] font-mono uppercase tracking-wide border rounded-full px-2 py-0.5 ${catColors}`}>
                                      {activity.cat}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          playChime('click');
                                          setMapActivity(activity);
                                        }}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition outline-none cursor-pointer"
                                      >
                                        <MapPin className="w-2.5 h-2.5" />
                                        <span>Map</span>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFavorite(activity, dayNum, slotName)}
                                        className="text-[10px] text-slate-500 hover:text-rose-400 font-medium flex items-center gap-1 transition outline-none cursor-pointer"
                                        title="Remove from favorites"
                                      >
                                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                                        <span>Remove</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Feature 1: Jet Lag Mitigation & Circadian Assistant */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 text-white border-b border-white/5 pb-3">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <h4 className="font-display font-semibold text-sm">Circadian rhythm Assistant</h4>
                      </div>

                      <div className="space-y-3.5">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Enter your home city timezone offset to optimize light exposure and rest schedules.
                        </p>

                        <div className="flex items-center justify-between bg-ink-900/50 p-3 rounded-xl border border-white/5">
                          <span className="text-xs font-mono text-slate-300">Your Home (UTC):</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setHomeTimezone(prev => Math.max(-12, prev - 1))}
                              className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 outline-none"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold text-white w-10 text-center">
                              {homeTimezone >= 0 ? `+${homeTimezone}` : homeTimezone}
                            </span>
                            <button
                              type="button"
                              onClick={() => setHomeTimezone(prev => Math.min(14, prev + 1))}
                              className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 outline-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-400/10 text-xs space-y-1">
                          <div className="flex justify-between font-mono text-blue-300">
                            <span>Destination timezone:</span>
                            <span className="font-bold">
                              UTC {destination.timezoneOffset >= 0 ? `+${destination.timezoneOffset}` : destination.timezoneOffset}
                            </span>
                          </div>
                          <div className="flex justify-between font-mono text-slate-400">
                            <span>Time Shift:</span>
                            <span className={`font-semibold ${timezoneDiff === 0 ? 'text-emerald-400' : 'text-blue-300'}`}>
                              {timezoneDiff === 0 ? 'No shift' : `${Math.abs(timezoneDiff)} hours ${timezoneDiff > 0 ? 'ahead' : 'behind'}`}
                            </span>
                          </div>
                        </div>

                        {/* Jet lag recommendations timeline */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Personalized Mitigation Timeline</span>
                          {jetLagTips.map((tip, idx) => (
                            <div key={idx} className="flex gap-3 text-xs bg-ink-900/40 p-3 rounded-xl border border-white/5">
                              <span className="font-mono font-bold text-blue-400 bg-blue-500/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-medium text-slate-200 block">{tip.title}</span>
                                <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">{tip.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Feature 14: Gamified Travel Bingo */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2 text-white">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <h4 className="font-display font-semibold text-sm">Gamified travel Bingo</h4>
                        </div>
                        {Object.values(bingoState).filter(Boolean).length === 9 && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full font-bold">
                            Completed!
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Cross off achievements as you explore {destination.name} to earn the ultimate explorer ranking.
                        </p>

                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>Bingo Grid Checklist:</span>
                          <span className="text-yellow-400 font-bold">
                            {Object.values(bingoState).filter(Boolean).length} / 9 achieved
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 aspect-square">
                          {bingoChallenges.map((challenge, idx) => {
                            const isDone = !!bingoState[challenge.id];
                            return (
                              <button
                                key={challenge.id}
                                type="button"
                                onClick={() => handleToggleBingo(challenge.id)}
                                title={challenge.label}
                                className={`rounded-lg p-2 text-[10px] leading-tight flex flex-col items-center justify-center text-center transition-all duration-300 relative border overflow-hidden ${
                                  isDone
                                    ? 'bg-yellow-500/15 border-yellow-400/40 text-yellow-200 shadow-glow'
                                    : 'bg-ink-950/60 border-white/5 text-slate-500 hover:border-white/15 hover:text-slate-300'
                                }`}
                              >
                                {isDone ? (
                                  <div className="absolute inset-0 bg-yellow-400/5 animate-pulse" />
                                ) : null}
                                <span className="font-mono text-[9px] text-slate-600 block mb-0.5">#{idx + 1}</span>
                                <span className="line-clamp-3 font-medium tracking-tight">
                                  {challenge.id === 'phrase' ? 'Local Phrases' : 
                                   challenge.id === 'fruit' ? 'Try Fruit' : 
                                   challenge.id === 'transit' ? 'Ride Transit' : 
                                   challenge.id === 'photo' ? 'Photo Spot' : 
                                   challenge.id === 'gesture' ? 'Greeting Gesture' : 
                                   challenge.id === 'souvenir' ? 'Get Token' : 
                                   challenge.id === 'offbeat' ? 'Quiet Lane' : 
                                   challenge.id === 'currency' ? 'Pay Coins' : 'Famous Dish'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="bg-ink-900/40 p-2.5 rounded-lg border border-white/5 text-[10px] text-slate-500 italic">
                          💡 Hover or tap tiles to see description, click to check off.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.section>
            )}

            {/* ===== BUDGET TAB PANEL ===== */}
            {activeTab === 'budget' && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Live budget estimator & group splits</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Recalculates instantly with trip length, travelers, budget tier, and custom additions.
                    </p>
                  </div>
                </div>

                {/* Interactive Multi-Passenger Splitter & Buffer Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Multi-Passenger Stepper Control */}
                  <div className="glass rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-400/10">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">Multi-passenger Splitter</span>
                        <span className="text-[10px] text-slate-400 block">Divide costs equally across friends</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTravelersCount(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center outline-none"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-white w-8 text-center">{travelersCount}</span>
                      <button
                        type="button"
                        onClick={() => setTravelersCount(prev => Math.min(25, prev + 1))}
                        className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Custom Extra Cost Buffer Slider */}
                  <div className="glass rounded-xl p-4 border border-white/5 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white">Custom Buffer Cost Additions</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-400">+{fmtUSD(customCostBuffer)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="1500"
                        step="50"
                        value={customCostBuffer}
                        onChange={(e) => setCustomCostBuffer(parseInt(e.target.value) || 0)}
                        className="w-full h-1 bg-ink-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-[10px] font-mono text-slate-500">$1500 max</span>
                    </div>
                  </div>

                </div>

                {/* Donut and Breakdown Card Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Interactive Donut */}
                  <div className="lg:col-span-4 glass rounded-2xl p-6 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
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
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          {travelersCount > 1 ? 'Total (Group)' : 'Total Est'}
                        </span>
                        <span className="font-display text-2xl font-bold text-white">
                          {fmtUSD(budgetStats.totalAmount)}
                        </span>
                        {travelersCount > 1 && (
                          <div className="mt-1 text-center bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">
                            <span className="text-[10px] font-mono text-blue-300 block">Per Person</span>
                            <span className="text-xs font-mono font-bold text-white">
                              {fmtUSD(budgetStats.totalAmount / travelersCount)}
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
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
                          <span className="font-mono text-sm text-slate-300 font-medium flex flex-col items-end">
                            <span>
                              {fmtUSD(seg.amount)}{' '}
                              <span className="text-slate-500 text-xs ml-1">· {Math.round(seg.percent * 100)}%</span>
                            </span>
                            {travelersCount > 1 && (
                              <span className="text-[10px] text-blue-400/80 font-mono mt-0.5">
                                {fmtUSD(seg.amount / travelersCount)} per person
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-ink-950 overflow-hidden">
                          <div className={`h-full rounded-full ${seg.bgColor}`} style={{ width: `${seg.percent * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Bento Box Elements: Overage Alerts & Carbon Estimators */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Feature 3: Smart Budget Overage Alert Matrix */}
                  <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <h4 className="font-display font-semibold text-sm">Smart Expense Overage Advisor</h4>
                      </div>
                      
                      {budgetStats.totalAmount > (250 * days) ? (
                        <div className="space-y-3">
                          <p className="text-xs text-amber-300/90 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl animate-pulse">
                            ⚠️ <strong>Budget alert:</strong> Projected trip cost exceeds the average optimal threshold (${fmtUSD(250 * days)}). Custom cost additions and style multipliers have flagged an offset.
                          </p>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Cost-Saving Recommendations:</span>
                            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                              <li>Switch your dining to local street-food stalls instead of restaurants.</li>
                              <li>Opt for standard regional rail passes instead of private car hires.</li>
                              <li>Browse museums on their designated free-admission days.</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-emerald-400 leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                            ✓ <strong>Healthy Budget parameters:</strong> Your estimated expenditure fits perfectly within standard averages for {destination.name}. No risk indices detected!
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Adding a Custom Cost Buffer above will let you simulate unplanned incidentals or expensive flight changes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Currency Conversion Assistant */}
                  <CurrencyConverter destinationCurrency={destination.currency} />

                  {/* Feature 4: Eco-Footprint & Carbon Offset Estimator */}
                  <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                      <Leaf className="w-4 h-4" />
                      <h4 className="font-display font-semibold text-sm">Eco-Footprint & Carbon Offset</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-medium">Estimated Trip CO₂ Footprint:</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          {ecoMetrics.co2} Metric Tons
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (ecoMetrics.co2 / 4) * 100)}%` }} />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">How to offset locally:</span>
                        <div className="space-y-1.5">
                          {ecoMetrics.tips.map((tip, idx) => (
                            <p key={idx} className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5">
                              <span className="text-emerald-400 mt-0.5 shrink-0">❖</span>
                              <span>{tip}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
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

                {/* Feature 9: Baggage Weight Allowance & Packing Optimizer */}
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-white">
                      <Scale className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <h4 className="font-display font-semibold text-sm">Baggage weight Optimizer</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Airline Carry-On Allowance Checker</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 bg-ink-900/60 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="text-xs font-mono text-slate-400">Total weight:</span>
                      <span className={`text-sm font-mono font-bold ${totalBaggageWeight > 7.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalBaggageWeight.toFixed(1)} kg
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">/ 7.0 kg limit</span>
                    </div>
                  </div>

                  <div className="w-full bg-ink-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        totalBaggageWeight > 7.0 
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                          : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                      }`} 
                      style={{ width: `${Math.min(100, (totalBaggageWeight / 7.0) * 100)}%` }} 
                    />
                  </div>

                  {totalBaggageWeight > 7.0 ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-rose-300/90 leading-relaxed">
                        <strong>Airline Cabin Warning:</strong> Carry-on weight limits for flights to {destination.country} are strictly restricted to 7.0 kg. Consider checking item weights, reducing toiletries, or wear heavy garments on the flight to remain compliant!
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-400/95 leading-relaxed">
                        ✓ <strong>Optimized Baggage:</strong> Your estimated bag weight fits perfectly in any flight's cabin overhead lockers without weight surcharges!
                      </p>
                    </div>
                  )}
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

                        {/* Inline Baggage Weight Controller */}
                        <div className="flex items-center gap-1.5 bg-ink-900/60 px-2 py-1 rounded-lg border border-white/5 opacity-80 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            type="button"
                            onClick={() => handleChangeWeight(item.id, -0.1)}
                            className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center font-bold text-slate-300 outline-none"
                          >
                            -
                          </button>
                          <span className="text-[9px] font-mono font-medium text-slate-300 w-11 text-center select-none">
                            {(baggageWeights[item.id] !== undefined ? baggageWeights[item.id] : 0.4).toFixed(1)} kg
                          </span>
                          <button
                            type="button"
                            onClick={() => handleChangeWeight(item.id, 0.1)}
                            className="w-4 h-4 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center font-bold text-slate-300 outline-none"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeletePacking(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-150 outline-none p-1 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ===== LOCAL INSIGHTS TAB PANEL ===== */}
            {activeTab === 'insights' && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">Local Insights & Safety Dossier</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Critical localized metadata for <span className="text-blue-400 font-semibold">{destination.name}</span>, {destination.country}.
                    </p>
                  </div>
                </div>

                {/* Grid row 1: Weather Disruption Gauge (Feature 13) + Phonetic Matrix (Feature 12) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Weather Risk Gauge */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <CloudLightning className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <h4 className="font-display font-semibold text-sm">Weather Disruption Risk</h4>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Historical Climate Index</p>
                        </div>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${weatherRisk.bg} ${weatherRisk.color}`}>
                        {weatherRisk.label}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                      {/* Gauge circle SVG */}
                      <div className="relative w-28 h-28 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="stroke-white/5 fill-none"
                            strokeWidth="8"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className={`fill-none transition-all duration-1000 ${
                              weatherRisk.risk >= 70 
                                ? 'stroke-rose-500' 
                                : weatherRisk.risk >= 40 
                                ? 'stroke-amber-400' 
                                : 'stroke-emerald-400'
                            }`}
                            strokeWidth="8"
                            strokeDasharray={301.59}
                            strokeDashoffset={301.59 * (1 - weatherRisk.risk / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-mono font-bold text-white">{weatherRisk.risk}%</span>
                          <span className="text-[9px] text-slate-500 uppercase font-semibold font-mono">Disruption</span>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-400 font-medium">Travel Month:</label>
                          <select
                            value={travelMonth}
                            onChange={(e) => {
                              setTravelMonth(parseInt(e.target.value, 10));
                              playChime('click');
                            }}
                            className="bg-ink-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-400/50"
                          >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                              <option key={i} value={i}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {weatherRisk.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Soundex Phonetic Survival Phrases */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-3.5">
                    <div className="flex items-center gap-2 text-white">
                      <Languages className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <h4 className="font-display font-semibold text-sm">Survival Phonetic Matrix</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Tap to hear audio guide tones</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                      {survivalPhrases.map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => playChime('click')}
                          className="w-full text-left flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all outline-none group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{phrase.original}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{phrase.en}</p>
                          </div>
                          <div className="flex items-center gap-2 text-right">
                            <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
                              /{phrase.phonetic}/
                            </span>
                            <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Weather Trend Chart Section */}
                <WeatherTrendChart destinationName={destination.name} travelMonth={travelMonth} />

                {/* Grid row 2: Emergency hotline + Passport Validity Tracker + Currency Converter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Emergency hotlines */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2.5 text-white">
                      <PhoneCall className="w-5 h-5 text-rose-400 shrink-0" />
                      <div>
                        <h4 className="font-display font-semibold text-sm">Emergency Hotlines & Consulate</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Verified {destination.country} Emergency Services</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Police</span>
                        <p className="text-lg font-mono font-bold text-rose-400 mt-1">{localEmergency.police}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Ambulance</span>
                        <p className="text-lg font-mono font-bold text-amber-400 mt-1">{localEmergency.ambulance}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Fire</span>
                        <p className="text-lg font-mono font-bold text-orange-400 mt-1">{localEmergency.fire || '112'}</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Embassy Contact:</strong> {localEmergency.consulate}. Always register with travel advisories before departing.
                      </div>
                    </div>
                  </div>

                  {/* Passport validity countdown tracker */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2.5 text-white">
                      <Compass className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <h4 className="font-display font-semibold text-sm">Passport Validity Countdown</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Compliance with the 6-Month Rule</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 bg-ink-900/60 p-3 rounded-xl border border-white/5">
                        <label className="text-xs text-slate-400 shrink-0 font-medium">Passport Expiry:</label>
                        <input
                          type="date"
                          className="flex-1 bg-transparent border-0 text-xs font-mono text-slate-200 outline-none focus:ring-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.value) {
                              localStorage.setItem('waypoint_passport_expiry', e.target.value);
                              playChime('click');
                            }
                          }}
                          defaultValue={localStorage.getItem('waypoint_passport_expiry') || ''}
                        />
                      </div>

                      {(() => {
                        const stored = localStorage.getItem('waypoint_passport_expiry');
                        if (!stored) {
                          return (
                            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 flex items-start gap-2.5">
                              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Enter your passport's expiration date to automatically verify compliance with immigration rules.
                              </p>
                            </div>
                          );
                        }

                        const expiryDate = new Date(stored);
                        const today = new Date();
                        const diffTime = expiryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const diffMonths = parseFloat((diffDays / 30.4).toFixed(1));

                        if (diffDays <= 0) {
                          return (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="text-xs text-rose-300 leading-relaxed">
                                <strong>⚠️ Passport Expired:</strong> Your passport is currently expired. Renew immediately to secure boarding!
                              </div>
                            </div>
                          );
                        } else if (diffMonths < 6) {
                          return (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="text-xs text-amber-300 leading-relaxed">
                                <strong>⚠️ Border Entry Hazard ({diffMonths} months left):</strong> Expiration date is under 6 months. Officials may deny boarding.
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-emerald-400/90 leading-relaxed">
                                ✓ <strong>Border Safe:</strong> Passport is valid for {diffMonths} months. Ready for boarding!
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Local Currency Quick Converter */}
                  <CurrencyConverter destinationCurrency={destination.currency} />
                </div>

                {/* Grid row 3: Interactive Cultural Etiquette Cards (Feature 8) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <HeartHandshake className="w-4 h-4 text-pink-400 shrink-0" />
                    <h4 className="font-display font-semibold text-sm">Interactive "Cultural Etiquette" Flipcards</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {etiquetteCards.map((card, idx) => {
                      const cardId = `card_${idx}`;
                      const isFlipped = !!flippedCard[cardId];
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setFlippedCard(prev => ({ ...prev, [cardId]: !prev[cardId] }));
                            playChime('click');
                          }}
                          className="h-[140px] cursor-pointer relative perspective"
                        >
                          <div
                            className={`w-full h-full duration-500 preserve-3d transition-all ${
                              isFlipped ? 'rotate-y-180' : ''
                            }`}
                          >
                            {/* Front side */}
                            <div className="absolute inset-0 backface-hidden glass rounded-2xl p-4 flex flex-col justify-between border border-white/5 bg-ink-950/40 hover:border-pink-500/20 hover:bg-ink-950/60 transition-all">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-semibold">Culture check</span>
                                <h5 className="font-display font-bold text-sm text-white mt-1">{card.title}</h5>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono">
                                <span>Click to flip</span>
                                <span>❖</span>
                              </div>
                            </div>

                            {/* Back side (flipped) */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 glass rounded-2xl p-4 flex flex-col justify-between border border-pink-500/20 bg-pink-500/[0.02]">
                              <div className="space-y-2">
                                <div className="text-xs leading-relaxed">
                                  <span className="text-emerald-400 font-bold">DO:</span> <span className="text-slate-300">{card.do}</span>
                                </div>
                                <div className="text-xs leading-relaxed">
                                  <span className="text-rose-400 font-bold">DON'T:</span> <span className="text-slate-400">{card.dont}</span>
                                </div>
                              </div>
                              <div className="text-right text-[9px] font-mono text-pink-400 uppercase font-semibold">
                                Etiquette Guide
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.section>
            )}

            {/* ===== ADAPTIVE AI DOSSIER TAB PANEL ===== */}
            {activeTab === 'dossier' && dossierData && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Dossier Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                      <span>Advanced AI Travel Dossier</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ultra-reliable offline dossiers integrating real-time sentiment data and adaptive planning logic.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const txt = generateDossierTextString(dossierData, destination);
                        navigator.clipboard.writeText(txt);
                        setCopied(true);
                        playChime('success');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-400/20 flex items-center gap-1.5 transition outline-none"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied Clean Text' : 'Copy Clean Dossier'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playChime('click');
                        const txt = generateDossierTextString(dossierData, destination);
                        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
                        const anchor = document.createElement('a');
                        anchor.setAttribute("href", dataStr);
                        anchor.setAttribute("download", `Waypoint_AI_Dossier_${destination.name}.txt`);
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                      }}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition outline-none"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download TXT
                    </button>
                  </div>
                </div>

                {/* Section 1: Destination Insights & Live Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Snapshot Metric Grid (7/12) */}
                  <div className="lg:col-span-7 glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">Section 1: Destination insights</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Vibe Match</span>
                        <p className="text-xl font-mono font-bold text-blue-300 mt-1">{dossierData.vibeMatchScore}%</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Best Window</span>
                        <p className="text-xs font-semibold text-slate-200 mt-2 truncate" title={dossierData.bestVisitingWindow}>{dossierData.bestVisitingWindow}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Currency Code</span>
                        <p className="text-sm font-bold text-slate-200 mt-2">{dossierData.currencyCode}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Hotlines</span>
                        <p className="text-xs font-semibold text-rose-400 mt-2 truncate" title={dossierData.emergencyHotlines}>{dossierData.emergencyHotlines.split('|')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Unfiltered Reviews (5/12) */}
                  <div className="lg:col-span-5 glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">Live Review Dashboard (Pain Points)</span>
                    </div>
                    <div className="space-y-3">
                      {dossierData.reviews.map((rev, i) => (
                        <div key={i} className="bg-amber-500/[0.02] border border-amber-500/10 p-3 rounded-xl relative">
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "{rev}"
                          </p>
                          <span className="text-[9px] font-mono text-amber-400/60 block text-right mt-1.5">— Verified Traveler Review</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Day-by-day Itinerary with chaos swapper */}
                <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">Section 2: Day-by-Day Self-Healing Itinerary</span>
                  </div>
                  
                  <div className="space-y-6">
                    {dossierData.days.map((day) => (
                      <div key={day.dayNum} className="border-b border-white/5 last:border-b-0 pb-6 last:pb-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-400/15">
                            Day {day.dayNum}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Morning Segment (Outdoor)</span>
                              <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">{day.morningActivity}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-2 block font-semibold">Est. ${day.morningCost} USD</span>
                          </div>
                          
                          <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Afternoon Segment (Scenic)</span>
                              <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">{day.afternoonActivity}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-2 block font-semibold">Est. ${day.afternoonCost} USD</span>
                          </div>

                          <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Evening Segment (Culinary)</span>
                              <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">{day.eveningActivity}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-2 block font-semibold">Est. ${day.eveningCost} USD</span>
                          </div>
                        </div>

                        {/* Chaos Buffer Card */}
                        <div className="border border-amber-500/20 bg-amber-500/[0.02] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">CHAOS BUFFER (Plan B)</span>
                              <p className="text-xs text-slate-300 leading-relaxed mt-0.5 font-medium">{day.chaosBuffer}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              playChime('success');
                              // Action to swap afternoon activity with plan B in the itinerary state!
                              setItinerary(prev => {
                                return prev.map((dayPlan, idx) => {
                                  if (idx !== (day.dayNum - 1)) return dayPlan;
                                  const updatedSlots = { ...dayPlan.slots };
                                  
                                  const originalAct = updatedSlots.Afternoon?.[0];
                                  const planBTitle = `Alternative: ${day.chaosBuffer.replace('Rain forecast? ', '').replace('If ', '').split(', ')[0] || 'Covered tour options'}`;
                                  
                                  const planBActivity: Activity = {
                                    id: `chaos_${Date.now()}`,
                                    title: planBTitle,
                                    slot: 'Afternoon',
                                    cost: originalAct ? Math.round(originalAct.cost * 0.8) : 25,
                                    done: false,
                                    style: 'culture',
                                    cat: 'Relaxation'
                                  };
                                  
                                  updatedSlots.Afternoon = [planBActivity];
                                  return { ...dayPlan, slots: updatedSlots };
                                });
                              });
                            }}
                            className="px-3 py-1.5 text-[10px] font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 hover:border-amber-400/40 rounded-lg transition-all outline-none whitespace-nowrap self-end sm:self-center"
                          >
                            ☄ Swap afternoon to Plan B
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Financial, Banking & Tax Intelligence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Consumption Tax card */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-display font-semibold text-xs uppercase tracking-wider font-bold">Consumption Tax Protocol</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-3">
                        {dossierData.consumptionTaxProtocol}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full self-start font-bold">100% Verified Refund Policy</span>
                  </div>

                  {/* Foreign Banking Dynamics */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                        <Wallet className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-display font-semibold text-xs uppercase tracking-wider font-bold">Foreign Banking Dynamics</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-3">
                        {dossierData.foreignBankingDynamics}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full self-start font-bold">Avoid Merchant DCC Traps</span>
                  </div>

                  {/* Global Expenditure Index */}
                  <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-white border-b border-white/5 pb-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <h4 className="font-display font-semibold text-xs uppercase tracking-wider font-bold">Global Expenditure Index</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-3">
                        {dossierData.globalExpenditureIndex}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-400/10">
                      <span className="text-[10px] font-mono text-blue-300">Cost Profile:</span>
                      <span className="text-[10px] font-mono text-white font-bold capitalize">{tier} Class Overhead</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Spending Breakdown & Packing Essentials */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Spending Model (7/12) */}
                  <div className="lg:col-span-7 glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <PieChart className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">Section 4: Expenditure model (with 15% Contingency)</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Lodging (Hotel/Hostel Est.)</span>
                        <span className="font-mono text-slate-200">${dossierData.costBreakdown.lodging} USD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Food & Beverage (Local Cuisine)</span>
                        <span className="font-mono text-slate-200">${dossierData.costBreakdown.food} USD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Activities & Transits</span>
                        <span className="font-mono text-slate-200">${dossierData.costBreakdown.activities} USD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-amber-400">
                        <span>Contingency Fund (15% Cushion)</span>
                        <span className="font-mono font-semibold">${dossierData.costBreakdown.contingency} USD</span>
                      </div>
                      <div className="h-px bg-white/5 my-2"></div>
                      <div className="flex items-center justify-between text-sm text-white font-bold">
                        <span>Total Estimated Outlay</span>
                        <span className="font-mono text-blue-400">${dossierData.costBreakdown.total} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Packing list (5/12) */}
                  <div className="lg:col-span-5 glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Backpack className="w-4 h-4 text-violet-400" />
                      <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider font-bold">Climate-Specific Essentials</span>
                    </div>

                    <div className="space-y-2">
                      {dossierData.packingList.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all">
                          <div className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-mono text-violet-300 font-bold">{idx + 1}</span>
                          </div>
                          <span className="text-xs text-slate-300 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
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

      {/* Interactive Activity Map Modal */}
      <ActivityMapModal
        isOpen={mapActivity !== null}
        onClose={() => setMapActivity(null)}
        activity={mapActivity}
        destinationName={destination?.name || ''}
      />
    </div>
  );
}
