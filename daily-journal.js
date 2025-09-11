// DAILY JOURNAL - Functionality

class DailyJournal {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        this.currentMood = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDate();
        this.loadTodayEntry();
    }

    setupEventListeners() {
        // Mood selector
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectMood(e.currentTarget);
            });
        });

        // Gratitude prompts
        document.querySelectorAll('.gratitude-prompt').forEach(prompt => {
            prompt.addEventListener('click', (e) => {
                this.addGratitudePrompt(e.target.textContent);
            });
        });

        // Auto-save on input
        const textareas = document.querySelectorAll('.journal-textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                this.autoSave();
            });
        });

        // Character counter
        textareas.forEach(textarea => {
            this.addCharacterCounter(textarea);
        });
    }

    updateDate() {
        const dateElement = document.getElementById('journal-date');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    selectMood(moodElement) {
        // Remove previous selection
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked mood
        moodElement.classList.add('selected');
        this.currentMood = moodElement.dataset.mood;
    }

    addGratitudePrompt(prompt) {
        const gratitudeTextarea = document.getElementById('gratitude');
        const currentValue = gratitudeTextarea.value.trim();
        
        if (currentValue) {
            gratitudeTextarea.value = currentValue + '\n• ' + prompt;
        } else {
            gratitudeTextarea.value = '• ' + prompt;
        }
        
        gratitudeTextarea.focus();
    }

    addCharacterCounter(textarea) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `${textarea.value.length} characters`;
        
        textarea.parentElement.appendChild(counter);
        
        textarea.addEventListener('input', () => {
            counter.textContent = `${textarea.value.length} characters`;
        });
    }

    autoSave() {
        // Save to localStorage automatically
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            this.saveDraft();
        }, 1000);
    }

    saveDraft() {
        const draft = {
            date: new Date().toDateString(),
            mood: this.currentMood,
            highlights: document.getElementById('highlights')?.value || '',
            gratitude: document.getElementById('gratitude')?.value || '',
            challenges: document.getElementById('challenges')?.value || '',
            tomorrow: document.getElementById('tomorrow')?.value || '',
            freeThoughts: document.getElementById('free-thoughts')?.value || '',
            isDraft: true,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('journalDraft', JSON.stringify(draft));
    }

    loadTodayEntry() {
        const today = new Date().toDateString();
        const todayEntry = this.entries.find(entry => entry.date === today);
        
        if (todayEntry) {
            this.loadEntry(todayEntry);
        } else {
            // Check for draft
            const draft = JSON.parse(localStorage.getItem('journalDraft') || '{}');
            if (draft.date === today) {
                this.loadEntry(draft);
            }
        }
    }

    loadEntry(entry) {
        if (entry.mood) {
            const moodElement = document.querySelector(`[data-mood="${entry.mood}"]`);
            if (moodElement) {
                this.selectMood(moodElement);
            }
        }
        
        if (entry.highlights) document.getElementById('highlights').value = entry.highlights;
        if (entry.gratitude) document.getElementById('gratitude').value = entry.gratitude;
        if (entry.challenges) document.getElementById('challenges').value = entry.challenges;
        if (entry.tomorrow) document.getElementById('tomorrow').value = entry.tomorrow;
        if (entry.freeThoughts) document.getElementById('free-thoughts').value = entry.freeThoughts;
    }

    saveEntry() {
        const entry = {
            id: Date.now(),
            date: new Date().toDateString(),
            mood: this.currentMood,
            highlights: document.getElementById('highlights')?.value || '',
            gratitude: document.getElementById('gratitude')?.value || '',
            challenges: document.getElementById('challenges')?.value || '',
            tomorrow: document.getElementById('tomorrow')?.value || '',
            freeThoughts: document.getElementById('free-thoughts')?.value || '',
            isDraft: false,
            timestamp: new Date().toISOString()
        };
        
        // Check if entry for today already exists
        const todayIndex = this.entries.findIndex(e => e.date === entry.date);
        if (todayIndex !== -1) {
            this.entries[todayIndex] = entry;
        } else {
            this.entries.push(entry);
        }
        
        // Save to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
        localStorage.removeItem('journalDraft');
        
        // Show success animation
        const saveBtn = document.querySelector('.save-entry-btn');
        if (saveBtn) {
            saveBtn.classList.add('save-success');
            saveBtn.innerHTML = '<span>✅</span> Saved!';
            
            setTimeout(() => {
                saveBtn.classList.remove('save-success');
                saveBtn.innerHTML = '<span>💾</span> Save Entry';
            }, 2000);
        }
        
        // Show success notification
        if (window.errorHandler) {
            window.errorHandler.showSuccess('Journal entry saved successfully!');
        }
        
        // Close modal after delay
        setTimeout(() => {
            closeJournalModal();
        }, 2000);
    }

    getEntryStats() {
        return {
            totalEntries: this.entries.length,
            currentStreak: this.calculateStreak(),
            moodTrend: this.calculateMoodTrend(),
            topGratitudes: this.getTopGratitudes()
        };
    }

    calculateStreak() {
        if (this.entries.length === 0) return 0;
        
        const sortedEntries = [...this.entries].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        let streak = 0;
        let currentDate = new Date();
        
        for (const entry of sortedEntries) {
            const entryDate = new Date(entry.timestamp);
            const dayDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateMoodTrend() {
        const recentEntries = this.entries.slice(-7);
        const moodScores = {
            'amazing': 5,
            'good': 4,
            'okay': 3,
            'not-great': 2,
            'terrible': 1
        };
        
        const scores = recentEntries
            .filter(entry => entry.mood)
            .map(entry => moodScores[entry.mood] || 3);
        
        if (scores.length === 0) return 'neutral';
        
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        if (average >= 4) return 'positive';
        if (average <= 2) return 'negative';
        return 'neutral';
    }

    getTopGratitudes() {
        const gratitudes = {};
        
        this.entries.forEach(entry => {
            if (entry.gratitude) {
                const items = entry.gratitude.split('\n')
                    .map(item => item.replace(/^[•\-*]\s*/, '').trim())
                    .filter(item => item);
                
                items.forEach(item => {
                    const key = item.toLowerCase();
                    gratitudes[key] = (gratitudes[key] || 0) + 1;
                });
            }
        });
        
        return Object.entries(gratitudes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([item]) => item);
    }
}

// Global functions for onclick handlers
function openJournalModal() {
    const modal = document.getElementById('journal-modal');
    if (modal) {
        modal.classList.add('active');
        if (!window.dailyJournal) {
            window.dailyJournal = new DailyJournal();
        }
        window.dailyJournal.updateDate();
        window.dailyJournal.loadTodayEntry();
    }
}

function closeJournalModal() {
    const modal = document.getElementById('journal-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveJournalEntry() {
    if (window.dailyJournal) {
        window.dailyJournal.saveEntry();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize journal if modal exists
    if (document.getElementById('journal-modal')) {
        window.dailyJournal = new DailyJournal();
    }
    
    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault();
            openJournalModal();
        }
    });
});