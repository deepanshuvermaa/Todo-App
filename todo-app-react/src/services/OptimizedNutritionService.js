// Optimized Nutrition Service with Lazy Loading, Caching, and Efficient Search
class OptimizedNutritionService {
  constructor() {
    this.cache = new Map();
    this.searchCache = new Map();
    this.nutritionData = null;
    this.isLoading = false;
    this.loadPromise = null;
    this.searchIndex = null;

    // Cache configuration
    this.MAX_CACHE_SIZE = 100;
    this.MAX_SEARCH_CACHE_SIZE = 50;
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // Lazy load nutrition database only when needed
  async loadDatabase() {
    if (this.nutritionData) return this.nutritionData;

    if (this.isLoading) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = import('../data/nutritionDatabase.js')
      .then(module => {
        this.nutritionData = module.nutritionDatabase;
        this.buildSearchIndex();
        this.isLoading = false;
        return this.nutritionData;
      })
      .catch(error => {
        console.error('Failed to load nutrition database:', error);
        this.isLoading = false;
        // Return minimal fallback data
        return this.getFallbackData();
      });

    return this.loadPromise;
  }

  // Build search index for faster lookups
  buildSearchIndex() {
    if (!this.nutritionData) return;

    this.searchIndex = new Map();

    Object.entries(this.nutritionData).forEach(([category, foods]) => {
      Object.entries(foods).forEach(([foodName, nutrition]) => {
        // Index by first letter
        const firstLetter = foodName[0].toLowerCase();
        if (!this.searchIndex.has(firstLetter)) {
          this.searchIndex.set(firstLetter, []);
        }

        this.searchIndex.get(firstLetter).push({
          name: foodName,
          category,
          nutrition,
          searchTokens: this.tokenize(foodName)
        });

        // Index by each word's first letter
        const words = foodName.split(' ');
        words.forEach(word => {
          if (word.length > 2) {
            const letter = word[0].toLowerCase();
            if (letter !== firstLetter) {
              if (!this.searchIndex.has(letter)) {
                this.searchIndex.set(letter, []);
              }

              const existing = this.searchIndex.get(letter);
              if (!existing.some(item => item.name === foodName)) {
                existing.push({
                  name: foodName,
                  category,
                  nutrition,
                  searchTokens: this.tokenize(foodName)
                });
              }
            }
          }
        });
      });
    });
  }

  // Tokenize food name for better search
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  // Efficient search with caching
  async search(query, limit = 10) {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = `${query.toLowerCase()}_${limit}`;

    // Check search cache
    if (this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.results;
      }
      this.searchCache.delete(cacheKey);
    }

    // Ensure database is loaded
    await this.loadDatabase();

    const searchTerm = query.toLowerCase().trim();
    const queryTokens = this.tokenize(searchTerm);
    const results = [];

    // Use search index for faster lookup
    if (this.searchIndex) {
      const firstLetter = searchTerm[0];
      const candidates = this.searchIndex.get(firstLetter) || [];

      // Also check other potential matches
      queryTokens.forEach(token => {
        if (token.length > 0 && token[0] !== firstLetter) {
          const additionalCandidates = this.searchIndex.get(token[0]) || [];
          candidates.push(...additionalCandidates);
        }
      });

      // Score and rank candidates
      const uniqueCandidates = new Map();

      candidates.forEach(candidate => {
        if (!uniqueCandidates.has(candidate.name)) {
          const score = this.calculateScore(candidate, searchTerm, queryTokens);
          if (score > 20) {
            uniqueCandidates.set(candidate.name, {
              ...candidate,
              score
            });
          }
        }
      });

      results.push(...uniqueCandidates.values());
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    const finalResults = results.slice(0, limit);

    // Cache the results
    this.addToSearchCache(cacheKey, finalResults);

    return finalResults;
  }

  // Calculate search relevance score
  calculateScore(candidate, searchTerm, queryTokens) {
    let score = 0;
    const candidateName = candidate.name.toLowerCase();

    // Exact match
    if (candidateName === searchTerm) {
      return 100;
    }

    // Starts with query
    if (candidateName.startsWith(searchTerm)) {
      score = 80;
    }
    // Contains query
    else if (candidateName.includes(searchTerm)) {
      score = 60;
    }

    // Token matching
    const candidateTokens = candidate.searchTokens || this.tokenize(candidate.name);

    queryTokens.forEach(queryToken => {
      candidateTokens.forEach(candidateToken => {
        if (candidateToken === queryToken) {
          score += 30 / queryTokens.length;
        } else if (candidateToken.startsWith(queryToken)) {
          score += 20 / queryTokens.length;
        } else if (candidateToken.includes(queryToken)) {
          score += 10 / queryTokens.length;
        }
      });
    });

    return Math.min(score, 95); // Cap at 95 to preserve exact matches
  }

  // Get nutrition data with caching
  async getNutrition(foodName, quantity = 100, unit = 'g') {
    const cacheKey = `${foodName}_${quantity}_${unit}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    const searchResults = await this.search(foodName, 1);

    if (searchResults.length === 0) {
      return null;
    }

    const bestMatch = searchResults[0];
    const nutrition = { ...bestMatch.nutrition };

    // Calculate multiplier based on quantity and unit
    const multiplier = this.calculateMultiplier(quantity, unit);

    // Apply multiplier to nutrition values
    Object.keys(nutrition).forEach(key => {
      nutrition[key] = Math.round(nutrition[key] * multiplier * 10) / 10;
    });

    const result = {
      foodName: bestMatch.name,
      category: bestMatch.category,
      quantity,
      unit,
      nutrition,
      confidence: bestMatch.score
    };

    // Cache the result
    this.addToCache(cacheKey, result);

    return result;
  }

  // Calculate quantity multiplier
  calculateMultiplier(quantity, unit) {
    let multiplier = quantity / 100;

    const unitConversions = {
      'kg': 10,
      'g': 0.01,
      'mg': 0.00001,
      'lb': 4.53592,
      'pound': 4.53592,
      'oz': 0.283495,
      'ounce': 0.283495,
      'cup': 2.4,
      'tbsp': 0.15,
      'tablespoon': 0.15,
      'tsp': 0.05,
      'teaspoon': 0.05,
      'serving': 1.5,
      'plate': 2,
      'bowl': 1.8,
      'piece': 1,
      'slice': 0.3,
      'small': 0.75,
      'medium': 1,
      'large': 1.5
    };

    if (unitConversions[unit.toLowerCase()]) {
      multiplier = quantity * unitConversions[unit.toLowerCase()];
    }

    return multiplier;
  }

  // Get suggestions for autocomplete (lightweight)
  async getSuggestions(query) {
    if (!query || query.trim().length < 2) return [];

    const results = await this.search(query, 5);

    return results.map(result => ({
      name: result.name,
      category: result.category,
      calories: result.nutrition.calories,
      protein: result.nutrition.protein,
      confidence: result.score
    }));
  }

  // Add to cache with size management
  addToCache(key, data) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Add to search cache with size management
  addToSearchCache(key, results) {
    if (this.searchCache.size >= this.MAX_SEARCH_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }

    this.searchCache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
    this.searchCache.clear();
  }

  // Get minimal fallback data if database fails to load
  getFallbackData() {
    return {
      commonFoods: {
        'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1 },
        'wheat': { calories: 340, protein: 11, carbs: 72, fat: 2, fiber: 12, sugar: 0.4, sodium: 2 },
        'dal': { calories: 350, protein: 24, carbs: 60, fat: 1.5, fiber: 15, sugar: 2, sodium: 15 },
        'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
        'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
        'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
        'paneer': { calories: 265, protein: 18, carbs: 3.6, fat: 21, fiber: 0, sugar: 2.6, sodium: 22 },
        'vegetables': { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2, sugar: 2, sodium: 20 },
        'fruits': { calories: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 2, sugar: 8, sodium: 1 },
        'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 }
      }
    };
  }

  // Preload database in background (call on app init)
  preload() {
    // Load database in background after a short delay
    setTimeout(() => {
      this.loadDatabase().catch(console.error);
    }, 2000);
  }

  // Analyze meal text and extract nutrition
  async analyzeMealFromText(text) {
    const words = text.toLowerCase().split(/\s+/);
    let quantity = 1;
    let unit = 'serving';
    let foodName = '';

    // Extract quantity and unit
    const quantityPattern = /(\d+\.?\d*)\s*(g|kg|mg|lb|oz|cup|tbsp|tsp|serving|plate|bowl|piece|slice|small|medium|large)?/i;
    const match = text.match(quantityPattern);

    if (match) {
      quantity = parseFloat(match[1]);
      if (match[2]) {
        unit = match[2].toLowerCase();
      }
      // Remove quantity and unit from text to get food name
      foodName = text.replace(match[0], '').trim();
    } else {
      foodName = text;
    }

    if (!foodName) {
      foodName = text;
    }

    const nutritionData = await this.getNutrition(foodName, quantity, unit);

    if (nutritionData) {
      return {
        success: true,
        data: {
          detectedFood: nutritionData.foodName,
          quantity,
          unit,
          nutrition: nutritionData.nutrition,
          confidence: nutritionData.confidence
        }
      };
    }

    return {
      success: false,
      message: 'Could not find nutrition information for this food'
    };
  }
}

// Create singleton instance
const nutritionService = new OptimizedNutritionService();

// Preload database after initial render
if (typeof window !== 'undefined') {
  nutritionService.preload();
}

export default nutritionService;