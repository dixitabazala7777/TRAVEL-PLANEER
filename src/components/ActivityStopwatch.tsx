import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Plus, Minus } from 'lucide-react';
import { playChime } from '../utils';

interface ActivityStopwatchProps {
  activityId: string;
}

interface StopwatchState {
  accumulatedTime: number; // in seconds
  isRunning: boolean;
  startTime: number | null; // timestamp in ms
}

export const ActivityStopwatch: React.FC<ActivityStopwatchProps> = ({ activityId }) => {
  const [state, setState] = useState<StopwatchState>(() => {
    try {
      const stored = localStorage.getItem(`waypoint_stopwatch_${activityId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load stopwatch state', e);
    }
    return {
      accumulatedTime: 0,
      isRunning: false,
      startTime: null,
    };
  });

  const [displaySeconds, setDisplaySeconds] = useState(0);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem(`waypoint_stopwatch_${activityId}`, JSON.stringify(state));
  }, [state, activityId]);

  // Handle active ticking while running
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const updateDisplay = () => {
      if (state.isRunning && state.startTime) {
        const elapsedMs = Date.now() - state.startTime;
        const totalSec = state.accumulatedTime + Math.floor(elapsedMs / 1000);
        setDisplaySeconds(totalSec);
      } else {
        setDisplaySeconds(state.accumulatedTime);
      }
    };

    updateDisplay(); // Initial draw

    if (state.isRunning) {
      intervalId = setInterval(updateDisplay, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isRunning, state.startTime, state.accumulatedTime]);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('click');
    setState(prev => {
      if (prev.isRunning) return prev;
      return {
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      };
    });
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('click');
    setState(prev => {
      if (!prev.isRunning || prev.startTime === null) return prev;
      const elapsedSec = Math.floor((Date.now() - prev.startTime) / 1000);
      return {
        accumulatedTime: prev.accumulatedTime + elapsedSec,
        isRunning: false,
        startTime: null,
      };
    });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('click');
    if (window.confirm('Are you sure you want to reset the tracked time for this activity?')) {
      setState({
        accumulatedTime: 0,
        isRunning: false,
        startTime: null,
      });
      setDisplaySeconds(0);
    }
  };

  const handleAdjustTime = (e: React.MouseEvent, secondsToAdd: number) => {
    e.stopPropagation();
    playChime('click');
    setState(prev => {
      // If running, we calculate the accumulated time first
      let currentAccumulated = prev.accumulatedTime;
      let currentStartTime = prev.startTime;
      
      if (prev.isRunning && prev.startTime !== null) {
        const elapsedSec = Math.floor((Date.now() - prev.startTime) / 1000);
        currentAccumulated += elapsedSec;
        currentStartTime = Date.now(); // reset start point to now
      }

      const nextAccumulated = Math.max(0, currentAccumulated + secondsToAdd);
      return {
        ...prev,
        accumulatedTime: nextAccumulated,
        startTime: currentStartTime,
      };
    });
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div 
      className="mt-3 bg-ink-950/40 border border-white/5 rounded-lg p-2 flex flex-col gap-1.5 transition-all hover:bg-ink-950/60"
      id={`stopwatch-${activityId}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" /> TIME TRACKER
        </span>
        {state.isRunning && (
          <div className="flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-mono font-black text-emerald-400 uppercase tracking-wide">TRACKING ACTIVE</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Stopwatch Display */}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-sm font-mono font-bold tracking-wider leading-none transition-colors duration-300 ${
            state.isRunning ? 'text-emerald-400' : 'text-slate-200'
          }`}>
            {formatTime(displaySeconds)}
          </span>
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            {displaySeconds >= 3600 ? 'hrs' : displaySeconds >= 60 ? 'mins' : 'secs'}
          </span>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick manual tuning buttons */}
          <button
            type="button"
            title="Subtract 5 minutes"
            disabled={displaySeconds < 60}
            onClick={(e) => handleAdjustTime(e, -300)}
            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-slate-200 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed outline-none"
          >
            <Minus className="w-3 h-3" />
          </button>
          
          <button
            type="button"
            title="Add 5 minutes"
            onClick={(e) => handleAdjustTime(e, 300)}
            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-slate-200 flex items-center justify-center transition outline-none"
          >
            <Plus className="w-3 h-3" />
          </button>

          <span className="w-[1px] h-3.5 bg-white/10 self-center mx-0.5" />

          {/* Reset button */}
          <button
            type="button"
            title="Reset tracking"
            disabled={displaySeconds === 0 && !state.isRunning}
            onClick={handleReset}
            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-rose-400 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed outline-none"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Start / Pause Toggle */}
          {state.isRunning ? (
            <button
              type="button"
              title="Pause tracking"
              onClick={handlePause}
              className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/20 text-amber-400 flex items-center gap-1 text-[10px] font-mono font-bold transition outline-none cursor-pointer"
            >
              <Pause className="w-2.5 h-2.5 fill-amber-400/20" /> PAUSE
            </button>
          ) : (
            <button
              type="button"
              title="Start tracking"
              onClick={handleStart}
              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 text-emerald-400 flex items-center gap-1 text-[10px] font-mono font-bold transition outline-none cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 fill-emerald-400/20" /> START
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
