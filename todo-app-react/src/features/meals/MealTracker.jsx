import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import MealForm from './MealForm';
import MealCard from './MealCard';
import MealStats from './MealStats';
import MealCalendar from './MealCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const MealTracker = () => {
  const { meals, addMeal, updateMeal, deleteMeal } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // today, week, calendar
  const [searchTerm, setSearchTerm] = useState('');

  // Filter meals by selected date or week
  const filteredMeals = useMemo(() => {
    let filtered = [...meals];

    if (viewMode === 'today') {
      filtered = filtered.filter(meal => meal.date === selectedDate);
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      filtered = filtered.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= startOfWeek && mealDate <= endOfWeek;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => {
      if (a.date === b.date) {
        const typeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
      }
      return new Date(b.date) - new Date(a.date);
    });
  }, [meals, selectedDate, viewMode, searchTerm]);

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const todayMeals = meals.filter(meal => meal.date === selectedDate);
    
    const totalCalories = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
    const totalFat = todayMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
    const totalFiber = todayMeals.reduce((sum, meal) => sum + (meal.fiber || 0), 0);

    const mealsByType = {
      breakfast: todayMeals.filter(m => m.type === 'breakfast').length,
      lunch: todayMeals.filter(m => m.type === 'lunch').length,
      dinner: todayMeals.filter(m => m.type === 'dinner').length,
      snack: todayMeals.filter(m => m.type === 'snack').length
    };

    // Calculate weekly average
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= weekStart && mealDate <= new Date(selectedDate);
    });
    const weeklyAvgCalories = weekMeals.length > 0 ? 
      Math.round(weekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / 7) : 0;

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      mealsByType,
      mealCount: todayMeals.length,
      weeklyAvgCalories,
      calorieGoal: 2000, // Can be made customizable
      proteinGoal: 50,
      carbGoal: 250,
      fatGoal: 65
    };
  }, [meals, selectedDate]);

  const handleSaveMeal = async (mealData) => {
    if (editingMeal) {
      await updateMeal(editingMeal.id, mealData);
      setEditingMeal(null);
    } else {
      await addMeal(mealData);
    }
    setShowForm(false);
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      await deleteMeal(id);
    }
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="meal-tracker">
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Meal Tracker</h2>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('today')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'today' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              Calendar
            </button>
          </div>

          {/* Add Meal Button */}
          <button
            onClick={() => {
              setEditingMeal(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Add Meal</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search meals or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Date Navigation */}
        {viewMode !== 'calendar' && (
          <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">{formatDate(selectedDate)}</h3>
              <p className="text-sm text-gray-500">{selectedDate}</p>
            </div>

            <button
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Daily Stats */}
        {viewMode !== 'calendar' && <MealStats stats={dailyStats} />}
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
            <MealForm
              meal={editingMeal}
              defaultDate={selectedDate}
              onSave={handleSaveMeal}
              onCancel={() => {
                setShowForm(false);
                setEditingMeal(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meals Display */}
      {viewMode === 'calendar' ? (
        <MealCalendar
          meals={meals}
          onDateSelect={setSelectedDate}
          onAddMeal={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMeals.length > 0 ? (
              filteredMeals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MealCard
                    meal={meal}
                    onEdit={() => {
                      setEditingMeal(meal);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteMeal(meal.id)}
                    onDuplicate={async () => {
                      const newMeal = { ...meal, id: undefined, date: selectedDate };
                      await addMeal(newMeal);
                    }}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-lg text-gray-500">No meals logged for {formatDate(selectedDate)}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Log your first meal
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MealTracker;