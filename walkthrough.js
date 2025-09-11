// INTERACTIVE WALKTHROUGH - Onboarding Experience

class Walkthrough {
    constructor() {
        this.currentSlide = 0;
        this.slides = [
            {
                icon: '🚀',
                title: 'Welcome to lifeTracker!',
                description: 'Your complete life management companion that helps you organize every aspect of your daily life.',
                features: [
                    { icon: '☁️', title: 'Cloud Sync', desc: 'All data syncs with Google Sheets automatically' },
                    { icon: '🌙', title: 'Dark Mode', desc: 'Easy on your eyes, day or night' },
                    { icon: '📱', title: 'Mobile Ready', desc: 'Works perfectly on all devices' }
                ]
            },
            {
                icon: '✨',
                title: 'Smart Features',
                description: 'Cutting-edge tools to boost your productivity and creativity.',
                features: [
                    { icon: '🎙️', title: 'Voice Notes', desc: 'Record ideas instantly with audio' },
                    { icon: '📸', title: 'Smart Screenshots', desc: 'Extract text from images with OCR' },
                    { icon: '🔗', title: 'Link Embeddings', desc: 'Rich previews for saved links' },
                    { icon: '📔', title: 'Daily Journal', desc: 'Track your mood and thoughts' }
                ]
            },
            {
                icon: '🎯',
                title: 'Track Everything',
                description: 'Comprehensive tracking for a balanced life.',
                features: [
                    { icon: '💰', title: 'Expense Tracker', desc: 'Monitor spending with category budgets' },
                    { icon: '🍽️', title: 'Meal Planner', desc: 'Track nutrition with 70+ Indian foods' },
                    { icon: '📞', title: 'Call Reminders', desc: 'Never forget important calls' },
                    { icon: '🪣', title: 'Bucket List', desc: 'Set and achieve life goals' }
                ]
            }
        ];
        
        this.init();
    }

    init() {
        // Check if user has seen walkthrough
        const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
        
        // Show walkthrough for new users or if forced
        if (!hasSeenWalkthrough || window.location.hash === '#walkthrough') {
            this.show();
        }
    }

    show() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'walkthrough-overlay';
        overlay.innerHTML = `
            <div class="walkthrough-container">
                ${this.slides.map((slide, index) => `
                    <div class="walkthrough-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                        <div class="walkthrough-icon">${slide.icon}</div>
                        <h2 class="walkthrough-title">${slide.title}</h2>
                        <p class="walkthrough-description">${slide.description}</p>
                        <div class="walkthrough-features">
                            ${slide.features.map(feature => `
                                <div class="walkthrough-feature">
                                    <span class="feature-icon">${feature.icon}</span>
                                    <div class="feature-text">
                                        <div class="feature-title">${feature.title}</div>
                                        <div class="feature-desc">${feature.desc}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                
                <div class="walkthrough-nav">
                    <div class="walkthrough-dots">
                        ${this.slides.map((_, index) => `
                            <span class="walkthrough-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
                        `).join('')}
                    </div>
                    <div class="walkthrough-buttons">
                        <button class="walkthrough-btn walkthrough-skip">Skip</button>
                        <button class="walkthrough-btn walkthrough-next">
                            <span>Next</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Add active class to show
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);

        // Setup event listeners
        this.setupEventListeners(overlay);
    }

    setupEventListeners(overlay) {
        // Next button
        const nextBtn = overlay.querySelector('.walkthrough-next');
        nextBtn.addEventListener('click', () => {
            this.nextSlide(overlay);
        });

        // Skip button
        const skipBtn = overlay.querySelector('.walkthrough-skip');
        skipBtn.addEventListener('click', () => {
            this.complete(overlay);
        });

        // Dots navigation
        overlay.querySelectorAll('.walkthrough-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(overlay, slideIndex);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('active')) return;
            
            if (e.key === 'ArrowRight') {
                this.nextSlide(overlay);
            } else if (e.key === 'ArrowLeft') {
                this.prevSlide(overlay);
            } else if (e.key === 'Escape') {
                this.complete(overlay);
            }
        });

        // Swipe gestures for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        overlay.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(overlay, touchStartX, touchEndX);
        });
    }

    handleSwipe(overlay, startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide(overlay);
            } else {
                // Swipe right - previous slide
                this.prevSlide(overlay);
            }
        }
    }

    nextSlide(overlay) {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updateSlide(overlay);
        } else {
            this.complete(overlay);
        }
    }

    prevSlide(overlay) {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlide(overlay);
        }
    }

    goToSlide(overlay, index) {
        this.currentSlide = index;
        this.updateSlide(overlay);
    }

    updateSlide(overlay) {
        // Update slides
        overlay.querySelectorAll('.walkthrough-slide').forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Update dots
        overlay.querySelectorAll('.walkthrough-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        // Update button text
        const nextBtn = overlay.querySelector('.walkthrough-next');
        if (this.currentSlide === this.slides.length - 1) {
            nextBtn.innerHTML = '<span>Get Started</span> <span>🚀</span>';
            nextBtn.classList.add('walkthrough-start');
        } else {
            nextBtn.innerHTML = '<span>Next</span> <span>→</span>';
            nextBtn.classList.remove('walkthrough-start');
        }
    }

    complete(overlay) {
        // Mark as seen
        localStorage.setItem('hasSeenWalkthrough', 'true');
        
        // Fade out
        overlay.classList.remove('active');
        
        // Remove after animation
        setTimeout(() => {
            overlay.remove();
        }, 400);

        // Show quick tips
        this.showQuickTips();
    }

    showQuickTips() {
        // Show tooltips for key features
        const tips = [
            { selector: '.notion-sidebar', message: 'Navigate using the sidebar', position: 'right' },
            { selector: '.daily-quote', message: 'Get daily motivation here', position: 'bottom' },
            { selector: '.quick-add-btn', message: 'Quick add anything', position: 'top' }
        ];

        let currentTip = 0;

        const showNextTip = () => {
            if (currentTip < tips.length) {
                const tip = tips[currentTip];
                const element = document.querySelector(tip.selector);
                
                if (element) {
                    this.showTooltip(element, tip.message, tip.position);
                }
                
                currentTip++;
                setTimeout(showNextTip, 3000);
            }
        };

        // Start showing tips after a delay
        setTimeout(showNextTip, 1000);
    }

    showTooltip(element, message, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = 'quick-tooltip';
        tooltip.textContent = message;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            z-index: 10000;
            animation: fadeIn 0.3s;
            white-space: nowrap;
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        
        switch(position) {
            case 'top':
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                break;
            case 'bottom':
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${rect.bottom + 10}px`;
                break;
            case 'right':
                tooltip.style.left = `${rect.right + 10}px`;
                tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
                break;
        }

        // Remove after 2 seconds
        setTimeout(() => {
            tooltip.style.animation = 'fadeOut 0.3s';
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }

    // Method to restart walkthrough
    restart() {
        localStorage.removeItem('hasSeenWalkthrough');
        this.currentSlide = 0;
        this.show();
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.walkthrough = new Walkthrough();
});

// Add restart option to settings or help menu
window.restartWalkthrough = () => {
    if (window.walkthrough) {
        window.walkthrough.restart();
    }
};