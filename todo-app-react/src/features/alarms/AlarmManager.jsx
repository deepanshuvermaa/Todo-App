import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';
import AlarmForm from './AlarmForm';
import FlipClock from './FlipClock';
import DigitalTimer from './DigitalTimer';
import PomodoroTimer from './PomodoroTimer';

const AlarmManager = () => {
  const { alarms, addAlarm, updateAlarm, deleteAlarm } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, clock, digital, pomodoro
  const [alarmSound, setAlarmSound] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = now.toTimeString().slice(0, 5);
      const currentDay = now.getDay();

      alarms.forEach(alarm => {
        if (!alarm.enabled || activeAlarms.includes(alarm.id)) return;

        const alarmTime = alarm.time;
        const shouldRing = alarm.repeat === 'once' ||
          (alarm.repeat === 'daily') ||
          (alarm.repeat === 'weekdays' && currentDay >= 1 && currentDay <= 5) ||
          (alarm.repeat === 'weekends' && (currentDay === 0 || currentDay === 6)) ||
          (alarm.repeat === 'custom' && alarm.customDays?.includes(currentDay));

        if (shouldRing && currentTimeStr === alarmTime) {
          triggerAlarm(alarm);
        }
      });
    };

    checkAlarms();
  }, [currentTime, alarms, activeAlarms]);

  const triggerAlarm = (alarm) => {
    setActiveAlarms(prev => [...prev, alarm.id]);

    // Play alarm sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alarm.label || 'Alarm', {
        body: alarm.message || 'Time for your reminder!',
        icon: '/favicon.ico'
      });
    }

    // Auto-dismiss after 1 minute if not manually dismissed
    setTimeout(() => {
      dismissAlarm(alarm.id);
    }, 60000);
  };

  const dismissAlarm = (alarmId) => {
    setActiveAlarms(prev => prev.filter(id => id !== alarmId));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleSaveAlarm = (alarmData) => {
    addAlarm({
      ...alarmData,
      id: Date.now().toString(),
      enabled: true,
      createdAt: new Date().toISOString()
    });
    setShowForm(false);
  };

  const toggleAlarm = (alarmId) => {
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
      updateAlarm(alarmId, { ...alarm, enabled: !alarm.enabled });
    }
  };

  const deleteAlarmHandler = (alarmId) => {
    if (window.confirm('Are you sure you want to delete this alarm?')) {
      deleteAlarm(alarmId);
      dismissAlarm(alarmId);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderActiveAlarms = () => {
    if (activeAlarms.length === 0) return null;

    return (
      <AnimatePresence>
        {activeAlarms.map(alarmId => {
          const alarm = alarms.find(a => a.id === alarmId);
          if (!alarm) return null;

          return (
            <motion.div
              key={alarmId}
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  backgroundColor: ['#ef4444', '#dc2626', '#ef4444']
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-red-500 text-white p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center"
              >
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-bold mb-2">{alarm.label || 'Alarm'}</h2>
                <p className="text-xl mb-2">{formatTime(alarm.time)}</p>
                {alarm.message && (
                  <p className="text-lg mb-6">{alarm.message}</p>
                )}
                <button
                  onClick={() => dismissAlarm(alarmId)}
                  className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    );
  };

  return (
    <div className="alarm-manager">
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCjiS1fPMeDEFJHfJ8N2QQAoUXrPp66hVFApGnt/yv2whCji" type="audio/wav" />
      </audio>

      {renderActiveAlarms()}

      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Alarms & Timers</h2>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Alarms
            </button>
            <button
              onClick={() => setViewMode('digital')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'digital'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setViewMode('pomodoro')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'pomodoro'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Focus
            </button>
          </div>

          {viewMode === 'list' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base">Add Alarm</span>
            </button>
          )}
        </div>

        <button
          onClick={requestNotificationPermission}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          Enable notifications for better alarm experience
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <AlarmForm
              onSave={handleSaveAlarm}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'digital' && <DigitalTimer currentTime={currentTime} />}
      {viewMode === 'pomodoro' && <PomodoroTimer />}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {alarms.length > 0 ? (
            alarms.map((alarm) => (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-mono font-bold">
                      {formatTime(alarm.time)}
                    </div>
                    <div>
                      <div className="font-medium">{alarm.label || 'Alarm'}</div>
                      {alarm.message && (
                        <div className="text-sm text-gray-500">{alarm.message}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Repeat: {alarm.repeat}
                        {alarm.repeat === 'custom' && alarm.customDays && (
                          <span> ({['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                            .filter((_, i) => alarm.customDays.includes(i))
                            .join(', ')})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        alarm.enabled
                          ? 'bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => deleteAlarmHandler(alarm.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-6xl mb-4">⏰</div>
              <p className="text-lg text-gray-500 mb-4">No alarms set</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Create your first alarm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlarmManager;