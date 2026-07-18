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
}

export interface Activity {
  id: string;
  title: string;
  slot: 'Morning' | 'Afternoon' | 'Evening';
  cat: string;
  style: string;
  cost: number;
  done: boolean;
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
