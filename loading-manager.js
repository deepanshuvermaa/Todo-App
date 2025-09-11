// LOADING STATES MANAGER - Handles all loading indicators

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.progressBar = null;
        this.init();
    }

    init() {
        // Create progress bar
        this.createProgressBar();
        
        // Intercept fetch requests to show loading
        this.interceptFetch();
        
        // Add loading states to existing functions
        this.enhanceExistingFunctions();
    }

    createProgressBar() {
        const container = document.createElement('div');
        container.className = 'progress-bar-container';
        container.innerHTML = '<div class="progress-bar"></div>';
        document.body.appendChild(container);
        this.progressBar = container;
    }

    showProgress(percent = 30) {
        this.progressBar.classList.add('active');
        const bar = this.progressBar.querySelector('.progress-bar');
        bar.style.width = percent + '%';
    }

    hideProgress() {
        const bar = this.progressBar.querySelector('.progress-bar');
        bar.style.width = '100%';
        setTimeout(() => {
            this.progressBar.classList.remove('active');
            bar.style.width = '0';
        }, 300);
    }

    // Show global loading overlay
    showGlobalLoading(text = 'Loading...') {
        let overlay = document.getElementById('global-loading');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-loading';
            overlay.className = 'global-loading';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-text').textContent = text;
            overlay.style.display = 'flex';
        }
    }

    hideGlobalLoading() {
        const overlay = document.getElementById('global-loading');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Show skeleton loader for a container
    showSkeleton(container, type = 'default') {
        const skeletons = {
            'task': this.getTaskSkeleton(),
            'note': this.getNoteSkeleton(),
            'dashboard': this.getDashboardSkeleton(),
            'default': this.getDefaultSkeleton()
        };

        if (container && typeof container === 'object') {
            container.innerHTML = skeletons[type] || skeletons['default'];
        }
    }

    getTaskSkeleton(count = 3) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="task-skeleton">
                    <div class="skeleton skeleton-checkbox"></div>
                    <div class="skeleton skeleton-text" style="width: ${60 + Math.random() * 30}%"></div>
                </div>
            `;
        }
        return html;
    }

    getNoteSkeleton(count = 2) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="note-skeleton">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `;
        }
        return html;
    }

    getDashboardSkeleton() {
        return `
            <div class="dashboard-skeleton">
                <div class="skeleton dashboard-card-skeleton"></div>
                <div class="skeleton dashboard-card-skeleton"></div>
                <div class="skeleton dashboard-card-skeleton"></div>
                <div class="skeleton dashboard-card-skeleton"></div>
            </div>
        `;
    }

    getDefaultSkeleton() {
        return `
            <div class="skeleton-card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 80%"></div>
                <div class="skeleton skeleton-text" style="width: 60%"></div>
            </div>
        `;
    }

    // Add loading state to button
    setButtonLoading(button, isLoading = true) {
        if (!button) return;

        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            button.dataset.originalText = button.textContent;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
            }
        }
    }

    // Show inline loading for lists
    showListLoading(container) {
        if (!container) return;
        
        const loader = document.createElement('div');
        loader.className = 'list-loading';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Loading items...</span>
        `;
        container.appendChild(loader);
    }

    hideListLoading(container) {
        if (!container) return;
        
        const loader = container.querySelector('.list-loading');
        if (loader) {
            loader.remove();
        }
    }

    // Intercept fetch to show progress
    interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            this.showProgress(30);
            
            return originalFetch.apply(this, args)
                .then(response => {
                    this.showProgress(90);
                    setTimeout(() => this.hideProgress(), 100);
                    return response;
                })
                .catch(error => {
                    this.hideProgress();
                    throw error;
                });
        };
    }

    // Enhance existing app functions with loading states
    enhanceExistingFunctions() {
        // Enhance TodoApp methods if it exists
        if (window.todoApp) {
            this.enhanceTodoApp();
        }

        // Enhance form submissions
        this.enhanceForms();

        // Enhance navigation
        this.enhanceNavigation();
    }

    enhanceTodoApp() {
        const app = window.todoApp;
        
        // Wrap loadTasks
        if (app.loadTasks) {
            const originalLoadTasks = app.loadTasks.bind(app);
            app.loadTasks = async () => {
                const container = document.getElementById('pending-tasks');
                if (container) {
                    this.showSkeleton(container, 'task');
                }
                
                try {
                    await originalLoadTasks();
                } finally {
                    // Skeleton will be replaced by actual content
                }
            };
        }

        // Wrap sync functions
        if (app.syncTasks) {
            const originalSync = app.syncTasks.bind(app);
            app.syncTasks = async () => {
                this.showProgress(30);
                try {
                    await originalSync();
                } finally {
                    this.hideProgress();
                }
            };
        }
    }

    enhanceForms() {
        // Add loading to all form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    this.setButtonLoading(submitBtn, true);
                }
            }
        });
    }

    enhanceNavigation() {
        // Add loading when switching tabs
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.showProgress(50);
                setTimeout(() => this.hideProgress(), 300);
            });
        });
    }

    // Show empty state with loading
    showEmptyStateLoading(container, message = 'Loading content...') {
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state-loading">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize loading manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.loadingManager = new LoadingManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}