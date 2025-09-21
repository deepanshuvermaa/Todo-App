import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartWork: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const motivationalQuotes = [
    "Focus on the process, not the outcome.",
    "Small progress is still progress.",
    "You're capable of more than you think.",
    "Every expert was once a beginner.",
    "The only impossible journey is the one you never begin.",
    "Success is the sum of small efforts repeated daily.",
    "Focus is a matter of deciding what things you're not going to do.",
    "Productivity is never an accident. It is always the result of commitment.",
    "Time is what we want most, but what we use worst.",
    "The key is not to prioritize what's on your schedule, but to schedule your priorities."
  ];

  useEffect(() => {
    // Set random motivational quote
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [isBreak, sessions]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);

    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = isBreak ? 'Break time is over! Ready to work?' : 'Great work! Time for a break.';
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico'
      });
    }

    if (isBreak) {
      // Break finished, start work session
      setIsBreak(false);
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartWork) {
        setIsActive(true);
      }
    } else {
      // Work session finished
      const newSessions = sessions + 1;
      setSessions(newSessions);
      setTotalSessions(prev => prev + 1);

      // Determine break type
      const isLongBreak = newSessions % settings.sessionsUntilLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreak : settings.shortBreak;

      setIsBreak(true);
      setTimeLeft(breakDuration * 60);

      if (settings.autoStartBreaks) {
        setIsActive(true);
      }
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setSessions(0);
    setTimeLeft(settings.workDuration * 60);
  };

  const skipSession = () => {
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = isBreak
      ? (sessions % settings.sessionsUntilLongBreak === 0 && sessions > 0 ? settings.longBreak : settings.shortBreak) * 60
      : settings.workDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getStatusColor = () => {
    if (isBreak) {
      return sessions % settings.sessionsUntilLongBreak === 0 && sessions > 0
        ? '#6366f1' // Long break - indigo
        : '#10b981'; // Short break - emerald
    }
    return '#87CEEB'; // Work session - sky blue (focus color)
  };

  const getStatusIcon = () => {
    if (isBreak) {
      return sessions % settings.sessionsUntilLongBreak === 0 && sessions > 0 ? '🧘‍♂️' : '☕';
    }
    return '🍅';
  };

  const getStatusText = () => {
    if (isBreak) {
      return sessions % settings.sessionsUntilLongBreak === 0 && sessions > 0 ? 'Long Break' : 'Short Break';
    }
    return 'Focus Time';
  };

  return (
    <div className="pomodoro-timer max-w-md mx-auto">
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrPp66hVFApGnt/yv2whCji" type="audio/wav" />
      </audio>

      <div className="relative overflow-hidden rounded-xl p-6 shadow-lg" style={{
        backgroundColor: getStatusColor(),
        color: isBreak ? '#ffffff' : '#1a202c'
      }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 text-center">
          {/* Status Header */}
          <div className="mb-4">
            <div className="text-2xl mb-1">{getStatusIcon()}</div>
            <h2 className="text-xl font-bold">{getStatusText()}</h2>
            <p className="text-sm opacity-90">Session {sessions + 1}</p>
          </div>

          {/* Timer Display */}
          <motion.div
            key={`${isBreak}-${sessions}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="text-5xl md:text-6xl font-mono font-bold mb-3">
              {formatTime(timeLeft)}
            </div>

            {/* Progress Ring */}
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.2"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: getProgress() / 100 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    strokeDasharray: '351.86',
                    strokeDashoffset: `${351.86 * (1 - getProgress() / 100)}`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold">{Math.round(getProgress())}%</span>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                isActive
                  ? 'bg-white text-gray-700 hover:bg-gray-100'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isActive ? '⏸️' : '▶️'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                !isBreak
                  ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-70'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              🔄
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipSession}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                !isBreak
                  ? 'bg-gray-700 bg-opacity-50 hover:bg-opacity-70'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
            >
              ⏭️
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div>
              <div className="text-2xl font-bold">{sessions}</div>
              <div className="text-sm opacity-75">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <div className="text-sm opacity-75">Total Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.ceil(sessions / settings.sessionsUntilLongBreak)}</div>
              <div className="text-sm opacity-75">Cycles</div>
            </div>
          </div>

          {/* Motivational Quote */}
          <motion.div
            key={motivationalQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-lg italic opacity-90 max-w-md mx-auto">
              "{motivationalQuote}"
            </p>
          </motion.div>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm opacity-75 hover:opacity-100 transition-opacity"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4">Pomodoro Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Work Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sessions until Long Break</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(e.target.value) || 4 }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  className="rounded"
                />
                <span>Auto-start breaks</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoStartWork}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                  className="rounded"
                />
                <span>Auto-start work sessions</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setTimeLeft(settings.workDuration * 60);
                  setIsBreak(false);
                  setShowSettings(false);
                }}
                className="btn-primary flex-1"
              >
                Apply Settings
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;