import React, { useState } from 'react';
import { motion } from 'framer-motion';

const HabitCalendar = ({ habits, habitHistory, onToggleDay }) => {
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

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const getDayStatus = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    let completedCount = 0;
    let totalHabits = habits.length;

    habits.forEach(habit => {
      if (habitHistory[habit.id] && habitHistory[habit.id][dateStr]) {
        completedCount++;
      }
    });

    return {
      dateStr,
      completedCount,
      totalHabits,
      percentage: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
      isToday: dateStr === todayStr,
      isFuture: date > today
    };
  };

  const getColorForPercentage = (percentage) => {
    if (percentage === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (percentage < 25) return 'bg-red-100 dark:bg-red-900/30';
    if (percentage < 50) return 'bg-orange-100 dark:bg-orange-900/30';
    if (percentage < 75) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (percentage < 100) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  return (
    <div className="habit-calendar">
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
            const status = getDayStatus(day);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: status.isFuture ? 1 : 1.05 }}
                className={`aspect-square rounded-lg border-2 ${
                  status.isToday ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                } ${status.isFuture ? 'opacity-50' : 'cursor-pointer'} ${
                  getColorForPercentage(status.percentage)
                } p-2 relative`}
                onClick={() => !status.isFuture && onToggleDay(null, status.dateStr)}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {day}
                </div>

                {status.totalHabits > 0 && !status.isFuture && (
                  <>
                    <div className="text-xs text-gray-500 mt-1">
                      {status.completedCount}/{status.totalHabits}
                    </div>

                    {status.percentage === 100 && (
                      <span className="absolute top-1 right-1 text-xs">✨</span>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Habit List for Calendar View */}
      <div className="mt-6 space-y-3">
        {habits.map(habit => {
          const monthDays = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = habitHistory[habit.id] && habitHistory[habit.id][dateStr];
            const isFuture = date > today;

            monthDays.push({
              day,
              dateStr,
              isCompleted,
              isFuture,
              isToday: dateStr === todayStr
            });
          }

          return (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{habit.icon}</span>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</h4>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-2">
                {monthDays.map(({ day, dateStr, isCompleted, isFuture, isToday }) => (
                  <button
                    key={day}
                    onClick={() => !isFuture && onToggleDay(habit.id, dateStr)}
                    disabled={isFuture}
                    className={`flex-shrink-0 w-8 h-8 rounded text-xs font-medium ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } ${
                      isFuture ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          <span className="text-gray-500">Not done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-500">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 rounded" />
          <span className="text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar;