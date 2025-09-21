import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const MealCalendar = ({ meals, onDateSelect, onAddMeal }) => {
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

  // Group meals by date
  const mealsByDate = useMemo(() => {
    const grouped = {};
    meals.forEach(meal => {
      if (!grouped[meal.date]) {
        grouped[meal.date] = [];
      }
      grouped[meal.date].push(meal);
    });
    return grouped;
  }, [meals]);

  const getDayStats = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    const dayMeals = mealsByDate[dateStr] || [];

    const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const mealCount = dayMeals.length;

    return {
      dateStr,
      totalCalories,
      mealCount,
      meals: dayMeals,
      isToday: dateStr === todayStr,
      isFuture: date > today
    };
  };

  const getCalorieColor = (calories) => {
    if (calories === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (calories < 1500) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (calories < 2000) return 'bg-green-100 dark:bg-green-900/30';
    if (calories < 2500) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍿'
    };
    return icons[type] || '🍴';
  };

  return (
    <div className="meal-calendar">
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
            const stats = getDayStats(day);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: stats.isFuture ? 1 : 1.05 }}
                className={`aspect-square rounded-lg border-2 ${
                  stats.isToday ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                } ${stats.isFuture ? 'opacity-50' : 'cursor-pointer'} ${
                  getCalorieColor(stats.totalCalories)
                } p-2 relative`}
                onClick={() => !stats.isFuture && onDateSelect(stats.dateStr)}
              >
                <div className="h-full flex flex-col">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {day}
                  </div>

                  {stats.mealCount > 0 && !stats.isFuture && (
                    <>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {stats.totalCalories}
                        </div>
                        <div className="text-xs text-gray-500">
                          cal
                        </div>
                      </div>

                      <div className="flex gap-0.5">
                        {stats.meals.slice(0, 3).map((meal, idx) => (
                          <span key={idx} className="text-xs" title={meal.type}>
                            {getMealTypeIcon(meal.type)}
                          </span>
                        ))}
                        {stats.meals.length > 3 && (
                          <span className="text-xs text-gray-500">+{stats.meals.length - 3}</span>
                        )}
                      </div>
                    </>
                  )}

                  {stats.mealCount === 0 && !stats.isFuture && stats.isToday && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddMeal();
                      }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-blue-500/20 rounded-lg transition-opacity"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Daily Calorie Ranges</h4>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300" />
            <span className="text-gray-500">No meals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
            <span className="text-gray-500">&lt; 1500 cal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded" />
            <span className="text-gray-500">1500-2000 cal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded" />
            <span className="text-gray-500">2000-2500 cal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded" />
            <span className="text-gray-500">&gt; 2500 cal</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span>🍳</span> Breakfast
            </span>
            <span className="flex items-center gap-1">
              <span>🥗</span> Lunch
            </span>
            <span className="flex items-center gap-1">
              <span>🍽️</span> Dinner
            </span>
            <span className="flex items-center gap-1">
              <span>🍿</span> Snack
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;