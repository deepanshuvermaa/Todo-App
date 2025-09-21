import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';
import nutritionService from '@/services/OptimizedNutritionService';

const MealForm = ({ meal, defaultDate, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'lunch',
    date: defaultDate || new Date().toISOString().split('T')[0],
    time: '',
    quantity: '1',
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    ingredients: [],
    notes: '',
    image: ''
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [autoCalculated, setAutoCalculated] = useState(false);
  const [showNutritionSuggestions, setShowNutritionSuggestions] = useState(false);
  const [nutritionSuggestions, setNutritionSuggestions] = useState([]);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { value: 'lunch', label: 'Lunch', icon: '🥗' },
    { value: 'dinner', label: 'Dinner', icon: '🍽️' },
    { value: 'snack', label: 'Snack', icon: '🍿' }
  ];

  const servingUnits = [
    'serving', 'plate', 'bowl', 'cup', 'piece',
    'slice', 'small', 'medium', 'large'
  ];

  // Common foods with nutritional data (per 100g)
  const commonFoods = {
    'Chicken Breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'Brown Rice': { calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9 },
    'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    'Salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
    'Banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
    'Greek Yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    'Oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
    'Eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    'Almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 },
    'Avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 }
  };

  useEffect(() => {
    if (meal) {
      setFormData({
        ...meal,
        ingredients: meal.ingredients || [],
        date: meal.date || defaultDate || new Date().toISOString().split('T')[0]
      });
    } else if (defaultDate) {
      setFormData(prev => ({ ...prev, date: defaultDate }));
    }
  }, [meal, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a meal name');
      return;
    }

    // Convert string values to numbers
    const nutritionData = {
      ...formData,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
      fiber: parseFloat(formData.fiber) || 0,
      sugar: parseFloat(formData.sugar) || 0,
      sodium: parseFloat(formData.sodium) || 0
    };

    onSave(nutritionData);
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()]
      });
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleQuickAdd = (foodName) => {
    const food = commonFoods[foodName];
    if (food) {
      setFormData({
        ...formData,
        name: foodName,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        fiber: food.fiber ? food.fiber.toString() : ''
      });
      setQuickAddMode(false);
    }
  };

  const calculateCalories = () => {
    // Simple macro calculation: protein and carbs = 4 cal/g, fat = 9 cal/g
    const proteinCal = (parseFloat(formData.protein) || 0) * 4;
    const carbsCal = (parseFloat(formData.carbs) || 0) * 4;
    const fatCal = (parseFloat(formData.fat) || 0) * 9;
    const total = Math.round(proteinCal + carbsCal + fatCal);

    if (total > 0) {
      setFormData({ ...formData, calories: total.toString() });
    }
  };

  // Auto-analyze nutrition when meal name or quantity changes
  const analyzeNutrition = async () => {
    if (!formData.name.trim() || !formData.quantity) return;

    setIsAnalyzing(true);
    setAutoCalculated(true);

    try {
      // Check common foods first
      const commonFood = commonFoods[formData.name];
      if (commonFood) {
        const multiplier = parseFloat(formData.quantity) || 1;
        setFormData(prev => ({
          ...prev,
          calories: Math.round(commonFood.calories * multiplier),
          protein: Math.round(commonFood.protein * multiplier * 10) / 10,
          carbs: Math.round(commonFood.carbs * multiplier * 10) / 10,
          fat: Math.round(commonFood.fat * multiplier * 10) / 10,
          fiber: Math.round((commonFood.fiber || 0) * multiplier * 10) / 10
        }));
        setNutritionData(commonFood);
      } else {
        // Try to analyze with optimized NutritionService
        const result = await nutritionService.analyzeMealFromText(`${formData.quantity} ${formData.unit} ${formData.name}`);

        if (result.success && result.data) {
          const nutrition = result.data.nutrition;
          setFormData(prev => ({
            ...prev,
            calories: Math.round(nutrition.calories),
            protein: nutrition.protein.toString(),
            carbs: nutrition.carbs.toString(),
            fat: nutrition.fat.toString(),
            fiber: (nutrition.fiber || 0).toString(),
            sugar: (nutrition.sugar || 0).toString(),
            sodium: (nutrition.sodium || 0).toString()
          }));

          if (result.data.detectedFood) {
            setFormData(prev => ({
              ...prev,
              ingredients: [...new Set([...prev.ingredients, result.data.detectedFood])]
            }));
          }
          setNutritionData(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to analyze nutrition:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get nutrition suggestions as user types
  const handleNameChange = (value) => {
    setFormData({ ...formData, name: value });

    if (value.length > 2) {
      // Get suggestions asynchronously
      nutritionService.getSuggestions(value).then(suggestions => {
        setNutritionSuggestions(suggestions);
        setShowNutritionSuggestions(suggestions.length > 0);
      });
    } else {
      setShowNutritionSuggestions(false);
    }
  };

  // Apply suggestion
  const applySuggestion = async (suggestionName) => {
    try {
      const result = await NutritionService.getNutritionData(
        suggestionName,
        parseFloat(formData.servingSize) || 1,
        formData.servingUnit
      );

      if (result.success && result.data) {
        const nutrition = result.data.nutrition;
        setFormData(prev => ({
          ...prev,
          name: suggestionName,
          calories: nutrition.calories.toString(),
          protein: nutrition.protein.toString(),
          carbs: nutrition.carbs.toString(),
          fat: nutrition.fat.toString(),
          fiber: nutrition.fiber.toString(),
          sugar: nutrition.sugar.toString(),
          sodium: nutrition.sodium.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
    setShowNutritionSuggestions(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">
        {meal ? 'Edit Meal' : 'Log New Meal'}
      </h3>

      {/* Quick Add Section */}
      {!meal && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setQuickAddMode(!quickAddMode)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Quick add from common foods →
          </button>
          
          {quickAddMode && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(commonFoods).map(foodName => (
                  <button
                    key={foodName}
                    type="button"
                    onClick={() => handleQuickAdd(foodName)}
                    className="p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    {foodName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meal Name */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Meal Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                handleNameChange(e.target.value);
                setTimeout(() => analyzeNutrition(), 1000);
              }}
              className="w-full pr-12 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="e.g., Grilled Chicken Salad"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              )}
              <VoiceButton
                onResult={(transcript) => handleNameChange(transcript)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-blue-500"
                title="Voice Input for Meal Name"
              />
            </div>
          </div>

          {/* Nutrition Suggestions */}
          {showNutritionSuggestions && nutritionSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
            >
              {nutritionSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applySuggestion(suggestion.name)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <span>{suggestion.name}</span>
                  <span className="text-xs text-gray-500">
                    {Math.round(suggestion.confidence * 100)}% match
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {/* Auto-analyze button */}
          <button
            type="button"
            onClick={analyzeNutrition}
            disabled={!formData.name.trim() || isAnalyzing}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-blue-500"></div>
                Analyzing nutrition...
              </>
            ) : (
              <>
                🔍 Auto-analyze nutrition
              </>
            )}
          </button>
        </div>

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Meal Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input-field"
          >
            {mealTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="input-field"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Time <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">Quantity <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => {
                setFormData({ ...formData, quantity: e.target.value });
                setTimeout(() => analyzeNutrition(), 500);
              }}
              className="input-field flex-1"
              min="0.1"
              step="0.1"
              required
            />
            <select
              value={formData.unit}
              onChange={(e) => {
                setFormData({ ...formData, unit: e.target.value });
                setTimeout(() => analyzeNutrition(), 500);
              }}
              className="input-field flex-1"
            >
              {servingUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Auto-Calculated Nutritional Information */}
      {autoCalculated && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800 dark:text-green-200">
              ✨ Auto-Calculated Nutrition Values
            </h4>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                Analyzing...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Calories</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.calories || 0}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Protein</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.protein || 0}g</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Carbs</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.carbs || 0}g</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fat</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.fat || 0}g</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Fiber</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.fiber || 0}g</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Sugar</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.sugar || 0}g</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Sodium</label>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formData.sodium || 0}mg</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            * Nutrition values are automatically calculated based on your meal and quantity
          </p>
        </div>
      )}

      {/* Show message when no data calculated yet */}
      {!autoCalculated && formData.name && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Enter meal name and quantity to see nutrition values
          </p>
        </div>
      )}

      {/* Ingredients */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Ingredients</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddIngredient();
              }
            }}
            className="input-field flex-1"
            placeholder="Add an ingredient..."
          />
          <button
            type="button"
            onClick={handleAddIngredient}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Add
          </button>
        </div>
        
        {formData.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Notes <span className="text-xs text-gray-500">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full pr-12 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
            rows="3"
            placeholder="Any additional notes about this meal..."
          />
          <div className="absolute right-3 top-3">
            <VoiceButton
              onResult={(transcript) => setFormData({ ...formData, notes: formData.notes + ' ' + transcript })}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-blue-500"
              title="Voice Input for Notes"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {meal ? 'Update Meal' : 'Log Meal'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

export default MealForm;