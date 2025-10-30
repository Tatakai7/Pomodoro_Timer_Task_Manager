import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Settings } from 'lucide-react';
import { playNotificationSound, showNotification } from '../utils/sounds';
import { Task } from '../lib/supabase';

interface PomodoroTimerProps {
  onSessionComplete: (minutes: number) => void;
  activeTask: Task | null;
}

type TimerMode = 'focus' | 'break';

export function PomodoroTimer({ onSessionComplete, activeTask }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [focusDuration, setFocusDuration] = useState(() => {
    const saved = localStorage.getItem('pomodoro-focus-duration');
    return saved ? parseInt(saved) : 25;
  });
  const [breakDuration, setBreakDuration] = useState(() => {
    const saved = localStorage.getItem('pomodoro-break-duration');
    return saved ? parseInt(saved) : 5;
  });
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('pomodoro-sessions');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data.count;
      }
    }
    return 0;
  });
  const intervalRef = useRef<number | null>(null);

  const FOCUS_TIME = focusDuration * 60;
  const BREAK_TIME = breakDuration * 60;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleTimerComplete();
    }
  }, [timeLeft]);

  const handleTimerComplete = () => {
    if (timeLeft !== 0) return;
    playNotificationSound();

    if (mode === 'focus') {
      showNotification('Focus Session Complete!', 'Great work! Time for a break.');
      onSessionComplete(focusDuration);
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      const today = new Date().toDateString();
      localStorage.setItem('pomodoro-sessions', JSON.stringify({ date: today, count: newCount }));
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      showNotification('Break Complete!', 'Ready to focus again?');
      setMode('focus');
      setTimeLeft(FOCUS_TIME);
    }

    setIsRunning(false);
  };

  const updateDurations = (newFocus: number, newBreak: number) => {
    setFocusDuration(newFocus);
    setBreakDuration(newBreak);
    localStorage.setItem('pomodoro-focus-duration', newFocus.toString());
    localStorage.setItem('pomodoro-break-duration', newBreak.toString());
    if (mode === 'focus') {
      setTimeLeft(newFocus * 60);
    } else {
      setTimeLeft(newBreak * 60);
    }
    setIsRunning(false);
    setShowSettings(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 transition-colors duration-300">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex-1"></div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Timer Settings"
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {showSettings && (
          <div className="w-full mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Timer Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Focus Duration:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={focusDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFocusDuration(Math.max(1, Math.min(60, val)));
                    }}
                    min="1"
                    max="60"
                    className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-center text-sm"
                    aria-label="Focus Duration in minutes"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">min</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-400">Break Duration:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={breakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setBreakDuration(Math.max(1, Math.min(30, val)));
                    }}
                    min="1"
                    max="30"
                    className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-center text-sm"
                    aria-label="Break Duration in minutes"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">min</span>
                </div>
              </div>
              <button
                onClick={() => updateDurations(focusDuration, breakDuration)}
                className="w-full px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => switchMode('focus')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Break
          </button>
        </div>

        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className={`transition-all duration-300 ${
                mode === 'focus'
                  ? 'text-blue-500'
                  : 'text-green-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {mode === 'focus' ? 'Focus Time' : 'Break Time'}
              </div>
            </div>
          </div>
        </div>

        {activeTask && (
          <div className="mb-6 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Working on:</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {activeTask.title}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-105 ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                Start
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock size={18} />
          <span className="text-sm">
            {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed today
          </span>
        </div>
      </div>
    </div>
  );
}
