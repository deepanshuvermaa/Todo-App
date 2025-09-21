class NutritionService {
  constructor() {
    this.apiKey = 'demo'; // In a real app, this should be from environment variables
    this.baseUrl = 'https://api.edamam.com/api/nutrition-data';
    this.foodDatabaseUrl = 'https://api.edamam.com/api/food-database/v2';

    // Fallback nutrition database for common foods
    this.nutritionDatabase = {
      // Proteins
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
      'tuna': { calories: 144, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 39 },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
      'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },
      'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72 },
      'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 },
      'turkey': { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 1060 },

      // Carbohydrates
      'brown rice': { calories: 112, protein: 2.6, carbs: 23.5, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
      'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
      'quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
      'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, sugar: 0.3, sodium: 49 },
      'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.8, sodium: 1 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 },
      'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 },
      'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 6 },

      // Vegetables
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
      'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
      'cucumber': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
      'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28 },
      'bell pepper': { calories: 31, protein: 1, carbs: 7, fat: 0.3, fiber: 2.5, sugar: 4.2, sodium: 4 },
      'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },

      // Fruits
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 },
      'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
      'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
      'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, sodium: 1 },
      'grapes': { calories: 62, protein: 0.6, carbs: 16, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2 },
      'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1 },
      'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1 },

      // Nuts and seeds
      'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.4, sodium: 1 },
      'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6, sodium: 2 },
      'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.7, sodium: 18 },
      'chia seeds': { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0, sodium: 16 },
      'sunflower seeds': { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6, sugar: 2.6, sodium: 9 },

      // Dairy
      'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
      'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 0.5, sodium: 621 },
      'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, sodium: 11 },
      'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },

      // Oils and fats
      'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 },
      'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
      'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },

      // Beverages
      'coffee': { calories: 2, protein: 0.3, carbs: 0.5, fat: 0, fiber: 0, sugar: 0, sodium: 5 },
      'tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0, fiber: 0, sugar: 0, sodium: 3 },
      'water': { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },

      // Common prepared foods
      'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, sodium: 598 },
      'burger': { calories: 540, protein: 25, carbs: 40, fat: 31, fiber: 2, sugar: 5, sodium: 1040 },
      'sandwich': { calories: 250, protein: 12, carbs: 30, fat: 10, fiber: 2, sugar: 3, sodium: 600 },
      'salad': { calories: 33, protein: 3, carbs: 6, fat: 0.3, fiber: 2, sugar: 3, sodium: 65 }
    };
  }

  // Search for food in our database with fuzzy matching
  searchFood(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Exact matches first
    Object.keys(this.nutritionDatabase).forEach(food => {
      if (food === normalizedQuery) {
        results.push({
          name: food,
          nutrition: this.nutritionDatabase[food],
          confidence: 1.0
        });
      }
    });

    // Partial matches
    if (results.length === 0) {
      Object.keys(this.nutritionDatabase).forEach(food => {
        if (food.includes(normalizedQuery) || normalizedQuery.includes(food)) {
          const confidence = this.calculateSimilarity(normalizedQuery, food);
          if (confidence > 0.3) {
            results.push({
              name: food,
              nutrition: this.nutritionDatabase[food],
              confidence
            });
          }
        }
      });
    }

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Calculate Levenshtein distance
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Get nutrition data for a food item
  async getNutritionData(foodName, quantity = 100, unit = 'g') {
    try {
      // First try our local database
      const localResults = this.searchFood(foodName);

      if (localResults.length > 0 && localResults[0].confidence > 0.7) {
        const nutrition = localResults[0].nutrition;
        const multiplier = this.getQuantityMultiplier(quantity, unit);

        return {
          success: true,
          data: {
            name: localResults[0].name,
            quantity,
            unit,
            nutrition: this.scaleNutrition(nutrition, multiplier),
            source: 'local'
          }
        };
      }

      // If not found locally or confidence is low, try to use estimation
      return this.estimateNutrition(foodName, quantity, unit);

    } catch (error) {
      console.error('Error getting nutrition data:', error);
      return {
        success: false,
        error: 'Failed to get nutrition data',
        fallback: this.getDefaultNutrition(quantity, unit)
      };
    }
  }

  // Estimate nutrition for unknown foods
  estimateNutrition(foodName, quantity, unit) {
    const multiplier = this.getQuantityMultiplier(quantity, unit);

    // Basic estimation based on food categories
    let baseNutrition = { calories: 100, protein: 5, carbs: 15, fat: 3, fiber: 2, sugar: 5, sodium: 100 };

    const lowerName = foodName.toLowerCase();

    // Protein-rich foods
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') ||
        lowerName.includes('meat') || lowerName.includes('protein')) {
      baseNutrition = { calories: 200, protein: 25, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 80 };
    }
    // Fruits
    else if (lowerName.includes('fruit') || lowerName.includes('berry') || lowerName.includes('apple') ||
             lowerName.includes('orange') || lowerName.includes('juice')) {
      baseNutrition = { calories: 60, protein: 0.5, carbs: 15, fat: 0.2, fiber: 3, sugar: 12, sodium: 2 };
    }
    // Vegetables
    else if (lowerName.includes('vegetable') || lowerName.includes('salad') || lowerName.includes('green')) {
      baseNutrition = { calories: 25, protein: 2, carbs: 5, fat: 0.2, fiber: 3, sugar: 2, sodium: 20 };
    }
    // Grains/Carbs
    else if (lowerName.includes('rice') || lowerName.includes('bread') || lowerName.includes('pasta') ||
             lowerName.includes('grain') || lowerName.includes('cereal')) {
      baseNutrition = { calories: 130, protein: 3, carbs: 28, fat: 1, fiber: 2, sugar: 1, sodium: 5 };
    }
    // Dairy
    else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
      baseNutrition = { calories: 80, protein: 8, carbs: 6, fat: 3, fiber: 0, sugar: 6, sodium: 120 };
    }
    // Nuts/Seeds
    else if (lowerName.includes('nut') || lowerName.includes('seed') || lowerName.includes('almond')) {
      baseNutrition = { calories: 580, protein: 20, carbs: 20, fat: 50, fiber: 10, sugar: 4, sodium: 5 };
    }

    return {
      success: true,
      data: {
        name: foodName,
        quantity,
        unit,
        nutrition: this.scaleNutrition(baseNutrition, multiplier),
        source: 'estimated'
      }
    };
  }

  // Get quantity multiplier based on unit
  getQuantityMultiplier(quantity, unit) {
    const standardQuantity = 100; // 100g is our base

    switch (unit.toLowerCase()) {
      case 'g':
      case 'gram':
      case 'grams':
        return quantity / standardQuantity;
      case 'kg':
      case 'kilogram':
      case 'kilograms':
        return (quantity * 1000) / standardQuantity;
      case 'oz':
      case 'ounce':
      case 'ounces':
        return (quantity * 28.35) / standardQuantity;
      case 'lb':
      case 'pound':
      case 'pounds':
        return (quantity * 453.592) / standardQuantity;
      case 'cup':
      case 'cups':
        return (quantity * 240) / standardQuantity; // Assuming 1 cup = 240ml = ~240g for liquids
      case 'tablespoon':
      case 'tbsp':
        return (quantity * 15) / standardQuantity;
      case 'teaspoon':
      case 'tsp':
        return (quantity * 5) / standardQuantity;
      case 'piece':
      case 'pieces':
      case 'slice':
      case 'slices':
        return quantity * 0.5; // Assume 1 piece = ~50g
      case 'serving':
      case 'servings':
        return quantity * 1; // 1 serving = 100g base
      default:
        return quantity / standardQuantity;
    }
  }

  // Scale nutrition values by multiplier
  scaleNutrition(nutrition, multiplier) {
    return {
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      fiber: Math.round(nutrition.fiber * multiplier * 10) / 10,
      sugar: Math.round(nutrition.sugar * multiplier * 10) / 10,
      sodium: Math.round(nutrition.sodium * multiplier)
    };
  }

  // Get default nutrition values
  getDefaultNutrition(quantity, unit) {
    const multiplier = this.getQuantityMultiplier(quantity, unit);
    return this.scaleNutrition(
      { calories: 100, protein: 5, carbs: 15, fat: 3, fiber: 2, sugar: 5, sodium: 100 },
      multiplier
    );
  }

  // Analyze meal from text description
  async analyzeMealFromText(mealDescription) {
    try {
      const words = mealDescription.toLowerCase().split(/[,\s]+/);
      const detectedFoods = [];

      // Look for food items in the description
      for (const word of words) {
        const results = this.searchFood(word);
        if (results.length > 0 && results[0].confidence > 0.5) {
          detectedFoods.push(results[0]);
        }
      }

      if (detectedFoods.length === 0) {
        // Try to estimate from the entire description
        return this.estimateNutrition(mealDescription, 1, 'serving');
      }

      // Combine nutrition from all detected foods
      let totalNutrition = {
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
      };

      detectedFoods.forEach(food => {
        Object.keys(totalNutrition).forEach(key => {
          totalNutrition[key] += food.nutrition[key] || 0;
        });
      });

      return {
        success: true,
        data: {
          name: mealDescription,
          quantity: 1,
          unit: 'serving',
          nutrition: totalNutrition,
          detectedFoods: detectedFoods.map(f => f.name),
          source: 'analyzed'
        }
      };

    } catch (error) {
      console.error('Error analyzing meal:', error);
      return this.estimateNutrition(mealDescription, 1, 'serving');
    }
  }

  // Get suggestions for similar foods
  getSuggestions(query) {
    const results = this.searchFood(query);
    return results.slice(0, 5).map(result => ({
      name: result.name,
      confidence: result.confidence
    }));
  }
}

export default new NutritionService();