// DESKTOP HEADER FIX - Move controls to quote section

class DesktopHeaderFix {
    constructor() {
        this.isDesktop = window.innerWidth > 768;
        
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
                this.restore();
            }
        });
    }

    init() {
        // Only proceed if sidebar is present
        if (!document.body.classList.contains('has-sidebar')) {
            return;
        }

        // Create controls wrapper in quote section
        this.createDesktopControls();
    }

    createDesktopControls() {
        // Check if already created
        if (document.querySelector('.quote-controls-wrapper')) {
            return;
        }

        // Find the quote section
        const quoteSection = document.querySelector('.daily-quote');
        if (!quoteSection) return;

        // Get original elements
        const syncStatus = document.getElementById('sync-status-indicator');
        const darkModeToggle = document.getElementById('dark-mode-toggle');

        if (!syncStatus || !darkModeToggle) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'quote-controls-wrapper';

        // Clone sync status
        const desktopSync = syncStatus.cloneNode(true);
        desktopSync.id = 'desktop-sync-status';
        desktopSync.className = 'desktop-sync-status';
        
        // Clone dark mode toggle
        const desktopDarkToggle = darkModeToggle.cloneNode(true);
        desktopDarkToggle.id = 'desktop-dark-toggle';
        desktopDarkToggle.className = 'desktop-dark-toggle';

        // Add to wrapper
        wrapper.appendChild(desktopSync);
        wrapper.appendChild(desktopDarkToggle);

        // Add wrapper to quote section
        quoteSection.style.position = 'relative';
        quoteSection.appendChild(wrapper);

        // Setup event listeners
        this.setupEventListeners(desktopDarkToggle);

        // Update sync status
        this.updateSyncStatus(desktopSync);
    }

    setupEventListeners(toggle) {
        toggle.addEventListener('click', () => {
            // Trigger the original dark mode toggle
            const originalToggle = document.getElementById('dark-mode-toggle');
            if (originalToggle) {
                originalToggle.click();
            }
        });
    }

    updateSyncStatus(element) {
        // Copy sync status from original element periodically
        const updateStatus = () => {
            const originalSync = document.getElementById('sync-status-indicator');
            if (originalSync && element) {
                element.innerHTML = originalSync.innerHTML;
                element.className = originalSync.className.replace('sync-status', 'desktop-sync-status');
                
                // Add specific state classes
                if (originalSync.textContent.includes('Connected')) {
                    element.classList.add('sync-connected');
                } else if (originalSync.textContent.includes('Syncing')) {
                    element.classList.add('sync-syncing');
                } else if (originalSync.textContent.includes('Disconnected')) {
                    element.classList.add('sync-disconnected');
                }
            }
        };

        // Initial update
        updateStatus();

        // Update every second
        setInterval(updateStatus, 1000);
    }

    restore() {
        // Remove desktop controls when switching to mobile
        const wrapper = document.querySelector('.quote-controls-wrapper');
        if (wrapper) {
            wrapper.remove();
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for sidebar to be initialized
    setTimeout(() => {
        window.desktopHeaderFix = new DesktopHeaderFix();
    }, 500);
});