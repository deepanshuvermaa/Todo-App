// Bucket List Manager - Handles all bucket list goals and vision board functionality
class BucketListManager {
    constructor() {
        this.goals = [];
        this.visionImages = [];
        this.currentFilter = {
            timeframe: 'all',
            category: 'all'
        };
        this.editingGoalId = null;
        this.init();
    }

    init() {
        this.loadGoals();
        this.loadVisionBoard();
        this.setupEventListeners();
        this.renderGoals();
        this.updateStats();
        
        // Sync with Google Sheets if authenticated
        if (window.todoApp && window.todoApp.isAuthenticated) {
            this.syncFromSheets();
        }
    }

    setupEventListeners() {
        // Add goal button
        const addBtn = document.getElementById('add-goal-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Modal controls
        const closeModalBtn = document.getElementById('close-goal-modal');
        const cancelBtn = document.getElementById('cancel-goal');
        const saveBtn = document.getElementById('save-goal');
        const modal = document.getElementById('goal-modal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveGoal();
            });
        }

        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Timeframe filters
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter.timeframe = e.target.dataset.timeframe;
                this.renderGoals();
            });
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter.category = e.target.dataset.category;
                this.renderGoals();
            });
        });

        // Timeframe select change (for custom date)
        const timeframeSelect = document.getElementById('goal-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                const customDateGroup = document.getElementById('custom-date-group');
                if (e.target.value === 'custom') {
                    customDateGroup.style.display = 'block';
                } else {
                    customDateGroup.style.display = 'none';
                }
            });
        }

        // Vision board upload
        const uploadBtn = document.getElementById('upload-vision-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => this.handleVisionUpload(e.target.files);
                input.click();
            });
        }

        // View board button
        const viewBoardBtn = document.getElementById('view-board-btn');
        if (viewBoardBtn) {
            viewBoardBtn.addEventListener('click', () => this.openVisionBoard());
        }

        // Goal image upload
        const goalImageInput = document.getElementById('goal-image');
        if (goalImageInput) {
            goalImageInput.addEventListener('change', (e) => {
                this.currentGoalImage = e.target.files[0];
            });
        }

        // Suggestion items
        document.querySelectorAll('.suggestion-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const suggestion = e.target.dataset.suggestion;
                this.openModal();
                document.getElementById('goal-title').value = suggestion;
            });
        });
    }

    openModal(goalId = null) {
        const modal = document.getElementById('goal-modal');
        const modalTitle = document.getElementById('modal-title');
        
        if (goalId) {
            // Edit mode
            this.editingGoalId = goalId;
            modalTitle.textContent = 'Edit Goal';
            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                this.populateModal(goal);
            }
        } else {
            // Add mode
            this.editingGoalId = null;
            modalTitle.textContent = 'Add New Goal';
            this.clearModal();
        }
        
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('goal-modal');
        modal.style.display = 'none';
        this.editingGoalId = null;
        this.currentGoalImage = null;
        this.clearModal();
    }

    clearModal() {
        document.getElementById('goal-title').value = '';
        document.getElementById('goal-description').value = '';
        document.getElementById('goal-category').value = 'travel';
        document.getElementById('goal-timeframe').value = 'year';
        document.getElementById('goal-deadline').value = '';
        document.getElementById('goal-priority').value = 'medium';
        document.getElementById('goal-budget').value = '';
        document.getElementById('goal-subgoals').value = '';
        document.getElementById('goal-notes').value = '';
        document.getElementById('goal-image').value = '';
        document.getElementById('custom-date-group').style.display = 'none';
    }

    populateModal(goal) {
        document.getElementById('goal-title').value = goal.title || '';
        document.getElementById('goal-description').value = goal.description || '';
        document.getElementById('goal-category').value = goal.category || 'travel';
        document.getElementById('goal-timeframe').value = goal.timeframe || 'year';
        document.getElementById('goal-deadline').value = goal.customDeadline || '';
        document.getElementById('goal-priority').value = goal.priority || 'medium';
        document.getElementById('goal-budget').value = goal.budget || '';
        document.getElementById('goal-subgoals').value = goal.subGoals ? goal.subGoals.join('\n') : '';
        document.getElementById('goal-notes').value = goal.notes || '';
        
        if (goal.timeframe === 'custom') {
            document.getElementById('custom-date-group').style.display = 'block';
        }
        
        // Show existing image if available
        if (goal.imageUrl) {
            this.showExistingImage(goal.imageUrl);
        }
    }
    
    showExistingImage(imageUrl) {
        const imagePreview = document.getElementById('image-preview');
        if (!imagePreview) {
            // Create image preview container if it doesn't exist
            const fileInput = document.getElementById('goal-image');
            const previewContainer = document.createElement('div');
            previewContainer.id = 'image-preview';
            previewContainer.style.cssText = 'position: relative; margin-top: 10px;';
            previewContainer.innerHTML = `
                <img src="${imageUrl}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                <button onclick="window.bucketListManager.removeGoalImage()" 
                        style="position: absolute; top: 5px; right: 5px; 
                        background: red; color: white; border: none; 
                        border-radius: 50%; width: 25px; height: 25px; 
                        cursor: pointer; font-size: 16px;">×</button>
            `;
            fileInput.parentNode.insertBefore(previewContainer, fileInput.nextSibling);
        } else {
            imagePreview.innerHTML = `
                <img src="${imageUrl}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">
                <button onclick="window.bucketListManager.removeGoalImage()" 
                        style="position: absolute; top: 5px; right: 5px; 
                        background: red; color: white; border: none; 
                        border-radius: 50%; width: 25px; height: 25px; 
                        cursor: pointer; font-size: 16px;">×</button>
            `;
        }
    }
    
    removeGoalImage() {
        // Remove image from current editing goal
        if (this.editingGoalId) {
            const goal = this.goals.find(g => g.id === this.editingGoalId);
            if (goal) {
                delete goal.imageUrl;
                this.saveToLocalStorage();
            }
        }
        
        // Clear current image
        this.currentGoalImage = null;
        document.getElementById('goal-image').value = '';
        
        // Remove preview
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.remove();
        }
    }

    saveGoal() {
        const title = document.getElementById('goal-title').value.trim();
        if (!title) {
            alert('Please enter a goal title');
            return;
        }

        const goal = {
            id: this.editingGoalId || Date.now(),
            title: title,
            description: document.getElementById('goal-description').value.trim(),
            category: document.getElementById('goal-category').value,
            timeframe: document.getElementById('goal-timeframe').value,
            customDeadline: document.getElementById('goal-deadline').value,
            priority: document.getElementById('goal-priority').value,
            budget: parseFloat(document.getElementById('goal-budget').value) || 0,
            subGoals: document.getElementById('goal-subgoals').value.split('\n').filter(s => s.trim()),
            notes: document.getElementById('goal-notes').value.trim(),
            status: 'planning',
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null,
            tags: this.generateTags(title, document.getElementById('goal-category').value)
        };

        // Handle image if uploaded
        if (this.currentGoalImage) {
            this.processGoalImage(this.currentGoalImage).then(imageUrl => {
                goal.imageUrl = imageUrl;
                this.saveGoalData(goal);
            });
        } else {
            // Keep existing image if editing
            if (this.editingGoalId) {
                const existingGoal = this.goals.find(g => g.id === this.editingGoalId);
                if (existingGoal && existingGoal.imageUrl) {
                    goal.imageUrl = existingGoal.imageUrl;
                }
            }
            this.saveGoalData(goal);
        }
    }

    saveGoalData(goal) {
        if (this.editingGoalId) {
            // Update existing goal
            const index = this.goals.findIndex(g => g.id === this.editingGoalId);
            if (index !== -1) {
                this.goals[index] = { ...this.goals[index], ...goal };
            }
        } else {
            // Add new goal
            this.goals.push(goal);
        }

        this.saveToLocalStorage();
        this.syncToSheets();
        this.renderGoals();
        this.updateStats();
        this.closeModal();
        this.showMessage(`Goal "${goal.title}" ${this.editingGoalId ? 'updated' : 'added'} successfully!`, 'success');
    }

    async processGoalImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }

    generateTags(title, category) {
        const tags = [category];
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('travel') || titleLower.includes('visit')) tags.push('travel');
        if (titleLower.includes('learn')) tags.push('education');
        if (titleLower.includes('business') || titleLower.includes('start')) tags.push('entrepreneurship');
        if (titleLower.includes('health') || titleLower.includes('fit')) tags.push('wellness');
        
        return [...new Set(tags)];
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveToLocalStorage();
            this.syncToSheets();
            this.renderGoals();
            this.updateStats();
            this.showMessage('Goal deleted successfully', 'success');
        }
    }

    toggleGoalStatus(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            if (goal.status === 'completed') {
                goal.status = 'planning';
                goal.completedAt = null;
                goal.progress = 0;
            } else {
                goal.status = 'completed';
                goal.completedAt = new Date().toISOString();
                goal.progress = 100;
            }
            
            this.saveToLocalStorage();
            this.syncToSheets();
            this.renderGoals();
            this.updateStats();
        }
    }

    updateGoalProgress(goalId, progress) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.progress = progress;
            if (progress > 0 && progress < 100) {
                goal.status = 'in-progress';
            } else if (progress === 100) {
                goal.status = 'completed';
                goal.completedAt = new Date().toISOString();
            }
            
            this.saveToLocalStorage();
            this.syncToSheets();
            this.renderGoals();
            this.updateStats();
        }
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;

        const filteredGoals = this.filterGoals();
        const groupedGoals = this.groupGoalsByTimeframe(filteredGoals);

        if (filteredGoals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-state">
                    <p>No goals found. Start by adding your first bucket list goal!</p>
                </div>
            `;
            return;
        }

        let html = '';
        for (const [timeframe, goals] of Object.entries(groupedGoals)) {
            if (goals.length === 0) continue;
            
            html += `
                <div class="goals-timeframe-group">
                    <h3 class="timeframe-title">${this.getTimeframeLabel(timeframe)} (${goals.length})</h3>
                    <div class="goals-grid-items">
            `;
            
            goals.forEach(goal => {
                const categoryEmoji = this.getCategoryEmoji(goal.category);
                const priorityClass = `priority-${goal.priority}`;
                const statusClass = `status-${goal.status}`;
                
                html += `
                    <div class="goal-card ${statusClass} ${priorityClass}" data-goal-id="${goal.id}">
                        <div class="goal-card-header">
                            <div class="goal-title-section">
                                <span class="goal-category">${categoryEmoji}</span>
                                <h4 class="goal-title">${goal.title}</h4>
                            </div>
                            <div class="goal-actions">
                                <button class="goal-action-btn" onclick="bucketListManager.toggleGoalStatus(${goal.id})">
                                    ${goal.status === 'completed' ? '✓' : '○'}
                                </button>
                                <button class="goal-action-btn" onclick="bucketListManager.openModal(${goal.id})">✏️</button>
                                <button class="goal-action-btn" onclick="bucketListManager.deleteGoal(${goal.id})">🗑️</button>
                            </div>
                        </div>
                        ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                        ${goal.imageUrl ? `<img src="${goal.imageUrl}" class="goal-image" alt="${goal.title}">` : ''}
                        
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                            </div>
                            <span class="progress-text">${goal.progress || 0}%</span>
                        </div>
                        
                        ${goal.subGoals && goal.subGoals.length > 0 ? `
                            <div class="goal-subgoals">
                                <p class="subgoals-title">Steps:</p>
                                <ul class="subgoals-list">
                                    ${goal.subGoals.slice(0, 3).map(sub => `<li>${sub}</li>`).join('')}
                                    ${goal.subGoals.length > 3 ? `<li>+${goal.subGoals.length - 3} more...</li>` : ''}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${goal.budget ? `
                            <div class="goal-budget">
                                <span class="budget-label">Budget:</span>
                                <span class="budget-amount">₹${goal.budget.toLocaleString()}</span>
                            </div>
                        ` : ''}
                        
                        <div class="goal-footer">
                            <span class="goal-date">Added ${this.formatDate(goal.createdAt)}</span>
                            ${goal.customDeadline ? `<span class="goal-deadline">Due: ${this.formatDate(goal.customDeadline)}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        goalsList.innerHTML = html;
    }

    filterGoals() {
        let filtered = [...this.goals];
        
        // Filter by timeframe
        if (this.currentFilter.timeframe !== 'all') {
            filtered = filtered.filter(goal => goal.timeframe === this.currentFilter.timeframe);
        }
        
        // Filter by category
        if (this.currentFilter.category !== 'all') {
            filtered = filtered.filter(goal => goal.category === this.currentFilter.category);
        }
        
        // Sort by priority and creation date
        filtered.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return filtered;
    }

    groupGoalsByTimeframe(goals) {
        const grouped = {};
        const timeframeOrder = ['month', '3months', '6months', 'year', '2years', '3years', '5years', '10years', 'lifetime', 'custom'];
        
        timeframeOrder.forEach(tf => {
            grouped[tf] = goals.filter(g => g.timeframe === tf);
        });
        
        return grouped;
    }

    getTimeframeLabel(timeframe) {
        const labels = {
            'month': 'This Month',
            '3months': '3 Months',
            '6months': '6 Months',
            'year': '1 Year',
            '2years': '2 Years',
            '3years': '3 Years',
            '5years': '5 Years',
            '10years': '10 Years',
            'lifetime': 'Lifetime',
            'custom': 'Custom Timeline'
        };
        return labels[timeframe] || timeframe;
    }

    getCategoryEmoji(category) {
        const emojis = {
            'travel': '🌍',
            'career': '💼',
            'health': '💪',
            'finance': '💰',
            'learning': '📚',
            'relationships': '❤️',
            'experiences': '🎯',
            'material': '🏠',
            'spiritual': '🧘',
            'creative': '🎨'
        };
        return emojis[category] || '🎯';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    updateStats() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.status === 'completed').length;
        const inProgressGoals = this.goals.filter(g => g.status === 'in-progress').length;
        const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
        
        document.getElementById('total-goals').textContent = totalGoals;
        document.getElementById('completed-goals').textContent = completedGoals;
        document.getElementById('progress-goals').textContent = inProgressGoals;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        
        // Update progress chart
        this.updateProgressChart(completedGoals, inProgressGoals, totalGoals - completedGoals - inProgressGoals);
    }

    updateProgressChart(completed, inProgress, planning) {
        const chartContainer = document.getElementById('goal-progress-chart');
        if (!chartContainer) return;
        
        const total = completed + inProgress + planning;
        if (total === 0) {
            chartContainer.innerHTML = '<p>No goals yet</p>';
            return;
        }
        
        const completedPercent = (completed / total) * 100;
        const inProgressPercent = (inProgress / total) * 100;
        const planningPercent = (planning / total) * 100;
        
        chartContainer.innerHTML = `
            <div class="progress-chart-bar">
                <div class="chart-segment completed" style="width: ${completedPercent}%" title="Completed: ${completed}"></div>
                <div class="chart-segment in-progress" style="width: ${inProgressPercent}%" title="In Progress: ${inProgress}"></div>
                <div class="chart-segment planning" style="width: ${planningPercent}%" title="Planning: ${planning}"></div>
            </div>
            <div class="chart-legend">
                <span class="legend-item"><span class="legend-color completed"></span>Completed</span>
                <span class="legend-item"><span class="legend-color in-progress"></span>In Progress</span>
                <span class="legend-item"><span class="legend-color planning"></span>Planning</span>
            </div>
        `;
    }

    // Vision Board Methods
    handleVisionUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.visionImages.push({
                        id: Date.now() + Math.random(),
                        url: e.target.result,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    });
                    this.saveVisionBoard();
                    this.renderVisionBoard();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    renderVisionBoard() {
        const preview = document.getElementById('vision-board-preview');
        if (!preview) return;
        
        if (this.visionImages.length === 0) {
            preview.innerHTML = `
                <div class="vision-placeholder">
                    <p>Upload images to create your vision board</p>
                </div>
            `;
            return;
        }
        
        preview.innerHTML = `
            <div class="vision-images-grid">
                ${this.visionImages.slice(0, 6).map(img => `
                    <div class="vision-image-item">
                        <img src="${img.url}" alt="${img.name}">
                        <button class="remove-vision-btn" onclick="window.bucketListManager.removeVisionImage('${img.id}')">×</button>
                    </div>
                `).join('')}
                ${this.visionImages.length > 6 ? `
                    <div class="vision-more">
                        <span>+${this.visionImages.length - 6} more</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    removeVisionImage(imageId) {
        // Convert to string for comparison since IDs might be passed as strings
        const idToRemove = String(imageId);
        this.visionImages = this.visionImages.filter(img => String(img.id) !== idToRemove);
        this.saveVisionBoard();
        this.renderVisionBoard();
        
        // Show confirmation message
        this.showMessage('Image removed from vision board', 'success');
    }

    openVisionBoard() {
        // Create full-screen vision board modal
        const modal = document.createElement('div');
        modal.className = 'vision-board-modal';
        modal.id = 'vision-board-modal';
        modal.innerHTML = `
            <div class="vision-board-full">
                <div class="vision-board-header">
                    <h2>My Vision Board</h2>
                    <button class="close-vision-board">×</button>
                </div>
                <div class="vision-board-content">
                    ${this.visionImages.map(img => `
                        <div class="vision-board-image">
                            <img src="${img.url}" alt="${img.name}">
                            <button class="remove-vision-btn" onclick="window.bucketListManager.removeVisionImage('${img.id}'); window.bucketListManager.closeVisionBoardModal();">×</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-vision-board').addEventListener('click', () => {
            this.closeVisionBoardModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeVisionBoardModal();
            }
        });
    }
    
    closeVisionBoardModal() {
        const modal = document.getElementById('vision-board-modal');
        if (modal) {
            document.body.removeChild(modal);
            // Re-render the vision board after closing to update the preview
            this.renderVisionBoard();
        }
    }

    // Storage Methods
    saveToLocalStorage() {
        localStorage.setItem('bucketListGoals', JSON.stringify(this.goals));
    }

    loadGoals() {
        const stored = localStorage.getItem('bucketListGoals');
        if (stored) {
            try {
                this.goals = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading goals:', e);
                this.goals = [];
            }
        }
    }

    saveVisionBoard() {
        localStorage.setItem('visionBoardImages', JSON.stringify(this.visionImages));
    }

    loadVisionBoard() {
        const stored = localStorage.getItem('visionBoardImages');
        if (stored) {
            try {
                this.visionImages = JSON.parse(stored);
                this.renderVisionBoard();
            } catch (e) {
                console.error('Error loading vision board:', e);
                this.visionImages = [];
            }
        }
    }

    // Google Sheets Sync
    async syncToSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) {
            return;
        }

        try {
            await this.ensureBucketListSheet();
            
            const values = this.goals.map(goal => [
                goal.id,
                goal.title,
                goal.description || '',
                goal.category,
                goal.timeframe,
                goal.customDeadline || '',
                goal.priority,
                goal.status,
                goal.progress,
                goal.budget || 0,
                goal.subGoals ? goal.subGoals.join('|') : '',
                goal.notes || '',
                goal.imageUrl || '',
                goal.createdAt,
                goal.completedAt || '',
                goal.tags ? goal.tags.join(',') : ''
            ]);

            if (values.length > 0) {
                await gapi.client.sheets.spreadsheets.values.clear({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'BucketList!A2:P1000'
                });

                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: `BucketList!A2:P${values.length + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values }
                });

                console.log('Bucket list synced to Google Sheets');
            }
        } catch (error) {
            console.error('Failed to sync bucket list:', error);
        }
    }

    async syncFromSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) {
            return;
        }

        try {
            await this.ensureBucketListSheet();
            
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: window.todoApp.sheetId,
                range: 'BucketList!A2:P1000'
            });

            if (response.result.values && response.result.values.length > 0) {
                this.goals = response.result.values.map(row => ({
                    id: parseInt(row[0]) || Date.now(),
                    title: row[1] || '',
                    description: row[2] || '',
                    category: row[3] || 'travel',
                    timeframe: row[4] || 'year',
                    customDeadline: row[5] || '',
                    priority: row[6] || 'medium',
                    status: row[7] || 'planning',
                    progress: parseInt(row[8]) || 0,
                    budget: parseFloat(row[9]) || 0,
                    subGoals: row[10] ? row[10].split('|') : [],
                    notes: row[11] || '',
                    imageUrl: row[12] || '',
                    createdAt: row[13] || new Date().toISOString(),
                    completedAt: row[14] || null,
                    tags: row[15] ? row[15].split(',') : []
                }));

                this.saveToLocalStorage();
                this.renderGoals();
                this.updateStats();
                console.log('Bucket list loaded from Google Sheets');
            }
        } catch (error) {
            console.error('Failed to load bucket list from sheets:', error);
        }
    }

    async ensureBucketListSheet() {
        if (!window.todoApp || !window.todoApp.sheetId) return;

        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });

            const sheets = response.result.sheets;
            const bucketListSheet = sheets.find(sheet => sheet.properties.title === 'BucketList');

            if (!bucketListSheet) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'BucketList',
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 16
                                    },
                                    tabColor: {
                                        red: 0.4,
                                        green: 0.7,
                                        blue: 0.9
                                    }
                                }
                            }
                        }]
                    }
                });

                // Add headers
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'BucketList!A1:P1',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [['ID', 'Title', 'Description', 'Category', 'Timeframe', 'Deadline', 'Priority', 'Status', 'Progress', 'Budget', 'SubGoals', 'Notes', 'ImageURL', 'Created', 'Completed', 'Tags']]
                    }
                });

                console.log('BucketList sheet created');
            }
        } catch (error) {
            console.error('Error ensuring bucket list sheet:', error);
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

// Initialize bucket list manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.bucketListManager = new BucketListManager();
});