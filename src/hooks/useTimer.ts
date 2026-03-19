import { useState, useEffect, useCallback, useRef } from 'react';
import type { BuildingTimer } from '../types/game';

interface TimerStorageData {
  startTime: number | null;
  isCompleted: boolean;
  level: number;
  baseDuration: number;
}

function getLevelAdjustedDuration(baseDuration: number, level: number): number {
  return Math.floor(baseDuration * Math.pow(2.5, level));
}

function getStorageKey(taskId: string): string {
  return `timer_${taskId}`;
}

function loadFromStorage(taskId: string): TimerStorageData | null {
  try {
    const raw = localStorage.getItem(getStorageKey(taskId));
    if (!raw) return null;
    return JSON.parse(raw) as TimerStorageData;
  } catch {
    return null;
  }
}

function saveToStorage(taskId: string, data: TimerStorageData): void {
  try {
    localStorage.setItem(getStorageKey(taskId), JSON.stringify(data));
  } catch {
    // localStorage unavailable — degrade gracefully
  }
}


interface UseTimerReturn {
  timerState: BuildingTimer;
  startTimer: () => void;
  resetTimer: () => void;
  completeTimer: () => void;
  acknowledgeComplete: () => void;
}

export function useTimer(duration: number, taskId: string): UseTimerReturn {
  const initialState = useCallback((): BuildingTimer => {
    const stored = loadFromStorage(taskId);
    if (stored) {
      const adjustedDuration = getLevelAdjustedDuration(duration, stored.level);

      if (stored.isCompleted) {
        return {
          hasStarted: true,
          isComplete: true,
          level: stored.level,
          progress: 100,
          timeRemaining: 0,
        };
      }

      if (stored.startTime !== null) {
        const elapsed = Date.now() - stored.startTime;
        if (elapsed >= adjustedDuration) {
          return {
            hasStarted: true,
            isComplete: true,
            level: stored.level,
            progress: 100,
            timeRemaining: 0,
          };
        }
        const remaining = adjustedDuration - elapsed;
        return {
          hasStarted: true,
          isComplete: false,
          level: stored.level,
          progress: Math.floor((elapsed / adjustedDuration) * 100),
          timeRemaining: remaining,
        };
      }
    }

    return {
      hasStarted: false,
      isComplete: false,
      level: 0,
      progress: 0,
      timeRemaining: getLevelAdjustedDuration(duration, 0),
    };
  }, [duration, taskId]);

  const [timerState, setTimerState] = useState<BuildingTimer>(initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (!prev.hasStarted || prev.isComplete) {
          clearTick();
          return prev;
        }

        const stored = loadFromStorage(taskId);
        if (!stored || stored.startTime === null) {
          clearTick();
          return prev;
        }

        const adjustedDuration = getLevelAdjustedDuration(duration, prev.level);
        const elapsed = Date.now() - stored.startTime;

        if (elapsed >= adjustedDuration) {
          clearTick();
          return {
            ...prev,
            isComplete: true,
            progress: 100,
            timeRemaining: 0,
          };
        }

        return {
          ...prev,
          progress: Math.floor((elapsed / adjustedDuration) * 100),
          timeRemaining: adjustedDuration - elapsed,
        };
      });
    }, 100);
  }, [clearTick, duration, taskId]);

  // Resume tick if loaded state was mid-progress
  useEffect(() => {
    const state = initialState();
    if (state.hasStarted && !state.isComplete) {
      startTick();
    }
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab sync via StorageEvent
  useEffect(() => {
    const storageKey = getStorageKey(taskId);
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      setTimerState(initialState());
      const current = loadFromStorage(taskId);
      if (current?.startTime !== null && !current?.isCompleted) {
        startTick();
      } else {
        clearTick();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearTick, initialState, startTick, taskId]);

  const startTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.hasStarted) return prev;
      const data: TimerStorageData = {
        startTime: Date.now(),
        isCompleted: false,
        level: prev.level,
        baseDuration: duration,
      };
      saveToStorage(taskId, data);
      const adjustedDuration = getLevelAdjustedDuration(duration, prev.level);
      const next: BuildingTimer = {
        hasStarted: true,
        isComplete: false,
        level: prev.level,
        progress: 0,
        timeRemaining: adjustedDuration,
      };
      return next;
    });
    startTick();
  }, [duration, startTick, taskId]);

  const completeTimer = useCallback(() => {
    clearTick();
    setTimerState(prev => {
      const nextLevel = prev.level + 1;
      const data: TimerStorageData = {
        startTime: null,
        isCompleted: true,
        level: nextLevel,
        baseDuration: duration,
      };
      saveToStorage(taskId, data);
      return {
        hasStarted: true,
        isComplete: true,
        level: nextLevel,
        progress: 100,
        timeRemaining: 0,
      };
    });
  }, [clearTick, duration, taskId]);

  const acknowledgeComplete = useCallback(() => {
    setTimerState(prev => {
      const data: TimerStorageData = {
        startTime: null,
        isCompleted: false,
        level: prev.level,
        baseDuration: duration,
      };
      saveToStorage(taskId, data);
      return {
        hasStarted: false,
        isComplete: false,
        level: prev.level,
        progress: 0,
        timeRemaining: getLevelAdjustedDuration(duration, prev.level),
      };
    });
  }, [duration, taskId]);

  const resetTimer = useCallback(() => {
    clearTick();
    setTimerState(prev => {
      const data: TimerStorageData = {
        startTime: null,
        isCompleted: false,
        level: prev.level,
        baseDuration: duration,
      };
      saveToStorage(taskId, data);
      return {
        hasStarted: false,
        isComplete: false,
        level: prev.level,
        progress: 0,
        timeRemaining: getLevelAdjustedDuration(duration, prev.level),
      };
    });
  }, [clearTick, duration, taskId]);

  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  return { timerState, startTimer, resetTimer, completeTimer, acknowledgeComplete };
}
