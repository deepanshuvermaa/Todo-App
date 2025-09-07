// Expense Manager - Handles all expense tracking functionality
class ExpenseManager {
    constructor() {
        this.expenses = [];
        this.budget = {
            monthly: 0,
            categories: {}
        };
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.loadExpenses();
        this.loadBudget();
        this.setupEventListeners();
        this.updateExpenseDate();
        this.renderExpenses();
        this.updateAnalytics();
    }

    setupEventListeners() {
        // Add expense button
        const addBtn = document.getElementById('add-expense-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addExpense());
        }

        // Enter key on amount or description
        const amountInput = document.getElementById('expense-amount');
        const descInput = document.getElementById('expense-description');
        
        if (amountInput) {
            amountInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addExpense();
            });
        }
        
        if (descInput) {
            descInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addExpense();
            });
        }

        // Quick amount buttons
        document.querySelectorAll('.quick-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                document.getElementById('expense-amount').value = amount.toFixed(2);
            });
        });

        // Budget save button
        const budgetBtn = document.getElementById('save-budget-btn');
        if (budgetBtn) {
            budgetBtn.addEventListener('click', () => this.saveBudget());
        }
    }

    updateExpenseDate() {
        const dateDisplay = document.getElementById('expense-date');
        if (dateDisplay) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = this.currentDate.toLocaleDateString('en-US', options);
        }
    }

    addExpense() {
        const amountInput = document.getElementById('expense-amount');
        const categorySelect = document.getElementById('expense-category');
        const descriptionInput = document.getElementById('expense-description');

        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        const description = descriptionInput.value.trim();

        // Validation
        if (!amount || amount <= 0) {
            this.showMessage('Please enter a valid amount', 'error');
            return;
        }

        if (!category) {
            this.showMessage('Please select a category', 'error');
            return;
        }

        // Create expense object
        const expense = {
            id: Date.now(),
            date: this.currentDate.toISOString().split('T')[0],
            amount: amount,
            category: category,
            description: description || `${category} expense`,
            timestamp: new Date().toISOString(),
            paymentMethod: 'cash', // Default, can be enhanced later
            tags: this.autoGenerateTags(category, description),
            linkedTaskId: this.checkForLinkedTask()
        };

        // Add to expenses array
        this.expenses.push(expense);
        this.saveExpenses();
        this.renderExpenses();
        this.updateAnalytics();

        // Clear inputs
        amountInput.value = '';
        categorySelect.value = '';
        descriptionInput.value = '';

        // Show success message
        this.showMessage(`Expense of ₹${amount.toFixed(2)} added`, 'success');

        // Sync to Google Sheets if connected
        if (window.todoApp && window.todoApp.isAuthenticated && window.todoApp.sheetId) {
            this.syncToSheets();
        }
    }

    autoGenerateTags(category, description) {
        const tags = [];
        const desc = description.toLowerCase();

        // Category-based tags
        if (category === 'Business') tags.push('deductible');
        if (category === 'Food' && (desc.includes('coffee') || desc.includes('starbucks'))) tags.push('coffee');
        if (category === 'Transport' && (desc.includes('uber') || desc.includes('taxi'))) tags.push('ride-share');
        
        // Time-based tags
        const hour = new Date().getHours();
        if (hour < 12 && category === 'Food') tags.push('breakfast');
        else if (hour < 15 && category === 'Food') tags.push('lunch');
        else if (hour > 17 && category === 'Food') tags.push('dinner');

        return tags;
    }

    checkForLinkedTask() {
        // Check if there's a recently completed task that might be related
        if (window.todoApp && window.todoApp.tasks) {
            const recentTasks = window.todoApp.tasks.filter(task => {
                const taskDate = new Date(task.date);
                const now = new Date();
                const hoursDiff = (now - taskDate) / (1000 * 60 * 60);
                return hoursDiff < 2 && task.completed; // Completed within last 2 hours
            });

            if (recentTasks.length > 0) {
                // Return the most recent completed task ID
                return recentTasks[recentTasks.length - 1].id;
            }
        }
        return null;
    }

    renderExpenses() {
        const expensesList = document.getElementById('expenses-list');
        if (!expensesList) return;

        const todayExpenses = this.expenses.filter(expense => 
            expense.date === this.currentDate.toISOString().split('T')[0]
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (todayExpenses.length === 0) {
            expensesList.innerHTML = '<li class="no-expenses">No expenses today</li>';
            return;
        }

        expensesList.innerHTML = todayExpenses.map(expense => `
            <li class="expense-item" data-id="${expense.id}">
                <div class="expense-icon">${this.getCategoryIcon(expense.category)}</div>
                <div class="expense-details">
                    <div class="expense-description">${this.escapeHtml(expense.description)}</div>
                    <div class="expense-category">${expense.category}</div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <button class="expense-delete" data-id="${expense.id}">×</button>
            </li>
        `).join('');

        // Add delete event listeners
        expensesList.querySelectorAll('.expense-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteExpense(id);
            });
        });
    }

    getCategoryIcon(category) {
        const icons = {
            'Food': '🍔',
            'Transport': '🚗',
            'Shopping': '🛍️',
            'Entertainment': '🎬',
            'Bills': '📄',
            'Health': '💊',
            'Education': '📚',
            'Business': '💼',
            'Other': '📌'
        };
        return icons[category] || '💰';
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.saveExpenses();
        this.renderExpenses();
        this.updateAnalytics();
        this.showMessage('Expense deleted', 'success');

        // Sync to sheets if connected
        if (window.todoApp && window.todoApp.isAuthenticated && window.todoApp.sheetId) {
            this.syncToSheets();
        }
    }

    updateAnalytics() {
        this.updateTodayStats();
        this.updateMonthlyStats();
        this.updateCategoryBreakdown();
        this.updateBudgetStatus();
        this.updateCategoryChart();
    }

    updateTodayStats() {
        const todayExpenses = this.expenses.filter(expense => 
            expense.date === this.currentDate.toISOString().split('T')[0]
        );

        const total = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const count = todayExpenses.length;

        document.getElementById('today-total').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('today-count').textContent = count;
    }

    updateMonthlyStats() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        const monthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });

        const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate daily average
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysPassed = this.currentDate.getDate();
        const dailyAverage = total / daysPassed;

        // Find highest spending day
        const dailyTotals = {};
        monthExpenses.forEach(expense => {
            dailyTotals[expense.date] = (dailyTotals[expense.date] || 0) + expense.amount;
        });
        const highestDay = Math.max(...Object.values(dailyTotals), 0);

        document.getElementById('month-total').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('daily-average').textContent = `₹${dailyAverage.toFixed(2)}`;
        document.getElementById('highest-day').textContent = `₹${highestDay.toFixed(2)}`;
    }

    updateCategoryBreakdown() {
        const todayExpenses = this.expenses.filter(expense => 
            expense.date === this.currentDate.toISOString().split('T')[0]
        );

        const categoryTotals = {};
        let total = 0;

        todayExpenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            total += expense.amount;
        });

        const breakdownDiv = document.getElementById('category-breakdown');
        if (!breakdownDiv) return;

        if (Object.keys(categoryTotals).length === 0) {
            breakdownDiv.innerHTML = '<div class="no-data">No expenses today</div>';
            return;
        }

        breakdownDiv.innerHTML = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percentage = (amount / total * 100).toFixed(1);
                return `
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-icon">${this.getCategoryIcon(category)}</span>
                            <span class="category-name">${category}</span>
                        </div>
                        <div class="category-amount">
                            <span>₹${amount.toFixed(2)}</span>
                            <span class="category-percentage">${percentage}%</span>
                        </div>
                    </div>
                `;
            }).join('');
    }

    updateBudgetStatus() {
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        const monthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });

        const spent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const budget = this.budget.monthly;

        const statusDiv = document.getElementById('budget-status');
        const progressBar = document.getElementById('budget-bar');

        if (budget > 0) {
            const percentage = Math.min((spent / budget * 100), 100);
            const remaining = Math.max(budget - spent, 0);

            statusDiv.innerHTML = `
                <div class="budget-info">
                    <span>Spent: ₹${spent.toFixed(2)} / ₹${budget.toFixed(2)}</span>
                    <span>Remaining: ₹${remaining.toFixed(2)}</span>
                </div>
            `;

            progressBar.style.width = `${percentage}%`;
            
            // Change color based on percentage
            if (percentage > 90) {
                progressBar.style.backgroundColor = '#DC2626';
            } else if (percentage > 75) {
                progressBar.style.backgroundColor = '#F59E0B';
            } else {
                progressBar.style.backgroundColor = '#10B981';
            }
        } else {
            statusDiv.innerHTML = '<div class="no-budget">No budget set</div>';
            progressBar.style.width = '0%';
        }
    }

    updateCategoryChart() {
        const chartDiv = document.getElementById('category-chart');
        if (!chartDiv) return;

        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();

        const monthExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
        });

        const categoryTotals = {};
        monthExpenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        if (Object.keys(categoryTotals).length === 0) {
            chartDiv.innerHTML = '<div class="no-data">No expenses this month</div>';
            return;
        }

        // Create simple bar chart
        const maxAmount = Math.max(...Object.values(categoryTotals));
        
        chartDiv.innerHTML = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const width = (amount / maxAmount * 100);
                return `
                    <div class="chart-bar-container">
                        <div class="chart-label">
                            <span>${this.getCategoryIcon(category)} ${category}</span>
                            <span>₹${amount.toFixed(2)}</span>
                        </div>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" style="width: ${width}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    saveBudget() {
        const budgetInput = document.getElementById('monthly-budget');
        const amount = parseFloat(budgetInput.value);

        if (amount && amount > 0) {
            this.budget.monthly = amount;
            localStorage.setItem('expenseBudget', JSON.stringify(this.budget));
            this.updateBudgetStatus();
            this.showMessage('Budget saved', 'success');
        }
    }

    loadBudget() {
        const stored = localStorage.getItem('expenseBudget');
        if (stored) {
            try {
                this.budget = JSON.parse(stored);
                const budgetInput = document.getElementById('monthly-budget');
                if (budgetInput && this.budget.monthly) {
                    budgetInput.value = this.budget.monthly;
                }
            } catch (e) {
                console.error('Error loading budget:', e);
            }
        }
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    loadExpenses() {
        const stored = localStorage.getItem('expenses');
        if (stored) {
            try {
                this.expenses = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading expenses:', e);
                this.expenses = [];
            }
        }
    }

    async syncToSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) return;

        try {
            // First, ensure the Expenses sheet exists
            await this.ensureExpenseSheet();

            // Get all expenses sorted by date (newest first)
            const allExpenses = this.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (allExpenses.length > 0) {
                // Clear existing data (except header row)
                await gapi.client.sheets.spreadsheets.values.clear({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'Expenses!A2:H1000'
                });

                // Format expenses for sheet (each expense as a row)
                const values = allExpenses.map(expense => [
                    expense.date,
                    expense.category,
                    expense.description,
                    expense.amount.toFixed(2),
                    expense.paymentMethod || 'Cash',
                    expense.tags ? expense.tags.join(', ') : '',
                    '', // Receipt URL placeholder
                    expense.linkedTaskId || ''
                ]);

                // Update the sheet with all expenses
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: `Expenses!A2:H${values.length + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values }
                });

                console.log(`${allExpenses.length} expenses synced to Google Sheets`);
            } else {
                console.log('No expenses to sync');
            }

            console.log('Expenses synced to Google Sheets');
        } catch (error) {
            console.error('Error syncing expenses:', error);
        }
    }

    async ensureExpenseSheet() {
        if (!window.todoApp || !window.todoApp.sheetId) return;

        try {
            // Get spreadsheet info
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });

            // Check if Expenses sheet exists
            const sheets = response.result.sheets;
            const expenseSheet = sheets.find(sheet => sheet.properties.title === 'Expenses');

            if (!expenseSheet) {
                // Create Expenses sheet
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Expenses',
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 8
                                    }
                                }
                            }
                        }]
                    }
                });

                // Add headers
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'Expenses!A1:H1',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [['Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Tags', 'Receipt URL', 'Linked Task ID']]
                    }
                });

                console.log('Expenses sheet created');
            }
        } catch (error) {
            console.error('Error ensuring expense sheet:', error);
        }
    }

    showMessage(message, type) {
        if (window.todoApp && window.todoApp.showMessage) {
            window.todoApp.showMessage(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize expense manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.expenseManager = new ExpenseManager();
});