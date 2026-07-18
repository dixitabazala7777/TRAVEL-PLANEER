import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Compass, 
  Navigation, 
  Bus, 
  Car, 
  Footprints, 
  Layers, 
  Sparkles, 
  Map,
  Star,
  Loader2,
  Coffee,
  Shield,
  Heart,
  Store
} from 'lucide-react';
import { playChime, hashStr, seededRandom } from '../utils';
import { Activity } from '../types';

interface ActivityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  destinationName: string;
}

type MapTheme = 'vector' | 'terrain' | 'satellite';

interface NearbyService {
  id: string;
  name: string;
  type: 'atm' | 'pharmacy' | 'cafe' | 'store' | 'landmark';
  rating: number;
  distanceMeters: number;
  bearingDegrees: number;
  cardinalDir: string;
  x: number; // offset x on map SVG
  y: number; // offset y on map SVG
}

const getServiceIcon = (type: 'atm' | 'pharmacy' | 'cafe' | 'store' | 'landmark') => {
  switch (type) {
    case 'atm':
      return Shield;
    case 'pharmacy':
      return Heart;
    case 'cafe':
      return Coffee;
    case 'store':
      return Store;
    case 'landmark':
      return MapPin;
    default:
      return MapPin;
  }
};

const getServiceColor = (type: 'atm' | 'pharmacy' | 'cafe' | 'store' | 'landmark') => {
  switch (type) {
    case 'atm':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        fill: '#10b981'
      };
    case 'pharmacy':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-400',
        fill: '#f43f5e'
      };
    case 'cafe':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        fill: '#f59e0b'
      };
    case 'store':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        fill: '#3b82f6'
      };
    case 'landmark':
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        fill: '#a855f7'
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        text: 'text-slate-400',
        fill: '#64748b'
      };
  }
};

const generateNearbyServices = (activityTitle: string, destinationName: string, actX: number, actY: number): NearbyService[] => {
  const hash = hashStr(activityTitle + destinationName + "nearby");
  const rng = seededRandom(hash);
  
  const types: ('atm' | 'pharmacy' | 'cafe' | 'store' | 'landmark')[] = ['atm', 'pharmacy', 'cafe', 'store', 'landmark'];
  const names = {
    atm: ['Global Cash ATM', 'Local Trust Bank ATM', 'Universal Express ATM', 'Secured Vault ATM'],
    pharmacy: ['Crossroad Pharmacy', '24/7 Wellness Apothecary', 'City Care Pharmacy', 'Green Cross Chemist'],
    cafe: ['Cornerstone Cafe', 'The Coffee Grind', 'Bakehouse & Co.', 'Aroma Espresso Lounge'],
    store: ['Express Market', 'Boutique Souvenirs', 'Metro Mart 24', 'Central Bodega'],
    landmark: ['Scenic Viewpoint', 'Historical Fountain', 'Peace Monument', 'Public Gardens']
  };

  const count = 3 + Math.floor(rng() * 3); // 3 to 5 items
  const services: NearbyService[] = [];

  for (let i = 0; i < count; i++) {
    const itemRng = seededRandom(hash + i * 888);
    const type = types[Math.floor(itemRng() * types.length)];
    const typeNames = names[type];
    const name = typeNames[Math.floor(itemRng() * typeNames.length)];
    
    // Position relative to active waypoint (actX, actY)
    // Keep them inside the map bounds (20 to 380 for x, 20 to 280 for y)
    const angle = itemRng() * Math.PI * 2;
    const distancePixels = 25 + itemRng() * 35; // 25 to 60 pixels radius (approx 1km)
    
    let x = actX + Math.cos(angle) * distancePixels;
    let y = actY + Math.sin(angle) * distancePixels;
    
    // Clamp inside the map bounds
    x = Math.max(20, Math.min(380, x));
    y = Math.max(20, Math.min(280, y));

    const distanceMeters = Math.round(150 + itemRng() * 750); // 150m to 900m
    const rating = parseFloat((4.5 + itemRng() * 0.5).toFixed(1)); // 4.5 to 5.0
    
    const bearingDegrees = Math.round((angle * 180) / Math.PI + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const cardinalDir = directions[Math.round(((bearingDegrees % 360) / 45)) % 8];

    services.push({
      id: `${type}-${i}`,
      name,
      type,
      rating,
      distanceMeters,
      bearingDegrees,
      cardinalDir,
      x,
      y
    });
  }

  return services;
};

export const ActivityMapModal: React.FC<ActivityMapModalProps> = ({
  isOpen,
  onClose,
  activity,
  destinationName
}) => {
  const [theme, setTheme] = useState<MapTheme>('vector');
  const [showNearby, setShowNearby] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);

  // Reset when activity or modal open state changes
  useEffect(() => {
    setShowNearby(false);
    setLoadingNearby(false);
    setNearbyServices([]);
  }, [activity, isOpen]);

  // Trigger click sound when switching map theme
  const handleThemeChange = (newTheme: MapTheme) => {
    playChime('click');
    setTheme(newTheme);
  };

  const handleClose = () => {
    playChime('click');
    onClose();
  };

  // Generate deterministic details based on the activity and destination name
  const mapData = useMemo(() => {
    if (!activity) return null;

    const actHash = hashStr(activity.title + destinationName);
    const rng = seededRandom(actHash);

    // Activity coordinates relative to center (0 to 100 on an SVG grid of 400x300)
    // Center is (200, 150)
    const angle = rng() * Math.PI * 2;
    const distanceVal = 50 + rng() * 80; // Distance in pixels from center
    
    const actX = 200 + Math.cos(angle) * distanceVal;
    const actY = 150 + Math.sin(angle) * distanceVal;

    // Real-world representation values
    const distanceKm = parseFloat((1.2 + rng() * 4.8).toFixed(1));
    const bearingDegrees = Math.round((angle * 180) / Math.PI + 360) % 360;
    
    // Cardinal direction
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const cardinalDir = directions[Math.round(((bearingDegrees % 360) / 45)) % 8];

    // Estimated transit times
    const taxiTime = Math.round(distanceKm * 3 + 4);
    const metroTime = Math.round(distanceKm * 4 + 6);
    const walkTime = Math.round(distanceKm * 12);

    // Transit fares / details
    const taxiCost = Math.round(distanceKm * 2.5 + 3);
    const metroCost = 2.5;

    // Generate random mock streets/roads that connect around
    const roads = Array.from({ length: 6 }).map((_, i) => {
      const roadRng = seededRandom(actHash + i * 100);
      const isHorizontal = roadRng() > 0.5;
      const offset = 50 + roadRng() * 200;
      return { isHorizontal, offset };
    });

    // Generate landmark spots
    const landmarks = [
      { name: `${destinationName} Station`, x: 200 + (roadRng(actHash, 1) - 0.5) * 160, y: 150 + (roadRng(actHash, 2) - 0.5) * 120 },
      { name: 'Local Market Square', x: 200 + (roadRng(actHash, 3) - 0.5) * 160, y: 150 + (roadRng(actHash, 4) - 0.5) * 120 },
      { name: 'Scenic Overlook', x: 200 + (roadRng(actHash, 5) - 0.5) * 160, y: 150 + (roadRng(actHash, 6) - 0.5) * 120 },
    ];

    return {
      actX,
      actY,
      distanceKm,
      bearingDegrees,
      cardinalDir,
      taxiTime,
      metroTime,
      walkTime,
      taxiCost,
      metroCost,
      roads,
      landmarks
    };
  }, [activity, destinationName]);

  // Helper helper to generate simple random number based on keys
  function roadRng(hash: number, index: number) {
    const f = seededRandom(hash + index * 500);
    return f();
  }

  const handleToggleNearby = () => {
    playChime('click');
    if (!showNearby) {
      setLoadingNearby(true);
      setShowNearby(true);
      setTimeout(() => {
        if (activity && mapData) {
          const generated = generateNearbyServices(activity.title, destinationName, mapData.actX, mapData.actY);
          setNearbyServices(generated);
        }
        setLoadingNearby(false);
      }, 600);
    } else {
      setShowNearby(false);
      setNearbyServices([]);
    }
  };

  if (!isOpen || !activity || !mapData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-ink-950 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Animated flow style for the SVG transit line */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flowDash {
            to {
              stroke-dashoffset: -20;
            }
          }
          .animate-flow-dash {
            animation: flowDash 1.2s linear infinite;
          }
          @keyframes pulseScale {
            0%, 100% {
              transform: scale(1);
              opacity: 0.25;
            }
            50% {
              transform: scale(1.6);
              opacity: 0.6;
            }
          }
          .animate-pulse-scale {
            animation: pulseScale 2s infinite ease-in-out;
            transform-origin: center;
          }
        `}} />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-ink-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-400/20">
              <Compass className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">WAYPOINT GEO-NAVIGATOR</span>
              <h3 className="font-display font-bold text-sm text-white truncate max-w-[240px] sm:max-w-md">
                {activity.title}
              </h3>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          
          {/* Left Column: Interactive Map Render Area */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between space-y-4">
            
            {/* Map Canvas Frame */}
            <div className="relative aspect-[4/3] rounded-2xl border border-white/5 overflow-hidden bg-ink-950 shadow-inner">
              
              {/* Floating Satellite/Standard View Toggle */}
              <div className="absolute top-3 left-3 z-10 flex gap-1 bg-ink-950/95 backdrop-blur border border-white/10 rounded-xl p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    playChime('click');
                    setTheme('vector');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer outline-none ${
                    theme !== 'satellite'
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-400/20'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playChime('click');
                    setTheme('satellite');
                  }}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer outline-none ${
                    theme === 'satellite'
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-400/20'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Satellite
                </button>
              </div>

              {/* Dynamic Theme Map Overlays */}
              {theme === 'satellite' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }} />
              )}

              {/* SVG Map Canvas */}
              <svg 
                viewBox="0 0 400 300" 
                className={`w-full h-full transition-all duration-300 ${
                  theme === 'terrain' ? 'bg-amber-950/10' : theme === 'satellite' ? 'bg-indigo-950/20' : 'bg-ink-950'
                }`}
              >
                {/* Coastal Line / River (deterministic curve) */}
                <path 
                  d="M -20,100 Q 150,80 220,190 T 420,240" 
                  fill="none" 
                  stroke={theme === 'satellite' ? 'rgba(56,189,248,0.25)' : theme === 'terrain' ? 'rgba(14,116,144,0.3)' : 'rgba(30,58,138,0.4)'} 
                  strokeWidth="32" 
                />
                <path 
                  d="M -20,100 Q 150,80 220,190 T 420,240" 
                  fill="none" 
                  stroke={theme === 'satellite' ? 'rgba(56,189,248,0.4)' : theme === 'terrain' ? 'rgba(6,182,212,0.4)' : 'rgba(59,130,246,0.5)'} 
                  strokeWidth="8" 
                />

                {/* Parks / Forest Rectangles */}
                <rect 
                  x="50" y="30" width="80" height="60" rx="12" 
                  fill={theme === 'terrain' ? 'rgba(20,184,166,0.1)' : 'rgba(16,185,129,0.06)'} 
                  stroke={theme === 'terrain' ? 'rgba(20,184,166,0.2)' : 'rgba(16,185,129,0.1)'} 
                  strokeWidth="1" 
                />
                <rect 
                  x="280" y="210" width="70" height="70" rx="12" 
                  fill={theme === 'terrain' ? 'rgba(20,184,166,0.1)' : 'rgba(16,185,129,0.06)'} 
                  stroke={theme === 'terrain' ? 'rgba(20,184,166,0.2)' : 'rgba(16,185,129,0.1)'} 
                  strokeWidth="1" 
                />

                {/* Grid Lines for Satellite view */}
                {theme === 'satellite' && (
                  <>
                    <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <line x1="0" y1="225" x2="400" y2="225" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  </>
                )}

                {/* Contour rings for Terrain view */}
                {theme === 'terrain' && (
                  <>
                    <circle cx="340" cy="60" r="40" fill="none" stroke="rgba(217,119,6,0.1)" strokeWidth="1" />
                    <circle cx="340" cy="60" r="30" fill="none" stroke="rgba(217,119,6,0.1)" strokeWidth="1" />
                    <circle cx="340" cy="60" r="20" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="1" />
                    <circle cx="340" cy="60" r="10" fill="none" stroke="rgba(217,119,6,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                  </>
                )}

                {/* Street/Road network */}
                {mapData.roads.map((road, idx) => (
                  <line
                    key={idx}
                    x1={road.isHorizontal ? 0 : road.offset}
                    y1={road.isHorizontal ? road.offset : 0}
                    x2={road.isHorizontal ? 400 : road.offset}
                    y2={road.isHorizontal ? road.offset : 300}
                    stroke={
                      theme === 'satellite'
                        ? 'rgba(56,189,248,0.15)'
                        : theme === 'terrain'
                        ? 'rgba(217,119,6,0.12)'
                        : 'rgba(255,255,255,0.07)'
                    }
                    strokeWidth={idx % 3 === 0 ? "3" : "1.5"}
                  />
                ))}

                {/* Animated Flowing Line from Downtown to Target */}
                <line 
                  x1="200" 
                  y1="150" 
                  x2={mapData.actX} 
                  y2={mapData.actY} 
                  stroke={theme === 'terrain' ? '#2dd4bf' : '#3b82f6'} 
                  strokeWidth="2.5" 
                  strokeDasharray="6,4" 
                  className="animate-flow-dash"
                />

                {/* Landmark Pins */}
                {mapData.landmarks.map((landmark, idx) => (
                  <g key={idx}>
                    <circle cx={landmark.x} cy={landmark.y} r="3" fill="#64748b" opacity="0.6" />
                    <text x={landmark.x + 6} y={landmark.y + 3} fill="#475569" fontSize="7" fontFamily="monospace">
                      {landmark.name}
                    </text>
                  </g>
                ))}

                {/* Destination Center Marker */}
                <g transform="translate(200, 150)">
                  <circle cx="0" cy="0" r="8" fill="rgba(59,130,246,0.2)" />
                  <circle cx="0" cy="0" r="4" fill="#3b82f6" />
                  <text x="8" y="12" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    {destinationName} Central
                  </text>
                </g>

                {/* Target Pin (Activity Location) */}
                <g transform={`translate(${mapData.actX}, ${mapData.actY})`}>
                  {/* Concentric Pulsing Wave */}
                  <circle cx="0" cy="0" r="14" fill="rgba(244,63,94,0.3)" className="animate-pulse-scale" />
                  <path 
                    d="M 0,-10 C -5,-10 -8,-7 -8,-2 C -8,3 0,10 0,10 C 0,10 8,3 8,-2 C 8,-7 5,-10 0,-10 Z" 
                    fill="#f43f5e" 
                    stroke="#111827" 
                    strokeWidth="1.5" 
                  />
                  <circle cx="0" cy="-2" r="3.5" fill="#fff" />
                  <text x="12" y="3" fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    Active Waypoint
                  </text>
                </g>

                {/* Nearby Services Pins */}
                {showNearby && !loadingNearby && nearbyServices.map((svc) => {
                  const SvcColor = getServiceColor(svc.type);
                  return (
                    <g key={svc.id}>
                      {/* Connection line from Active Waypoint to Nearby Service */}
                      <line 
                        x1={mapData.actX} 
                        y1={mapData.actY} 
                        x2={svc.x} 
                        y2={svc.y} 
                        stroke={SvcColor.fill} 
                        strokeWidth="1.2" 
                        strokeDasharray="2,3" 
                        opacity="0.5"
                      />
                      {/* Subtle hover pulse */}
                      <circle cx={svc.x} cy={svc.y} r="8" fill={SvcColor.fill} opacity="0.15" className="animate-pulse-scale" style={{ animationDuration: '3s' }} />
                      
                      {/* Small Pin Dot */}
                      <circle cx={svc.x} cy={svc.y} r="4.5" fill={SvcColor.fill} stroke="#111827" strokeWidth="1" />
                      <circle cx={svc.x} cy={svc.y} r="1.5" fill="#fff" />
                      
                      {/* Text Label with background pill for readability */}
                      <g transform={`translate(${svc.x + 6}, ${svc.y - 3})`}>
                        <rect 
                          x="-2" 
                          y="-6" 
                          width={svc.name.length * 4.4 + 4} 
                          height="9" 
                          rx="2" 
                          fill="rgba(17, 24, 39, 0.85)" 
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="0.5"
                        />
                        <text fill="#cbd5e1" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">
                          {svc.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Calibration/Telemetry Info */}
              <div className="absolute bottom-3 left-3 bg-ink-950/80 backdrop-blur border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LAT: {(43.2 + mapData.distanceKm * 0.01).toFixed(4)}°N</span>
                <span className="text-slate-600">|</span>
                <span>LON: {(12.4 + mapData.distanceKm * 0.02).toFixed(4)}°E</span>
              </div>

              {/* Compass Ring Overlaid */}
              <div className="absolute top-3 right-3 bg-ink-950/80 backdrop-blur border border-white/5 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-mono font-bold">
                {mapData.cardinalDir}
              </div>
            </div>

            {/* Map Styling Controls */}
            <div className="flex items-center justify-between bg-ink-900/40 border border-white/5 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-mono text-slate-300">Map Styling Preset</span>
              </div>
              <div className="flex gap-1.5">
                {[
                  { id: 'vector', label: 'Vector' },
                  { id: 'terrain', label: 'Tactical' },
                  { id: 'satellite', label: 'Satellite' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleThemeChange(preset.id as MapTheme)}
                    className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-all ${
                      theme === preset.id
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20 font-bold'
                        : 'text-slate-500 hover:text-slate-300 bg-white/[0.02] border border-white/5'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Distance, Bearing, and Transit Calculation */}
          <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between">
            
            {/* Header Telemetry card */}
            <div className="space-y-4">
              <div className="bg-ink-900/60 rounded-2xl p-4 border border-white/5 space-y-3">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Relative Waypoint Matrix</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-slate-500 block">LINEAR DISTANCE</span>
                    <span className="text-lg font-display font-bold text-white font-mono block mt-0.5">
                      {mapData.distanceKm} <span className="text-xs font-medium text-slate-400">km</span>
                    </span>
                  </div>
                  
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-500 block">BEARING</span>
                    <span className="text-lg font-display font-bold text-white font-mono block mt-0.5 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-emerald-400 inline" style={{ transform: `rotate(${mapData.bearingDegrees}deg)` }} />
                      <span>{mapData.bearingDegrees}° {mapData.cardinalDir}</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-blue-500/5 rounded-xl p-2.5 border border-blue-400/10 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>Located approximately <strong className="text-slate-300">{mapData.distanceKm} km {mapData.cardinalDir}</strong> of the {destinationName} core station. Estimated transit times vary by style.</span>
                </div>
              </div>

              {/* Nearby Toggle Widget */}
              <div className="bg-ink-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-400 w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Nearby Services & Landmarks</span>
                      <span className="text-[10px] text-slate-500 block">Scan within 1km radius</span>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={handleToggleNearby}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showNearby ? 'bg-emerald-500' : 'bg-slate-850'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showNearby ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Display State */}
                {showNearby && (
                  <div className="border-t border-white/5 pt-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    {loadingNearby ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
                          Querying Geo-Index...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {nearbyServices.map((svc) => {
                          const SvcIcon = getServiceIcon(svc.type);
                          const SvcColorClass = getServiceColor(svc.type);
                          return (
                            <div 
                              key={svc.id}
                              className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-2 rounded-xl flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-lg ${SvcColorClass.bg} border ${SvcColorClass.border} flex items-center justify-center shrink-0`}>
                                  <SvcIcon className={`w-3.5 h-3.5 ${SvcColorClass.text}`} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                                    {svc.name}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                                    {svc.type.toUpperCase()} • {svc.distanceMeters}m {svc.cardinalDir}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10 shrink-0">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-mono font-bold text-amber-300">
                                  {svc.rating}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Transit Estimations */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Transit Planner Options</span>
                
                {/* Taxi Option */}
                <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Taxi / Ride-Hailing</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Estimated via local roadways</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block font-mono">~{mapData.taxiTime} mins</span>
                    <span className="text-[10px] text-amber-400 block font-mono mt-0.5">Est. ${mapData.taxiCost}</span>
                  </div>
                </div>

                {/* Metro Option */}
                <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Bus className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Subway & Metro Rail</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Line 3 to central terminus</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block font-mono">~{mapData.metroTime} mins</span>
                    <span className="text-[10px] text-blue-400 block font-mono mt-0.5">Flat fare: ${mapData.metroCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Walking Option */}
                <div className="bg-white/[0.02] hover:bg-white/[0.04] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Footprints className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Pedestrian Footpath</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Calorie Burn: ~{Math.round(mapData.distanceKm * 65)} kcal</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block font-mono">~{mapData.walkTime} mins</span>
                    <span className="text-[10px] text-emerald-400 block font-mono mt-0.5">Free Scenic Route</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick close buttons */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-500/15 outline-none cursor-pointer mt-4"
            >
              Close Navigator Map
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
