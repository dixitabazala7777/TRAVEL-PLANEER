import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Info, ExternalLink, RefreshCw, ThermometerSnowflake, Waves, Flame, Wind, Sun } from 'lucide-react';
import { WeatherAlertResponse } from '../types';
import { playChime } from '../utils';

interface WeatherAlertsProps {
  destinationName: string;
  travelMonth: number;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ destinationName, travelMonth }) => {
  const [data, setData] = useState<WeatherAlertResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destinationName, month: travelMonth }),
      });

      if (!response.ok) throw new Error('Failed to fetch weather alerts');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Weather alerts error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="glass rounded-2xl p-6 border border-rose-500/20 bg-rose-500/5 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-sm text-rose-200 mb-4">Historical analysis failed</p>
        <button 
          onClick={() => { playChime('click'); fetchAlerts(); }}
          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-100 flex items-center gap-2 mx-auto transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Retry Analysis
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
            <div key={idx} className={`p-4 rounded-xl border flex gap-4 transition-all hover:scale-[1.01] ${getSeverityColor(alert.severity)}`}>
              <div className="shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold uppercase tracking-wide">{alert.type}</h5>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-current bg-opacity-10 font-bold border border-current border-opacity-20">
                    {alert.severity} Risk
                  </span>
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
