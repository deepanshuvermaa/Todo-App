// MOBILE KEYBOARD FIX - Auto-scroll and viewport adjustments

class MobileKeyboardFix {
    constructor() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isAndroid = /Android/.test(navigator.userAgent);
        this.isMobile = this.isIOS || this.isAndroid;
        this.activeInput = null;
        this.originalViewportHeight = window.innerHeight;
        
        if (this.isMobile) {
            this.init();
        }
    }

    init() {
        // Handle focus events on all inputs
        this.setupInputListeners();
        
        // Handle viewport changes
        this.setupViewportListener();
        
        // Fix for modals and overlays
        this.setupModalFixes();
        
        // iOS specific fixes
        if (this.isIOS) {
            this.setupIOSFixes();
        }
    }

    setupInputListeners() {
        // Delegate event handling for dynamic content
        document.addEventListener('focusin', (e) => {
            if (this.isInputElement(e.target)) {
                this.handleInputFocus(e.target);
            }
        });

        document.addEventListener('focusout', (e) => {
            if (this.isInputElement(e.target)) {
                this.handleInputBlur(e.target);
            }
        });

        // Prevent zoom on double-tap for inputs
        document.addEventListener('touchstart', (e) => {
            if (this.isInputElement(e.target)) {
                e.target.style.fontSize = '16px';
            }
        });
    }

    isInputElement(element) {
        const inputTypes = ['input', 'textarea', 'select'];
        const tagName = element.tagName.toLowerCase();
        return inputTypes.includes(tagName) || element.contentEditable === 'true';
    }

    handleInputFocus(input) {
        this.activeInput = input;
        
        // Add class to body for styling adjustments
        document.body.classList.add('keyboard-open');
        
        // Scroll input into view with proper offset
        setTimeout(() => {
            this.scrollInputIntoView(input);
            
            // For textareas, ensure caret is visible
            if (input.tagName.toLowerCase() === 'textarea') {
                this.ensureCaretVisible(input);
            }
        }, 300); // Delay to allow keyboard to open

        // Adjust viewport for fixed elements
        this.adjustViewport(true);
        
        // Handle modal inputs specially
        if (this.isInModal(input)) {
            this.handleModalInput(input);
        }
    }

    handleInputBlur(input) {
        this.activeInput = null;
        
        // Remove keyboard open class
        document.body.classList.remove('keyboard-open');
        
        // Reset viewport
        this.adjustViewport(false);
        
        // iOS specific: Force keyboard to close
        if (this.isIOS) {
            document.activeElement.blur();
            window.scrollTo(0, 0);
        }
    }

    scrollInputIntoView(input) {
        const rect = input.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const keyboardHeight = this.originalViewportHeight - viewportHeight;
        
        // Calculate ideal scroll position
        const idealTop = 100; // Distance from top of viewport
        const scrollTop = window.pageYOffset + rect.top - idealTop;
        
        // Check if input is below keyboard
        if (rect.bottom > viewportHeight - keyboardHeight) {
            window.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
        
        // For inputs near bottom, add padding to container
        const container = input.closest('.view, .modal-content, .card');
        if (container) {
            const tempPadding = keyboardHeight + 50;
            container.style.paddingBottom = `${tempPadding}px`;
            
            // Remove padding after keyboard closes
            setTimeout(() => {
                if (!this.activeInput) {
                    container.style.paddingBottom = '';
                }
            }, 500);
        }
    }

    ensureCaretVisible(textarea) {
        // Get caret position
        const caretPos = textarea.selectionStart;
        const textBeforeCaret = textarea.value.substring(0, caretPos);
        const lines = textBeforeCaret.split('\n');
        const currentLine = lines.length;
        
        // Estimate line height
        const style = window.getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight);
        const paddingTop = parseInt(style.paddingTop);
        
        // Calculate scroll position
        const scrollTop = (currentLine - 1) * lineHeight - paddingTop;
        
        // Scroll textarea content
        if (textarea.scrollTop < scrollTop) {
            textarea.scrollTop = scrollTop;
        }
    }

    isInModal(input) {
        return input.closest('.modal, .journal-modal, [role="dialog"]') !== null;
    }

    handleModalInput(input) {
        const modal = input.closest('.modal, .journal-modal, [role="dialog"]');
        if (!modal) return;
        
        // Add special class for modal keyboard handling
        modal.classList.add('keyboard-active');
        
        // Adjust modal position
        const modalContent = modal.querySelector('.modal-content, .journal-container');
        if (modalContent) {
            const rect = input.getBoundingClientRect();
            const modalRect = modalContent.getBoundingClientRect();
            
            // If input is in lower half of modal, scroll modal
            if (rect.top > modalRect.top + modalRect.height / 2) {
                modalContent.scrollTop += rect.top - modalRect.top - 100;
            }
        }
    }

    adjustViewport(keyboardOpen) {
        if (keyboardOpen) {
            // Add viewport meta tag adjustments for keyboard
            let viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
            
            // Adjust fixed elements
            const fixedElements = document.querySelectorAll('.mobile-bottom-nav, .floating-voice-btn');
            fixedElements.forEach(el => {
                el.style.position = 'absolute';
            });
        } else {
            // Reset viewport
            let viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1.0');
            }
            
            // Reset fixed elements
            const fixedElements = document.querySelectorAll('.mobile-bottom-nav, .floating-voice-btn');
            fixedElements.forEach(el => {
                el.style.position = '';
            });
        }
    }

    setupViewportListener() {
        let previousHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = previousHeight - currentHeight;
            
            // Keyboard is likely open if height decreased by more than 100px
            if (heightDifference > 100) {
                document.body.classList.add('keyboard-open');
                
                // Scroll active input into view
                if (this.activeInput) {
                    this.scrollInputIntoView(this.activeInput);
                }
            } else if (heightDifference < -100) {
                // Keyboard likely closed
                document.body.classList.remove('keyboard-open');
            }
            
            previousHeight = currentHeight;
        });
    }

    setupModalFixes() {
        // Prevent body scroll when modal input is focused
        document.addEventListener('touchmove', (e) => {
            if (this.activeInput && this.isInModal(this.activeInput)) {
                const modal = this.activeInput.closest('.modal, .journal-modal');
                if (modal && !modal.contains(e.target)) {
                    e.preventDefault();
                }
            }
        }, { passive: false });
    }

    setupIOSFixes() {
        // iOS specific: Prevent rubber band scrolling
        document.addEventListener('touchmove', (e) => {
            if (this.activeInput) {
                const scrollable = this.activeInput.closest('.scrollable, .modal-content');
                if (scrollable) {
                    const scrollTop = scrollable.scrollTop;
                    const scrollHeight = scrollable.scrollHeight;
                    const height = scrollable.clientHeight;
                    const isScrolledToTop = scrollTop === 0;
                    const isScrolledToBottom = scrollTop + height >= scrollHeight;
                    
                    if ((isScrolledToTop && e.touches[0].clientY > this.lastY) ||
                        (isScrolledToBottom && e.touches[0].clientY < this.lastY)) {
                        e.preventDefault();
                    }
                }
            }
        }, { passive: false });
        
        // Track touch position
        document.addEventListener('touchstart', (e) => {
            this.lastY = e.touches[0].clientY;
        });
        
        // Fix for iOS Safari toolbar
        this.fixIOSSafariToolbar();
    }

    fixIOSSafariToolbar() {
        // Detect Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (isSafari) {
            // Add padding for Safari toolbar
            document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
            
            // Adjust for notch on newer iPhones
            const style = document.createElement('style');
            style.textContent = `
                @supports (padding: max(0px)) {
                    .mobile-bottom-nav {
                        padding-bottom: max(8px, env(safe-area-inset-bottom));
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Public method to manually trigger scroll to input
    scrollToInput(input) {
        if (input && this.isInputElement(input)) {
            this.scrollInputIntoView(input);
        }
    }
}

// CSS additions for keyboard handling
const keyboardStyles = `
    <style>
        /* Keyboard open adjustments */
        body.keyboard-open {
            padding-bottom: 50vh;
        }
        
        body.keyboard-open .mobile-bottom-nav {
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        
        body.keyboard-open .floating-voice-btn {
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        
        /* Modal keyboard adjustments */
        .modal.keyboard-active .modal-content {
            max-height: 50vh;
            overflow-y: auto;
        }
        
        .journal-modal.keyboard-active .journal-container {
            max-height: 50vh;
        }
        
        /* Input focus styles */
        input:focus,
        textarea:focus,
        select:focus {
            position: relative;
            z-index: 1;
        }
        
        /* Prevent zoom on iOS */
        @media (max-width: 768px) {
            input[type="text"],
            input[type="email"],
            input[type="number"],
            input[type="password"],
            input[type="tel"],
            input[type="url"],
            input[type="date"],
            input[type="datetime-local"],
            input[type="month"],
            input[type="time"],
            input[type="week"],
            select,
            textarea {
                font-size: 16px !important;
            }
        }
        
        /* Smooth transitions */
        .view,
        .modal-content,
        .card {
            transition: padding-bottom 0.3s ease;
        }
    </style>
`;

// Initialize keyboard fix
document.addEventListener('DOMContentLoaded', () => {
    // Add styles
    document.head.insertAdjacentHTML('beforeend', keyboardStyles);
    
    // Initialize keyboard handler
    window.mobileKeyboardFix = new MobileKeyboardFix();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileKeyboardFix;
}