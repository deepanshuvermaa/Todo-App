import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';
import ConfirmDialog from '@/components/ConfirmDialog';
import AlarmForm from './AlarmForm';
import FlipClock from './FlipClock';
import DigitalTimer from './DigitalTimer';
import PomodoroTimer from './PomodoroTimer';
import AlarmModal from './AlarmModal';
import AlarmSoundManager from './AlarmSoundManager';

const AlarmManager = () => {
  const { alarms, addAlarm, updateAlarm, deleteAlarm, checkPreTaskReminders } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, clock, digital, pomodoro
  const [snoozedAlarms, setSnoozedAlarms] = useState(new Map());
  const [alarmSettings, setAlarmSettings] = useState({
    soundType: 'classic',
    volume: 0.7,
    snoozeEnabled: true,
    vibrationEnabled: true
  });
  const [confirmState, setConfirmState] = useState(null);
  const soundManagerRef = useRef(AlarmSoundManager);

  // Track the last time we checked alarms so we can detect missed windows
  const lastCheckTimeRef = useRef(Date.now());

  useEffect(() => {
    let minuteCounter = 0;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      lastCheckTimeRef.current = Date.now();
      // F13: Check pre-task reminders every 60 seconds (not every second)
      minuteCounter++;
      if (minuteCounter >= 60) {
        minuteCounter = 0;
        checkPreTaskReminders();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [checkPreTaskReminders]);

  // M1: Missed alarm recovery — when tab becomes visible again after being hidden,
  // check if any alarms fired while the interval was throttled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = new Date();
        const gapMs = Date.now() - lastCheckTimeRef.current;
        // If tab was hidden for more than 90 seconds, we may have missed alarms
        if (gapMs > 90_000) {
          const missedFrom = new Date(lastCheckTimeRef.current);
          const alarmsCopy = useAppStore.getState().alarms;
          alarmsCopy.forEach(alarm => {
            if (!alarm.enabled) return;
            const [h, m] = alarm.time.split(':').map(Number);
            // Check each minute in the gap
            const candidate = new Date(missedFrom);
            candidate.setSeconds(0, 0);
            while (candidate <= now) {
              const candidateStr = candidate.toTimeString().slice(0, 5);
              const candidateDay = candidate.getDay();
              const shouldRing = alarm.repeat === 'once' || alarm.repeat === 'daily' ||
                (alarm.repeat === 'weekdays' && candidateDay >= 1 && candidateDay <= 5) ||
                (alarm.repeat === 'weekends' && (candidateDay === 0 || candidateDay === 6)) ||
                (alarm.repeat === 'custom' && alarm.customDays?.includes(candidateDay));

              if (shouldRing && candidateStr === alarm.time) {
                // Fire a "missed alarm" notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`Missed Alarm: ${alarm.label || 'Alarm'}`, {
                    body: `This alarm was scheduled for ${alarm.time} but fired while the app was in the background.`,
                    icon: '/todo-app/vite.svg'
                  });
                }
                break;
              }
              candidate.setMinutes(candidate.getMinutes() + 1);
            }
          });
        }
        lastCheckTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = now.toTimeString().slice(0, 5);
      const currentDay = now.getDay();

      alarms.forEach(alarm => {
        if (!alarm.enabled || activeAlarms.includes(alarm.id)) return;

        // Check if alarm is snoozed
        const snoozeInfo = snoozedAlarms.get(alarm.id);
        if (snoozeInfo && now < snoozeInfo.wakeTime) return;

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

      // Check snoozed alarms
      snoozedAlarms.forEach((snoozeInfo, alarmId) => {
        if (now >= snoozeInfo.wakeTime) {
          const alarm = alarms.find(a => a.id === alarmId);
          if (alarm && alarm.enabled) {
            setSnoozedAlarms(prev => {
              const newMap = new Map(prev);
              newMap.delete(alarmId);
              return newMap;
            });
            triggerAlarm(alarm);
          }
        }
      });
    };

    checkAlarms();
  }, [currentTime, alarms, activeAlarms, snoozedAlarms]);

  const triggerAlarm = async (alarm) => {
    console.log('🚨 Triggering alarm:', alarm.label || alarm.id);
    setActiveAlarms(prev => [...prev, alarm.id]);

    // Start continuous alarm sound
    try {
      await soundManagerRef.current.startAlarm(
        alarm.soundType || alarmSettings.soundType,
        alarmSettings.volume
      );
    } catch (error) {
      console.error('Failed to start alarm sound:', error);
    }

    // Start vibration if enabled
    if (alarmSettings.vibrationEnabled) {
      soundManagerRef.current.startVibratingAlarm();
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(alarm.label || 'Alarm', {
        body: alarm.message || 'Your alarm is ringing!',
        icon: '/todo-app/vite.svg',
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        dismissAlarm(alarm.id);
        notification.close();
      };
    }

    // Keep device awake (prevent screen sleep)
    if ('wakeLock' in navigator) {
      try {
        await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log('Wake lock failed:', err);
      }
    }

    // Auto-dismiss after 10 minutes — use a ref to read live state, not stale closure
    const alarmId = alarm.id;
    setTimeout(() => {
      setActiveAlarms(prev => {
        if (prev.includes(alarmId)) {
          console.log('Auto-dismissing alarm after 10 minutes');
          soundManagerRef.current.stopAlarm();
          return prev.filter(id => id !== alarmId);
        }
        return prev;
      });
    }, 10 * 60 * 1000);
  };

  const dismissAlarm = (alarmId) => {
    console.log('🔇 Dismissing alarm:', alarmId);
    setActiveAlarms(prev => prev.filter(id => id !== alarmId));
    soundManagerRef.current.stopAlarm();

    // Clear any snoozed state
    setSnoozedAlarms(prev => {
      const newMap = new Map(prev);
      newMap.delete(alarmId);
      return newMap;
    });

    // If it's a "once" alarm, disable it after dismissal
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm && alarm.repeat === 'once') {
      updateAlarm(alarmId, { ...alarm, enabled: false });
    }
  };

  const snoozeAlarm = (alarmId, minutes = 5) => {
    console.log(`😴 Snoozing alarm ${alarmId} for ${minutes} minutes`);

    // Stop current alarm
    setActiveAlarms(prev => prev.filter(id => id !== alarmId));
    soundManagerRef.current.stopAlarm();

    // Set snooze time
    const wakeTime = new Date(Date.now() + minutes * 60 * 1000);
    setSnoozedAlarms(prev => new Map(prev).set(alarmId, { wakeTime, minutes }));

    // Show snooze notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Alarm Snoozed`, {
        body: `Will ring again in ${minutes} minutes at ${wakeTime.toTimeString().slice(0, 5)}`,
        icon: '/todo-app/vite.svg'
      });
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
    setConfirmState({
      message: 'Delete this alarm?',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: () => {
        deleteAlarm(alarmId);
        dismissAlarm(alarmId);
      },
    });
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
            <AlarmModal
              key={alarmId}
              alarm={alarm}
              onDismiss={dismissAlarm}
              onSnooze={snoozeAlarm}
              formatTime={formatTime}
            />
          );
        })}
      </AnimatePresence>
    );
  };

  const testAlarmSound = (soundType) => {
    soundManagerRef.current.playTestSound(soundType, 3000);
  };

  return (
    <div className="alarm-manager">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
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

        <div className="flex flex-col items-center gap-3 mb-4">
          <button
            onClick={requestNotificationPermission}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Enable notifications for better alarm experience
          </button>

          {/* Alarm Settings */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full max-w-2xl">
            <h3 className="text-sm font-semibold mb-3 text-center">Alarm Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sound Type Selection */}
              <div>
                <label className="block text-xs font-medium mb-2">Sound Type</label>
                <select
                  value={alarmSettings.soundType}
                  onChange={(e) => setAlarmSettings(prev => ({ ...prev, soundType: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {soundManagerRef.current.getSoundTypes().map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => testAlarmSound(alarmSettings.soundType)}
                  className="mt-1 w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors"
                >
                  Test Sound
                </button>
              </div>

              {/* Volume Control */}
              <div>
                <label className="block text-xs font-medium mb-2">
                  Volume: {Math.round(alarmSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={alarmSettings.volume}
                  onChange={(e) => {
                    const volume = parseFloat(e.target.value);
                    setAlarmSettings(prev => ({ ...prev, volume }));
                    soundManagerRef.current.setVolume(volume);
                  }}
                  className="w-full"
                />
              </div>

              {/* Toggle Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={alarmSettings.vibrationEnabled}
                    onChange={(e) => setAlarmSettings(prev => ({ ...prev, vibrationEnabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Vibration</span>
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={alarmSettings.snoozeEnabled}
                    onChange={(e) => setAlarmSettings(prev => ({ ...prev, snoozeEnabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Snooze Option</span>
                </label>
              </div>
            </div>
          </div>
        </div>
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

                      {/* Snooze Status */}
                      {snoozedAlarms.has(alarm.id) && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                          <span>😴</span>
                          <span>
                            Snoozed until {snoozedAlarms.get(alarm.id).wakeTime.toTimeString().slice(0, 5)}
                          </span>
                        </div>
                      )}

                      {/* Active Status */}
                      {activeAlarms.includes(alarm.id) && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                          <span>🔥</span>
                          <span>Currently ringing!</span>
                        </div>
                      )}
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