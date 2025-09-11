// NOTION-STYLE SIDEBAR - Desktop Only

class NotionSidebar {
    constructor() {
        this.isDesktop = window.innerWidth > 768;
        this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (this.isDesktop) {
            this.init();
        }
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            const wasDesktop = this.isDesktop;
            this.isDesktop = window.innerWidth > 768;
            
            if (!wasDesktop && this.isDesktop) {
                this.init();
            } else if (wasDesktop && !this.isDesktop) {
                this.destroy();
            }
        });
    }

    init() {
        this.createSidebar();
        this.setupEventListeners();
        this.updateActiveItem();
        
        // Add class to body
        document.body.classList.add('has-sidebar');
        
        if (this.isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
            document.querySelector('.notion-sidebar')?.classList.add('collapsed');
        }
    }

    createSidebar() {
        // Check if sidebar already exists
        if (document.querySelector('.notion-sidebar')) return;

        const sidebar = document.createElement('aside');
        sidebar.className = 'notion-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-user">
                    <div class="sidebar-avatar">LT</div>
                    <div class="sidebar-username">lifeTracker</div>
                </div>
                <button class="sidebar-collapse-btn" title="Collapse sidebar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                    </svg>
                </button>
            </div>

            <div class="sidebar-search">
                <input type="text" class="sidebar-search-input" placeholder="Search...">
            </div>

            <nav class="sidebar-nav">
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Main</div>
                    <a href="#" class="sidebar-item" data-view="dashboard">
                        <span class="sidebar-item-icon">🏠</span>
                        <span class="sidebar-item-text">Dashboard</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="today">
                        <span class="sidebar-item-icon">📅</span>
                        <span class="sidebar-item-text">Today</span>
                        <span class="sidebar-item-badge" id="today-count" style="display: none;">0</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="journal">
                        <span class="sidebar-item-icon">📔</span>
                        <span class="sidebar-item-text">Daily Journal</span>
                    </a>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-section-title">Track</div>
                    <a href="#" class="sidebar-item" data-view="expenses">
                        <span class="sidebar-item-icon">💰</span>
                        <span class="sidebar-item-text">Expenses</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="meals">
                        <span class="sidebar-item-icon">🍽️</span>
                        <span class="sidebar-item-text">Meals</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="habits">
                        <span class="sidebar-item-icon">🎯</span>
                        <span class="sidebar-item-text">Habits</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="reminders">
                        <span class="sidebar-item-icon">📞</span>
                        <span class="sidebar-item-text">Call Reminders</span>
                        <span class="sidebar-item-badge" id="reminder-count" style="display: none;">0</span>
                    </a>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-section-title">Create</div>
                    <a href="#" class="sidebar-item" data-view="notes">
                        <span class="sidebar-item-icon">📝</span>
                        <span class="sidebar-item-text">Notes</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="embeddings">
                        <span class="sidebar-item-icon">🔗</span>
                        <span class="sidebar-item-text">Link Embeddings</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="screenshots">
                        <span class="sidebar-item-icon">📸</span>
                        <span class="sidebar-item-text">Smart Screenshots</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="voice-notes">
                        <span class="sidebar-item-icon">🎙️</span>
                        <span class="sidebar-item-text">Voice Notes</span>
                    </a>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-section-title">Goals</div>
                    <a href="#" class="sidebar-item" data-view="bucket-list">
                        <span class="sidebar-item-icon">🪣</span>
                        <span class="sidebar-item-text">Bucket List</span>
                    </a>
                </div>

                <div class="sidebar-divider"></div>

                <div class="sidebar-section">
                    <a href="#" class="sidebar-item" data-view="history">
                        <span class="sidebar-item-icon">📊</span>
                        <span class="sidebar-item-text">History</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="settings">
                        <span class="sidebar-item-icon">⚙️</span>
                        <span class="sidebar-item-text">Settings</span>
                    </a>
                    <a href="#" class="sidebar-item" data-view="about">
                        <span class="sidebar-item-icon">ℹ️</span>
                        <span class="sidebar-item-text">About</span>
                    </a>
                </div>
            </nav>

            <div class="sidebar-footer">
                <button class="sidebar-new-btn">
                    <span>➕</span>
                    <span>New Page</span>
                </button>
            </div>
        `;

        document.body.insertBefore(sidebar, document.body.firstChild);

        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18m-18-6h18m-18 12h18"/>
            </svg>
        `;
        document.body.appendChild(toggleBtn);
    }

    setupEventListeners() {
        // Collapse button
        document.querySelector('.sidebar-collapse-btn')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Toggle button (when collapsed)
        document.querySelector('.sidebar-toggle-btn')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                
                if (view === 'journal') {
                    // Open journal modal
                    if (window.openJournalModal) {
                        window.openJournalModal();
                    }
                } else {
                    // Switch view
                    this.switchView(view);
                }
            });
        });

        // Search functionality
        const searchInput = document.querySelector('.sidebar-search-input');
        searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // New page button
        document.querySelector('.sidebar-new-btn')?.addEventListener('click', () => {
            this.createNewPage();
        });

        // Update counts periodically
        this.updateCounts();
        setInterval(() => this.updateCounts(), 60000); // Update every minute
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.notion-sidebar');
        const body = document.body;
        
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            body.classList.toggle('sidebar-collapsed');
            
            this.isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', this.isCollapsed);
        }
    }

    switchView(viewName) {
        // Update active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}-view`);
        });

        // Trigger app's view switch if available
        if (window.app && window.app.switchTab) {
            window.app.switchTab(viewName);
        }
    }

    updateActiveItem() {
        // Find current active view
        const activeView = document.querySelector('.view.active');
        if (activeView) {
            const viewId = activeView.id.replace('-view', '');
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === viewId);
            });
        }
    }

    handleSearch(query) {
        const items = document.querySelectorAll('.sidebar-item');
        const sections = document.querySelectorAll('.sidebar-section');
        
        if (!query) {
            // Show all items
            items.forEach(item => item.style.display = '');
            sections.forEach(section => section.style.display = '');
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        
        sections.forEach(section => {
            let hasVisibleItems = false;
            const sectionItems = section.querySelectorAll('.sidebar-item');
            
            sectionItems.forEach(item => {
                const text = item.querySelector('.sidebar-item-text').textContent.toLowerCase();
                if (text.includes(lowerQuery)) {
                    item.style.display = '';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Hide section title if no items are visible
            const title = section.querySelector('.sidebar-section-title');
            if (title) {
                title.style.display = hasVisibleItems ? '' : 'none';
            }
        });
    }

    updateCounts() {
        // Update today's task count
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const todayTasks = tasks.filter(task => !task.completed);
        const todayCount = document.getElementById('today-count');
        if (todayCount) {
            todayCount.textContent = todayTasks.length;
            todayCount.style.display = todayTasks.length > 0 ? '' : 'none';
        }

        // Update reminder count
        const reminders = JSON.parse(localStorage.getItem('callReminders') || '[]');
        const activeReminders = reminders.filter(r => !r.completed);
        const reminderCount = document.getElementById('reminder-count');
        if (reminderCount) {
            reminderCount.textContent = activeReminders.length;
            reminderCount.style.display = activeReminders.length > 0 ? '' : 'none';
        }
    }

    createNewPage() {
        // Quick add dialog
        const options = [
            { icon: '📝', text: 'New Note', action: 'note' },
            { icon: '✅', text: 'New Task', action: 'task' },
            { icon: '💰', text: 'New Expense', action: 'expense' },
            { icon: '🎯', text: 'New Goal', action: 'goal' }
        ];

        // For now, just switch to notes view
        this.switchView('notes');
        setTimeout(() => {
            const addBtn = document.querySelector('.add-note-btn');
            if (addBtn) addBtn.click();
        }, 300);
    }

    destroy() {
        document.querySelector('.notion-sidebar')?.remove();
        document.querySelector('.sidebar-toggle-btn')?.remove();
        document.body.classList.remove('has-sidebar', 'sidebar-collapsed');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.notionSidebar = new NotionSidebar();
});