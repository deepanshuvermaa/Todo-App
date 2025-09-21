import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DigitalTimer = ({ currentTime }) => {
  const [timerMode, setTimerMode] = useState('clock'); // clock, countdown, stopwatch
  const [countdownTime, setCountdownTime] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [countdownInput, setCountdownInput] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [lapTimes, setLapTimes] = useState([]);

  const countdownRef = useRef(null);
  const stopwatchRef = useRef(null);

  useEffect(() => {
    if (countdownActive && countdownTime > 0) {
      countdownRef.current = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setCountdownActive(false);
            // Timer finished - play sound/notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Finished!', {
                body: 'Your countdown timer has reached zero.',
                icon: '/favicon.ico'
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }

    return () => clearInterval(countdownRef.current);
  }, [countdownActive, countdownTime]);

  useEffect(() => {
    if (stopwatchActive) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 10); // Update every 10ms for more precision
    } else {
      clearInterval(stopwatchRef.current);
    }

    return () => clearInterval(stopwatchRef.current);
  }, [stopwatchActive]);

  const formatTime = (seconds, includeMs = false) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = includeMs ? Math.floor((seconds * 100) % 100) : 0;

    if (includeMs) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = () => {
    const totalSeconds = countdownInput.hours * 3600 + countdownInput.minutes * 60 + countdownInput.seconds;
    if (totalSeconds > 0) {
      setCountdownTime(totalSeconds);
      setCountdownActive(true);
    }
  };

  const resetCountdown = () => {
    setCountdownActive(false);
    setCountdownTime(0);
  };

  const startStopwatch = () => {
    setStopwatchActive(!stopwatchActive);
  };

  const resetStopwatch = () => {
    setStopwatchActive(false);
    setStopwatchTime(0);
    setLapTimes([]);
  };

  const addLap = () => {
    setLapTimes(prev => [...prev, stopwatchTime / 100]);
  };

  const renderClock = () => (
    <div className="text-center">
      <motion.div
        key={currentTime.getSeconds()}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.5 }}
        className="text-6xl md:text-8xl font-mono font-bold mb-4"
        style={{
          color: '#3b82f6',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        {currentTime.toLocaleTimeString()}
      </motion.div>
      <div className="text-xl text-gray-500 dark:text-gray-400">
        {currentTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );

  const renderCountdown = () => (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">Countdown Timer</h3>

        {!countdownActive && countdownTime === 0 && (
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="23"
                value={countdownInput.hours}
                onChange={(e) => setCountdownInput(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={countdownInput.minutes}
                onChange={(e) => setCountdownInput(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={countdownInput.seconds}
                onChange={(e) => setCountdownInput(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                className="input-field text-center"
              />
            </div>
          </div>
        )}

        <motion.div
          animate={{
            scale: countdownActive && countdownTime <= 10 && countdownTime > 0 ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.5, repeat: countdownTime <= 10 && countdownTime > 0 ? Infinity : 0 }}
          className="text-6xl md:text-8xl font-mono font-bold mb-4"
          style={{
            color: countdownTime <= 10 && countdownTime > 0 ? '#ef4444' : 'inherit'
          }}
        >
          {formatTime(countdownTime)}
        </motion.div>

        <div className="flex gap-4 justify-center">
          {!countdownActive ? (
            <button
              onClick={startCountdown}
              className="btn-primary flex items-center gap-2"
              disabled={countdownInput.hours === 0 && countdownInput.minutes === 0 && countdownInput.seconds === 0}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M12 3v18" />
              </svg>
              Start
            </button>
          ) : (
            <button
              onClick={() => setCountdownActive(false)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Pause
            </button>
          )}

          <button
            onClick={resetCountdown}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  const renderStopwatch = () => (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">Stopwatch</h3>

        <div className="text-6xl md:text-8xl font-mono font-bold mb-4">
          {formatTime(stopwatchTime / 100, true)}
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={startStopwatch}
            className={`px-6 py-2 rounded-lg transition-colors ${
              stopwatchActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {stopwatchActive ? 'Stop' : 'Start'}
          </button>

          {stopwatchActive && (
            <button
              onClick={addLap}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Lap
            </button>
          )}

          <button
            onClick={resetStopwatch}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>

        {lapTimes.length > 0 && (
          <div className="max-w-md mx-auto">
            <h4 className="font-semibold mb-2">Lap Times</h4>
            <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {lapTimes.map((lap, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>Lap {index + 1}</span>
                  <span className="font-mono">{formatTime(lap, true)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="digital-timer">
      <div className="mb-6">
        <div className="flex justify-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 max-w-md mx-auto">
          <button
            onClick={() => setTimerMode('clock')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              timerMode === 'clock'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🕐 Clock
          </button>
          <button
            onClick={() => setTimerMode('countdown')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              timerMode === 'countdown'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⏱️ Timer
          </button>
          <button
            onClick={() => setTimerMode('stopwatch')}
            className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
              timerMode === 'stopwatch'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ⏲️ Stopwatch
          </button>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-2xl border border-gray-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={timerMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {timerMode === 'clock' && renderClock()}
            {timerMode === 'countdown' && renderCountdown()}
            {timerMode === 'stopwatch' && renderStopwatch()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DigitalTimer;