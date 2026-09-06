export interface Destination {
  id: string;
  name: string;
  country: string;
  currency: string;
  language: string;
  safety: number;
  bestTime: string;
  climate: 'cold' | 'tropical' | 'desert' | 'temperate';
  img: string;
  costIndex: number;
  styles: string[];
  timezoneOffset: number; // UTC offset in hours
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    embassyNote: string;
  };
  etiquette: {
    rule: string;
    detail: string;
  }[];
  phrases: {
    native: string;
    phonetic: string;
    meaning: string;
  }[];
  disruptionRiskByMonth: number[]; // 12 values for Jan to Dec (0 to 100)
  bingo: string[]; // 9 items for 3x3 bingo grid
  archetypeWeights: Record<string, number>; // Weights for travel styles (e.g., culture: 95, adventure: 20)
  culturalEtiquette: string;
  localScamToAvoid: string;
  emergencyHotline: string;
}

export interface Activity {
  id: string;
  title: string;
  slot: 'Morning' | 'Afternoon' | 'Evening';
  cat: string;
  style: string;
  cost: number;
  done: boolean;
  notes?: string;
}

export interface PackingItem {
  id: string;
  label: string;
  checked: boolean;
  custom: boolean;
}

export interface TravelStyle {
  id: string;
  label: string;
  icon: string;
}

export interface DayPlan {
  day: number;
  slots: {
    Morning: Activity[];
    Afternoon: Activity[];
    Evening: Activity[];
  };
}

export type BudgetTier = 'budget' | 'moderate' | 'luxury';

export interface WeatherAlert {
  type: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  description: string;
  advice: string;
}

export interface WeatherAlertResponse {
  alerts: WeatherAlert[];
  summary: string;
}

export interface SafeZone {
  name: string;
  type: string;
  location: string;
  why: string;
}
