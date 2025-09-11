// ERROR HANDLER - User-friendly error messages with retry options

class ErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.retryCallbacks = new Map();
        this.init();
    }

    init() {
        // Override console.error to catch all errors
        this.interceptErrors();
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'promise');
            event.preventDefault();
        });

        // Handle general errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event.message, 'runtime');
            event.preventDefault();
        });
    }

    // User-friendly error messages mapping
    getErrorMessage(error, context = '') {
        const errorMessages = {
            // Network errors
            'Failed to fetch': {
                title: 'Connection Problem',
                message: 'Unable to connect to the server. Please check your internet connection.',
                icon: '📡',
                actions: ['retry', 'dismiss']
            },
            'NetworkError': {
                title: 'Network Issue',
                message: 'There seems to be a problem with your network. Please try again.',
                icon: '🌐',
                actions: ['retry', 'dismiss']
            },
            
            // Google Sheets errors
            'PERMISSION_DENIED': {
                title: 'Access Denied',
                message: 'You need to grant permission to access Google Sheets.',
                icon: '🔒',
                actions: ['authorize', 'dismiss']
            },
            'UNAUTHENTICATED': {
                title: 'Sign In Required',
                message: 'Please sign in with your Google account to continue.',
                icon: '👤',
                actions: ['signin', 'dismiss']
            },
            'QUOTA_EXCEEDED': {
                title: 'Limit Reached',
                message: 'You\'ve reached the API limit. Please wait a moment and try again.',
                icon: '⏳',
                actions: ['retry', 'dismiss']
            },
            
            // Data errors
            'Invalid data': {
                title: 'Invalid Data',
                message: 'The data you entered appears to be invalid. Please check and try again.',
                icon: '⚠️',
                actions: ['dismiss']
            },
            'Required field': {
                title: 'Missing Information',
                message: 'Please fill in all required fields.',
                icon: '📝',
                actions: ['dismiss']
            },
            
            // Storage errors
            'QuotaExceededError': {
                title: 'Storage Full',
                message: 'Your device storage is full. Please free up some space.',
                icon: '💾',
                actions: ['dismiss']
            },
            
            // Default error
            'default': {
                title: 'Something Went Wrong',
                message: 'An unexpected error occurred. Please try again.',
                icon: '❌',
                actions: ['retry', 'dismiss']
            }
        };

        // Find matching error message
        let errorConfig = errorMessages.default;
        const errorString = error?.toString() || '';
        
        for (const [key, config] of Object.entries(errorMessages)) {
            if (errorString.includes(key) || error?.code === key) {
                errorConfig = config;
                break;
            }
        }

        // Add context-specific information
        if (context) {
            errorConfig.context = context;
        }

        return errorConfig;
    }

    // Show error notification
    showError(config, retryCallback = null) {
        // Remove any existing error notification
        this.hideError();

        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <div class="error-icon">${config.icon}</div>
                <div class="error-text">
                    <div class="error-title">${config.title}</div>
                    <div class="error-message">${config.message}</div>
                </div>
                <button class="error-close" onclick="errorHandler.hideError()">✕</button>
            </div>
            <div class="error-actions">
                ${this.renderActions(config.actions, retryCallback)}
            </div>
        `;

        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds for non-critical errors
        if (!config.actions.includes('signin') && !config.actions.includes('authorize')) {
            setTimeout(() => this.hideError(), 10000);
        }
    }

    renderActions(actions, retryCallback) {
        let html = '';
        
        actions.forEach(action => {
            switch(action) {
                case 'retry':
                    html += `<button class="error-btn error-btn-primary" onclick="errorHandler.retry()">
                        <span>🔄</span> Try Again
                    </button>`;
                    if (retryCallback) {
                        this.retryCallbacks.set('current', retryCallback);
                    }
                    break;
                    
                case 'signin':
                    html += `<button class="error-btn error-btn-primary" onclick="googleAuth.signIn()">
                        <span>🔑</span> Sign In
                    </button>`;
                    break;
                    
                case 'authorize':
                    html += `<button class="error-btn error-btn-primary" onclick="googleAuth.authorize()">
                        <span>🔓</span> Grant Access
                    </button>`;
                    break;
                    
                case 'dismiss':
                    html += `<button class="error-btn error-btn-secondary" onclick="errorHandler.hideError()">
                        Dismiss
                    </button>`;
                    break;
            }
        });
        
        return html;
    }

    hideError() {
        const notification = document.querySelector('.error-notification');
        if (notification) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }

    retry() {
        const callback = this.retryCallbacks.get('current');
        if (callback && typeof callback === 'function') {
            this.hideError();
            callback();
        }
    }

    // Handle different types of errors
    handleError(error, type = 'general', retryCallback = null) {
        console.log('Handling error:', error, 'Type:', type);
        
        const config = this.getErrorMessage(error, type);
        this.showError(config, retryCallback);
        
        // Log to console for debugging (but not the original console.error)
        console.log(`[${type}] Error:`, error);
    }

    // Intercept console.error
    interceptErrors() {
        const originalError = console.error;
        console.error = (...args) => {
            // Call original console.error
            originalError.apply(console, args);
            
            // Show user-friendly error if it's not a development error
            const errorString = args.join(' ');
            if (!errorString.includes('DevTools') && !errorString.includes('Extension')) {
                this.handleError(errorString, 'console');
            }
        };
    }

    // Show success notification
    showSuccess(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <div class="success-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Show warning notification
    showWarning(message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = 'warning-notification';
        notification.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-message">${message}</div>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    // Show info notification
    showInfo(message, duration = 4000) {
        const notification = document.createElement('div');
        notification.className = 'info-notification';
        notification.innerHTML = `
            <div class="info-content">
                <div class="info-icon">ℹ️</div>
                <div class="info-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Initialize error handler
let errorHandler;
document.addEventListener('DOMContentLoaded', () => {
    errorHandler = new ErrorHandler();
    window.errorHandler = errorHandler;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}