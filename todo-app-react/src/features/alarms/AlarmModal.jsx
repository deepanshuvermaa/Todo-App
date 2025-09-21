import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AlarmModal = ({ alarm, onDismiss, onSnooze, formatTime }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const snoozeOptions = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
  ];

  const handleSnooze = (minutes) => {
    onSnooze(alarm.id, minutes);
  };

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{
          scale: [1, 1.02, 1],
          y: 0,
          boxShadow: [
            '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
            '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
            '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
          ]
        }}
        transition={{
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 0.3 }
        }}
        className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            ⏰
          </motion.div>
          <h2 className="text-2xl font-bold">ALARM</h2>
          <div className="text-sm opacity-90">
            Ringing for {formatElapsedTime(timeElapsed)}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 text-center">
          <div className="text-4xl font-mono font-bold mb-3">
            {formatTime(alarm.time)}
          </div>

          <div className="text-xl font-semibold mb-2">
            {alarm.label || 'Alarm'}
          </div>

          {alarm.message && (
            <div className="text-lg mb-4 opacity-90">
              {alarm.message}
            </div>
          )}

          <div className="text-sm opacity-75 mb-6">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Dismiss Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDismiss(alarm.id)}
              className="w-full bg-white text-red-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-all duration-200"
            >
              STOP ALARM
            </motion.button>

            {/* Snooze Options */}
            <div className="grid grid-cols-2 gap-2">
              {snoozeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSnooze(option.value)}
                  className="bg-red-400 hover:bg-red-300 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 shadow"
                >
                  Snooze {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="bg-red-700 px-6 py-3 text-center text-sm opacity-90">
          <div className="flex items-center justify-center gap-2">
            <span>💡</span>
            <span>Swipe or tap to dismiss</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AlarmModal;