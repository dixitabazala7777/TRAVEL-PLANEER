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
    styles: ['culture', 'foodie', 'relaxation'],
    timezoneOffset: 1,
    emergency: {
      police: '17',
      ambulance: '15',
      fire: '18',
      embassyNote: 'US Embassy Paris: 2 Avenue Gabriel, 75008 Paris (Ph: +33 1 43 12 22 22)'
    },
    etiquette: [
      { rule: 'Say Bonjour', detail: 'Always greet shopkeepers, waiters, or strangers with "Bonjour" before starting a conversation, or it will be seen as extremely rude.' },
      { rule: 'Low Dining Volume', detail: 'Keep conversation volumes moderate in restaurants; speaking loudly in public is frowned upon.' },
      { rule: 'Tipping Rules', detail: 'Service is included (service compris) on bills. Rounding up to the nearest €1-€5 for good service is appreciated but optional.' }
    ],
    phrases: [
      { native: 'Bonjour', phonetic: 'bohn-zhoor', meaning: 'Hello / Good morning' },
      { native: 'S\'il vous plaît', phonetic: 'seel voo pleh', meaning: 'Please' },
      { native: 'Merci beaucoup', phonetic: 'mair-see boh-koo', meaning: 'Thank you very much' },
      { native: 'Parlez-vous anglais ?', phonetic: 'par-lay voo ahn-gleh', meaning: 'Do you speak English?' },
      { native: 'L\'addition, s\'il vous plaît', phonetic: 'lah-dee-see-ohn seel voo pleh', meaning: 'The bill, please' }
    ],
    disruptionRiskByMonth: [35, 30, 20, 15, 10, 5, 5, 10, 15, 20, 25, 40], // winter freezes, summer transport strikes
    bingo: [
      'Picnic near Eiffel Tower',
      'Order a crepe from a street stand',
      'Take a selfie on Pont Alexandre III',
      'Try a warm morning pain au chocolat',
      'Get lost in the Louvre or Orsay museum',
      'Find a hidden cafe in Le Marais',
      'Navigate the Paris Metro solo',
      'Buy a vintage book along the Seine',
      'Ascend the steps of Sacré-Cœur'
    ],
    archetypeWeights: {
      culture: 100,
      foodie: 95,
      relaxation: 80,
      adventure: 30,
      family: 75
    },
    culturalEtiquette: 'Always greet with "Bonjour" or "Bonsoir" upon entering shops or starting conversations. Keep voice levels low in restaurants.',
    localScamToAvoid: 'Be cautious of the "string bracelet" trick around Sacré-Cœur, petition signatures from fake deaf associations, or unattended bags near the Eiffel Tower.',
    emergencyHotline: 'Police: 17, Ambulance: 15, General European Emergency: 112'
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
    styles: ['culture', 'foodie', 'adventure'],
    timezoneOffset: 9,
    emergency: {
      police: '110',
      ambulance: '119',
      fire: '119',
      embassyNote: 'US Embassy Tokyo: 1-10-5 Akasaka, Minato-ku, Tokyo 107-8420 (Ph: +81 3-3224-5000)'
    },
    etiquette: [
      { rule: 'No Public Eating', detail: 'Eating or drinking while walking is considered bad manners. Consume food at the place of purchase.' },
      { rule: 'No Tipping', detail: 'Tipping is strictly not customary and can cause confusion. Excellent service is standard.' },
      { rule: 'Escalator Walkways', detail: 'Stand on the left side of the escalator, keeping the right side clear for walkers (in Tokyo; reversed in Osaka).' }
    ],
    phrases: [
      { native: 'Konnichiwa', phonetic: 'kon-nee-chee-wah', meaning: 'Hello' },
      { native: 'Arigatou gozaimasu', phonetic: 'ah-ree-gah-toe go-zye-mass', meaning: 'Thank you very much' },
      { native: 'Sumimasen', phonetic: 'soo-mee-mah-sen', meaning: 'Excuse me / Sorry' },
      { native: 'Kore wa ikura desu ka ?', phonetic: 'ko-reh wah ee-koo-rah dess kah', meaning: 'How much is this?' },
      { native: 'Eigo ga hanasemasu ka ?', phonetic: 'ay-go gah hah-nah-seh-mass kah', meaning: 'Can you speak English?' }
    ],
    disruptionRiskByMonth: [15, 10, 15, 20, 20, 35, 40, 55, 60, 45, 15, 10], // typhoons in Jul-Oct, spring sakura peaks
    bingo: [
      'Eat ramen from a vending machine shop',
      'Walk across Shibuya Crossing',
      'Hear the giant bells of Senso-ji',
      'Use a high-tech Japanese toilet',
      'Buy a weird drink from a green vending machine',
      'Wander through Akihabara electric town',
      'Spot Mt. Fuji from a skyscraper observatory',
      'Try fresh sushi at Toyosu or Tsukiji market',
      'Listen to the neon bustle of Shinjuku at night'
    ],
    archetypeWeights: {
      culture: 95,
      foodie: 100,
      relaxation: 50,
      adventure: 70,
      family: 85
    },
    culturalEtiquette: 'Do not eat or drink while walking. Avoid talking loudly on trains, stand on the left of escalators, and never tip.',
    localScamToAvoid: 'Watch out for touts in Roppongi/Kabukicho offering "cheap drinks" or free entry, leading to excessive credit card charges.',
    emergencyHotline: 'Police: 110, Ambulance/Fire: 119'
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
    styles: ['relaxation', 'adventure', 'culture'],
    timezoneOffset: 8,
    emergency: {
      police: '110',
      ambulance: '118',
      fire: '113',
      embassyNote: 'US Consular Agency Bali: Jl. Tantular No. 32, Renon, Denpasar (Ph: +62 361 233 605)'
    },
    etiquette: [
      { rule: 'Temple Dress Code', detail: 'Cover shoulders and knees. Sarongs are usually available to rent or borrow at temple entrances.' },
      { rule: 'Right Hand Only', detail: 'Use your right hand for eating, shaking hands, and handing items. The left hand is considered unclean.' },
      { rule: 'Respect Offerings', detail: 'Do not step on the small palm-leaf canang sari offerings placed on pathways and doorways.' }
    ],
    phrases: [
      { native: 'Selamat pagi', phonetic: 'seh-lah-mat pah-gee', meaning: 'Good morning' },
      { native: 'Terima kasih', phonetic: 'teh-ree-mah kah-see', meaning: 'Thank you' },
      { native: 'Sama-sama', phonetic: 'sah-mah sah-mah', meaning: 'You are welcome' },
      { native: 'Berapa harganya ?', phonetic: 'beh-rah-pah har-gah-nyah', meaning: 'How much is it?' },
      { native: 'Bisa bicara bahasa Inggris ?', phonetic: 'bee-sah bee-chah-rah bah-hah-sah ing-gris', meaning: 'Can you speak English?' }
    ],
    disruptionRiskByMonth: [75, 70, 60, 45, 20, 10, 5, 5, 10, 25, 50, 70], // heavy rainy season Nov-Mar
    bingo: [
      'Eat a meal at a local beach Warung',
      'Visit Ubud Monkey Forest',
      'See the sunset at Uluwatu Temple',
      'Sip from a fresh young coconut',
      'Climb or gaze at Mount Batur',
      'Walk through Tegalalang rice terraces',
      'Take a photo of a traditional gates',
      'Receive a flower blessing',
      'Watch a traditional Kecak dance'
    ],
    archetypeWeights: {
      culture: 85,
      foodie: 70,
      relaxation: 100,
      adventure: 90,
      family: 75
    },
    culturalEtiquette: 'Cover shoulders and knees at temples with a sarong. Use your right hand to hand over items or eat, and don\'t step on offerings.',
    localScamToAvoid: 'Avoid unauthorized money changers offering higher rates with hidden commission; stick to authorized, glass-fronted offices.',
    emergencyHotline: 'Police: 110, Ambulance: 118, Fire: 113'
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
    styles: ['adventure', 'relaxation'],
    timezoneOffset: 0,
    emergency: {
      police: '112',
      ambulance: '112',
      fire: '112',
      embassyNote: 'US Embassy Reykjavik: Engjateigur 7, 105 Reykjavik (Ph: +354 595 2200)'
    },
    etiquette: [
      { rule: 'Shower before Spas', detail: 'You must wash thoroughly with soap without a swimsuit before entering thermal pools and geothermal lagoons.' },
      { rule: 'Do Not Drive Off-Road', detail: 'Off-road driving is strictly illegal and heavily fined to preserve fragile subarctic environments.' },
      { rule: 'No Bottle Water', detail: 'Tap water is exceptionally pure. Ordering bottled water is unnecessary and socially discouraged.' }
    ],
    phrases: [
      { native: 'Góðan daginn', phonetic: 'go-than die-yin', meaning: 'Good day / Hello' },
      { native: 'Takk fyrir', phonetic: 'tahk feer-ir', meaning: 'Thank you' },
      { native: 'Gjörðu svo vel', phonetic: 'gyur-thuh svo vel', meaning: 'Please / You are welcome' },
      { native: 'Hvað kostar þetta ?', phonetic: 'kvath kos-tar thet-ta', meaning: 'How much does this cost?' },
      { native: 'Talarðu ensku ?', phonetic: 'tah-lar-thuh en-skuh', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [80, 75, 70, 50, 25, 15, 10, 10, 30, 55, 70, 85], // winter gales, dark days, snow blockages
    bingo: [
      'Take a dip in a hot thermal pool',
      'Behold the Hallgrímskirkja Cathedral',
      'Taste an Icelandic hot dog with all sauces',
      'Spot the Northern Lights or Midnight Sun',
      'Drive or tour the Golden Circle route',
      'Feel the mist of Gullfoss Waterfall',
      'Walk on a black sand beach',
      'See puffins along the coastal cliffs',
      'Try local rye bread baked in the ground'
    ],
    archetypeWeights: {
      culture: 70,
      foodie: 60,
      relaxation: 80,
      adventure: 100,
      family: 65
    },
    culturalEtiquette: 'Always shower thoroughly without a swimsuit before entering geothermal pools. Never drive off-road to protect the fragile environment.',
    localScamToAvoid: 'Do not pay for bottled water (tap water is extremely pure). Avoid driving without checking Vedur.is for sudden weather gales.',
    emergencyHotline: 'Universal Emergency: 112'
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
    styles: ['culture', 'foodie', 'family'],
    timezoneOffset: -5,
    emergency: {
      police: '911',
      ambulance: '911',
      fire: '911',
      embassyNote: 'US Federal Office Center, Manhattan, NY. Dial 311 for local municipal assistance.'
    },
    etiquette: [
      { rule: 'Tipping 18-22%', detail: 'Tipping at sit-down dining is strictly standard; tip 18% to 22% of the pre-tax bill.' },
      { rule: 'Keep Moving', detail: 'Don\'t block sidewalks to look at maps. Step to the side next to buildings to preserve foot-traffic flow.' },
      { rule: 'MetroCard Swipes', detail: 'Be ready with your card or contactless device at the turnstile to prevent line jams.' }
    ],
    phrases: [
      { native: 'How\'s it going ?', phonetic: 'howz it go-ing', meaning: 'Friendly greeting' },
      { native: 'Can I get a... ?', phonetic: 'kan eye get ah', meaning: 'Polite order syntax' },
      { native: 'Excuse me', phonetic: 'eks-kyooz mee', meaning: 'Passing through crowds' },
      { native: 'Where is the subway ?', phonetic: 'wair iz thuh suhb-way', meaning: 'Asking directions' },
      { native: 'Keep the change', phonetic: 'keep thuh chaynj', meaning: 'For small service tips' }
    ],
    disruptionRiskByMonth: [45, 40, 25, 15, 10, 5, 10, 15, 15, 15, 20, 35], // heavy winter snow, hot summer storms
    bingo: [
      'Eat a slice of hot NY-style dollar pizza',
      'Walk across the Brooklyn Bridge',
      'Wander through Central Park\'s ramble',
      'Catch a yellow taxi or navigate the subway',
      'See a Broadway show or off-Broadway play',
      'Ascend the Empire State or Rockefeller Center',
      'Visit Times Square late at night',
      'Get a classic bagel with cream cheese',
      'Explore the High Line elevated park'
    ],
    archetypeWeights: {
      culture: 100,
      foodie: 95,
      relaxation: 40,
      adventure: 50,
      family: 90
    },
    culturalEtiquette: 'Tipping 18-22% is expected for table service. Stand to the side of sidewalks to let busy pedestrians pass. Keep moving at subway turnstiles.',
    localScamToAvoid: 'Ignore street costume characters demanding high fees for photos, or CD sellers trying to force-insert music discs into your hands.',
    emergencyHotline: 'Emergency Services: 911'
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
    styles: ['luxury', 'family', 'adventure'],
    timezoneOffset: 4,
    emergency: {
      police: '999',
      ambulance: '998',
      fire: '997',
      embassyNote: 'US Consulate General Dubai: Al Seef St, Umm Hurair 1, Dubai (Ph: +971 4 309 4000)'
    },
    etiquette: [
      { rule: 'Respect Dress Code', detail: 'Dress modestly in malls and public areas. Knees and shoulders should be covered.' },
      { rule: 'No Public Affection', detail: 'Holding hands is generally fine for couples, but kissing or hugging in public is strictly illegal.' },
      { rule: 'Ramadan Rules', detail: 'During Ramadan, do not eat, drink, or smoke in public from dawn to dusk.' }
    ],
    phrases: [
      { native: 'Marhaban', phonetic: 'mar-hah-ban', meaning: 'Hello / Welcome' },
      { native: 'Shukran', phonetic: 'shoo-kran', meaning: 'Thank you' },
      { native: 'Min fadlak', phonetic: 'min fad-lak', meaning: 'Please' },
      { native: 'Kam hatha ?', phonetic: 'kam ha-tha', meaning: 'How much is this?' },
      { native: 'Hal tatakallam al-Ingleeziah ?', phonetic: 'hal tah-tah-kah-lam al-ing-lee-zee-yah', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [10, 10, 15, 30, 60, 85, 95, 95, 80, 50, 20, 10], // extreme summer heat May-Sep makes outdoors impossible
    bingo: [
      'Gaze up at the Burj Khalifa peak',
      'Go on a golden desert safari drive',
      'Ride an abra across the Dubai Creek',
      'Stroll through the sparkling Gold Souk',
      'Witness the choreographed Fountain Show',
      'Experience the massive Dubai Mall',
      'Taste rich camel milk ice cream',
      'See the futuristic Frame of Dubai',
      'Walk along the Palm Jumeirah boardwalk'
    ],
    archetypeWeights: {
      culture: 75,
      foodie: 85,
      relaxation: 85,
      adventure: 80,
      family: 95
    },
    culturalEtiquette: 'Dress modestly in public spaces (knees/shoulders covered). Avoid any public displays of affection, and respect holy customs during Ramadan.',
    localScamToAvoid: 'Be wary of unlicensed cabs charging inflated fixed rates. Always verify that the taxi\'s electronic meter is active before moving.',
    emergencyHotline: 'Police: 999, Ambulance: 998, Fire: 997'
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
    styles: ['culture', 'foodie'],
    timezoneOffset: 1,
    emergency: {
      police: '112',
      ambulance: '112',
      fire: '115',
      embassyNote: 'US Embassy Rome: Via Vittorio Veneto 121, 00187 Rome (Ph: +39 06 46741)'
    },
    etiquette: [
      { rule: 'No Cappuccino after Noon', detail: 'Cappuccinos are strictly a breakfast drink. Ordering one after 11:00 AM or with dinner is seen as a culinary crime.' },
      { rule: 'Sartorial Church Rules', detail: 'Cover shoulders and knees inside churches, especially the Vatican and major basilicas.' },
      { rule: 'Free Public Fountains', detail: 'Carry a reusable bottle. You can refill for free at any of Rome\'s nasoni (drinking fountains).' }
    ],
    phrases: [
      { native: 'Buongiorno', phonetic: 'bwon-jor-no', meaning: 'Good morning / Hello' },
      { native: 'Grazie mille', phonetic: 'graht-syee meel-leh', meaning: 'Thank you very much' },
      { native: 'Per favore', phonetic: 'pehr fah-voh-reh', meaning: 'Please' },
      { native: 'Il conto, per favore', phonetic: 'eel kon-toe pehr fah-voh-reh', meaning: 'The bill, please' },
      { native: 'Parla inglese ?', phonetic: 'par-lah een-gleh-zeh', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [25, 20, 15, 10, 5, 5, 10, 20, 10, 15, 25, 30], // summer closures in August (Ferragosto), winter rain
    bingo: [
      'Throw a coin into the Trevi Fountain',
      'Walk the ancient floors of the Colosseum',
      'Eat classic creamy Gelato in a piazza',
      'Gaze up at the open Pantheon dome',
      'Sip local espresso standing at a bar counter',
      'See St. Peter\'s Square at Vatican City',
      'Savor a real pasta carbonara dish',
      'Climb the historic Spanish Steps',
      'Find a quiet cobblestone path in Trastevere'
    ],
    archetypeWeights: {
      culture: 100,
      foodie: 100,
      relaxation: 75,
      adventure: 40,
      family: 75
    },
    culturalEtiquette: 'Avoid ordering cappuccino after 11:00 AM. Dress respectfully when visiting churches. Utilize free nasoni fountains for pure drinking water.',
    localScamToAvoid: 'Watch out for pickpockets on Bus 64 to Vatican City, and avoid street vendors trying to give "free" bracelets or roses before demanding money.',
    emergencyHotline: 'General Emergency: 112, Fire: 115'
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
    styles: ['relaxation', 'foodie'],
    timezoneOffset: 2,
    emergency: {
      police: '100',
      ambulance: '166',
      fire: '199',
      embassyNote: 'US Embassy Athens: 91 Vasilisis Sophias Ave, 10160 Athens (Ph: +30 210-721-2951)'
    },
    etiquette: [
      { rule: 'Toilet Paper Disposal', detail: 'Never flush toilet paper down the toilet. Use the small bins provided due to narrow plumbing pipes.' },
      { rule: 'Respect White Domes', detail: 'Do not climb on the roofs of private churches or white-domed buildings for Instagram photos.' },
      { rule: 'Quiet Hours', detail: 'Respect mid-afternoon quiet hours (siesta, 2:00 PM - 5:00 PM), especially in residential village paths.' }
    ],
    phrases: [
      { native: 'Yassas', phonetic: 'yah-sahss', meaning: 'Hello (polite)' },
      { native: 'Efcharisto', phonetic: 'ef-khah-rees-toh', meaning: 'Thank you' },
      { native: 'Parakalo', phonetic: 'pah-rah-kah-loh', meaning: 'Please / You are welcome' },
      { native: 'Poso kani ?', phonetic: 'poh-soh kah-nee', meaning: 'How much is it?' },
      { native: 'Milate anglika ?', phonetic: 'mee-lah-teh ahng-lee-kah', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [70, 65, 45, 20, 10, 5, 5, 5, 10, 25, 55, 75], // winter ferry shutdowns, heavy winds
    bingo: [
      'Watch the famous sunset from Oia',
      'Walk down the steps to Amoudi Bay',
      'Swim at the unique Red Sand Beach',
      'Eat freshly grilled octopus at a tavern',
      'Hike the scenic cliff path from Fira to Oia',
      'Explore the prehistoric Akrotiri ruins',
      'Sip dry Assyrtiko white wine at sunset',
      'Ride a local bus along steep island cliffs',
      'Find a blue-domed church tucked away'
    ],
    archetypeWeights: {
      culture: 80,
      foodie: 90,
      relaxation: 100,
      adventure: 60,
      family: 70
    },
    culturalEtiquette: 'Do not throw toilet paper in the toilet (use the provided bins). Refrain from climbing on blue church domes or private roofs for photos.',
    localScamToAvoid: 'Be cautious of taxis demanding high fixed prices instead of using meters, and overpriced restaurants that omit weight prices on fresh fish.',
    emergencyHotline: 'Police: 100, Ambulance: 166, Fire: 199'
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
    styles: ['foodie', 'culture', 'adventure'],
    timezoneOffset: 7,
    emergency: {
      police: '191',
      ambulance: '1669',
      fire: '199',
      embassyNote: 'US Embassy Bangkok: 95 Wireless Road, Bangkok 10330 (Ph: +66 2 205 4000)'
    },
    etiquette: [
      { rule: 'Respect Royalty', detail: 'Never make derogatory jokes or comments about the Thai Royal Family. It is a highly serious federal offense.' },
      { rule: 'Remove Your Shoes', detail: 'Take off your shoes when entering temples, private Thai homes, and even some small shops.' },
      { rule: 'Head is Sacred', detail: 'The head is considered the most sacred part of the body. Never touch anyone on the head.' }
    ],
    phrases: [
      { native: 'Sawasdee khrap/ka', phonetic: 'sah-wah-dee krahp / kah', meaning: 'Hello (Male/Female speaker)' },
      { native: 'Khob khun khrap/ka', phonetic: 'kob-koon krahp / kah', meaning: 'Thank you' },
      { native: 'Mai pen rai', phonetic: 'my-pen-rye', meaning: 'No worries / It\'s okay' },
      { native: 'Nee tao-rai ?', phonetic: 'nee tao-rye', meaning: 'How much is this?' },
      { native: 'Poot pasa ang-krit dai mai ?', phonetic: 'poot pah-sah ahng-grit dye-my', meaning: 'Can you speak English?' }
    ],
    disruptionRiskByMonth: [15, 10, 20, 30, 60, 70, 75, 80, 85, 70, 25, 15], // monsoon rains, flooding in Sep-Oct, heatwaves in Apr
    bingo: [
      'Ride in a roaring open three-wheeled Tuk Tuk',
      'Gaze up at the giant Wat Pho reclining Buddha',
      'Eat hot Pad Thai from a street cart vendor',
      'Sip a cold drink on a high skyscraper rooftop',
      'Explore the massive weekend Chatuchak Market',
      'Take a public express boat down Chao Phraya',
      'See the emerald Buddha inside Grand Palace',
      'Drink fresh sweet Thai milk tea with ice',
      'Stroll through neon flower markets at night'
    ],
    archetypeWeights: {
      culture: 95,
      foodie: 100,
      relaxation: 60,
      adventure: 80,
      family: 70
    },
    culturalEtiquette: 'Never speak negatively about the Royal Family. Take off shoes when entering temples or homes. Do not touch anybody on the head.',
    localScamToAvoid: 'Ignore tuk-tuk drivers who claim the Grand Palace is "closed" today for a holiday in order to redirect you to overpriced jewelry shops.',
    emergencyHotline: 'Tourist Police: 1155, General Police: 191, Medical: 1669'
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
    styles: ['adventure', 'culture', 'relaxation'],
    timezoneOffset: 2,
    emergency: {
      police: '10111',
      ambulance: '10177',
      fire: '107',
      embassyNote: 'US Consulate General Cape Town: 2 Reddam Ave, Westlake 7945 (Ph: +27 21 702 7300)'
    },
    etiquette: [
      { rule: 'Be Safety Vigilant', detail: 'Avoid walking alone at night, especially in unlit or quiet city streets. Use registered Uber rides.' },
      { rule: 'Tipping Custom', detail: 'Tipping 10-15% is standard at all restaurants and bars, and for car park attendants.' },
      { rule: 'Water Conservation', detail: 'Cape Town is historically drought-prone; always practice strict mindfulness with running taps.' }
    ],
    phrases: [
      { native: 'Howzit ?', phonetic: 'how-zit', meaning: 'How are you? / Hello' },
      { native: 'Dankie', phonetic: 'dahn-kee', meaning: 'Thank you' },
      { native: 'Lekker', phonetic: 'leh-ker', meaning: 'Great / Cool / Delicious' },
      { native: 'How much is this ?', phonetic: 'how much is this', meaning: 'Asking price' },
      { native: 'Just now', phonetic: 'just now', meaning: 'Sometime soon / later' }
    ],
    disruptionRiskByMonth: [15, 10, 15, 25, 45, 60, 65, 55, 35, 20, 15, 15], // winter rain, high coastal winds in summer (Cape Doctor)
    bingo: [
      'Take the cable car up Table Mountain',
      'See wild African penguins at Boulders Beach',
      'Drive along the scenic Chapman\'s Peak',
      'Walk among the colorful houses of Bo-Kaap',
      'Taste fresh seafood at V&A Waterfront',
      'Stand on the edge of the Cape of Good Hope',
      'Hike to the summit of Lion\'s Head',
      'Taste local dry biltong jerky snacks',
      'Stroll through Kirstenbosch botanical gardens'
    ],
    archetypeWeights: {
      culture: 80,
      foodie: 85,
      relaxation: 80,
      adventure: 100,
      family: 75
    },
    culturalEtiquette: 'Avoid walking alone at night. Always tip 10-15% for service. Be highly mindful of running taps and conserve water.',
    localScamToAvoid: 'Do not let strangers assist you at ATMs, as card skimming is common. Avoid walking in deserted city centers after business hours.',
    emergencyHotline: 'Police: 10111, Ambulance: 10177, Fire: 107'
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
    styles: ['relaxation', 'culture', 'family'],
    timezoneOffset: 1,
    emergency: {
      police: '117',
      ambulance: '144',
      fire: '118',
      embassyNote: 'US Embassy Bern: Sulgeneckstrasse 19, 3007 Bern (Ph: +41 31 357 70 11)'
    },
    etiquette: [
      { rule: 'Absolute Punctuality', detail: 'Arriving even 2 minutes late for tours, meetings, or transport is considered highly disrespectful.' },
      { rule: 'Quiet Sundays', detail: 'Sundays are official rest days. Do not make loud noises, recycle glass, or hang laundry in public view.' },
      { rule: 'Toast Eye Contact', detail: 'When clinking glasses (cheers / Prost!), maintain direct eye contact with each person at the table.' }
    ],
    phrases: [
      { native: 'Grüezi', phonetic: 'grew-tsi', meaning: 'Hello (Swiss German)' },
      { native: 'Merci villmal', phonetic: 'mair-see feel-mahl', meaning: 'Thank you very much' },
      { native: 'Bitte', phonetic: 'bit-teh', meaning: 'Please / You are welcome' },
      { native: 'Wieviel chostet das ?', phonetic: 'vee-feel khos-tet dahs', meaning: 'How much does this cost?' },
      { native: 'Redet Sie Englisch ?', phonetic: 'reh-det zee eng-leesh', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [60, 55, 45, 30, 15, 10, 5, 5, 15, 25, 45, 55], // cold Alpine winter snow, high cost of dynamic booking
    bingo: [
      'Stroll down the wealthy Bahnhofstrasse',
      'Take a boat ride across the clear Lake Zurich',
      'Taste rich, creamy Swiss chocolate truffles',
      'Eat hot melted cheese fondue or raclette',
      'Wander through Zurich\'s medieval Altstadt',
      'Refill your bottle from a historic city fountain',
      'Climb the towers of Grossmünster',
      'Ride the Polybahn funicular railway up',
      'Enjoy the panoramic view from Lindenhof hill'
    ],
    archetypeWeights: {
      culture: 90,
      foodie: 80,
      relaxation: 90,
      adventure: 60,
      family: 90
    },
    culturalEtiquette: 'Be absolutely punctual. Sundays are strict rest days with no loud noise. Maintain direct eye contact when saying cheers.',
    localScamToAvoid: 'Avoid buying day-of train tickets at premium counters without checking for cheaper Saver Day Passes on the official SBB mobile app.',
    emergencyHotline: 'Police: 117, Ambulance: 144, Fire: 118'
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
    styles: ['culture', 'adventure', 'foodie'],
    timezoneOffset: 1,
    emergency: {
      police: '19',
      ambulance: '15',
      fire: '15',
      embassyNote: 'US Embassy Rabat: KM 5.7 Avenue Mohamed VI, Souissi, Rabat (Ph: +212 537 637 200)'
    },
    etiquette: [
      { rule: 'The Art of Barter', detail: 'Haggling in the souks is highly customary. Politely offer half the initial price and meet in the middle.' },
      { rule: 'Respectful Photography', detail: 'Always ask permission before photographing street artists or locals; they will expect a small tip.' },
      { rule: 'Avoid Left Hand', detail: 'Avoid eating or passing communal bread with your left hand, as it is traditionally seen as impolite.' }
    ],
    phrases: [
      { native: 'Salam alaykum', phonetic: 'sah-lahm ah-lay-koom', meaning: 'Hello / Peace be with you' },
      { native: 'Shukran', phonetic: 'shoo-kran', meaning: 'Thank you' },
      { native: 'Afak', phonetic: 'ah-fahk', meaning: 'Please' },
      { native: 'Bshal hada ?', phonetic: 'b-shahl hah-dah', meaning: 'How much is this?' },
      { native: 'Wash kat-hder l\'engleza ?', phonetic: 'wash kat-deh-r l-eng-leh-zah', meaning: 'Do you speak English?' }
    ],
    disruptionRiskByMonth: [20, 15, 20, 35, 65, 85, 95, 90, 70, 40, 25, 20], // intense summer heat desert dry spells Jun-Aug
    bingo: [
      'Wander the maze-like paths of Medina Souks',
      'Witness acrobatics in Jemaa el-Fnaa square',
      'Stroll through the stunning Jardin Majorelle',
      'Sip hot, sweet fresh mint tea on a terrace',
      'Dine on slow-cooked tajine in a clay pot',
      'Savor fresh orange juice in the main square',
      'Explore the ruins of El Badi Palace',
      'Smell spices piled high in a spice market',
      'Sleep or rest in a peaceful traditional Riad'
    ],
    archetypeWeights: {
      culture: 100,
      foodie: 90,
      relaxation: 70,
      adventure: 80,
      family: 65
    },
    culturalEtiquette: 'Expect and enjoy haggling in souks. Ask permission before taking pictures of performers or street displays, and use your right hand.',
    localScamToAvoid: 'Be wary of helpful strangers offering unsolicited directions in the Medina maze, who then aggressively demand a hefty tip to guide you out.',
    emergencyHotline: 'Police: 19, Ambulance/Fire: 15'
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
