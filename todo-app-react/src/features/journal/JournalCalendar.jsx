import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JournalCalendar = ({ entries, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const getMoodEmoji = (mood) => {
    const moods = {
      amazing: '😄',
      good: '😊',
      okay: '😐',
      bad: '😟',
      terrible: '😢'
    };
    return moods[mood] || '';
  };

  const getEntryForDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return entries.find(entry => entry.date === dateStr);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="journal-calendar">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold">{monthYear}</h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {[...Array(startingDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const entry = getEntryForDate(day);
            const isToday = dateStr === today;
            const isFuture = dateStr > today;

            return (
              <motion.div
                key={day}
                whileHover={{ scale: isFuture ? 1 : 1.05 }}
                className={`aspect-square rounded-lg border-2 p-2 ${
                  isToday ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                } ${
                  isFuture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  entry ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => !isFuture && onDateSelect(dateStr)}
              >
                <div className="h-full flex flex-col">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {day}
                  </div>
                  
                  {entry && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      {entry.mood && (
                        <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      )}
                      {entry.gratitude && entry.gratitude.filter(g => g).length > 0 && (
                        <span className="text-xs">🙏</span>
                      )}
                      {entry.content && entry.content.length > 100 && (
                        <span className="text-xs text-blue-600">📝</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-gray-300" />
            <span className="text-gray-500">Has entry</span>
          </div>
          <div className="flex items-center gap-2">
            <span>😄</span>
            <span className="text-gray-500">Mood tracked</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🙏</span>
            <span className="text-gray-500">Gratitude logged</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span className="text-gray-500">Long entry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCalendar;