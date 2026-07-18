/**
 * Waypoint - Advanced AI Travel Dossier Generator Engine
 * Generates highly reliable, structured travel dossiers with zero introductory text.
 */

import { Destination, DayPlan } from './types';

export interface DossierData {
  vibeMatchScore: number;
  bestVisitingWindow: string;
  currencyCode: string;
  emergencyHotlines: string;
  reviews: string[];
  days: {
    dayNum: number;
    morningActivity: string;
    morningCost: number;
    afternoonActivity: string;
    afternoonCost: number;
    eveningActivity: string;
    eveningCost: number;
    chaosBuffer: string;
  }[];
  consumptionTaxProtocol: string;
  foreignBankingDynamics: string;
  globalExpenditureIndex: string;
  costBreakdown: {
    lodging: number;
    food: number;
    activities: number;
    contingency: number;
    total: number;
  };
  packingList: string[];
}

export const DOSSIER_DATABASE: Record<string, Omit<DossierData, 'vibeMatchScore' | 'days' | 'costBreakdown'>> = {
  paris: {
    bestVisitingWindow: 'Apr – Jun, Oct – Nov',
    currencyCode: 'EUR (€)',
    emergencyHotlines: 'Police: 17 | Ambulance: 15 | General European: 112',
    reviews: [
      'The historic Metro Line 4 is undergoing signal modernization—expect evening detours and station closures on Sundays.',
      "The Louvre is heavily overcrowded between 11 AM and 3 PM; booking a timed sunrise slot is mandatory to beat the tour buses."
    ],
    consumptionTaxProtocol: 'France levies a standard 20% VAT. Tourists can claim a tax-free refund of up to 12% on purchases exceeding €100 at participating merchants by obtaining a tax-free form and scanning it at Pablo kiosks in the airport prior to departure.',
    foreignBankingDynamics: 'Local bank ATMs are reliable; watch out for standalone tourist ATMs (like Euronet) charging high markups. Dynamic Currency Conversion (DCC) traps are prevalent at card terminals—always select to pay in Euros (EUR) instead of your home currency.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 12% cheaper than London, while local museum admissions and cultural transit are 18% higher.',
    packingList: [
      'Compact micro-weave travel umbrella',
      'Elegant waterproof trench coat',
      'Slip-on leather walking sneakers',
      'Lightweight cashmere layer scarf',
      'Anti-theft cross-body shoulder bag'
    ]
  },
  tokyo: {
    bestVisitingWindow: 'Mar – May, Oct – Nov',
    currencyCode: 'JPY (¥)',
    emergencyHotlines: 'Police: 110 | Ambulance: 119 | Fire: 119',
    reviews: [
      "Pedestrian detours are common around Shibuya Station's East Exit due to heavy construction—expect confusing signs.",
      'Tsukiji Outer Market gets extremely packed with food tours after 9:30 AM; arrive by 7:30 AM to try fresh sashimi without the 45-minute queues.'
    ],
    consumptionTaxProtocol: 'Japan charges a 10% consumption tax. International visitors can shop tax-free (saving 10%) at designated tax-free stores by presenting their physical passport at the cash register to process immediate tax exemption before payment.',
    foreignBankingDynamics: 'Japan is highly cash-dependent, although card acceptance is growing. 7-Eleven (7-Bank) and Japan Post ATMs accept international cards with low flat fees. Beware of DCC traps at high-end souvenir shops—always choose Japanese Yen (JPY) on the terminal.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 25% cheaper than New York, while local rail transport is 15% cheaper due to the high-density network.',
    packingList: [
      'High-durability clear vinyl umbrella',
      'Easy slip-off walk-support sneakers',
      'Compact hand-held cooling fan',
      'PASMO or SUICA transit IC card holder',
      'Quick-dry lightweight shell windbreaker'
    ]
  },
  bali: {
    bestVisitingWindow: 'Apr – Oct',
    currencyCode: 'IDR (Rp)',
    emergencyHotlines: 'Police: 110 | Ambulance: 118 | General: 112',
    reviews: [
      'Traffic congestion around Ubud and Canggu is severe—a 5km car ride can take over an hour. Renting a scooter with a licensed driver is recommended.',
      'The famous Lempuyang Temple (Gates of Heaven) requires a 3 to 4-hour queue just to take a photo; arrive at 5:00 AM or skip it for less crowded temples.'
    ],
    consumptionTaxProtocol: 'Indonesia levies a standard 11% VAT. Tourists can claim a tax refund of up to 10% on purchases of Rp 5,000,000 or more at participating shops by presenting tax invoice forms at major airport refund counters before departure.',
    foreignBankingDynamics: 'ATM card skimming is a serious threat in tourist hubs; only use ATMs inside authorized bank branches (such as Mandiri or BCA). Always check terminal screens to reject DCC traps and settle transactions in Indonesian Rupiah (IDR).',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 60% cheaper than Sydney, while short-haul private transport is 45% cheaper.',
    packingList: [
      'High-SPF organic coral-safe sunscreen',
      'Natural citronella insect repellent spray',
      'Ultra-light micro-fiber quick-dry towel',
      'Lightweight waterproof dry bag',
      'Breathable UV-protective linen clothing'
    ]
  },
  reykjavik: {
    bestVisitingWindow: 'Jun – Aug (Hiking), Nov – Mar (Northern Lights)',
    currencyCode: 'ISK (kr)',
    emergencyHotlines: 'Police / Ambulance / Fire: 112',
    reviews: [
      'Sudden gale-force winds and snowstorms can close Ring Road stretches within minutes, even in autumn—always check road.is before starting your engine.',
      'The Blue Lagoon can be extremely commercialized and packed with tour buses; check out Sky Lagoon or the local municipal pools for a more authentic soak.'
    ],
    consumptionTaxProtocol: 'Iceland levies a standard 24% VAT (11% on books and food). Tourists can claim a tax refund of up to 15% on purchases exceeding ISK 6,000 by presenting tax-free receipts and forms at Keflavik Airport.',
    foreignBankingDynamics: 'Iceland is virtually cash-free; cards are accepted everywhere, even for public restrooms. Local ATMs charge nominal fees but cash is rarely necessary. DCC traps are rare, but always settle transactions in Icelandic Króna (ISK).',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 35% higher than Paris, while local transit and car hire are 40% higher.',
    packingList: [
      'Windproof and waterproof Gore-Tex outer shell',
      'Thermal merino wool base layers',
      'Sturdy waterproof ankle-support hiking boots',
      'Reusable insulated thermal water bottle',
      'Touchscreen-compatible windproof gloves'
    ]
  },
  newyork: {
    bestVisitingWindow: 'Sep – Nov, Apr – Jun',
    currencyCode: 'USD ($)',
    emergencyHotlines: 'Emergency (Police, Ambulance, Fire): 911',
    reviews: [
      'The subway system is currently undergoing extensive signal upgrades—expect weekend delays, skipped express stops, and route detours.',
      'Times Square is overwhelmingly congested and full of aggressive costumed characters seeking tips; keep moving and head to Bryant Park for a peaceful breather.'
    ],
    consumptionTaxProtocol: 'New York State levies an 8.875% sales tax added at the cash register. Unlike European countries, the USA has no national VAT system and does not offer sales tax refunds for international tourists.',
    foreignBankingDynamics: 'ATMs are abundant but beware of high out-of-network fees ($3 to $7) at convenience store ATMs; use official bank ATMs (Chase, Citi, TD). Cards are widely accepted, but some food trucks and small delis remain cash-only.',
    globalExpenditureIndex: 'New York is a benchmark hub; average dining expenditures sit approximately 15% higher than London, while short-haul taxi rides are 20% cheaper.',
    packingList: [
      'Sturdy urban walking boots or sneakers',
      'Compact automatic wind-resistant umbrella',
      'Multi-pocket anti-theft daypack',
      'Noise-cancelling headphones for transit',
      'Multi-port fast charger for power banks'
    ]
  },
  dubai: {
    bestVisitingWindow: 'Nov – Mar',
    currencyCode: 'AED (Dirham)',
    emergencyHotlines: 'Police: 999 | Ambulance: 998 | Fire: 997',
    reviews: [
      'Traffic gridlock on Sheikh Zayed Road during peak hours (8-10 AM and 5-7 PM) is severe—always use the Dubai Metro to travel between Marina and Downtown.',
      'The outdoor souks can feel overwhelmingly aggressive with vendors seeking sales; polite but firm refusal is required to stroll in peace.'
    ],
    consumptionTaxProtocol: 'The UAE levies a standard 5% VAT. International tourists can claim a tax-free refund of 85% of the VAT paid (minus a small admin fee) on purchases of AED 250 or more at retail stores via Planet Payment kiosks at Dubai International Airport.',
    foreignBankingDynamics: 'ATMs are highly reliable and card payments are accepted almost everywhere, including taxis. Avoid standalone ATMs in remote souks; stick to major local banks like ENBD or ADCB. Always choose to pay in AED to avoid DCC markups.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 10% cheaper than Singapore, while high-end lodging and luxury experiences are 22% higher.',
    packingList: [
      'Polarized UV400 sunglasses',
      'Lightweight linen clothing or loose cotton layers',
      'High-protection SPF 50 sunscreen',
      'Insulated water flask to keep drinks chilled',
      'Soft pashmina or shawl for air-conditioned indoor spaces'
    ]
  },
  rome: {
    bestVisitingWindow: 'Apr – May, Sep – Oct',
    currencyCode: 'EUR (€)',
    emergencyHotlines: 'Police/Ambulance/Fire: 112 | Alternative: 113',
    reviews: [
      'The central Termini Station area is prone to aggressive pickpockets—keep backpacks in front and never accept "free" rose tokens from strangers.',
      'The Colosseum general ticket line can take over 2.5 hours under direct sun; booking a guided tour that includes skip-the-line privileges is absolutely mandatory.'
    ],
    consumptionTaxProtocol: 'Italy levies a standard 22% VAT (IVA). Tourists can claim a tax-free refund of up to 12.5% on retail purchases exceeding €154.94 at participating merchants by obtaining an invoice and validating it at customs kiosks.',
    foreignBankingDynamics: 'Stick to ATMs located inside legitimate bank branches (such as UniCredit or Intesa Sanpaolo) to prevent card-skimming. Card usage is highly prevalent, but carry a few coins for small trattoria items or public toilets. Always refuse DCC conversion.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 18% cheaper than Paris, while local public transport and metro rides are 25% cheaper.',
    packingList: [
      'Refillable steel water bottle for Roman public fountains (Nasoni)',
      'Comfortable shock-absorbing cobblestone walking shoes',
      'Wide-brimmed sun hat or fedora',
      'Lightweight scarf for entering churches (covering shoulders)',
      'Compact power bank for mapping coordinates'
    ]
  },
  santorini: {
    bestVisitingWindow: 'May – Oct',
    currencyCode: 'EUR (€)',
    emergencyHotlines: 'Police: 100 | Ambulance: 166 | Fire: 199 | General: 112',
    reviews: [
      "Oia's famous sunset viewpoint gets unsafely crowded by 5:00 PM during summer; book a restaurant table facing west or watch the sunset from Akrotiri Lighthouse to escape the crowds.",
      'The steep steps from Fira down to the old port can be covered in slippery donkey waste—taking the cable car is much cleaner and safer.'
    ],
    consumptionTaxProtocol: 'Greece levies a standard 24% VAT. Tourists can claim a tax refund of up to 14% on purchases of €50 or more at participating retail shops. Collect your tax-free form and get it stamped at Santorini Airport.',
    foreignBankingDynamics: "Standalone ATMs along Oia's main walkway charge excessive convenience fees (up to €6 per withdrawal); use official bank ATMs (like Piraeus Bank or Alpha Bank) in Fira. Most local tavernas accept cards, but some beach bars prefer cash.",
    globalExpenditureIndex: 'Average dining expenditures sit approximately 15% higher than Athens, while private transport between towns is 30% higher due to island monopolies.',
    packingList: [
      'Polarized sunglasses for intense white-cliff reflections',
      'High-SPF water-resistant mineral sunscreen',
      'Sturdy grip sandals or light trail sneakers',
      'Breathable linen cover-up shirts',
      'Waterproof dry bag for volcanic hot spring boat swims'
    ]
  },
  bangkok: {
    bestVisitingWindow: 'Nov – Feb',
    currencyCode: 'THB (฿)',
    emergencyHotlines: 'Police: 191 | Tourist Police: 1155 | Ambulance: 1669',
    reviews: [
      'The traffic congestion is legendary—taking a taxi during rush hour can mean sitting motionless for 2 hours. Always utilize the BTS Skytrain or MRT Subway.',
      'Tuk-tuk drivers outside the Grand Palace frequently run scams claiming the temple is closed for a holiday to redirect you to gem stores; ignore them and walk straight to the official gate.'
    ],
    consumptionTaxProtocol: "Thailand levies a 7% VAT. International tourists can claim a VAT refund of up to 5% on purchases of THB 2,000 or more per day per store. Look for 'VAT Refund for Tourists' signs and request a PP10 form.",
    foreignBankingDynamics: 'All Thai ATMs charge a standard, steep fee of THB 220 ($6) for international cards per withdrawal; withdraw maximum amounts at once. Carry cash, as street food stalls and markets do not accept foreign credit cards.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 65% cheaper than Munich, while high-density public rail fares are 40% cheaper.',
    packingList: [
      'Ultra-light, highly compact pocket umbrella',
      'Slip-on lightweight shoes (easy to remove at temple entrances)',
      'DEET-free high-strength mosquito repellent spray',
      'Breathable, long, loose pants (mandatory for temple modesty)',
      'Reusable hand sanitizing wipes for street food tours'
    ]
  },
  capetown: {
    bestVisitingWindow: 'Nov – Mar',
    currencyCode: 'ZAR (R)',
    emergencyHotlines: 'Police: 10111 | Ambulance: 10177 | General: 112',
    reviews: [
      "Table Mountain cableway can close with zero warning due to high winds and 'tablecloth' cloud cover—always book flexible tickets and go the moment you see a clear sky.",
      'Do not walk alone on quiet city streets or dark beaches after sunset; use reputable ride-shares like Uber which are highly secure and cheap.'
    ],
    consumptionTaxProtocol: 'South Africa levies a standard 15% VAT. International tourists can claim a tax refund of up to 14% on purchases exceeding ZAR 250 by presenting tax invoices, passport, and the physical goods for inspection at Cape Town International Airport.',
    foreignBankingDynamics: 'ATMs are widely available but use only those located inside secure shopping centers or bank lobbies to prevent card-skimming. Card payment is standard at restaurants, but keep small ZAR cash for tipping parking attendants.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 45% cheaper than Barcelona, while top-tier wine-estate tours are 50% cheaper.',
    packingList: [
      'High-SPF reef-safe sport sunscreen',
      'Polarized sunglasses for intense ocean glare',
      'Lightweight windbreaker or softshell jacket',
      'Grip-sole trail hiking sneakers',
      'Safe-deposit money belt or small body pouch'
    ]
  },
  zurich: {
    bestVisitingWindow: 'Jun – Aug, Dec – Feb (Skiing)',
    currencyCode: 'CHF (Swiss Franc)',
    emergencyHotlines: 'Police: 117 | Ambulance: 144 | Fire: 118 | General: 112',
    reviews: [
      'Dining out in Zurich is staggeringly expensive—a simple burger and fries can easily cost CHF 35. Pick up fresh pre-made meals from Coop or Migros supermarkets to save budget.',
      'The city rail network is extremely punctual; arriving even 1 minute late means you will miss your connection, so synchronize your clock to local Swiss time.'
    ],
    consumptionTaxProtocol: 'Switzerland levies a standard 8.1% VAT. International tourists can claim a tax-free refund of up to 6.5% on purchases exceeding CHF 300 in a single store by presenting a global blue refund form at airport customs before departure.',
    foreignBankingDynamics: 'Swiss ATMs are exceptionally secure; cards are universally accepted, even for purchasing single street-car tickets. Standalone ATMs rarely have fees, but always decline DCC to settle transactions in Swiss Francs (CHF).',
    globalExpenditureIndex: "Zurich is one of the world's costliest cities; average dining expenditures sit approximately 42% higher than Paris, while local transit is 50% higher.",
    packingList: [
      'Heavy thermal layers (merino wool) or fleece',
      'Slip-resistant winter walking boots or robust sneakers',
      'Premium UV-protection mountain sunglasses',
      'Compact rainproof hardshell jacket',
      'Swiss rail pass sleeve or digital travel wallet'
    ]
  },
  marrakech: {
    bestVisitingWindow: 'Mar – May, Sep – Nov',
    currencyCode: 'MAD (Dirham)',
    emergencyHotlines: 'Police: 19 | Ambulance/Fire: 15 | Tourist Police: +212 524 38 46 01',
    reviews: [
      "The Medina's maze of alleyways has no signal for Google Maps—locals will offer to guide you and then aggressively demand huge fees; download an offline map app like Maps.me.",
      'Jemaa el-Fnaa square at night is full of snake charmers and monkey handlers who will place animals on you without asking and demand steep payments; keep a polite but firm distance.'
    ],
    consumptionTaxProtocol: 'Morocco levies a standard 20% VAT. Tourists can claim a tax refund of up to 15% on retail purchases of MAD 2,000 or more at accredited stores by obtaining a tax-free border form and validating it at the airport customs office.',
    foreignBankingDynamics: 'Morocco is a cash-dominated economy. Card payments are rare outside of high-end hotels and restaurants. Local ATMs (BMCE or Attijariwafa Bank) are reliable but charge a standard processing fee of MAD 20-30 per transaction.',
    globalExpenditureIndex: 'Average dining expenditures sit approximately 50% cheaper than Rome, while traditional artisanal goods are 40% cheaper when bargained effectively.',
    packingList: [
      'Wide-brimmed cotton sun hat or cheche headscarf',
      'High-protection non-greasy sunscreen',
      'Lightweight breathable cotton clothes (covering shoulders and knees)',
      'Reusable hydrating electrolyte packets',
      'Anti-dust face mask or bandana for desert excursions'
    ]
  }
};

// Generic fallback data in case destination id is not matched
const DEFAULT_DOSSIER: Omit<DossierData, 'vibeMatchScore' | 'days' | 'costBreakdown'> = {
  bestVisitingWindow: 'May – Sep',
  currencyCode: 'USD ($)',
  emergencyHotlines: 'Police/Ambulance: 112 | 911',
  reviews: [
    'Popular scenic viewpoints get extremely crowded between 11 AM and 3 PM; consider booking early slots.',
    'Public transport is undergoing regular upgrades—always check current regional routes online.'
  ],
  consumptionTaxProtocol: 'The native consumption tax rate ranges from 5% to 15%. Visitors can seek refunds at select transit hubs by preserving tax invoices.',
  foreignBankingDynamics: 'Foreign card transactions generally incur a 2-3% network markup. Stick to official bank branch ATMs to prevent skimming.',
  globalExpenditureIndex: 'Average dining and travel overhead is generally consistent with regional benchmarks.',
  packingList: [
    'Compact wind-resistant travel umbrella',
    'High-SPF protection sunscreen',
    'Comfortable orthotic walking shoes',
    'Reusable thermal drink bottle',
    'Emergency power bank charger'
  ]
};

// Map of plan B sentences by destination and day
export const CHAOS_BUFFERS: Record<string, string[]> = {
  paris: [
    'Rain forecast? Head into the covered passages of Passage des Panoramas and Galerie Vivienne for boutique shopping and cozy bistros, completely sheltered.',
    "If Orsay museum lines are wrapped around the block, cross the Seine to the Musée de l'Orangerie for water lily panoramas, which is often less congested.",
    "If the Luxembourg Gardens are closed due to high winds, swap it for a warm hot chocolate at Angelina's or a tour of the nearby Panthéon.",
    "If Seine cruise tickets are sold out, stroll the sheltered arcades of the Place des Vosges in the Marais and visit Victor Hugo's house.",
    "If the Eiffel Tower queues are too long, head to the Montparnasse Tower Observatory deck, offering the best panoramic views of the city.",
    "In case of rain, explore the rich underground world of the Paris Catacombs or enjoy the digital art exhibitions at Atelier des Lumières.",
    'If Versailles is overcrowded, take a short train ride to Château de Vincennes, a medieval fortress with vast grounds and virtually no queues.',
    "If the Notre-Dame square is congested, cross the bridge to the quiet cloister of Église Saint-Séverin or the Shakespeare and Company bookstore.",
    "Should the outdoor flea market at Saint-Ouen be rained out, browse the antique booksellers inside the covered Marché du Livre Ancien.",
    'If the Pompidou Centre is closed, explore the nearby modern photography museum, Maison Européenne de la Photographie, in Le Marais.',
    'If any outdoor walking tour gets rained out, take shelter in the beautiful, warm glasshouses of the Jardin des Plantes.'
  ],
  tokyo: [
    "If Shibuya Crossing is engulfed in rain, seek refuge in Shibuya Sky's indoor observatory or browse the multi-floor Loft department store nearby.",
    "If Senso-ji temple grounds are too crowded, walk 10 minutes to the quiet, retro street of Hoppy Dori or seek shelter in the Tokyo National Museum.",
    'If Meiji Shrine walking paths get muddy during a downpour, head inside the Meiji Jingu Museum or visit the indoor multi-story Tokyo Plaza Harajuku.',
    "If Shinjuku Gyoen National Garden is closed, head to the Tokyo Metropolitan Government Building's free observation deck for dry panoramic city views.",
    'If tickets for the Ghibli Museum or teamLab Planet are completely sold out, visit the immersive Miraikan Museum of Emerging Science in Odaiba.',
    'In case of heavy typhoon rain, enjoy the massive indoor amusement park Tokyo Joypolis in Odaiba or the Sunshine City Aquarium in Ikebukuro.',
    'If Harajuku Takeshita Street is too packed to walk, step into the peaceful Togo Shrine gardens right next door for instant serenity.',
    'If Akihabara shopping lines are long, check out the vintage radio parts market under the train tracks or play retro games in the multi-story Taito HEY arcade.',
    'If Mt. Fuji visibility is zero from Hakone, spend the day soaking in the indoor baths of Yunessun Hot Spring Spa resort instead.',
    'If the fish auction viewing is unavailable, tour the modern architectural marvel of Tokyo International Forum and its indoor glass atrium.',
    "If any outdoor street stroll is rained out, take a food crawl through Tokyo's extensive underground department store basement basars (Depachika)."
  ],
  bali: [
    'If outdoor beach plans get rained out in Canggu, book an indoor traditional Balinese massage at a local luxury spa or attend a silver-making workshop.',
    'If monkey forest trails are closed due to aggressive monkey behavior, explore Ubud\'s indoor art market or the beautiful Blanco Renaissance Museum.',
    'If the trek to Tegallalang Rice Terraces is muddy and slippery, relax with a tropical tea tasting at a nearby sheltered ridge cafe.',
    'If heavy winds cancel fast boat departures to Nusa Penida, explore the cultural park of Garuda Wisnu Kencana or visit Uluwatu\'s indoor galleries.',
    'If temple steps are slick from tropical rain, take an authentic Balinese cooking class inside a traditional village home compound.',
    'If beach clubs are too noisy or packed, find solace at the tranquil, historical Klungkung Palace ruins in Semarapura.',
    'If sea waves are too rough for surfing, spend the afternoon taking an intensive traditional wood-carving class in Mas village.',
    'In case of heavy afternoon monsoons, explore the private Indonesian collections inside the Museum Pasifika in Nusa Dua.'
  ],
  reykjavik: [
    'If the wind is howling too hard for outdoor geysers, head inside Perlan Museum\'s indoor ice cave and 360-degree interactive climate exhibits.',
    'If Northern Lights visibility is zero due to cloud cover, book a digital Northern Lights simulation show at the Aurora Reykjavik Centre.',
    'If Golden Circle mountain passes are blocked by snow, take a cozy food walk through Reykjavik\'s downtown soup kitchens and bakeries.',
    'If the Blue Lagoon is closed due to volcanic seismic activity, drive to the Laugarvatn Fontana steam baths or the secret geothermal lagoons of Flúðir.',
    'If sea swells cancel whale watching boat departures, tour the beautiful Harpa Concert Hall or visit the Whales of Iceland museum nearby.',
    'Should storm force winds strike, spend an educational day exploring the indoor National Museum of Iceland in downtown Reykjavik.'
  ],
  newyork: [
    'If walking the High Line gets rained out, take refuge in Chelsea Market for gourmet food stalls or browse the modern art at the Whitney Museum nearby.',
    'If ferry queues to the Statue of Liberty are over 2 hours long, view the statue for free from the sheltered indoor decks of the Staten Island Ferry.',
    'If Central Park walking paths are muddy and slick, explore the indoor galleries of the Metropolitan Museum of Art or the American Museum of Natural History.',
    'If the Empire State Building observatory is masked in heavy fog, head to the immersive digital exhibits at Summit One Vanderbilt which offers beautiful indoor views.',
    'If outdoor walking tours are rained out, catch a classic Broadway matinee or browse the legendary collections of the Morgan Library & Museum.',
    'Should Fifth Avenue strolls get rained out, take shelter in the majestic, cathedral-like vaults of the Grand Central Terminal.'
  ],
  dubai: [
    'If the desert heat becomes unbearable, head inside the vast Dubai Mall to experience the indoor Dubai Aquarium or glide on the Olympic-sized ice rink.',
    'If outdoor dune buggy tours are cancelled due to desert sandstorms, visit the beautiful Museum of the Future or explore the indoor tropical rainforest at The Green Planet.',
    'If high winds close the Burj Khalifa outdoor deck, experience the virtual reality skywalk and glass slides inside Sky Views Observatory, fully indoors.',
    'If outdoor waterpark queues are too long, seek indoor winter fun by skiing down real snow slopes at Ski Dubai in Mall of the Emirates.',
    'If walking the Al Fahidi Historical Neighborhood is too hot, visit the fully air-conditioned Coffee Museum inside traditional wind-tower structures.',
    'If seaside beaches are too scorching, enjoy the massive air-conditioned indoor theme park IMG Worlds of Adventure.'
  ],
  rome: [
    'If Colosseum queues are wrapped around the block, explore the subterranean ruins of San Clemente Basilica, featuring three layers of history completely indoors.',
    'If outdoor walking around Trevi Fountain is too crowded, head inside the stunning, sheltered Pantheon or visit the nearby Doria Pamphilj gallery.',
    'If rain dampens your Roman Forum walk, explore the extensive classical sculptures inside the Capitoline Museums or the air-conditioned Palazzo Altemps.',
    'If Vatican Museums general admission is sold out, tour the magnificent Castel Sant\'Angelo fortress and its sheltered papal apartments nearby.',
    'If any open-air ruins walking tour gets rained out, take a professional indoor pasta and tiramisu-making masterclass inside a cozy Roman kitchen.'
  ],
  santorini: [
    'If the Meltemi summer winds are blowing too hard for outdoor catamaran cruises, tour the indoor prehistoric archaeological site of Akrotiri, buried in volcanic ash.',
    'If beach paths in Kamari are too hot to walk on, visit the indoor Santo Wines estate for a sheltered volcanic wine tasting with glass-front caldera views.',
    'If Oia\'s pedestrian lanes are gridlocked with tourists, escape to the quiet, authentic medieval village of Pyrgos nestled high in the hills.',
    'If ferry disruptions prevent inter-island day trips, visit the Museum of Prehistoric Thera in Fira or the sheltered Tomato Industrial Museum in Vlychada.',
    'If walking the cliffside trail to Imerovigli gets rained out, relax with a traditional Greek cooking demonstration inside a sheltered mountain tavern.'
  ],
  bangkok: [
    'If the afternoon heat or a tropical rainstorm hits while temple-hopping, seek shelter in the massive, air-conditioned ICONSIAM mall and its indoor floating market bazaar.',
    'If long queues plague the Grand Palace, walk to the nearby quiet, air-conditioned National Museum or visit the stunning Jim Thompson House.',
    'If outdoor street food stalls on Yaowarat Road are washed out by monsoon rain, take a culinary journey inside the clean, sheltered food halls of MBK Center or Siam Paragon.',
    'If Chatuchak Weekend Market is too overwhelming and hot, head to the air-conditioned indoor shopping maze of Platinum Fashion Mall.',
    'If walking tours get rained out, book an immersive 2-hour traditional Thai massage at a high-quality sheltered spa franchise like Let\'s Relax.'
  ],
  capetown: [
    'If high winds close the Table Mountain cableway, take a scenic coastal drive to the Cape Point vineyards or explore the sheltered Two Oceans Aquarium at the V&A Waterfront.',
    'If ferry departures to Robben Island are suspended due to rough sea swells, tour the world-class Zeitz Museum of Contemporary Art Africa (MOCAA) housed in a historic grain silo.',
    'If rain dampens your Kirstenbosch Botanical Gardens hike, indulge in a sheltered wine tasting and lunch inside the historic cellars of Groot Constantia.',
    'If heavy swells prevent surfing at Muizenberg beach, explore the vibrant indoor food stalls and live music at the Bay Harbour Market in Hout Bay.',
    'If wind or rain closes the Cape Peninsula coastal roads, explore the indoor galleries of the South African National Gallery.'
  ],
  zurich: [
    'If hiking trails around Uetliberg are muddy and slick, explore the extensive collections of the Swiss National Museum (Landesmuseum) located in an indoor castle next to the station.',
    'If outdoor lake cruises are rained out, indulge your sweet tooth with an indoor interactive chocolate tour at the Lindt Home of Chocolate in Kilchberg.',
    'If heavy rainfall dampens your stroll along Bahnhofstrasse, explore the sheltered modern art exhibitions inside Kunsthaus Zurich, Switzerland\'s largest art museum.',
    'If mountain passes are blocked by heavy snowfall, spend the day soaking in the warm thermal baths of Thermalbad & Spa Zurich, built inside a historic stone brewery.',
    'If outdoor boat tours are suspended, catch an afternoon classical concert inside the world-renowned Tonhalle Zurich or tour the FIFA Museum.'
  ],
  marrakech: [
    'If the Medina\'s outdoor souks get too hot and chaotic, seek tranquility inside the beautiful, sheltered ruins of El Badi Palace or the Bahia Palace.',
    'If dust storms cancel hot air balloon tours, visit the indoor Musée de Marrakech or browse the exquisite traditional textiles inside the Dar Si Said Museum.',
    'If Jardin Majorelle is overbooked and crowded, head to the peaceful, sheltered Le Jardin Secret nestled inside an elegant Medina riad.',
    'If rain dampens your day trip to the Atlas Mountains, book an authentic Moroccan Hammam scrub and steam bath experience inside a luxury local bathhouse.',
    'If walking tours are rained out, join an indoor cooking masterclass to learn the art of slow-cooked lamb and lemon tagines inside a peaceful courtyard riad.'
  ]
};

/**
 * Normalizes destination keys for lookup
 */
function getDestKey(dest: Destination): string {
  const nameLower = dest.name.toLowerCase();
  if (nameLower.includes('paris')) return 'paris';
  if (nameLower.includes('tokyo')) return 'tokyo';
  if (nameLower.includes('bali')) return 'bali';
  if (nameLower.includes('reykjavik') || nameLower.includes('reyk')) return 'reykjavik';
  if (nameLower.includes('york')) return 'newyork';
  if (nameLower.includes('dubai')) return 'dubai';
  if (nameLower.includes('rome')) return 'rome';
  if (nameLower.includes('santorini')) return 'santorini';
  if (nameLower.includes('bangkok')) return 'bangkok';
  if (nameLower.includes('cape town') || nameLower.includes('capetown')) return 'capetown';
  if (nameLower.includes('zurich') || nameLower.includes('zürich')) return 'zurich';
  if (nameLower.includes('marrakech') || nameLower.includes('marrakesh')) return 'marrakech';
  return 'default';
}

/**
 * Returns a detailed Chaos Buffer (Plan B) sentence for a specific day
 */
export function getChaosBuffer(dest: Destination, dayNum: number): string {
  const key = getDestKey(dest);
  const list = CHAOS_BUFFERS[key] || DEFAULT_DOSSIER.packingList;
  const idx = (dayNum - 1) % list.length;
  return list[idx] || "If weather or disruptions impact your scheduled outdoor stops, swap to nearby indoor museums or historic cafés.";
}

/**
 * Generates the full structured Dossier data for the given destination, days, vibe match score, and tier.
 */
export function generateDossierData(
  dest: Destination,
  days: number,
  vibeScore: number,
  tier: 'budget' | 'moderate' | 'luxury',
  itineraryDays: DayPlan[]
): DossierData {
  const key = getDestKey(dest);
  const baseDossier = DOSSIER_DATABASE[key] || DEFAULT_DOSSIER;

  // Calculate day-by-day blocks using our structured activities
  const daysData: DossierData['days'] = [];
  for (let i = 1; i <= days; i++) {
    const itineraryDay = itineraryDays.find(d => d.day === i) || (itineraryDays.length > 0 ? itineraryDays[(i - 1) % itineraryDays.length] : null);
    
    let morningAct = `Explore ${dest.name}'s scenic highlights`;
    let morningCost = tier === 'budget' ? 12 : tier === 'moderate' ? 25 : 55;
    let afternoonAct = `Historic architectural tour of local districts`;
    let afternoonCost = tier === 'budget' ? 15 : tier === 'moderate' ? 35 : 75;
    let eveningAct = `Traditional culinary event and dinner`;
    let eveningCost = tier === 'budget' ? 22 : tier === 'moderate' ? 45 : 120;

    if (itineraryDay && itineraryDay.slots) {
      const morn = itineraryDay.slots.Morning?.[0];
      if (morn) {
        morningAct = morn.title;
        morningCost = Math.round(morn.cost);
      }
      const aft = itineraryDay.slots.Afternoon?.[0];
      if (aft) {
        afternoonAct = aft.title;
        afternoonCost = Math.round(aft.cost);
      }
      const eve = itineraryDay.slots.Evening?.[0];
      if (eve) {
        eveningAct = eve.title;
        eveningCost = Math.round(eve.cost);
      }
    }

    daysData.push({
      dayNum: i,
      morningActivity: morningAct,
      morningCost,
      afternoonActivity: afternoonAct,
      afternoonCost,
      eveningActivity: eveningAct,
      eveningCost,
      chaosBuffer: getChaosBuffer(dest, i)
    });
  }

  // Cost estimates
  let dailyLodging = tier === 'budget' ? 65 : tier === 'moderate' ? 140 : 350;
  let dailyFood = tier === 'budget' ? 30 : tier === 'moderate' ? 60 : 150;
  
  // Calculate activities cost directly
  let totalAct = daysData.reduce((acc, d) => acc + d.morningCost + d.afternoonCost + d.eveningCost, 0);
  let totalLodging = dailyLodging * days;
  let totalFood = dailyFood * days;
  let contingency = Math.round((totalLodging + totalFood + totalAct) * 0.15);
  let total = totalLodging + totalFood + totalAct + contingency;

  return {
    vibeMatchScore: vibeScore,
    bestVisitingWindow: baseDossier.bestVisitingWindow,
    currencyCode: baseDossier.currencyCode,
    emergencyHotlines: baseDossier.emergencyHotlines,
    reviews: baseDossier.reviews,
    days: daysData,
    consumptionTaxProtocol: baseDossier.consumptionTaxProtocol,
    foreignBankingDynamics: baseDossier.foreignBankingDynamics,
    globalExpenditureIndex: baseDossier.globalExpenditureIndex,
    costBreakdown: {
      lodging: totalLodging,
      food: totalFood,
      activities: totalAct,
      contingency,
      total
    },
    packingList: baseDossier.packingList
  };
}

/**
 * Generates the clean, un-introductory text layout exactly matching the user instruction format.
 */
export function generateDossierTextString(data: DossierData, dest: Destination): string {
  let output = `1. DESTINATION SNAPSHOT\n`;
  output += `- Vibe Match %: ${data.vibeMatchScore}% | Best Season: ${data.bestVisitingWindow} | Currency: ${data.currencyCode} | Local Emergency Hotline Numbers: ${data.emergencyHotlines}\n\n`;

  output += `LIVE REVIEW DASHBOARD:\n`;
  data.reviews.forEach((review, idx) => {
    output += `- Review ${idx + 1}: "${review}"\n`;
  });
  output += `\n`;

  output += `2. DAY-BY-DAY SELF-HEALING ITINERARY\n`;
  data.days.forEach(day => {
    output += `- [Day ${day.dayNum}]\n`;
    output += `- Morning: ${day.morningActivity} | Cost: ($${day.morningCost} USD)\n`;
    output += `- Afternoon: ${day.afternoonActivity} | Cost: ($${day.afternoonCost} USD)\n`;
    output += `- Evening: ${day.eveningActivity} | Cost: ($${day.eveningCost} USD)\n`;
    output += `- **CHAOS BUFFER (Plan B)**: ${day.chaosBuffer}\n\n`;
  });

  output += `3. FINANCIAL, BANKING & TAX INTELLIGENCE\n`;
  output += `- Consumption Tax Protocol: ${data.consumptionTaxProtocol}\n`;
  output += `- Foreign Banking Dynamics: ${data.foreignBankingDynamics}\n`;
  output += `- Global Expenditure Index: ${data.globalExpenditureIndex}\n\n`;

  output += `4. COST MODEL & PACKING CORNER\n`;
  output += `- Lodging: $${data.costBreakdown.lodging} USD\n`;
  output += `- Food: $${data.costBreakdown.food} USD\n`;
  output += `- Activities: $${data.costBreakdown.activities} USD\n`;
  output += `- 15% Contingency Buffer: $${data.costBreakdown.contingency} USD\n`;
  output += `- Exactly 5 climate-specific packing essentials:\n`;
  data.packingList.forEach((item, idx) => {
    output += `  ${idx + 1}. ${item}\n`;
  });

  return output.trim();
}
