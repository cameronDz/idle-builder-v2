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
  /** Reduce the active timer by `ms` milliseconds. Completes the timer if the reduction exceeds the remaining time. No-op when the timer is not running. */
  reduceTime: (ms: number) => void;
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
      // stored exists but startTime is null and not completed — building is idle between levels
      return {
        hasStarted: false,
        isComplete: false,
        level: stored.level,
        progress: 0,
        timeRemaining: getLevelAdjustedDuration(duration, stored.level),
      };
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
            level: prev.level + 1,
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

  // Persist completion to localStorage as a proper side effect (not inside a state updater)
  useEffect(() => {
    if (timerState.isComplete && timerState.hasStarted) {
      saveToStorage(taskId, {
        startTime: null,
        isCompleted: true,
        level: timerState.level,
        baseDuration: duration,
      });
    }
  }, [timerState.isComplete, timerState.hasStarted, timerState.level, taskId, duration]);

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

  /**
   * Reduces the active timer by `ms` milliseconds by shifting the stored
   * startTime back in time.  If the reduction causes elapsed >= adjustedDuration
   * the timer completes immediately (level increments, isComplete = true).
   * No-op when the timer has not started or is already complete, or when `ms`
   * is not a positive number.
   */
  const reduceTime = useCallback((ms: number) => {
    if (ms <= 0) return;
    setTimerState(prev => {
      if (!prev.hasStarted || prev.isComplete) return prev;

      const stored = loadFromStorage(taskId);
      if (!stored || stored.startTime === null) return prev;

      const newStartTime = stored.startTime - ms;
      const adjustedDuration = getLevelAdjustedDuration(duration, prev.level);
      const elapsed = Date.now() - newStartTime;

      if (elapsed >= adjustedDuration) {
        clearTick();
        const nextLevel = prev.level + 1;
        saveToStorage(taskId, {
          startTime: null,
          isCompleted: true,
          level: nextLevel,
          baseDuration: duration,
        });
        return {
          hasStarted: true,
          isComplete: true,
          level: nextLevel,
          progress: 100,
          timeRemaining: 0,
        };
      }

      saveToStorage(taskId, { ...stored, startTime: newStartTime });
      const remaining = adjustedDuration - elapsed;
      return {
        ...prev,
        progress: Math.floor((elapsed / adjustedDuration) * 100),
        timeRemaining: remaining,
      };
    });
  }, [clearTick, duration, taskId]);

  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  return { timerState, startTimer, resetTimer, completeTimer, acknowledgeComplete, reduceTime };
}
