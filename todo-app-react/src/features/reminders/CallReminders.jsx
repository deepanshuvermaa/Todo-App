import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import ReminderForm from './ReminderForm';
import ReminderCard from './ReminderCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

const CallReminders = () => {
  const { callReminders, completedCallReminders, addCallReminder, updateCallReminder, deleteCallReminder, completeCallReminder } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, completed, all
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmState, setConfirmState] = useState(null);

  // Filter and sort reminders
  const filteredReminders = useMemo(() => {
    let reminders = [];

    if (filter === 'pending' || filter === 'all') {
      reminders = [...reminders, ...callReminders];
    }
    
    if (filter === 'completed' || filter === 'all') {
      reminders = [...reminders, ...completedCallReminders];
    }

    // Apply search filter
    if (searchTerm) {
      reminders = reminders.filter(reminder => 
        reminder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.phone?.includes(searchTerm) ||
        reminder.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by priority and date
    return reminders.sort((a, b) => {
      // Pending reminders come first
      if (!a.completedDate && b.completedDate) return -1;
      if (a.completedDate && !b.completedDate) return 1;
      
      // Then sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Finally sort by date/time
      const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
      const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
      return dateA - dateB;
    });
  }, [callReminders, completedCallReminders, filter, searchTerm]);

  // Get upcoming reminders for today and tomorrow
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return callReminders.filter(reminder => {
      return reminder.date === todayStr || reminder.date === tomorrowStr;
    });
  }, [callReminders]);

  // Get overdue reminders
  const overdueReminders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const now = today.getHours() * 60 + today.getMinutes();

    return callReminders.filter(reminder => {
      if (reminder.date < todayStr) return true;
      
      if (reminder.date === todayStr && reminder.time) {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderMinutes = hours * 60 + minutes;
        return reminderMinutes < now;
      }
      
      return false;
    });
  }, [callReminders]);

  const handleSaveReminder = async (reminderData) => {
    if (editingReminder) {
      await updateCallReminder(editingReminder.id, reminderData);
      setEditingReminder(null);
    } else {
      await addCallReminder(reminderData);
    }
    setShowForm(false);
  };

  const handleDeleteReminder = (id) => {
    setConfirmState({
      message: 'Delete this reminder?',
      detail: 'This call reminder will be permanently deleted.',
      confirmLabel: 'Delete Reminder',
      danger: true,
      onConfirm: () => deleteCallReminder(id),
    });
  };

  const handleCompleteReminder = async (reminder) => {
    await completeCallReminder(reminder.id);
  };

  const handleSnoozeReminder = async (id, minutes = 30) => {
    const reminder = callReminders.find(r => r.id === id);
    if (!reminder) return;

    const snoozeDate = new Date();
    snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);

    await updateCallReminder(id, {
      date: snoozeDate.toISOString().split('T')[0],
      time: snoozeDate.toTimeString().slice(0, 5),
      snoozedUntil: snoozeDate.toISOString()
    });
  };

  const stats = {
    total: callReminders.length,
    overdue: overdueReminders.length,
    today: upcomingReminders.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
    completed: completedCallReminders.length
  };

  return (
    <div className="call-reminders">
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Call Reminders</h2>

        {/* Controls Row */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setEditingReminder(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Add Reminder</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, phone, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Pending ({callReminders.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            Completed ({completedCallReminders.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
          >
            All
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Total Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border ${
              stats.overdue > 0 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="text-sm text-gray-500">Overdue</p>
            <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
              {stats.overdue}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </motion.div>
        </div>

        {/* Overdue Alert */}
        {overdueReminders.length > 0 && filter !== 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-red-800 dark:text-red-200">
                You have {overdueReminders.length} overdue reminder{overdueReminders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <ReminderForm
              reminder={editingReminder}
              onSave={handleSaveReminder}
              onCancel={() => {
                setShowForm(false);
                setEditingReminder(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredReminders.length > 0 ? (
            filteredReminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReminderCard
                  reminder={reminder}
                  onEdit={() => {
                    setEditingReminder(reminder);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteReminder(reminder.id)}
                  onComplete={() => handleCompleteReminder(reminder)}
                  onSnooze={(minutes) => handleSnoozeReminder(reminder.id, minutes)}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-lg text-gray-500">
                {searchTerm ? 'No reminders found matching your search' : 'No call reminders yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Create your first reminder
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CallReminders;