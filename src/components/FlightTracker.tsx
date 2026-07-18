import React, { useState, useEffect } from 'react';
import { Plane, Calendar, Search, MapPin, ExternalLink, RefreshCw, AlertCircle, Info, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { playChime } from '../utils';

interface FlightTrackerProps {
  destinationName: string | undefined;
  destinationCountry: string | undefined;
  travelMonth: number; // 0-indexed
  tripDurationDays: number;
}

interface FlightOption {
  airline: string;
  flightNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
  duration: string;
  type: string;
  notes: string;
}

interface FlightSearchResponse {
  flights: FlightOption[];
  summary: string;
  citations?: { title: string; uri: string }[];
  error?: string;
}

export const FlightTracker: React.FC<FlightTrackerProps> = ({
  destinationName,
  destinationCountry,
  travelMonth,
  tripDurationDays,
}) => {
  const [origin, setOrigin] = useState(() => {
    return localStorage.getItem('waypoint_flight_origin') || 'New York (JFK)';
  });
  
  const [destinationInput, setDestinationInput] = useState('');

  // Determine current/next year
  const currentYear = new Date().getFullYear();
  const yearToUse = new Date().getMonth() > travelMonth ? currentYear + 1 : currentYear;

  // Pre-fill Departure Date based on selected travelMonth
  const getInitialDepartureDate = () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${yearToUse}-${pad(travelMonth + 1)}-15`;
  };

  const [departureDate, setDepartureDate] = useState(getInitialDepartureDate);

  // Pre-fill Return Date based on Departure Date + duration
  const getInitialReturnDate = (depDateStr: string) => {
    try {
      const depDate = new Date(depDateStr);
      if (!isNaN(depDate.getTime())) {
        depDate.setDate(depDate.getDate() + tripDurationDays);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${depDate.getFullYear()}-${pad(depDate.getMonth() + 1)}-${pad(depDate.getDate())}`;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  const [returnDate, setReturnDate] = useState(() => getInitialReturnDate(getInitialDepartureDate()));

  // Keep destination input synchronized with selected destination props
  useEffect(() => {
    if (destinationName) {
      setDestinationInput(`${destinationName}${destinationCountry ? `, ${destinationCountry}` : ''}`);
    }
  }, [destinationName, destinationCountry]);

  // Keep date values updated if travelMonth or duration changes
  useEffect(() => {
    const dep = getInitialDepartureDate();
    setDepartureDate(dep);
    setReturnDate(getInitialReturnDate(dep));
  }, [travelMonth, tripDurationDays]);

  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDepartureDate(val);
    setReturnDate(getInitialReturnDate(val));
  };

  // State for search results
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FlightSearchResponse | null>(() => {
    try {
      const cached = localStorage.getItem(`waypoint_flights_${destinationName}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Save origin changes
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    localStorage.setItem('waypoint_flight_origin', val);
  };

  // Search loader animation steps
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 0:
        return 'Initializing flight scanner connection...';
      case 1:
        return 'Contacting Google Search for real-time airline offers...';
      case 2:
        return 'Parsing latest schedule durations and layovers...';
      case 3:
        return 'Grounding direct/connecting pricing estimates...';
      default:
        return 'Analyzing flight pathways...';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destinationInput || !departureDate) return;

    playChime('click');
    setLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination: destinationInput,
          departureDate,
          returnDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server returned an error while searching for flights.');
      }

      setResults(data);
      localStorage.setItem(`waypoint_flights_${destinationName}`, JSON.stringify(data));
      playChime('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to scan flight options at this moment.');
      playChime('click');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="flight-tracker-container" className="space-y-6">
      {/* Search Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs text-blue-400 font-mono font-bold uppercase tracking-wider">
            <Plane className="w-3.5 h-3.5" /> REAL-TIME FLIGHT GROUNDING
          </div>
          <h3 className="text-xl font-display font-medium text-white tracking-tight">
            Live Flight Scanner & Tariff Estimator
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify your origin to execute a real-time web search for upcoming connections, airfares, and direct schedules rooted in actual airline availability.
          </p>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center gap-3 self-stretch md:self-auto shrink-0 font-mono">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">VERIFIED WEB DATA</span>
            <span className="text-[11px] text-slate-300 font-semibold block">Google Search Powered</span>
          </div>
        </div>
      </div>

      {/* Input Form Controls */}
      <div className="glass rounded-2xl border border-white/5 p-5 md:p-6 shadow-xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Origin */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Origin Location / Airport
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                placeholder="e.g. London (LHR) or NYC"
                required
                className="w-full bg-ink-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:bg-ink-950/90 transition-all outline-none"
              />
            </div>
          </div>

          {/* Swap Indicator icon in middle */}
          <div className="hidden md:flex md:col-span-1 justify-center pb-3">
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Destination */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Target Destination
            </label>
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Tokyo, Japan"
              required
              className="w-full bg-ink-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/50 focus:bg-ink-950/90 transition-all outline-none"
            />
          </div>

          {/* Dates */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Outbound Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={handleDepartureDateChange}
                required
                className="w-full bg-ink-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-blue-500/50 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-ink-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-blue-500/50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.35)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{loading ? 'Scanning...' : 'Scan Airfares'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading States */}
      {loading && (
        <div className="glass rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] p-8 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <Plane className="w-5 h-5 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">EXECUTING WEB SEARCH</p>
            <p className="text-sm font-medium text-slate-200 transition-all duration-300">
              {getLoadingMessage()}
            </p>
          </div>
          <p className="text-[10px] text-slate-500">This connects live flight schedules and matches web citations. Please stand by.</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="border border-rose-500/20 bg-rose-500/[0.03] p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase text-rose-400 tracking-wider">Flight Scanner Interrupted</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Flight Search Results */}
      {!loading && results && (
        <div className="space-y-6">
          {/* Summary Overview */}
          {results.summary && (
            <div className="border border-blue-500/10 bg-blue-500/[0.01] p-4 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest">Market Summary</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {results.summary}
                </p>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.flights && results.flights.length > 0 ? (
              results.flights.map((flight, idx) => (
                <div 
                  key={idx} 
                  className="glass rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                          <Plane className="w-4 h-4 text-blue-400 transform -rotate-45" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                            {flight.airline}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 font-bold block">
                            {flight.flightNumber} • {flight.route}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        {flight.price}
                      </span>
                    </div>

                    <div className="h-[1px] bg-white/5" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">SCHEDULE</span>
                        <p className="text-xs font-semibold text-slate-300 mt-0.5">
                          {flight.departureTime} - {flight.arrivalTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">DURATION / TRANSIT</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs font-semibold text-slate-300">
                            {flight.duration}
                          </p>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.25 rounded ${
                            flight.type.toLowerCase().includes('direct')
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {flight.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {flight.notes && (
                    <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5 text-[10px] text-slate-400 leading-normal italic">
                      {flight.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="md:col-span-2 text-center py-10 text-slate-500 text-xs font-mono">
                No active schedules returned. Modify inputs and try again.
              </div>
            )}
          </div>

          {/* Citations & Sources */}
          {results.citations && results.citations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Live Grounding Citations
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.citations.map((cite, idx) => (
                  <a
                    key={idx}
                    href={cite.uri}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playChime('click')}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-400/10 hover:border-blue-400/20 px-2.5 py-1 rounded transition-all outline-none cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">{cite.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback info when no search performed yet */}
      {!loading && !results && (
        <div className="glass rounded-xl p-8 text-center space-y-3.5">
          <Plane className="w-8 h-8 text-slate-500 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-300">Ready to Scan Airfares</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Scan flights departing from {origin} to {destinationName || 'your destination'} for {departureDate || 'the trip dates'}.
            </p>
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer outline-none"
          >
            <Search className="w-3.5 h-3.5" /> Initialize Search
          </button>
        </div>
      )}
    </div>
  );
};
