import React, { useState, useEffect, useRef } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Mic, 
  MicOff, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Volume2, 
  VolumeX,
  AlertTriangle,
  Info,
  Flame,
  Zap
} from 'lucide-react';
import { playChime } from '../utils';

interface HardwareAuditCenterProps {
  onPowerModeChange?: (lowPower: boolean) => void;
}

export const HardwareAuditCenter: React.FC<HardwareAuditCenterProps> = ({ onPowerModeChange }) => {
  // Battery States
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isLowPowerMode, setIsLowPowerMode] = useState<boolean>(false);

  // Audio Analyzer States
  const [decibels, setDecibels] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);

  // Audio Node Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ==========================================
  // BATTERY API HOOKS
  // ==========================================
  useEffect(() => {
    let batteryInstance: any = null;

    const updateBatteryInfo = (battery: any) => {
      const level = Math.round(battery.level * 100);
      setBatteryLevel(level);
      setIsCharging(battery.charging);
      
      // Auto Eco-Mode when battery is under 20% and not charging
      const lowPower = battery.level < 0.20 && !battery.charging;
      setIsLowPowerMode(lowPower);
      if (onPowerModeChange) {
        onPowerModeChange(lowPower);
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        updateBatteryInfo(battery);
        
        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
      }).catch((err: any) => {
        console.warn('Battery API not supported or blocked:', err);
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => {});
        batteryInstance.removeEventListener('chargingchange', () => {});
      }
    };
  }, [onPowerModeChange]);

  // ==========================================
  // WEB AUDIO API REAL-TIME ANALYZER
  // ==========================================
  const stopAudioMonitor = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    setIsMonitoring(false);
    setDecibels(0);
  };

  const startAudioMonitor = async () => {
    setHasPermissionError(false);
    playChime('click');

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setIsMonitoring(true);

      const checkVolume = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map raw frequencies to a realistic decibel reading (30 dB to 110 dB)
        const dbReading = Math.min(110, Math.floor(average * 0.75 + 30));
        setDecibels(dbReading);

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.error('Microphone access denied:', err);
      setHasPermissionError(true);
      setIsMonitoring(false);
      setDecibels(0);
    }
  };

  const toggleMonitor = () => {
    if (isMonitoring) {
      stopAudioMonitor();
      playChime('click');
    } else {
      startAudioMonitor();
    }
  };

  // Clean up audio references on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Determine threat level & colors based on current ambient decibels
  const getThreatAssessment = (db: number) => {
    if (db >= 85) {
      return {
        label: 'DANGER: EXTREME SCAM RISK',
        desc: 'Screaming vendors, aggressive callouts, high-pressure street hustlers. Keep your head down and proceed quickly.',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        barColor: 'bg-red-500'
      };
    }
    if (db >= 65) {
      return {
        label: 'WARNING: HIGH TRADING NOISE',
        desc: 'Busy market street, loud commercial center. High concentration of tourists. Guard your wallet and stay alert.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
        barColor: 'bg-amber-500'
      };
    }
    if (db > 0) {
      return {
        label: 'STABLE: SAFE / MODERATE NOISE',
        desc: 'Normal ambient volume. Average risk profiles. Standard travel alertness is sufficient.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        barColor: 'bg-emerald-500'
      };
    }
    return {
      label: 'IDLE / CALIBRATING',
      desc: 'Audit center waiting for live sound. Start monitoring to scan environmental noise thresholds.',
      color: 'text-slate-400',
      bg: 'bg-slate-500/10 border-white/5',
      barColor: 'bg-indigo-500'
    };
  };

  const threat = getThreatAssessment(decibels);

  // Manual toggle for low power mode simulation if Battery API is not supported / to test easily
  const toggleSimulationLowPower = () => {
    playChime('click');
    const newState = !isLowPowerMode;
    setIsLowPowerMode(newState);
    if (onPowerModeChange) {
      onPowerModeChange(newState);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* 1. AMBIENT SAFETY DECIBEL ANALYZER */}
      <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-display font-semibold text-sm">Ambient Safety Decibel Analyzer</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Live Scam & Crowd Tracker</p>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Measures surrounding hustle volume to flag chaotic tourist hotspots, high-pressure street seller grids, and aggressive marketing zones.
          </p>
        </div>

        {/* Meter Window */}
        <div className="p-4 bg-ink-950/80 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
          {/* Waveform effect when active */}
          {isMonitoring && (
            <div className="absolute inset-x-0 bottom-0 h-10 opacity-10 flex items-end justify-center gap-1">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-indigo-500 rounded-t-sm"
                  style={{ 
                    height: `${Math.max(10, Math.min(100, Math.random() * decibels))}%`,
                    animation: `pulse 0.5s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          )}

          <div className="text-center z-10">
            <span className="text-3xl font-mono font-black text-indigo-400 flex items-baseline justify-center gap-1">
              {decibels}
              <span className="text-xs text-slate-500 font-normal">dB</span>
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full bg-slate-800/40 h-2 rounded-full overflow-hidden z-10 border border-white/5">
            <div 
              className={`h-full transition-all duration-150 ${threat.barColor}`}
              style={{ width: `${isMonitoring ? (decibels / 110) * 100 : 0}%` }}
            />
          </div>

          {/* Threat level Badge */}
          <div className={`w-full p-2.5 rounded-lg border text-center ${threat.bg} z-10 transition-all`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${threat.color}`}>
              {threat.label}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              {threat.desc}
            </p>
          </div>
        </div>

        {hasPermissionError && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-300 leading-normal">
              Microphone permission denied. Enable browser mic access to perform active noise safety audits.
            </p>
          </div>
        )}

        <button
          onClick={toggleMonitor}
          className={`w-full text-xs font-bold py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isMonitoring 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
          }`}
        >
          {isMonitoring ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              Stop Ambient Audio Stream
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              Initialize Live Sound Audit
            </>
          )}
        </button>
      </div>

      {/* 2. SYSTEM POWER MATRIX */}
      <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-4 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Battery className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-display font-semibold text-sm">System Power Matrix</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Device Resources Monitor</p>
              </div>
            </div>
            {isCharging && <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monitors real-time battery thresholds to dynamically load responsive visual grids, preserve device safety, and toggle energy throttle mode.
          </p>
        </div>

        {/* Battery Status Layout */}
        <div className="p-4 bg-ink-950/80 rounded-xl border border-white/5 space-y-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Current Level</span>
              <p className="text-2xl font-mono font-black text-white">{batteryLevel}%</p>
            </div>
            
            {/* Battery graphic */}
            <div className="relative w-16 h-8 border-2 border-slate-600 rounded-md p-0.5 flex items-center">
              <div 
                className={`h-full rounded-sm transition-all duration-500 ${
                  batteryLevel <= 20 
                    ? 'bg-rose-500 animate-pulse' 
                    : batteryLevel <= 50 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
              <div className="absolute -right-1.5 top-2.5 w-1 h-2 bg-slate-600 rounded-r-xs" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Power Connection</span>
            <span className={`text-[11px] font-mono font-bold ${isCharging ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isCharging ? 'AC ADAPTER DETECTED' : 'DISCHARGING / PORTABLE'}
            </span>
          </div>

          {/* Eco Throttle Details */}
          <div className={`p-2 rounded border text-center ${
            isLowPowerMode 
              ? 'bg-amber-500/10 border-amber-500/20' 
              : 'bg-white/[0.01] border-white/5'
          }`}>
            <span className={`text-[10px] font-mono font-black block tracking-widest uppercase ${
              isLowPowerMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'
            }`}>
              {isLowPowerMode ? '🔋 ECO THROTTLE ACTIVE (HIGH CONTRAST)' : 'POWER CONSERVATION IDLE'}
            </span>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
              {isLowPowerMode 
                ? 'Layout adjusted for high accessibility and low battery draw.' 
                : 'Triggers high-contrast layout automatically at <20% battery.'}
            </p>
          </div>
        </div>

        {/* Simulation button */}
        <button
          onClick={toggleSimulationLowPower}
          className="w-full text-xs font-bold py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Simulate Eco Throttle Toggle
        </button>
      </div>

    </div>
  );
};
