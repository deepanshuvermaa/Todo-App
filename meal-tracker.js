// Meal Tracker Manager - Handles nutrition tracking and meal logging
class MealTracker {
    constructor() {
        this.meals = [];
        this.waterIntake = 0;
        this.currentMealType = 'breakfast';
        this.userProfile = null;
        this.dailyGoals = null;
        this.nutritionDatabase = this.initNutritionDatabase();
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.loadTodaysMeals();
        this.setupEventListeners();
        this.updateDateDisplay();
        this.calculateDailyGoals();
    }

    initNutritionDatabase() {
        // Nutrition data per 100g or per piece for common Indian foods
        return {
            // Grains & Cereals (per 100g cooked)
            'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, serving: 150 },
            'chapati': { calories: 70, protein: 2.5, carbs: 15, fats: 0.5, fiber: 2, serving: 30 }, // per piece
            'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7, serving: 25 }, // per slice
            'oats': { calories: 68, protein: 2.4, carbs: 12, fats: 1.4, fiber: 1.7, serving: 40 },
            'quinoa': { calories: 120, protein: 4.4, carbs: 21, fats: 1.9, fiber: 2.8, serving: 185 },
            
            // Lentils & Legumes (per 100g cooked)
            'dal': { calories: 120, protein: 8, carbs: 20, fats: 0.5, fiber: 8, serving: 150 },
            'chickpeas': { calories: 164, protein: 9, carbs: 27, fats: 2.6, fiber: 8, serving: 150 },
            'rajma': { calories: 127, protein: 9, carbs: 23, fats: 0.5, fiber: 6, serving: 150 },
            'kidney beans': { calories: 127, protein: 9, carbs: 23, fats: 0.5, fiber: 6, serving: 150 },
            
            // Proteins (per 100g)
            'chicken': { calories: 239, protein: 27, carbs: 0, fats: 14, fiber: 0, serving: 100 },
            'fish': { calories: 206, protein: 22, carbs: 0, fats: 12, fiber: 0, serving: 100 },
            'egg': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, serving: 50 }, // per piece
            'paneer': { calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, serving: 50 },
            'tofu': { calories: 76, protein: 8, carbs: 2, fats: 4.8, fiber: 0, serving: 100 },
            'mutton': { calories: 294, protein: 25, carbs: 0, fats: 21, fiber: 0, serving: 100 },
            
            // Dairy (per 100ml or 100g)
            'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, fiber: 0, serving: 250 },
            'curd': { calories: 60, protein: 3.1, carbs: 4.7, fats: 3.3, fiber: 0, serving: 100 },
            'yogurt': { calories: 60, protein: 3.1, carbs: 4.7, fats: 3.3, fiber: 0, serving: 100 },
            'cheese': { calories: 402, protein: 25, carbs: 1.3, fats: 33, fiber: 0, serving: 30 },
            'butter': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81, fiber: 0, serving: 10 },
            
            // Vegetables (per 100g)
            'potato': { calories: 77, protein: 2, carbs: 17, fats: 0.1, fiber: 2.2, serving: 150 },
            'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, serving: 100 },
            'onion': { calories: 40, protein: 1.1, carbs: 9, fats: 0.1, fiber: 1.7, serving: 100 },
            'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, serving: 100 },
            'carrot': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, fiber: 2.8, serving: 100 },
            'cauliflower': { calories: 25, protein: 1.9, carbs: 5, fats: 0.3, fiber: 2, serving: 100 },
            'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6, serving: 100 },
            
            // Fruits (per piece or 100g)
            'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, serving: 180 }, // per piece
            'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, serving: 120 }, // per piece
            'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, serving: 150 }, // per piece
            'mango': { calories: 60, protein: 0.8, carbs: 15, fats: 0.4, fiber: 1.6, serving: 200 },
            'grapes': { calories: 67, protein: 0.6, carbs: 17, fats: 0.4, fiber: 0.9, serving: 100 },
            
            // Snacks & Others
            'samosa': { calories: 262, protein: 4, carbs: 24, fats: 17, fiber: 2, serving: 60 }, // per piece
            'pakora': { calories: 315, protein: 6, carbs: 24, fats: 22, fiber: 3, serving: 100 },
            'nuts': { calories: 607, protein: 20, carbs: 21, fats: 54, fiber: 8, serving: 30 },
            'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, serving: 30 },
            'tea': { calories: 40, protein: 1, carbs: 5, fats: 2, fiber: 0, serving: 150 },
            'coffee': { calories: 40, protein: 1, carbs: 5, fats: 2, fiber: 0, serving: 150 },
            
            // Default for unknown foods
            'default': { calories: 100, protein: 3, carbs: 15, fats: 3, fiber: 2, serving: 100 }
        };
    }

    setupEventListeners() {
        // Meal type selector
        document.querySelectorAll('.meal-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMealType = e.target.dataset.meal;
            });
        });

        // Add meal button
        const addMealBtn = document.getElementById('add-meal-btn');
        if (addMealBtn) {
            addMealBtn.addEventListener('click', () => this.addMeal());
        }

        // Food shortcuts with smart quantities
        document.querySelectorAll('.food-shortcut').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const food = e.target.dataset.food;
                const unit = e.target.dataset.unit;
                const defaultQty = e.target.dataset.default || '1';
                
                document.getElementById('food-item').value = food;
                document.getElementById('food-unit').value = unit;
                document.getElementById('food-quantity').value = defaultQty;
                
                // Update quantity input step based on unit
                this.updateQuantityStep(unit);
            });
        });

        // Save profile button
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveUserProfile());
        }

        // Water intake button
        const addWaterBtn = document.getElementById('add-water');
        if (addWaterBtn) {
            addWaterBtn.addEventListener('click', () => this.addWater());
        }

        // Enter key support
        document.getElementById('food-item')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMeal();
        });
        
        // Unit change handler
        const unitSelect = document.getElementById('food-unit');
        if (unitSelect) {
            unitSelect.addEventListener('change', (e) => {
                this.updateQuantityStep(e.target.value);
            });
        }
        
        // Update gram conversion on input changes
        const foodInput = document.getElementById('food-item');
        const quantityInput = document.getElementById('food-quantity');
        
        if (foodInput) {
            foodInput.addEventListener('input', () => this.updateGramConversion());
        }
        
        if (quantityInput) {
            quantityInput.addEventListener('input', () => this.updateGramConversion());
        }
    }
    
    updateQuantityStep(unit) {
        const quantityInput = document.getElementById('food-quantity');
        if (!quantityInput) return;
        
        // Smart step values based on unit type
        const stepValues = {
            'piece': 1,
            'slice': 1,
            'egg': 1,
            'scoop': 1,
            'bowl': 1,
            'plate': 1,
            'cup': 1,
            'glass': 1,
            'serving': 1,
            'handful': 1,
            'gram': 10,     // Step by 10 grams
            'ml': 50,        // Step by 50 ml
            'tbsp': 1,
            'tsp': 1
        };
        
        // Update step and min values
        const step = stepValues[unit] || 1;
        quantityInput.step = step;
        quantityInput.min = step;
        
        // Adjust current value if needed
        const currentValue = parseFloat(quantityInput.value);
        if (currentValue && currentValue % step !== 0) {
            quantityInput.value = Math.round(currentValue / step) * step;
        }
        
        // Update gram conversion display
        this.updateGramConversion();
    }
    
    updateGramConversion() {
        const foodItem = document.getElementById('food-item').value.trim().toLowerCase();
        const quantity = parseFloat(document.getElementById('food-quantity').value) || 1;
        const unit = document.getElementById('food-unit').value;
        const conversionDiv = document.getElementById('gram-conversion');
        
        if (!conversionDiv) return;
        
        // Don't show conversion for already precise units
        if (unit === 'gram' || unit === 'ml' || unit === 'piece' || unit === 'egg' || unit === 'slice') {
            conversionDiv.innerHTML = '';
            return;
        }
        
        // Get approximate gram conversion
        const grams = this.getApproximateGrams(foodItem, quantity, unit);
        
        if (grams > 0) {
            conversionDiv.innerHTML = `
                <span class="conversion-info">
                    ≈ ${grams} grams
                    <span class="conversion-note">(approximate for nutrition calculation)</span>
                </span>
            `;
        } else {
            conversionDiv.innerHTML = '';
        }
    }
    
    getApproximateGrams(foodItem, quantity, unit) {
        // Standard conversions for common units
        const standardConversions = {
            'cup': {
                'rice': 185,        // Cooked rice
                'dal': 200,         // Cooked dal
                'tea': 240,         // Tea/coffee
                'coffee': 240,
                'milk': 240,
                'flour': 120,       // All purpose flour
                'sugar': 200,
                'oil': 220,
                'default': 200
            },
            'bowl': {
                'rice': 250,        // Medium bowl cooked rice
                'dal': 250,         // Medium bowl dal
                'sabzi': 150,       // Vegetable curry
                'curry': 200,       // Gravy dishes
                'salad': 100,       // Mixed salad
                'soup': 250,
                'khichdi': 250,
                'upma': 200,
                'poha': 180,
                'biryani': 300,
                'pulao': 250,
                'halwa': 150,
                'kheer': 200,
                'default': 200
            },
            'plate': {
                'biryani': 400,
                'pulao': 350,
                'fried rice': 300,
                'noodles': 250,
                'pasta': 250,
                'dosa': 120,        // One dosa
                'default': 300
            },
            'glass': {
                'milk': 250,
                'lassi': 250,
                'buttermilk': 250,
                'juice': 250,
                'water': 250,
                'default': 250
            },
            'serving': {
                'default': 150      // Standard serving
            },
            'handful': {
                'nuts': 30,
                'namkeen': 25,
                'chips': 20,
                'grapes': 80,
                'default': 30
            },
            'scoop': {
                'ice cream': 60,
                'protein': 30,
                'default': 50
            },
            'tbsp': {
                'oil': 14,
                'ghee': 14,
                'butter': 14,
                'sugar': 12,
                'honey': 21,
                'default': 15
            },
            'tsp': {
                'oil': 5,
                'ghee': 5,
                'sugar': 4,
                'salt': 6,
                'spices': 2,
                'default': 5
            }
        };
        
        // Get conversion based on unit and food item
        if (standardConversions[unit]) {
            // Try to find specific food match
            for (let food in standardConversions[unit]) {
                if (foodItem.includes(food) && food !== 'default') {
                    return standardConversions[unit][food] * quantity;
                }
            }
            // Use default for that unit
            return standardConversions[unit]['default'] * quantity;
        }
        
        return 0;
    }

    addMeal() {
        const foodItem = document.getElementById('food-item').value.trim();
        const quantity = parseFloat(document.getElementById('food-quantity').value) || 1;
        const unit = document.getElementById('food-unit').value;

        if (!foodItem) {
            this.showMessage('Please enter a food item', 'error');
            return;
        }

        // Calculate nutrition
        const nutrition = this.calculateNutrition(foodItem, quantity, unit);
        
        const meal = {
            id: Date.now(),
            type: this.currentMealType,
            food: foodItem,
            quantity: quantity,
            unit: unit,
            nutrition: nutrition,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0]
        };

        this.meals.push(meal);
        this.saveMeals();
        this.displayMeal(meal);
        this.updateNutritionSummary();
        this.syncToSheets();

        // Clear inputs
        document.getElementById('food-item').value = '';
        document.getElementById('food-quantity').value = '';
        
        this.showMessage(`Added ${foodItem} to ${this.currentMealType}`, 'success');
    }

    calculateNutrition(foodItem, quantity, unit) {
        // Find food in database (case-insensitive)
        const foodKey = Object.keys(this.nutritionDatabase).find(key => 
            foodItem.toLowerCase().includes(key)
        ) || 'default';
        
        const foodData = this.nutritionDatabase[foodKey];
        
        // Convert quantity to grams
        let gramsMultiplier = 1;
        
        switch(unit) {
            case 'gram':
                gramsMultiplier = quantity / 100;
                break;
            case 'kg':
                gramsMultiplier = (quantity * 1000) / 100;
                break;
            case 'cup':
                gramsMultiplier = (quantity * 240) / 100; // 1 cup ≈ 240g for liquids
                break;
            case 'bowl':
                gramsMultiplier = (quantity * 300) / 100; // 1 bowl ≈ 300g
                break;
            case 'piece':
                gramsMultiplier = quantity * (foodData.serving / 100);
                break;
            case 'serving':
                gramsMultiplier = quantity * (foodData.serving / 100);
                break;
            case 'ml':
                gramsMultiplier = quantity / 100; // for liquids, 1ml ≈ 1g
                break;
            case 'liter':
                gramsMultiplier = (quantity * 1000) / 100;
                break;
            case 'tbsp':
                gramsMultiplier = (quantity * 15) / 100; // 1 tbsp ≈ 15g
                break;
            case 'tsp':
                gramsMultiplier = (quantity * 5) / 100; // 1 tsp ≈ 5g
                break;
            default:
                gramsMultiplier = quantity;
        }

        return {
            calories: Math.round(foodData.calories * gramsMultiplier),
            protein: Math.round(foodData.protein * gramsMultiplier * 10) / 10,
            carbs: Math.round(foodData.carbs * gramsMultiplier * 10) / 10,
            fats: Math.round(foodData.fats * gramsMultiplier * 10) / 10,
            fiber: Math.round(foodData.fiber * gramsMultiplier * 10) / 10
        };
    }

    displayMeal(meal) {
        const mealList = document.querySelector(`#${meal.type}-meals .meal-list`);
        if (!mealList) return;

        const mealItem = document.createElement('li');
        mealItem.className = 'meal-item';
        mealItem.innerHTML = `
            <div class="meal-info">
                <span class="meal-name">${meal.food}</span>
                <span class="meal-quantity">${meal.quantity} ${meal.unit}</span>
                <span class="meal-time">${meal.time}</span>
            </div>
            <div class="meal-nutrition">
                <span class="nutrition-badge">${meal.nutrition.calories} kcal</span>
                <span class="nutrition-badge">P: ${meal.nutrition.protein}g</span>
                <span class="nutrition-badge">C: ${meal.nutrition.carbs}g</span>
            </div>
            <button class="delete-meal-btn" onclick="window.mealTracker.deleteMeal(${meal.id})">×</button>
        `;
        
        mealList.appendChild(mealItem);
    }

    deleteMeal(mealId) {
        this.meals = this.meals.filter(meal => meal.id !== mealId);
        this.saveMeals();
        this.refreshDisplay();
        this.updateNutritionSummary();
        this.syncToSheets();
    }

    updateNutritionSummary() {
        const todaysMeals = this.getTodaysMeals();
        
        const totals = todaysMeals.reduce((acc, meal) => {
            acc.calories += meal.nutrition.calories;
            acc.protein += meal.nutrition.protein;
            acc.carbs += meal.nutrition.carbs;
            acc.fats += meal.nutrition.fats;
            acc.fiber += meal.nutrition.fiber;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });

        // Update display
        document.getElementById('total-calories').textContent = Math.round(totals.calories);
        document.getElementById('total-protein').textContent = Math.round(totals.protein);
        document.getElementById('total-carbs').textContent = Math.round(totals.carbs);
        document.getElementById('total-fats').textContent = Math.round(totals.fats);
        document.getElementById('total-fiber').textContent = Math.round(totals.fiber);

        // Update progress bars
        if (this.dailyGoals) {
            this.updateProgressBar('calories-bar', totals.calories, this.dailyGoals.calories);
            this.updateProgressBar('protein-bar', totals.protein, this.dailyGoals.protein);
            this.updateProgressBar('carbs-bar', totals.carbs, this.dailyGoals.carbs);
            this.updateProgressBar('fats-bar', totals.fats, this.dailyGoals.fats);
            this.updateProgressBar('fiber-bar', totals.fiber, this.dailyGoals.fiber);
        }

        // Update recommendations
        this.updateRecommendations(totals);
    }

    updateProgressBar(barId, current, target) {
        const bar = document.getElementById(barId);
        if (bar) {
            const percentage = Math.min((current / target) * 100, 100);
            bar.style.width = `${percentage}%`;
            
            // Color coding
            if (percentage < 50) {
                bar.style.background = '#FFC107'; // Yellow
            } else if (percentage < 90) {
                bar.style.background = '#28A745'; // Green
            } else if (percentage <= 100) {
                bar.style.background = '#28A745'; // Green
            } else {
                bar.style.background = '#DC3545'; // Red (over limit)
            }
        }
    }

    calculateDailyGoals() {
        if (!this.userProfile) {
            this.dailyGoals = {
                calories: 2000,
                protein: 50,
                carbs: 300,
                fats: 65,
                fiber: 25
            };
            return;
        }

        const { weight, height, age, gender, goal } = this.userProfile;
        
        // Calculate BMR (Basal Metabolic Rate)
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Activity factor (moderate)
        let calories = bmr * 1.5;
        
        // Adjust based on goal
        switch(goal) {
            case 'lose':
                calories -= 500; // 500 calorie deficit
                break;
            case 'gain':
                calories += 500; // 500 calorie surplus
                break;
            case 'athletic':
                calories += 300; // Higher for athletic performance
                break;
        }

        // Calculate macros based on goal
        let proteinRatio, carbRatio, fatRatio;
        
        switch(goal) {
            case 'lose':
                proteinRatio = 0.30; // High protein for weight loss
                carbRatio = 0.35;
                fatRatio = 0.35;
                break;
            case 'gain':
                proteinRatio = 0.25; // Balanced for muscle gain
                carbRatio = 0.45;
                fatRatio = 0.30;
                break;
            case 'athletic':
                proteinRatio = 0.25;
                carbRatio = 0.50; // Higher carbs for performance
                fatRatio = 0.25;
                break;
            default:
                proteinRatio = 0.20;
                carbRatio = 0.50;
                fatRatio = 0.30;
        }

        this.dailyGoals = {
            calories: Math.round(calories),
            protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
            carbs: Math.round((calories * carbRatio) / 4), // 4 cal per gram
            fats: Math.round((calories * fatRatio) / 9), // 9 cal per gram
            fiber: gender === 'male' ? 38 : 25
        };

        // Update display
        document.getElementById('target-calories').textContent = `${this.dailyGoals.calories} kcal`;
        document.getElementById('target-protein').textContent = `${this.dailyGoals.protein}g`;
    }

    updateRecommendations(totals) {
        const recommendationsDiv = document.getElementById('meal-recommendations');
        if (!recommendationsDiv) return;

        let recommendations = [];
        
        if (this.dailyGoals) {
            const remainingCalories = this.dailyGoals.calories - totals.calories;
            const remainingProtein = this.dailyGoals.protein - totals.protein;
            
            if (remainingCalories > 500) {
                recommendations.push(`💡 You still need ${Math.round(remainingCalories)} more calories today.`);
            } else if (remainingCalories < -200) {
                recommendations.push(`⚠️ You've exceeded your calorie goal by ${Math.abs(Math.round(remainingCalories))} calories.`);
            }
            
            if (remainingProtein > 20) {
                recommendations.push(`💪 Add ${Math.round(remainingProtein)}g more protein (try chicken, eggs, or dal).`);
            }
            
            if (totals.fiber < this.dailyGoals.fiber * 0.5) {
                recommendations.push(`🥬 Increase fiber intake with vegetables and whole grains.`);
            }
            
            if (this.waterIntake < 2000) {
                recommendations.push(`💧 Drink more water! You're at ${this.waterIntake}ml of 3000ml goal.`);
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ Great job! You\'re on track with your nutrition goals!');
        }

        recommendationsDiv.innerHTML = recommendations.map(r => `<p>${r}</p>`).join('');
    }

    addWater() {
        this.waterIntake += 250;
        document.getElementById('water-amount').textContent = `${this.waterIntake} / 3000 ml`;
        this.saveWaterIntake();
        
        if (this.waterIntake >= 3000) {
            this.showMessage('Great! You\'ve reached your daily water goal! 💧', 'success');
        }
    }

    saveUserProfile() {
        const profile = {
            goal: document.getElementById('fitness-goal').value,
            weight: parseFloat(document.getElementById('user-weight').value),
            height: parseFloat(document.getElementById('user-height').value),
            age: parseInt(document.getElementById('user-age').value),
            gender: document.getElementById('user-gender').value
        };

        if (!profile.goal || !profile.weight || !profile.height || !profile.age || !profile.gender) {
            this.showMessage('Please fill all profile fields', 'error');
            return;
        }

        this.userProfile = profile;
        localStorage.setItem('userHealthProfile', JSON.stringify(profile));
        this.calculateDailyGoals();
        this.updateNutritionSummary();
        this.showMessage('Profile saved successfully!', 'success');
        this.syncToSheets();
    }

    loadUserProfile() {
        const saved = localStorage.getItem('userHealthProfile');
        if (saved) {
            this.userProfile = JSON.parse(saved);
            // Populate form
            document.getElementById('fitness-goal').value = this.userProfile.goal;
            document.getElementById('user-weight').value = this.userProfile.weight;
            document.getElementById('user-height').value = this.userProfile.height;
            document.getElementById('user-age').value = this.userProfile.age;
            document.getElementById('user-gender').value = this.userProfile.gender;
        }
    }

    saveMeals(skipSync = false) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`meals_${today}`, JSON.stringify(this.meals));
        
        // Trigger immediate sync if authenticated (unless explicitly skipped)
        if (!skipSync && window.todoApp && window.todoApp.isAuthenticated && window.todoApp.sheetId && navigator.onLine) {
            // Debounce sync to avoid too many API calls
            if (this.syncDebounceTimer) {
                clearTimeout(this.syncDebounceTimer);
            }
            this.syncDebounceTimer = setTimeout(() => {
                window.todoApp.syncMealsToSheet().catch(error => {
                    console.error('Background meal sync error:', error);
                });
            }, 500); // Wait 500ms to batch multiple changes
        }
    }

    loadTodaysMeals() {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`meals_${today}`);
        if (saved) {
            this.meals = JSON.parse(saved);
            this.refreshDisplay();
        }
        
        // Load water intake
        const savedWater = localStorage.getItem(`water_${today}`);
        if (savedWater) {
            this.waterIntake = parseInt(savedWater);
            document.getElementById('water-amount').textContent = `${this.waterIntake} / 3000 ml`;
        }
    }

    saveWaterIntake() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`water_${today}`, this.waterIntake.toString());
    }

    getTodaysMeals() {
        const today = new Date().toISOString().split('T')[0];
        return this.meals.filter(meal => meal.date === today);
    }

    refreshDisplay() {
        // Clear all meal lists
        document.querySelectorAll('.meal-list').forEach(list => list.innerHTML = '');
        
        // Re-display all meals
        this.getTodaysMeals().forEach(meal => this.displayMeal(meal));
        this.updateNutritionSummary();
    }

    updateDateDisplay() {
        const dateElement = document.getElementById('meal-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    async syncToSheets() {
        // Use main app's comprehensive sync system
        if (window.todoApp && window.todoApp.isAuthenticated && window.todoApp.sheetId) {
            try {
                await window.todoApp.syncToSheetsWithRetry();
            } catch (error) {
                console.error('Failed to sync meals to sheets:', error);
            }
        }
    }
    
    async loadFromGoogleSheets() {
        try {
            if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId || !gapi || !gapi.client) {
                console.log('Google Sheets not available for meal loading');
                return;
            }
            
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: window.todoApp.sheetId,
                range: 'Meals!A2:H1000'
            });
            
            const rows = response.result.values || [];
            const loadedMeals = [];
            
            rows.forEach(row => {
                if (row[0]) { // If ID exists
                    loadedMeals.push({
                        id: row[0],
                        mealType: row[1] || 'breakfast',
                        foodItem: row[2] || '',
                        quantity: parseFloat(row[3]) || 0,
                        unit: row[4] || 'g',
                        calories: parseFloat(row[5]) || 0,
                        date: row[6] || new Date().toISOString().split('T')[0],
                        nutrition: {
                            calories: parseFloat(row[5]) || 0,
                            protein: parseFloat(row[7]) || 0,
                            carbs: 0,
                            fats: 0,
                            fiber: 0
                        }
                    });
                }
            });
            
            // Replace local meals with cloud data
            const today = new Date().toISOString().split('T')[0];
            this.meals = loadedMeals.filter(meal => meal.date === today);
            this.saveMeals(true); // Skip sync since we just loaded from cloud
            this.refreshDisplay();
            this.updateNutritionSummary();
            console.log(`Loaded ${this.meals.length} meals from sheet for today`);
            
        } catch (error) {
            console.error('Error loading meals from sheet:', error);
            // Don't throw - allow app to continue with local data
        }
    }
    
    addPendingMeal(meal) {
        // Add meal if it doesn't already exist
        if (!this.meals.find(m => m.id === meal.id)) {
            this.meals.push(meal);
            this.saveMeals(true); // Skip sync for pending changes
            this.refreshDisplay();
            this.updateNutritionSummary();
        }
    }

    // Sheet creation and management now handled by main app comprehensive sync

    async syncUserProfile() {
        if (!this.userProfile || !window.todoApp.sheetId) return;
        
        try {
            // Create or update UserProfile sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: window.todoApp.sheetId,
                range: 'UserProfile!A1:B6',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [
                        ['Field', 'Value'],
                        ['Goal', this.userProfile.goal],
                        ['Weight (kg)', this.userProfile.weight],
                        ['Height (cm)', this.userProfile.height],
                        ['Age', this.userProfile.age],
                        ['Gender', this.userProfile.gender]
                    ]
                }
            });
        } catch (error) {
            console.log('Failed to sync user profile:', error);
        }
    }

    showMessage(message, type) {
        if (window.todoApp && window.todoApp.showMessage) {
            window.todoApp.showMessage(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Initialize meal tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mealTracker = new MealTracker();
});