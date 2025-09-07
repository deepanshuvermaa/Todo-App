// Quote Manager - Handles motivational quotes from API Ninjas
class QuoteManager {
    constructor() {
        this.apiKey = 'TedlP2lloqXycb4R14CAfg==y4Ssdn4n5hVUICrs';
        this.apiUrl = 'https://api.api-ninjas.com/v1/quotes';
        this.currentQuote = null;
        this.quoteHistory = [];
        this.currentIndex = -1;
        this.favoriteQuotes = [];
        this.maxHistory = 50;
        this.init();
    }

    async init() {
        // Set up toggle functionality first
        this.setupToggle();
        
        // Load collapsed state from localStorage
        this.loadCollapsedState();
        
        // Always show a fallback quote immediately
        this.displayFallbackQuote();
        
        // Refresh quote every hour
        setInterval(() => {
            this.displayFallbackQuote();
        }, 60 * 60 * 1000);
        
        // Also refresh on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const lastFetch = localStorage.getItem('lastQuoteFetch');
                const oneHour = 60 * 60 * 1000;
                
                if (!lastFetch || Date.now() - parseInt(lastFetch) > oneHour) {
                    this.displayFallbackQuote();
                }
            }
        });
    }
    
    setupToggle() {
        const toggleBtn = document.getElementById('quote-toggle');
        const quoteDiv = document.getElementById('daily-quote');
        const refreshBtn = document.getElementById('quote-refresh');
        const prevBtn = document.getElementById('quote-prev');
        const nextBtn = document.getElementById('quote-next');
        const favoriteBtn = document.getElementById('quote-favorite');
        const copyBtn = document.getElementById('quote-copy');
        
        if (toggleBtn && quoteDiv) {
            toggleBtn.addEventListener('click', () => {
                quoteDiv.classList.toggle('collapsed');
                const isCollapsed = quoteDiv.classList.contains('collapsed');
                localStorage.setItem('quoteCollapsed', isCollapsed);
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshQuote();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigateQuote('prev');
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigateQuote('next');
            });
        }
        
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyQuote();
            });
        }
        
        // Load favorites from localStorage
        this.loadFavorites();
        // Load quote history
        this.loadHistory();
    }
    
    loadCollapsedState() {
        const isCollapsed = localStorage.getItem('quoteCollapsed') === 'true';
        const quoteDiv = document.getElementById('daily-quote');
        
        if (isCollapsed && quoteDiv) {
            quoteDiv.classList.add('collapsed');
        }
    }

    loadCachedQuote() {
        // This method is no longer needed as init() handles it
        // Kept for compatibility
        const cached = localStorage.getItem('dailyQuote');
        if (cached) {
            try {
                const quote = JSON.parse(cached);
                return quote;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // API fetch removed - using only fallback quotes

    displayQuote(quote) {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        if (quoteText && quoteAuthor) {
            if (quote && quote.quote) {
                // Fade out effect
                quoteText.style.opacity = '0';
                quoteAuthor.style.opacity = '0';
                
                setTimeout(() => {
                    quoteText.textContent = quote.quote;
                    quoteAuthor.textContent = quote.author || 'Unknown';
                    
                    // Fade in effect
                    quoteText.style.transition = 'opacity 0.5s ease';
                    quoteAuthor.style.transition = 'opacity 0.5s ease';
                    quoteText.style.opacity = '1';
                    quoteAuthor.style.opacity = '1';
                    
                    // Update favorite button state
                    this.updateFavoriteButton();
                }, 300);
            } else {
                // Display default if no quote
                quoteText.textContent = "Every day is a new beginning. Take a deep breath and start again.";
                quoteAuthor.textContent = "Unknown";
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
            }
        }
    }

    displayFallbackQuote() {
        const fallbackQuotes = [
            // Iconic Movie Quotes - The Most Powerful & Life-Changing
            { quote: "Do or do not. There is no try.", author: "Yoda, Star Wars" },
            { quote: "In every job that must be done, there is an element of fun.", author: "Mary Poppins" },
            { quote: "Oh yes, the past can hurt. But the way I see it, you can either run from it or learn from it.", author: "Rafiki, The Lion King" },
            { quote: "Why do we fall? So we can learn to pick ourselves up.", author: "Batman Begins" },
            { quote: "It's not who I am underneath, but what I do that defines me.", author: "Batman Begins" },
            { quote: "Our lives are defined by opportunities, even the ones we miss.", author: "The Curious Case of Benjamin Button" },
            { quote: "Every man dies, but not every man really lives.", author: "Braveheart" },
            { quote: "Get busy living, or get busy dying.", author: "The Shawshank Redemption" },
            { quote: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", author: "The Shawshank Redemption" },
            { quote: "The flower that blooms in adversity is the most rare and beautiful of all.", author: "Mulan" },
            
            // Perspective-Changing Quotes
            { quote: "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it.", author: "Ferris Bueller's Day Off" },
            { quote: "The only thing standing between you and your goal is the story you keep telling yourself.", author: "Wolf of Wall Street" },
            { quote: "Great men are not born great, they grow great.", author: "The Godfather" },
            { quote: "A man who doesn't spend time with his family can never be a real man.", author: "The Godfather" },
            { quote: "Nobody is gonna hit as hard as life, but it ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.", author: "Rocky Balboa" },
            { quote: "The world ain't all sunshine and rainbows. It's a very mean and nasty place and it will beat you to your knees and keep you there permanently if you let it.", author: "Rocky Balboa" },
            { quote: "Pain is temporary. It may last a minute, or an hour, or a day, or a year, but eventually it will subside and something else will take its place. If I quit, however, it lasts forever.", author: "Lance Armstrong" },
            { quote: "The only time success comes before work is in the dictionary.", author: "The Pursuit of Happyness" },
            { quote: "Don't ever let somebody tell you you can't do something. You got a dream, you gotta protect it.", author: "The Pursuit of Happyness" },
            { quote: "Sometimes it is the people who no one imagines anything of who do the things that no one can imagine.", author: "The Imitation Game" },
            
            // Courage & Strength
            { quote: "Being brave doesn't mean you aren't scared. Being brave means you are scared, really scared, badly scared, and you do the right thing anyway.", author: "Neil Gaiman" },
            { quote: "It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends.", author: "Harry Potter" },
            { quote: "It is not our abilities that show what we truly are. It is our choices.", author: "Harry Potter" },
            { quote: "Dark times lie ahead of us and there will be a time when we must choose between what is easy and what is right.", author: "Harry Potter" },
            { quote: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.", author: "Harry Potter" },
            { quote: "All we have to decide is what to do with the time that is given to us.", author: "The Lord of the Rings" },
            { quote: "Even the smallest person can change the course of the future.", author: "The Lord of the Rings" },
            { quote: "I wish it need not have happened in my time. So do all who live to see such times. But that is not for them to decide.", author: "The Lord of the Rings" },
            { quote: "There's some good in this world, Mr. Frodo, and it's worth fighting for.", author: "The Lord of the Rings" },
            { quote: "A ship is safe in harbor, but that's not what ships are for.", author: "John A. Shedd" },
            
            // Dreams & Ambition
            { quote: "The only thing predictable about life is its unpredictability.", author: "Ratatouille" },
            { quote: "Your identity is your most valuable possession. Protect it.", author: "The Incredibles" },
            { quote: "Sometimes the right path is not the easiest one.", author: "Pocahontas" },
            { quote: "The very things that hold you down are going to lift you up.", author: "Dumbo" },
            { quote: "When life gets you down, you know what you gotta do? Just keep swimming.", author: "Finding Nemo" },
            { quote: "To infinity and beyond!", author: "Toy Story" },
            { quote: "Adventure is out there!", author: "Up" },
            { quote: "The problem is not the problem. The problem is your attitude about the problem.", author: "Pirates of the Caribbean" },
            { quote: "You're mad, bonkers, completely off your head. But I'll tell you a secret. All the best people are.", author: "Alice in Wonderland" },
            { quote: "The only way to achieve the impossible is to believe it is possible.", author: "Alice in Wonderland" },
            
            // Success & Failure
            { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { quote: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
            { quote: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
            { quote: "Champions aren't made in the gyms. Champions are made from something they have deep inside them - a desire, a dream, a vision.", author: "Muhammad Ali" },
            { quote: "If you're going through hell, keep going.", author: "Winston Churchill" },
            { quote: "The harder the conflict, the more glorious the triumph.", author: "Thomas Paine" },
            { quote: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
            { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
            { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            
            // Personal Growth
            { quote: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
            { quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
            { quote: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
            { quote: "Yesterday is history, tomorrow is a mystery, today is a gift, that's why it's called the present.", author: "Kung Fu Panda" },
            { quote: "Your mind is like water. When it is agitated it becomes difficult to see, but when you calm it, everything becomes clear.", author: "Kung Fu Panda" },
            { quote: "There is no secret ingredient. It's just you.", author: "Kung Fu Panda" },
            { quote: "You are more than what you have become.", author: "The Lion King" },
            { quote: "Remember who you are.", author: "The Lion King" },
            { quote: "The past is in the past.", author: "Frozen" },
            { quote: "Some people are worth melting for.", author: "Frozen" },
            
            // Leadership & Character
            { quote: "With great power comes great responsibility.", author: "Spider-Man" },
            { quote: "A true hero isn't measured by the size of his strength, but by the strength of his heart.", author: "Hercules" },
            { quote: "Heroes are made by the path they choose, not the powers they are graced with.", author: "Iron Man" },
            { quote: "I am Iron Man.", author: "Iron Man" },
            { quote: "I can do this all day.", author: "Captain America" },
            { quote: "The price of freedom is high, but it's a price I'm willing to pay.", author: "Captain America" },
            { quote: "Part of the journey is the end.", author: "Avengers: Endgame" },
            { quote: "We are Groot.", author: "Guardians of the Galaxy" },
            { quote: "I'm always angry.", author: "The Avengers" },
            { quote: "Whatever it takes.", author: "Avengers: Endgame" },
            
            // Wisdom & Philosophy
            { quote: "Life is like a box of chocolates. You never know what you're gonna get.", author: "Forrest Gump" },
            { quote: "Stupid is as stupid does.", author: "Forrest Gump" },
            { quote: "My mama always said, 'Life was like a box of chocolates. You never know what you're gonna get.'", author: "Forrest Gump" },
            { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
            { quote: "A smooth sea never made a skilled sailor.", author: "Franklin D. Roosevelt" },
            { quote: "The mind is everything. What you think you become.", author: "Buddha" },
            { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
            { quote: "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.", author: "Robert Frost" },
            { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            
            // Determination & Perseverance
            { quote: "I'll be back.", author: "The Terminator" },
            { quote: "Hasta la vista, baby.", author: "Terminator 2" },
            { quote: "There is no fate but what we make for ourselves.", author: "Terminator" },
            { quote: "May the Force be with you.", author: "Star Wars" },
            { quote: "I find your lack of faith disturbing.", author: "Star Wars" },
            { quote: "Never tell me the odds.", author: "Star Wars" },
            { quote: "The Force will be with you. Always.", author: "Star Wars" },
            { quote: "Roads? Where we're going, we don't need roads.", author: "Back to the Future" },
            { quote: "Your future is whatever you make it, so make it a good one.", author: "Back to the Future" },
            { quote: "If you put your mind to it, you can accomplish anything.", author: "Back to the Future" },
            
            // Final 10 - Ultimate Motivation
            { quote: "You have within you right now, everything you need to deal with whatever the world can throw at you.", author: "Brian Tracy" },
            { quote: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.", author: "Christian D. Larson" },
            { quote: "The moment you give up is the moment you let someone else win.", author: "Kobe Bryant" },
            { quote: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
            { quote: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. Twenty-six times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
            { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
            { quote: "What we think, we become.", author: "Buddha" },
            { quote: "The best revenge is massive success.", author: "Frank Sinatra" },
            { quote: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
            { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
        ];
        
        // Implement better randomization with Fisher-Yates shuffle
        const shuffleArray = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };
        
        // Get quote queue from localStorage or create new shuffled queue
        let quoteQueue = JSON.parse(localStorage.getItem('quoteQueue') || '[]');
        
        if (quoteQueue.length === 0) {
            // Create new shuffled queue when all quotes have been shown
            quoteQueue = shuffleArray(fallbackQuotes);
            console.log('Created new shuffled quote queue with', quoteQueue.length, 'quotes');
        }
        
        // Get next quote from queue
        const randomQuote = quoteQueue.shift();
        
        // Save updated queue
        localStorage.setItem('quoteQueue', JSON.stringify(quoteQueue));
        
        this.displayQuote(randomQuote);
        this.cacheQuote(randomQuote);
        this.addToHistory(randomQuote);
    }

    cacheQuote(quote) {
        localStorage.setItem('dailyQuote', JSON.stringify(quote));
        localStorage.setItem('lastQuoteFetch', Date.now().toString());
    }

    // Method to manually refresh quote
    refreshQuote() {
        const refreshBtn = document.getElementById('quote-refresh');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            refreshBtn.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                refreshBtn.style.transform = 'rotate(0deg)';
            }, 500);
        }
        
        // Show a new fallback quote
        this.displayFallbackQuote();
    }
    
    navigateQuote(direction) {
        if (direction === 'prev' && this.currentIndex > 0) {
            this.currentIndex--;
            const quote = this.quoteHistory[this.currentIndex];
            this.currentQuote = quote;
            this.displayQuote(quote);
            this.updateNavigationButtons();
        } else if (direction === 'next' && this.currentIndex < this.quoteHistory.length - 1) {
            this.currentIndex++;
            const quote = this.quoteHistory[this.currentIndex];
            this.currentQuote = quote;
            this.displayQuote(quote);
            this.updateNavigationButtons();
        }
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('quote-prev');
        const nextBtn = document.getElementById('quote-next');
        
        if (prevBtn) {
            prevBtn.style.opacity = this.currentIndex > 0 ? '1' : '0.3';
            prevBtn.disabled = this.currentIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.style.opacity = this.currentIndex < this.quoteHistory.length - 1 ? '1' : '0.3';
            nextBtn.disabled = this.currentIndex >= this.quoteHistory.length - 1;
        }
    }
    
    addToHistory(quote) {
        if (!quote) return;
        
        // Check if quote already exists in history
        const exists = this.quoteHistory.some(q => q.quote === quote.quote);
        if (!exists) {
            this.quoteHistory.push(quote);
            this.currentIndex = this.quoteHistory.length - 1;
            
            // Limit history size
            if (this.quoteHistory.length > this.maxHistory) {
                this.quoteHistory.shift();
                this.currentIndex--;
            }
            
            this.saveHistory();
            this.updateNavigationButtons();
        }
    }
    
    saveHistory() {
        localStorage.setItem('quoteHistory', JSON.stringify(this.quoteHistory));
        localStorage.setItem('quoteIndex', this.currentIndex.toString());
    }
    
    loadHistory() {
        const history = localStorage.getItem('quoteHistory');
        const index = localStorage.getItem('quoteIndex');
        
        if (history) {
            try {
                this.quoteHistory = JSON.parse(history);
                this.currentIndex = index ? parseInt(index) : this.quoteHistory.length - 1;
                this.updateNavigationButtons();
            } catch (e) {
                console.error('Error loading quote history:', e);
            }
        }
    }
    
    toggleFavorite() {
        if (!this.currentQuote) return;
        
        const favoriteBtn = document.getElementById('quote-favorite');
        const quoteId = this.getQuoteId(this.currentQuote);
        const index = this.favoriteQuotes.findIndex(q => this.getQuoteId(q) === quoteId);
        
        if (index === -1) {
            this.favoriteQuotes.push(this.currentQuote);
            if (favoriteBtn) favoriteBtn.classList.add('active');
            this.showNotification('Added to favorites!');
        } else {
            this.favoriteQuotes.splice(index, 1);
            if (favoriteBtn) favoriteBtn.classList.remove('active');
            this.showNotification('Removed from favorites');
        }
        
        this.saveFavorites();
    }
    
    getQuoteId(quote) {
        return quote ? `${quote.quote}-${quote.author}` : '';
    }
    
    saveFavorites() {
        localStorage.setItem('favoriteQuotes', JSON.stringify(this.favoriteQuotes));
    }
    
    loadFavorites() {
        const favorites = localStorage.getItem('favoriteQuotes');
        if (favorites) {
            try {
                this.favoriteQuotes = JSON.parse(favorites);
            } catch (e) {
                console.error('Error loading favorite quotes:', e);
            }
        }
    }
    
    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('quote-favorite');
        if (favoriteBtn && this.currentQuote) {
            const quoteId = this.getQuoteId(this.currentQuote);
            const isFavorite = this.favoriteQuotes.some(q => this.getQuoteId(q) === quoteId);
            
            if (isFavorite) {
                favoriteBtn.classList.add('active');
            } else {
                favoriteBtn.classList.remove('active');
            }
        }
    }
    
    copyQuote() {
        if (!this.currentQuote) return;
        
        const text = `"${this.currentQuote.quote}" — ${this.currentQuote.author || 'Unknown'}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Quote copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Quote copied to clipboard!');
        }
    }
    
    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'quote-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Initialize quote manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quoteManager = new QuoteManager();
});