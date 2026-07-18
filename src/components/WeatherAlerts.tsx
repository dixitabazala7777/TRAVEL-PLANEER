import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ShieldAlert, Info, ExternalLink, RefreshCw, ThermometerSnowflake, Waves, Flame, Wind, Sun, MapPin, ChevronDown, ChevronUp, Landmark } from 'lucide-react';
import { WeatherAlertResponse, SafeZone } from '../types';
import { playChime } from '../utils';

interface WeatherAlertsProps {
  destinationName: string;
  travelMonth: number;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ destinationName, travelMonth }) => {
  const [data, setData] = useState<WeatherAlertResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string, isQuota?: boolean } | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  
  // Safe Zones state
  const [safeZonesMap, setSafeZonesMap] = useState<Record<number, { zones: SafeZone[], loading: boolean }>>({});
  const [expandedAlertIdx, setExpandedAlertIdx] = useState<number | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    setSafeZonesMap({});
    setExpandedAlertIdx(null);
    try {
      const response = await fetch('/api/weather-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destinationName, month: travelMonth }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json();
          setError({ message: errData.message || 'Quota exceeded', isQuota: true });
          setCooldown(30); // 30 second cooldown
          return;
        }
        throw new Error('Failed to fetch weather alerts');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Weather alerts error:', err);
      setError({ message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchSafeZones = async (idx: number, weatherType: string) => {
    if (safeZonesMap[idx]) {
      setExpandedAlertIdx(expandedAlertIdx === idx ? null : idx);
      return;
    }

    setSafeZonesMap(prev => ({ ...prev, [idx]: { zones: [], loading: true } }));
    setExpandedAlertIdx(idx);
    playChime('click');

    try {
      const response = await fetch('/api/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destinationName, weatherType }),
      });

      if (!response.ok) throw new Error('Failed to fetch safe zones');
      const result = await response.json();
      setSafeZonesMap(prev => ({ ...prev, [idx]: { zones: result.safeZones || [], loading: false } }));
    } catch (err) {
      console.error('Safe zones error:', err);
      setSafeZonesMap(prev => ({ ...prev, [idx]: { zones: [], loading: false } }));
    }
  };

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    fetchAlerts();
  }, [destinationName, travelMonth]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'moderate': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getAlertIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('heat')) return <Sun className="w-4 h-4" />;
    if (t.includes('monsoon') || t.includes('flood') || t.includes('hurricane')) return <Waves className="w-4 h-4" />;
    if (t.includes('wildfire') || t.includes('fire')) return <Flame className="w-4 h-4" />;
    if (t.includes('blizzard') || t.includes('snow') || t.includes('cold')) return <ThermometerSnowflake className="w-4 h-4" />;
    if (t.includes('wind') || t.includes('storm')) return <Wind className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/5 bg-ink-950/40 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/5" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/5 rounded" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-20 w-full bg-white/5 rounded-xl" />
          <div className="h-20 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass rounded-2xl p-6 border text-center transition-all ${
        error.isQuota ? 'border-amber-500/20 bg-amber-500/5' : 'border-rose-500/20 bg-rose-500/5'
      }`}>
        <ShieldAlert className={`w-10 h-10 mx-auto mb-3 ${error.isQuota ? 'text-amber-500' : 'text-rose-500'}`} />
        <p className={`text-sm mb-1 font-bold ${error.isQuota ? 'text-amber-200' : 'text-rose-200'}`}>
          {error.isQuota ? 'Quota Limit Reached' : 'Analysis Failed'}
        </p>
        <p className="text-[11px] text-slate-400 mb-4 max-w-[200px] mx-auto leading-relaxed">
          {error.message}
        </p>
        <button 
          onClick={() => { playChime('click'); fetchAlerts(); }}
          disabled={cooldown > 0}
          className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-2 mx-auto transition-all ${
            cooldown > 0 
              ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-slate-500' 
              : error.isQuota 
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-100'
                : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/30 text-rose-100'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${cooldown > 0 ? '' : 'animate-spin-slow'}`} /> 
          {cooldown > 0 ? `Wait ${cooldown}s` : 'Retry Analysis'}
        </button>
      </div>
    );
  }

  const hasAlerts = data?.alerts && data.alerts.length > 0;

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 bg-ink-950/40 flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
            hasAlerts ? 'bg-amber-500/10 border-amber-400/20' : 'bg-emerald-500/10 border-emerald-400/20'
          }`}>
            <ShieldAlert className={`w-4 h-4 ${hasAlerts ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-white">Historical Weather Analysis</h4>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Pattern Research for {destinationName}
            </p>
          </div>
        </div>
        {!loading && (
          <button 
            onClick={() => { playChime('click'); fetchAlerts(); }}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"
            title="Refresh analysis"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {data?.summary && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex gap-3 items-start">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            "{data.summary}"
          </p>
        </div>
      )}

      {hasAlerts ? (
        <div className="space-y-3">
          {data.alerts.map((alert, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: alert.severity === 'Critical' || alert.severity === 'High' ? [1, 1.01, 1] : 1
              }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.3, delay: idx * 0.1 }
              }}
              className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold uppercase tracking-wide">{alert.type}</h5>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-current bg-opacity-10 font-bold border border-current border-opacity-20">
                        {alert.severity} Risk
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="pt-1 flex items-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">Advice:</span>
                    <p className="text-[10px] font-medium leading-relaxed italic">
                      {alert.advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Zones Button */}
              <div className="pt-2 border-t border-current border-opacity-10">
                <button
                  onClick={() => fetchSafeZones(idx, alert.type)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-current bg-opacity-5 hover:bg-opacity-10 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  <span className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5" />
                    Locate Indoor Safe Zones
                  </span>
                  {safeZonesMap[idx]?.loading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : expandedAlertIdx === idx ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {expandedAlertIdx === idx && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {safeZonesMap[idx]?.loading ? (
                      <div className="py-4 flex flex-col items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] font-mono opacity-60">Scanning for public hubs...</span>
                      </div>
                    ) : safeZonesMap[idx]?.zones.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {safeZonesMap[idx].zones.map((zone, zIdx) => (
                          <div key={zIdx} className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex gap-3">
                            <div className="shrink-0 w-7 h-7 rounded-md bg-white/5 flex items-center justify-center">
                              <MapPin className="w-3.5 h-3.5 opacity-60" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white">{zone.name}</span>
                                <span className="text-[8px] px-1 rounded bg-white/5 opacity-60 uppercase">{zone.type}</span>
                              </div>
                              <p className="text-[9px] opacity-60 flex items-center gap-1">
                                <Info className="w-2.5 h-2.5" /> {zone.location}
                              </p>
                              <p className="text-[9px] opacity-80 leading-snug italic">
                                "{zone.why}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] py-2 opacity-60 text-center italic">No specific safe zones found nearby.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center space-y-2 border border-dashed border-white/5 rounded-2xl bg-emerald-500/[0.02]">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <Sun className="w-5 h-5 text-emerald-400" />
          </div>
          <h5 className="text-sm font-bold text-slate-200">Stable Historical Profile</h5>
          <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto">
            No extreme seasonal risks identified in the historical record for this month.
          </p>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <div className="w-1 h-1 rounded-full bg-blue-400" />
          Research Grounded by Google Search
        </div>
        <a 
          href={`https://www.google.com/search?q=historical+extreme+weather+${destinationName}+${travelMonth+1}`}
          target="_blank"
          rel="noreferrer"
          className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors uppercase tracking-widest"
        >
          Raw Data <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
