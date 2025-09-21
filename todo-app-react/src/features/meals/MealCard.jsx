import React from 'react';
import { motion } from 'framer-motion';

const MealCard = ({ meal, onEdit, onDelete, onDuplicate }) => {
  const getMealIcon = (type) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍿'
    };
    return icons[type] || '🍴';
  };

  const getNutritionColor = (value, type) => {
    if (type === 'calories') {
      if (value < 300) return 'text-green-600';
      if (value < 600) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'protein') {
      if (value >= 20) return 'text-green-600';
      if (value >= 10) return 'text-yellow-600';
      return 'text-gray-600';
    }
    return 'text-gray-600';
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const macroPercentages = () => {
    const totalMacros = (meal.protein || 0) * 4 + (meal.carbs || 0) * 4 + (meal.fat || 0) * 9;
    if (totalMacros === 0) return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: Math.round(((meal.protein || 0) * 4 / totalMacros) * 100),
      carbs: Math.round(((meal.carbs || 0) * 4 / totalMacros) * 100),
      fat: Math.round(((meal.fat || 0) * 9 / totalMacros) * 100)
    };
  };

  const macros = macroPercentages();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getMealIcon(meal.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{meal.name}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="capitalize">{meal.type}</span>
                {meal.time && (
                  <>
                    <span>•</span>
                    <span>{formatTime(meal.time)}</span>
                  </>
                )}
                {meal.servingSize && (
                  <>
                    <span>•</span>
                    <span>{meal.servingSize} {meal.servingUnit}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Duplicate meal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calories Display */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <p className={`text-2xl font-bold ${getNutritionColor(meal.calories, 'calories')}`}>
              {meal.calories || 0}
            </p>
            <p className="text-xs text-gray-500">calories</p>
          </div>

          {/* Macro Distribution */}
          <div className="flex-1 mx-4">
            <div className="flex h-3 rounded-full overflow-hidden">
              {macros.protein > 0 && (
                <div
                  className="bg-blue-500"
                  style={{ width: `${macros.protein}%` }}
                  title={`Protein: ${macros.protein}%`}
                />
              )}
              {macros.carbs > 0 && (
                <div
                  className="bg-yellow-500"
                  style={{ width: `${macros.carbs}%` }}
                  title={`Carbs: ${macros.carbs}%`}
                />
              )}
              {macros.fat > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${macros.fat}%` }}
                  title={`Fat: ${macros.fat}%`}
                />
              )}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>P: {macros.protein}%</span>
              <span>C: {macros.carbs}%</span>
              <span>F: {macros.fat}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Nutrition */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {meal.protein || 0}g
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {meal.carbs || 0}g
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {meal.fat || 0}g
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
          </div>
        </div>

        {/* Additional Nutrition Info */}
        {(meal.fiber || meal.sugar || meal.sodium) && (
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {meal.fiber && (
              <span>Fiber: {meal.fiber}g</span>
            )}
            {meal.sugar && (
              <span>Sugar: {meal.sugar}g</span>
            )}
            {meal.sodium && (
              <span>Sodium: {meal.sodium}mg</span>
            )}
          </div>
        )}

        {/* Ingredients */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {meal.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {meal.notes && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-600 dark:text-gray-400">
            {meal.notes}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MealCard;