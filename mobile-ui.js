// Mobile UI Enhancement System - Complete Implementation
// This file handles all mobile-specific UI improvements

class MobileUIEnhancement {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.currentView = 'dashboard';
        this.isQuickAddOpen = false;
        this.isMoreMenuOpen = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.headerVisible = true;
        this.lastScrollTop = 0;
        
        if (this.isMobile) {
            this.init();
        }
        
        // Re-initialize on resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (this.isMobile && !wasMobile) {
                this.init();
            } else if (!this.isMobile && wasMobile) {
                this.cleanup();
            }
        });
    }
    
    init() {
        console.log('Initializing mobile UI enhancements...');
        
        // Core mobile features
        this.createBottomNavigation();
        this.createQuickAddMenu();
        this.createMoreMenu();
        this.setupSwipeGestures();
        this.setupSmartHeader();
        this.optimizeTouch();
        this.checkFirstVisit();
        this.setupBackButtonNavigation();
        
        // Hide desktop navigation
        const desktopNav = document.querySelector('.nav-tabs');
        if (desktopNav) {
            desktopNav.style.display = 'none';
        }
        
        // Adjust main content padding
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.paddingBottom = '70px'; // Space for bottom nav
        }
    }
    
    cleanup() {
        // Restore desktop navigation
        const desktopNav = document.querySelector('.nav-tabs');
        if (desktopNav) {
            desktopNav.style.display = '';
        }
        
        // Remove mobile elements
        const bottomNav = document.getElementById('mobile-bottom-nav');
        if (bottomNav) bottomNav.remove();
        
        const quickAddOverlay = document.getElementById('quick-add-overlay');
        if (quickAddOverlay) quickAddOverlay.remove();
        
        const moreMenuOverlay = document.getElementById('more-menu-overlay');
        if (moreMenuOverlay) moreMenuOverlay.remove();
    }
    
    createBottomNavigation() {
        // Remove existing if any
        const existing = document.getElementById('mobile-bottom-nav');
        if (existing) existing.remove();
        
        const bottomNav = document.createElement('nav');
        bottomNav.id = 'mobile-bottom-nav';
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.innerHTML = `
            <button class="bottom-nav-item active" data-view="dashboard">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                <span>Home</span>
            </button>
            <button class="bottom-nav-item" data-view="today">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span>Tasks</span>
            </button>
            <div class="bottom-nav-fab-container">
                <button class="fab-button" id="mobile-quick-add-fab">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                </button>
            </div>
            <button class="bottom-nav-item" data-view="expenses">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.81.45 1.61 1.67 1.61 1.16 0 1.6-.64 1.6-1.46 0-.84-.68-1.22-1.88-1.54-2.28-.61-3.21-1.48-3.21-3.15 0-1.69 1.16-2.84 2.76-3.19V5.58h2.66v1.38c1.52.29 2.72 1.16 2.83 2.88h-1.97c-.06-.72-.5-1.32-1.45-1.32-1.06 0-1.58.49-1.58 1.37 0 .84.68 1.22 1.88 1.54 2.28.61 3.21 1.48 3.21 3.15 0 1.87-1.36 2.99-2.97 3.35z"/>
                </svg>
                <span>Money</span>
            </button>
            <button class="bottom-nav-item" data-view="more" id="mobile-more-menu-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span>More</span>
            </button>
        `;
        
        document.body.appendChild(bottomNav);
        
        // Add event listeners
        bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                if (view === 'more') {
                    this.toggleMoreMenu();
                } else {
                    this.switchView(view);
                }
            });
        });
        
        // FAB button listener
        const fab = bottomNav.querySelector('#mobile-quick-add-fab');
        if (fab) {
            fab.addEventListener('click', () => this.toggleQuickAdd());
        }
    }
    
    createQuickAddMenu() {
        const overlay = document.createElement('div');
        overlay.id = 'quick-add-overlay';
        overlay.className = 'quick-add-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="quick-add-backdrop"></div>
            <div class="quick-add-menu">
                <button class="quick-add-item" data-action="task">
                    <div class="quick-add-icon">✓</div>
                    <span>Task</span>
                </button>
                <button class="quick-add-item" data-action="expense">
                    <div class="quick-add-icon">💰</div>
                    <span>Expense</span>
                </button>
                <button class="quick-add-item" data-action="note">
                    <div class="quick-add-icon">📝</div>
                    <span>Note</span>
                </button>
                <button class="quick-add-item" data-action="meal">
                    <div class="quick-add-icon">🍽️</div>
                    <span>Meal</span>
                </button>
                <button class="quick-add-item" data-action="reminder">
                    <div class="quick-add-icon">📞</div>
                    <span>Reminder</span>
                </button>
                <button class="quick-add-item" data-action="habit">
                    <div class="quick-add-icon">🎯</div>
                    <span>Habit</span>
                </button>
                <button class="quick-add-item" data-action="screenshot">
                    <div class="quick-add-icon">📸</div>
                    <span>Screenshot</span>
                </button>
                <button class="quick-add-item" data-action="voice">
                    <div class="quick-add-icon">🎙️</div>
                    <span>Voice Note</span>
                </button>
                <button class="quick-add-item" data-action="link">
                    <div class="quick-add-icon">🔗</div>
                    <span>Link</span>
                </button>
            </div>
            <button class="quick-add-close">×</button>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        overlay.querySelector('.quick-add-backdrop').addEventListener('click', () => {
            this.toggleQuickAdd();
        });
        
        overlay.querySelector('.quick-add-close').addEventListener('click', () => {
            this.toggleQuickAdd();
        });
        
        overlay.querySelectorAll('.quick-add-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                this.handleQuickAdd(action);
            });
        });
    }
    
    createMoreMenu() {
        const overlay = document.createElement('div');
        overlay.id = 'more-menu-overlay';
        overlay.className = 'more-menu-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="more-menu-backdrop"></div>
            <div class="more-menu">
                <div class="more-menu-header">
                    <h3>More Features</h3>
                    <button class="more-menu-close">×</button>
                </div>
                <div class="more-menu-items">
                    <button class="more-menu-item" data-view="meals">
                        <span class="more-item-icon">🍽️</span>
                        <span>Meals</span>
                    </button>
                    <button class="more-menu-item" data-view="habits">
                        <span class="more-item-icon">🎯</span>
                        <span>Habits</span>
                    </button>
                    <button class="more-menu-item" data-view="notes">
                        <span class="more-item-icon">📝</span>
                        <span>Notes</span>
                    </button>
                    <button class="more-menu-item" data-view="reminders">
                        <span class="more-item-icon">📞</span>
                        <span>Call Reminders</span>
                    </button>
                    <button class="more-menu-item" data-view="bucket-list">
                        <span class="more-item-icon">🪣</span>
                        <span>Bucket List</span>
                    </button>
                    <button class="more-menu-item" data-view="embeddings">
                        <span class="more-item-icon">🔗</span>
                        <span>Links</span>
                    </button>
                    <button class="more-menu-item" data-view="screenshots">
                        <span class="more-item-icon">📸</span>
                        <span>Screenshots</span>
                    </button>
                    <button class="more-menu-item" data-view="voice-notes">
                        <span class="more-item-icon">🎙️</span>
                        <span>Voice Notes</span>
                    </button>
                    <button class="more-menu-item" data-view="history">
                        <span class="more-item-icon">📊</span>
                        <span>History</span>
                    </button>
                    <button class="more-menu-item" data-view="settings">
                        <span class="more-item-icon">⚙️</span>
                        <span>Settings</span>
                    </button>
                    <button class="more-menu-item" data-view="about">
                        <span class="more-item-icon">ℹ️</span>
                        <span>About</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add event listeners
        overlay.querySelector('.more-menu-backdrop').addEventListener('click', () => {
            this.toggleMoreMenu();
        });
        
        overlay.querySelector('.more-menu-close').addEventListener('click', () => {
            this.toggleMoreMenu();
        });
        
        overlay.querySelectorAll('.more-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                this.switchView(view);
                this.toggleMoreMenu();
            });
        });
    }
    
    setupSwipeGestures() {
        // Add swipe gestures to task items
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.task-item')) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const diffX = touchX - this.touchStartX;
            const diffY = touchY - this.touchStartY;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                e.preventDefault();
                
                if (diffX > 0) {
                    // Swipe right - complete
                    taskItem.style.transform = `translateX(${Math.min(diffX, 80)}px)`;
                    taskItem.style.background = 'linear-gradient(to right, #10b981, transparent)';
                } else {
                    // Swipe left - delete
                    taskItem.style.transform = `translateX(${Math.max(diffX, -80)}px)`;
                    taskItem.style.background = 'linear-gradient(to left, #ef4444, transparent)';
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const touchX = e.changedTouches[0].clientX;
            const diffX = touchX - this.touchStartX;
            
            if (Math.abs(diffX) > 80) {
                if (diffX > 0) {
                    // Complete task
                    this.completeTask(taskItem);
                } else {
                    // Delete task
                    this.deleteTask(taskItem);
                }
            } else {
                // Reset position
                taskItem.style.transform = '';
                taskItem.style.background = '';
            }
        });
    }
    
    setupSmartHeader() {
        const header = document.querySelector('.header');
        const navTabs = document.querySelector('.nav-tabs');
        
        if (!header) return;
        
        // For mobile, simple header without sticky behavior
        if (this.isMobile) {
            // Normal position, not sticky or fixed
            header.style.position = 'relative';
            header.style.zIndex = '100';
            
            // Hide desktop nav tabs on mobile
            if (navTabs) {
                navTabs.style.display = 'none';
            }
        }
    }
    
    optimizeTouch() {
        // Ensure all interactive elements have proper touch targets
        const minTouchSize = 44; // iOS recommended minimum
        
        document.querySelectorAll('button, .btn, input, select, textarea, .task-checkbox').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.height < minTouchSize) {
                el.style.minHeight = minTouchSize + 'px';
                el.style.paddingTop = '10px';
                el.style.paddingBottom = '10px';
            }
        });
        
        // Prevent zoom on input focus (iOS)
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.style.fontSize && parseInt(el.style.fontSize) < 16) {
                el.style.fontSize = '16px';
            }
        });
        
        // Add touch feedback
        document.querySelectorAll('button, .btn').forEach(el => {
            el.addEventListener('touchstart', () => {
                el.classList.add('touch-active');
            });
            
            el.addEventListener('touchend', () => {
                setTimeout(() => el.classList.remove('touch-active'), 100);
            });
        });
    }
    
    checkFirstVisit() {
        // Only show onboarding once for first-time users
        if (!localStorage.getItem('onboarded') && !localStorage.getItem('skipOnboarding')) {
            this.showOnboarding();
        }
    }
    
    showOnboarding() {
        const onboarding = document.createElement('div');
        onboarding.className = 'onboarding-wizard';
        onboarding.innerHTML = `
            <div class="onboard-step active" data-step="1">
                <div class="onboard-content">
                    <h2>Welcome to LifeTracker! 👋</h2>
                    <p>Your personal productivity companion</p>
                    <button class="btn-primary onboard-next">Get Started</button>
                </div>
            </div>
            <div class="onboard-step" data-step="2">
                <div class="onboard-content">
                    <h2>Quick Tour</h2>
                    <div class="onboard-features">
                        <div class="onboard-feature">
                            <span class="feature-icon">✓</span>
                            <p>Track daily tasks</p>
                        </div>
                        <div class="onboard-feature">
                            <span class="feature-icon">💰</span>
                            <p>Manage expenses</p>
                        </div>
                        <div class="onboard-feature">
                            <span class="feature-icon">📊</span>
                            <p>View insights</p>
                        </div>
                    </div>
                    <button class="btn-primary onboard-next">Continue</button>
                </div>
            </div>
            <div class="onboard-step" data-step="3">
                <div class="onboard-content">
                    <h2>Sync Your Data?</h2>
                    <p>Connect Google Sheets to sync across devices</p>
                    <button class="btn-google" onclick="window.todoApp?.handleGoogleSignIn()">
                        Connect Google
                    </button>
                    <button class="btn-secondary onboard-skip">Skip for Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(onboarding);
        
        // Handle navigation
        onboarding.querySelectorAll('.onboard-next').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentStep = onboarding.querySelector('.onboard-step.active');
                const nextStep = currentStep.nextElementSibling;
                
                if (nextStep && nextStep.classList.contains('onboard-step')) {
                    currentStep.classList.remove('active');
                    nextStep.classList.add('active');
                } else {
                    this.completeOnboarding(onboarding);
                }
            });
        });
        
        const skipBtn = onboarding.querySelector('.onboard-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.completeOnboarding(onboarding);
            });
        }
    }
    
    completeOnboarding(onboardingEl) {
        localStorage.setItem('onboarded', 'true');
        onboardingEl.classList.add('fade-out');
        setTimeout(() => onboardingEl.remove(), 300);
    }
    
    toggleQuickAdd() {
        const overlay = document.getElementById('quick-add-overlay');
        const fab = document.getElementById('mobile-quick-add-fab');
        
        if (!overlay) return;
        
        this.isQuickAddOpen = !this.isQuickAddOpen;
        
        if (this.isQuickAddOpen) {
            overlay.style.display = 'flex';
            fab.classList.add('active');
            // Animate menu items
            setTimeout(() => {
                overlay.querySelectorAll('.quick-add-item').forEach((item, index) => {
                    item.style.animation = `slideUp 0.3s ease ${index * 0.05}s forwards`;
                });
            }, 10);
        } else {
            overlay.style.display = 'none';
            fab.classList.remove('active');
        }
    }
    
    toggleMoreMenu() {
        const overlay = document.getElementById('more-menu-overlay');
        
        if (!overlay) return;
        
        this.isMoreMenuOpen = !this.isMoreMenuOpen;
        
        if (this.isMoreMenuOpen) {
            overlay.style.display = 'flex';
            setTimeout(() => overlay.classList.add('active'), 10);
        } else {
            overlay.classList.remove('active');
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }
    
    setupBackButtonNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.switchView(e.state.view, true);
            } else {
                // Default to today view
                const hash = window.location.hash.slice(1);
                if (hash) {
                    this.switchView(hash, true);
                } else {
                    this.switchView('today', true);
                }
            }
        });
        
        // Set initial state
        const initialView = window.location.hash.slice(1) || 'today';
        history.replaceState({ view: initialView }, '', `#${initialView}`);
        this.switchView(initialView, true);
    }
    
    switchView(viewName, isBackNavigation = false) {
        // Store previous view for back navigation
        const previousView = this.currentView;
        
        // Update active nav item
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Trigger the same click event as desktop navigation
        const desktopTab = document.querySelector(`.nav-tab[data-tab="${viewName}"]`);
        if (desktopTab) {
            desktopTab.click();
        }
        
        this.currentView = viewName;
        
        // Add to history for back button navigation (only if not coming from back button)
        if (!isBackNavigation && previousView !== viewName) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }
    }
    
    handleQuickAdd(action) {
        this.toggleQuickAdd();
        
        // Switch to appropriate view and focus on input
        switch(action) {
            case 'task':
                this.switchView('today');
                setTimeout(() => {
                    const input = document.getElementById('task-input');
                    if (input) input.focus();
                }, 300);
                break;
            case 'expense':
                this.switchView('expenses');
                setTimeout(() => {
                    const input = document.querySelector('.expense-amount');
                    if (input) input.focus();
                }, 300);
                break;
            case 'note':
                this.switchView('notes');
                setTimeout(() => {
                    const btn = document.querySelector('.add-note-btn');
                    if (btn) btn.click();
                }, 300);
                break;
            case 'meal':
                this.switchView('meals');
                break;
            case 'reminder':
                this.switchView('reminders');
                break;
            case 'habit':
                this.switchView('habits');
                break;
            case 'screenshot':
                this.switchView('screenshots');
                setTimeout(() => {
                    const btn = document.querySelector('.upload-screenshot-btn');
                    if (btn) btn.click();
                }, 300);
                break;
            case 'voice':
                this.switchView('voice-notes');
                setTimeout(() => {
                    const btn = document.querySelector('.new-recording-btn');
                    if (btn) btn.click();
                }, 300);
                break;
            case 'link':
                this.switchView('embeddings');
                setTimeout(() => {
                    const btn = document.querySelector('.add-embedding-btn');
                    if (btn) btn.click();
                }, 300);
                break;
        }
    }
    
    completeTask(taskItem) {
        // Trigger checkbox click
        const checkbox = taskItem.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
        
        // Animate
        taskItem.style.animation = 'completeTask 0.5s ease forwards';
        setTimeout(() => {
            taskItem.style.transform = '';
            taskItem.style.background = '';
        }, 500);
    }
    
    deleteTask(taskItem) {
        // Find delete button and click it
        const deleteBtn = taskItem.querySelector('.task-delete');
        if (deleteBtn) {
            deleteBtn.click();
        }
        
        // Animate
        taskItem.style.animation = 'deleteTask 0.5s ease forwards';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileUI = new MobileUIEnhancement();
    });
} else {
    window.mobileUI = new MobileUIEnhancement();
}