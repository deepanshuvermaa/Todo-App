// AI-Powered Insights Module - User provides their own API key for smart recommendations
class AIInsights {
    constructor() {
        this.apiKey = null;
        this.provider = 'openai'; // Can be 'openai', 'anthropic', 'gemini'
        this.insights = [];
        this.lastAnalysis = null;
        this.analysisInterval = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.createSettingsUI();
        if (this.apiKey) {
            this.startAnalysis();
        }
    }

    loadSettings() {
        const settings = localStorage.getItem('aiInsightsSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.apiKey = parsed.apiKey;
            this.provider = parsed.provider || 'openai';
        }
    }

    saveSettings() {
        localStorage.setItem('aiInsightsSettings', JSON.stringify({
            apiKey: this.apiKey,
            provider: this.provider,
            lastSaved: new Date().toISOString()
        }));
    }

    createSettingsUI() {
        // Add AI settings to the settings page
        const settingsView = document.getElementById('settings-view');
        if (!settingsView) return;

        const aiSection = document.createElement('div');
        aiSection.className = 'settings-section';
        aiSection.innerHTML = `
            <h2 class="section-title">AI-POWERED INSIGHTS (Optional)</h2>
            <div class="settings-card">
                <div class="ai-settings-intro">
                    <p>Enable AI-powered insights for personalized recommendations based on your activity patterns. 
                    You'll need to provide your own API key from one of the supported providers.</p>
                    <p class="ai-privacy-note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                </div>

                <div class="ai-provider-selection">
                    <label class="settings-label">Select AI Provider:</label>
                    <div class="provider-options">
                        <button class="provider-btn ${this.provider === 'openai' ? 'active' : ''}" data-provider="openai">
                            <div class="provider-icon">🤖</div>
                            <div class="provider-name">OpenAI</div>
                            <div class="provider-model">GPT-3.5/4</div>
                        </button>
                        <button class="provider-btn ${this.provider === 'anthropic' ? 'active' : ''}" data-provider="anthropic">
                            <div class="provider-icon">🧠</div>
                            <div class="provider-name">Anthropic</div>
                            <div class="provider-model">Claude</div>
                        </button>
                        <button class="provider-btn ${this.provider === 'gemini' ? 'active' : ''}" data-provider="gemini">
                            <div class="provider-icon">✨</div>
                            <div class="provider-name">Google</div>
                            <div class="provider-model">Gemini</div>
                        </button>
                    </div>
                </div>

                <div class="ai-api-setup">
                    <label class="settings-label">API Key:</label>
                    <div class="api-key-input-group">
                        <input type="password" 
                               id="ai-api-key" 
                               class="settings-input" 
                               placeholder="Enter your API key"
                               value="${this.apiKey || ''}">
                        <button class="btn-secondary" onclick="window.aiInsights.toggleKeyVisibility()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                    <div class="api-key-help">
                        <p id="provider-instructions">
                            ${this.getProviderInstructions()}
                        </p>
                    </div>
                </div>

                <div class="ai-settings-actions">
                    <button class="btn-primary" onclick="window.aiInsights.saveApiKey()">
                        Save & Enable AI Insights
                    </button>
                    <button class="btn-secondary" onclick="window.aiInsights.testConnection()">
                        Test Connection
                    </button>
                    ${this.apiKey ? `
                        <button class="btn-secondary" style="background: #dc3545; color: white;" 
                                onclick="window.aiInsights.removeApiKey()">
                            Remove API Key
                        </button>
                    ` : ''}
                </div>

                ${this.apiKey ? `
                    <div class="ai-status">
                        <div class="status-indicator ${this.apiKey ? 'active' : ''}"></div>
                        <span>AI Insights: ${this.apiKey ? 'Active' : 'Inactive'}</span>
                    </div>
                ` : ''}

                <div class="ai-cost-warning">
                    <p><strong>⚠️ Important:</strong> Using AI features will consume API credits from your account. 
                    Typical usage costs:</p>
                    <ul>
                        <li>OpenAI GPT-3.5: ~$0.01-0.02 per day</li>
                        <li>Anthropic Claude: ~$0.02-0.03 per day</li>
                        <li>Google Gemini: Free tier available</li>
                    </ul>
                    <p>The app will analyze your data once per hour when active.</p>
                </div>
            </div>
        `;

        settingsView.appendChild(aiSection);

        // Setup event listeners
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectProvider(e.currentTarget.dataset.provider);
            });
        });
    }

    selectProvider(provider) {
        this.provider = provider;
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.provider === provider);
        });
        document.getElementById('provider-instructions').innerHTML = this.getProviderInstructions();
    }

    getProviderInstructions() {
        const instructions = {
            openai: `
                <strong>OpenAI Setup:</strong><br>
                1. Go to <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a><br>
                2. Create a new API key<br>
                3. Copy and paste it here<br>
                4. Pricing: ~$0.002 per 1K tokens (GPT-3.5)
            `,
            anthropic: `
                <strong>Anthropic Setup:</strong><br>
                1. Go to <a href="https://console.anthropic.com/account/keys" target="_blank">Anthropic Console</a><br>
                2. Create an API key<br>
                3. Copy and paste it here<br>
                4. Pricing: ~$0.003 per 1K tokens (Claude Instant)
            `,
            gemini: `
                <strong>Google Gemini Setup:</strong><br>
                1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a><br>
                2. Get API key (free tier available)<br>
                3. Copy and paste it here<br>
                4. Pricing: Free for up to 60 requests/minute
            `
        };
        return instructions[this.provider] || instructions.openai;
    }

    toggleKeyVisibility() {
        const input = document.getElementById('ai-api-key');
        input.type = input.type === 'password' ? 'text' : 'password';
    }

    saveApiKey() {
        const input = document.getElementById('ai-api-key');
        this.apiKey = input.value.trim();
        
        if (!this.apiKey) {
            this.showNotification('Please enter an API key', 'error');
            return;
        }

        this.saveSettings();
        this.showNotification('API key saved successfully!', 'success');
        this.startAnalysis();
        
        // Refresh the settings UI
        setTimeout(() => location.reload(), 1000);
    }

    removeApiKey() {
        if (confirm('Are you sure you want to remove your API key?')) {
            this.apiKey = null;
            this.saveSettings();
            this.stopAnalysis();
            location.reload();
        }
    }

    async testConnection() {
        if (!this.apiKey) {
            this.showNotification('Please enter an API key first', 'error');
            return;
        }

        this.showNotification('Testing connection...', 'info');

        try {
            const response = await this.makeAPICall('Hello, please respond with "Connection successful"');
            if (response) {
                this.showNotification('✅ Connection successful!', 'success');
            }
        } catch (error) {
            this.showNotification(`❌ Connection failed: ${error.message}`, 'error');
        }
    }

    async makeAPICall(prompt) {
        if (!this.apiKey) return null;

        const endpoints = {
            openai: 'https://api.openai.com/v1/chat/completions',
            anthropic: 'https://api.anthropic.com/v1/messages',
            gemini: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.provider === 'openai') {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        } else if (this.provider === 'anthropic') {
            headers['x-api-key'] = this.apiKey;
            headers['anthropic-version'] = '2023-06-01';
        }

        let body;
        if (this.provider === 'openai') {
            body = JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful life tracking assistant providing personalized insights based on user data.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            });
        } else if (this.provider === 'anthropic') {
            body = JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 150,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });
        } else if (this.provider === 'gemini') {
            body = JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            });
        }

        try {
            const response = await fetch(endpoints[this.provider], {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (this.provider === 'openai') {
                return data.choices[0].message.content;
            } else if (this.provider === 'anthropic') {
                return data.content[0].text;
            } else if (this.provider === 'gemini') {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.error('AI API Error:', error);
            throw error;
        }
    }

    startAnalysis() {
        if (!this.apiKey) return;

        // Run initial analysis
        this.analyzeUserData();

        // Set up hourly analysis
        this.analysisInterval = setInterval(() => {
            this.analyzeUserData();
        }, 60 * 60 * 1000); // Every hour
    }

    stopAnalysis() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }
    }

    async analyzeUserData() {
        if (!this.apiKey) return;

        // Gather user data for analysis
        const userData = this.gatherUserData();
        
        // Create prompt for AI
        const prompt = this.createAnalysisPrompt(userData);

        try {
            const response = await this.makeAPICall(prompt);
            if (response) {
                this.processAIResponse(response);
            }
        } catch (error) {
            console.error('Failed to get AI insights:', error);
        }
    }

    gatherUserData() {
        const data = {
            tasks: {
                total: 0,
                completed: 0,
                pending: 0,
                averageCompletionTime: 0,
                categories: {},
                patterns: []
            },
            expenses: {
                daily: [],
                weekly: [],
                monthly: 0,
                categories: {},
                trends: []
            },
            meals: {
                regular: [],
                calories: [],
                mealTimes: [],
                preferences: []
            },
            habits: {
                streaks: {},
                consistency: {}
            },
            mood: {
                recent: [],
                average: null
            }
        };

        // Gather tasks data
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const recentTasks = tasks.filter(t => new Date(t.date) >= last7Days);
        data.tasks.total = recentTasks.length;
        data.tasks.completed = recentTasks.filter(t => t.completed).length;
        data.tasks.pending = recentTasks.filter(t => !t.completed).length;

        // Gather expense data
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const recentExpenses = expenses.filter(e => new Date(e.date) >= last7Days);
        
        // Group expenses by category
        recentExpenses.forEach(expense => {
            data.expenses.categories[expense.category] = 
                (data.expenses.categories[expense.category] || 0) + expense.amount;
        });

        // Calculate daily averages
        const dailyTotals = {};
        recentExpenses.forEach(expense => {
            dailyTotals[expense.date] = (dailyTotals[expense.date] || 0) + expense.amount;
        });
        data.expenses.daily = Object.values(dailyTotals);
        
        // Gather meal data
        const meals = JSON.parse(localStorage.getItem('meals') || '[]');
        const recentMeals = meals.filter(m => new Date(m.date) >= last7Days);
        
        // Find most common meals
        const mealFrequency = {};
        recentMeals.forEach(meal => {
            meal.items?.forEach(item => {
                mealFrequency[item.name] = (mealFrequency[item.name] || 0) + 1;
            });
        });
        data.meals.regular = Object.entries(mealFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);

        // Gather mood data
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        data.mood.recent = moodHistory.slice(-7);

        // Gather streaks
        if (window.streakManager) {
            data.habits.streaks = window.streakManager.streaks;
        }

        return data;
    }

    createAnalysisPrompt(data) {
        return `Based on this user's life tracking data from the past week:

        Tasks: ${data.tasks.completed} completed, ${data.tasks.pending} pending out of ${data.tasks.total} total
        Task completion rate: ${data.tasks.total > 0 ? Math.round(data.tasks.completed / data.tasks.total * 100) : 0}%
        
        Expenses: 
        - Categories: ${Object.entries(data.expenses.categories).map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)}`).join(', ')}
        - Daily average: ₹${data.expenses.daily.length > 0 ? (data.expenses.daily.reduce((a,b) => a+b, 0) / data.expenses.daily.length).toFixed(0) : 0}
        
        Meals: Most frequent foods: ${data.meals.regular.join(', ') || 'No data'}
        
        Habits: Login streak: ${data.habits.streaks.login || 0} days
        
        Mood: Recent moods: ${data.mood.recent.map(m => m.mood).join(', ') || 'No data'}

        Please provide 3 personalized insights or recommendations to help improve their productivity, health, or financial wellness. 
        Keep each insight concise (max 20 words) and actionable. Format as JSON array of objects with 'icon' and 'text' fields.
        Use appropriate emojis as icons.`;
    }

    processAIResponse(response) {
        try {
            // Try to parse JSON from response
            let insights;
            
            // Extract JSON if wrapped in other text
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                insights = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: create insights from plain text
                const lines = response.split('\n').filter(line => line.trim());
                insights = lines.slice(0, 3).map(line => ({
                    icon: '💡',
                    text: line.replace(/^\d+\.?\s*/, '').trim()
                }));
            }

            this.insights = insights;
            this.lastAnalysis = new Date();
            
            // Update dashboard if it exists
            if (window.smartDashboard) {
                this.updateDashboardInsights();
            }

            // Save insights
            localStorage.setItem('aiInsights', JSON.stringify({
                insights: this.insights,
                timestamp: this.lastAnalysis
            }));

        } catch (error) {
            console.error('Failed to process AI response:', error);
        }
    }

    updateDashboardInsights() {
        // Add AI insights to the dashboard
        const insightsWidget = document.querySelector('.insights-widget');
        if (!insightsWidget) return;

        const carousel = insightsWidget.querySelector('#insights-carousel');
        if (carousel && this.insights.length > 0) {
            // Add AI badge to indicate these are AI-generated
            const header = insightsWidget.querySelector('.widget-header');
            if (header && !header.querySelector('.ai-badge')) {
                const badge = document.createElement('span');
                badge.className = 'ai-badge';
                badge.innerHTML = '✨ AI';
                badge.title = 'Powered by AI';
                header.appendChild(badge);
            }

            // Prepend AI insights to existing insights
            const aiInsightCards = this.insights.map((insight, index) => `
                <div class="insight-card ai-insight" data-index="ai-${index}">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-text">${insight.text}</div>
                    <div class="insight-source">AI Recommendation</div>
                </div>
            `).join('');

            // Get existing insights and combine
            const existingCards = carousel.innerHTML;
            carousel.innerHTML = aiInsightCards + existingCards;
        }
    }

    getQuickInsight(context) {
        // Provide quick insights without API call based on local data
        const insights = {
            morning: [
                "Start with your most challenging task while energy is high",
                "Review yesterday's incomplete tasks and prioritize them",
                "Set 3 main goals for today to maintain focus"
            ],
            evening: [
                "Review today's accomplishments and plan tomorrow",
                "Complete any quick 5-minute tasks before bed",
                "Prepare tomorrow's priorities tonight for a smooth start"
            ],
            highExpense: [
                "Your spending is above average today, consider reviewing",
                "Check if today's expenses align with your monthly budget",
                "Consider meal prep to reduce food expenses"
            ],
            lowWater: [
                "You're behind on water intake, have a glass now",
                "Set hourly reminders to stay hydrated",
                "Keep a water bottle visible as a reminder"
            ],
            taskOverload: [
                "You have many pending tasks, consider delegating or deferring some",
                "Break large tasks into smaller, manageable steps",
                "Focus on 'must do' vs 'nice to do' tasks"
            ]
        };

        return insights[context] ? 
            insights[context][Math.floor(Math.random() * insights[context].length)] : 
            "Keep up the great work!";
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `ai-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize AI Insights when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiInsights = new AIInsights();
});