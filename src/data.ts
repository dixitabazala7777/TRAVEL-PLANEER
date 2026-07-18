import { Destination, TravelStyle } from './types';

export const DESTINATIONS: Destination[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    currency: 'EUR (€)',
    language: 'French',
    safety: 82,
    bestTime: 'Apr – Jun, Sep – Oct',
    climate: 'temperate',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.25,
    styles: ['culture', 'foodie', 'relaxation']
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    currency: 'JPY (¥)',
    language: 'Japanese',
    safety: 94,
    bestTime: 'Mar – May, Oct – Nov',
    climate: 'temperate',
    img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.15,
    styles: ['culture', 'foodie', 'adventure']
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    currency: 'IDR (Rp)',
    language: 'Indonesian',
    safety: 75,
    bestTime: 'Apr – Oct',
    climate: 'tropical',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop',
    costIndex: 0.6,
    styles: ['relaxation', 'adventure', 'culture']
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    currency: 'ISK (kr)',
    language: 'Icelandic',
    safety: 97,
    bestTime: 'Jun – Aug',
    climate: 'cold',
    img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.4,
    styles: ['adventure', 'relaxation']
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    currency: 'USD ($)',
    language: 'English',
    safety: 70,
    bestTime: 'Apr – Jun, Sep – Nov',
    climate: 'temperate',
    img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.5,
    styles: ['culture', 'foodie', 'family']
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    currency: 'AED (د.إ)',
    language: 'Arabic',
    safety: 90,
    bestTime: 'Nov – Mar',
    climate: 'desert',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.35,
    styles: ['luxury', 'family', 'adventure']
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    currency: 'EUR (€)',
    language: 'Italian',
    safety: 78,
    bestTime: 'Apr – Jun, Sep – Oct',
    climate: 'temperate',
    img: 'https://images.unsplash.com/photo-1526481280694-3bfa875218a7?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.05,
    styles: ['culture', 'foodie']
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    currency: 'EUR (€)',
    language: 'Greek',
    safety: 88,
    bestTime: 'May – Sep',
    climate: 'tropical',
    img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.1,
    styles: ['relaxation', 'foodie']
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    currency: 'THB (฿)',
    language: 'Thai',
    safety: 73,
    bestTime: 'Nov – Feb',
    climate: 'tropical',
    img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1600&auto=format&fit=crop',
    costIndex: 0.55,
    styles: ['foodie', 'culture', 'adventure']
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    country: 'South Africa',
    currency: 'ZAR (R)',
    language: 'English/Afrikaans',
    safety: 65,
    bestTime: 'Nov – Mar',
    climate: 'temperate',
    img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1600&auto=format&fit=crop',
    costIndex: 0.75,
    styles: ['adventure', 'culture', 'relaxation']
  },
  {
    id: 'zurich',
    name: 'Zurich',
    country: 'Switzerland',
    currency: 'CHF (Fr)',
    language: 'German',
    safety: 96,
    bestTime: 'Jun – Sep',
    climate: 'cold',
    img: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=1600&auto=format&fit=crop',
    costIndex: 1.6,
    styles: ['relaxation', 'culture', 'family']
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    currency: 'MAD (د.م)',
    language: 'Arabic/French',
    safety: 68,
    bestTime: 'Mar – May, Sep – Nov',
    climate: 'desert',
    img: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?q=80&w=1600&auto=format&fit=crop',
    costIndex: 0.65,
    styles: ['culture', 'adventure', 'foodie']
  }
];

export const STYLES: TravelStyle[] = [
  { id: 'adventure', label: 'Adventure', icon: 'MountainSnow' },
  { id: 'culture', label: 'Culture', icon: 'Landmark' },
  { id: 'relaxation', label: 'Relaxation', icon: 'Palmtree' },
  { id: 'foodie', label: 'Foodie', icon: 'Utensils' },
  { id: 'family', label: 'Family-friendly', icon: 'Users' }
];

export interface ActivityTemplate {
  t: string;
  slot: 'Morning' | 'Afternoon' | 'Evening';
  cat: string;
  cost: number;
}

export const ACTIVITY_POOL: Record<string, ActivityTemplate[]> = {
  adventure: [
    { t: 'Guided hike through {name}\'s scenic trails', slot: 'Morning', cat: 'Adventure', cost: 35 },
    { t: 'Bike tour across the old town of {name}', slot: 'Morning', cat: 'Adventure', cost: 28 },
    { t: 'Kayak or paddleboard session on the waterfront', slot: 'Afternoon', cat: 'Adventure', cost: 42 },
    { t: 'Sunset zip-line / canopy adventure', slot: 'Afternoon', cat: 'Adventure', cost: 55 },
    { t: 'Night trek to a scenic viewpoint over {name}', slot: 'Evening', cat: 'Adventure', cost: 20 },
    { t: 'Rock climbing or bouldering session', slot: 'Afternoon', cat: 'Adventure', cost: 38 }
  ],
  culture: [
    { t: 'Guided tour of {name}\'s flagship museum', slot: 'Morning', cat: 'Culture', cost: 22 },
    { t: 'Walking tour through the historic quarter', slot: 'Morning', cat: 'Culture', cost: 15 },
    { t: 'Visit the main cathedral / temple complex', slot: 'Afternoon', cat: 'Culture', cost: 10 },
    { t: 'Local artisan market and craft workshop', slot: 'Afternoon', cat: 'Culture', cost: 18 },
    { t: 'Traditional performance or theatre show', slot: 'Evening', cat: 'Culture', cost: 45 },
    { t: 'Sunset stroll through the old palace gardens', slot: 'Evening', cat: 'Culture', cost: 8 }
  ],
  relaxation: [
    { t: 'Spa & wellness morning at a local retreat', slot: 'Morning', cat: 'Relaxation', cost: 60 },
    { t: 'Slow breakfast at a rooftop café', slot: 'Morning', cat: 'Relaxation', cost: 16 },
    { t: 'Beach or lakeside lounging session', slot: 'Afternoon', cat: 'Relaxation', cost: 5 },
    { t: 'Sunset yoga session with skyline views', slot: 'Afternoon', cat: 'Relaxation', cost: 20 },
    { t: 'Rooftop lounge with live acoustic music', slot: 'Evening', cat: 'Relaxation', cost: 30 },
    { t: 'Evening boat cruise along the coastline', slot: 'Evening', cat: 'Relaxation', cost: 48 }
  ],
  foodie: [
    { t: 'Street food crawl through the local market', slot: 'Morning', cat: 'Foodie', cost: 24 },
    { t: 'Hands-on cooking class with a local chef', slot: 'Morning', cat: 'Foodie', cost: 52 },
    { t: 'Wine or craft-beverage tasting flight', slot: 'Afternoon', cat: 'Foodie', cost: 34 },
    { t: 'Lunch at a family-run neighborhood favorite', slot: 'Afternoon', cat: 'Foodie', cost: 19 },
    { t: 'Tasting-menu dinner at an acclaimed local spot', slot: 'Evening', cat: 'Foodie', cost: 70 },
    { t: 'Late-night dessert & coffee crawl', slot: 'Evening', cat: 'Foodie', cost: 14 }
  ],
  family: [
    { t: 'Interactive science / discovery center visit', slot: 'Morning', cat: 'Family', cost: 26 },
    { t: 'Zoo, aquarium or wildlife park morning', slot: 'Morning', cat: 'Family', cost: 30 },
    { t: 'Theme park or amusement pier afternoon', slot: 'Afternoon', cat: 'Family', cost: 45 },
    { t: 'Public park picnic and playground time', slot: 'Afternoon', cat: 'Family', cost: 10 },
    { t: 'Family-friendly show or open-air cinema', slot: 'Evening', cat: 'Family', cost: 25 },
    { t: 'Ice cream walk along the main promenade', slot: 'Evening', cat: 'Family', cost: 8 }
  ]
};

export const PACKING_BASE = [
  'Passport & travel documents',
  'Phone charger & adapter',
  'Reusable water bottle',
  'Basic first-aid kit',
  'Toiletry bag',
  'Daypack / crossbody bag'
];

export const PACKING_CLIMATE: Record<string, string[]> = {
  cold: ['Thermal base layers', 'Insulated waterproof jacket', 'Wool socks', 'Beanie & gloves', 'Waterproof boots'],
  tropical: ['Sunscreen SPF 50+', 'Swimwear', 'Lightweight breathable clothing', 'Insect repellent', 'Wide-brim hat'],
  desert: ['Sunscreen SPF 50+', 'Light long-sleeve clothing (UV protection)', 'Sunglasses & scarf/shemagh', 'Extra hydration bottle', 'Lip balm with SPF'],
  temperate: ['Light rain jacket', 'Layerable sweater', 'Comfortable walking shoes', 'Umbrella']
};

export const PACKING_STYLE: Record<string, string[]> = {
  adventure: ['Hiking boots', 'Quick-dry activewear', 'Power bank', 'Action camera / GoPro'],
  culture: ['Modest / temple-appropriate outfit', 'Portable phrasebook or translator app', 'Notebook & pen'],
  relaxation: ['Sandals', 'Good book / e-reader', 'Eye mask & earplugs'],
  foodie: ['Antacids / digestive aid', 'Reusable snack container'],
  family: ['Kids\' entertainment (tablet, books)', 'Snacks for travel days', 'Spare change of clothes for kids']
};
