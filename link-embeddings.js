// LINK EMBEDDINGS - Rich link previews like Notion

class LinkEmbeddings {
    constructor() {
        this.embeddings = JSON.parse(localStorage.getItem('linkEmbeddings') || '[]');
        this.currentView = 'grid'; // grid or list
        this.init();
    }

    init() {
        this.createUI();
        this.loadEmbeddings();
        this.setupEventListeners();
        this.setupPasteHandler();
    }

    createUI() {
        const container = document.getElementById('embeddings-view');
        if (!container) return;

        container.innerHTML = `
            <div class="embeddings-container">
                <div class="embeddings-header">
                    <h2>📎 Link Embeddings</h2>
                    <div class="embeddings-controls">
                        <div class="view-toggle">
                            <button class="view-btn grid-view active" data-view="grid" title="Grid View">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 3h8v8H3zm10 0h8v8h-8zm-10 10h8v8H3zm10 0h8v8h-8z"/>
                                </svg>
                            </button>
                            <button class="view-btn list-view" data-view="list" title="List View">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/>
                                </svg>
                            </button>
                        </div>
                        <button class="btn btn-primary add-embedding-btn">
                            <span>+</span> Add Link
                        </button>
                    </div>
                </div>

                <div class="embeddings-input-section" style="display: none;">
                    <div class="embedding-input-card">
                        <input type="url" 
                               id="embedding-url-input" 
                               class="embedding-url-input" 
                               placeholder="Paste a link (YouTube, Twitter, Article, etc.)"
                               autocomplete="off">
                        <div class="embedding-input-actions">
                            <button class="btn btn-secondary cancel-embedding">Cancel</button>
                            <button class="btn btn-primary fetch-embedding">Embed</button>
                        </div>
                    </div>
                    <div class="embedding-preview" style="display: none;">
                        <div class="preview-loading">
                            <div class="loading-spinner"></div>
                            <span>Fetching preview...</span>
                        </div>
                    </div>
                </div>

                <div class="embeddings-grid" id="embeddings-grid">
                    <!-- Embeddings will be rendered here -->
                </div>

                <div class="empty-embeddings" style="display: none;">
                    <div class="empty-icon">🔗</div>
                    <h3>No Links Yet</h3>
                    <p>Add links to create rich previews of websites, videos, and articles</p>
                    <button class="btn btn-primary add-first-embedding">
                        Add Your First Link
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Add link button
        document.querySelector('.add-embedding-btn')?.addEventListener('click', () => {
            this.showInputSection();
        });

        document.querySelector('.add-first-embedding')?.addEventListener('click', () => {
            this.showInputSection();
        });

        // Cancel button
        document.querySelector('.cancel-embedding')?.addEventListener('click', () => {
            this.hideInputSection();
        });

        // Fetch button
        document.querySelector('.fetch-embedding')?.addEventListener('click', () => {
            this.fetchAndEmbed();
        });

        // Enter key on input
        document.getElementById('embedding-url-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchAndEmbed();
            }
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.closest('.view-btn').dataset.view);
            });
        });
    }

    setupPasteHandler() {
        // Listen for paste events globally
        document.addEventListener('paste', (e) => {
            if (document.activeElement.id === 'embedding-url-input') return;
            
            const activeView = document.querySelector('.view.active');
            if (activeView?.id === 'embeddings-view') {
                const text = e.clipboardData.getData('text');
                if (this.isValidUrl(text)) {
                    this.showInputSection();
                    document.getElementById('embedding-url-input').value = text;
                    this.fetchAndEmbed();
                }
            }
        });
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showInputSection() {
        const section = document.querySelector('.embeddings-input-section');
        section.style.display = 'block';
        document.getElementById('embedding-url-input').focus();
    }

    hideInputSection() {
        const section = document.querySelector('.embeddings-input-section');
        section.style.display = 'none';
        document.getElementById('embedding-url-input').value = '';
        document.querySelector('.embedding-preview').style.display = 'none';
    }

    async fetchAndEmbed() {
        const url = document.getElementById('embedding-url-input').value.trim();
        if (!this.isValidUrl(url)) {
            window.errorHandler?.showWarning('Please enter a valid URL');
            return;
        }

        // Show loading
        const preview = document.querySelector('.embedding-preview');
        preview.style.display = 'block';
        preview.innerHTML = `
            <div class="preview-loading">
                <div class="loading-spinner"></div>
                <span>Fetching preview...</span>
            </div>
        `;

        try {
            const metadata = await this.fetchMetadata(url);
            this.showPreview(metadata);
            
            // Add to embeddings after preview
            setTimeout(() => {
                this.addEmbedding(metadata);
                this.hideInputSection();
            }, 1000);
        } catch (error) {
            window.errorHandler?.showError({
                title: 'Failed to fetch preview',
                message: 'Could not load preview for this link. Adding basic link instead.',
                icon: '⚠️',
                actions: ['dismiss']
            });
            
            // Add basic embedding
            const basicMetadata = {
                url: url,
                title: new URL(url).hostname,
                description: url,
                type: 'link'
            };
            this.addEmbedding(basicMetadata);
            this.hideInputSection();
        }
    }

    async fetchMetadata(url) {
        // Detect content type
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // YouTube
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return this.fetchYouTubeMetadata(url);
        }
        
        // Twitter/X
        if (domain.includes('twitter.com') || domain.includes('x.com')) {
            return this.fetchTwitterMetadata(url);
        }
        
        // GitHub
        if (domain.includes('github.com')) {
            return this.fetchGitHubMetadata(url);
        }
        
        // Default: Try to fetch Open Graph data
        return this.fetchOpenGraphMetadata(url);
    }

    async fetchYouTubeMetadata(url) {
        const videoId = this.extractYouTubeId(url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        return {
            url: url,
            type: 'youtube',
            videoId: videoId,
            title: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            platform: 'YouTube'
        };
    }

    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async fetchTwitterMetadata(url) {
        const tweetId = url.split('/').pop().split('?')[0];
        return {
            url: url,
            type: 'twitter',
            tweetId: tweetId,
            title: 'Tweet',
            platform: 'X (Twitter)'
        };
    }

    async fetchGitHubMetadata(url) {
        const parts = url.replace('https://github.com/', '').split('/');
        const [owner, repo] = parts;
        
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            const data = await response.json();
            
            return {
                url: url,
                type: 'github',
                title: data.full_name,
                description: data.description,
                stars: data.stargazers_count,
                forks: data.forks_count,
                language: data.language,
                platform: 'GitHub'
            };
        } catch (error) {
            throw error;
        }
    }

    async fetchOpenGraphMetadata(url) {
        // For production, you'd need a backend service or CORS proxy
        // This is a simplified version using a free service
        try {
            // Using a CORS proxy for demo (replace with your backend in production)
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const html = data.contents;
            
            // Parse meta tags
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const getMetaContent = (property) => {
                const meta = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
                return meta?.getAttribute('content') || '';
            };
            
            return {
                url: url,
                type: 'article',
                title: getMetaContent('og:title') || doc.title || new URL(url).hostname,
                description: getMetaContent('og:description') || getMetaContent('description'),
                image: getMetaContent('og:image'),
                siteName: getMetaContent('og:site_name') || new URL(url).hostname,
                platform: 'Web'
            };
        } catch (error) {
            // Fallback to basic metadata
            return {
                url: url,
                type: 'link',
                title: new URL(url).hostname,
                description: url,
                platform: 'Web'
            };
        }
    }

    showPreview(metadata) {
        const preview = document.querySelector('.embedding-preview');
        preview.innerHTML = this.renderEmbedding(metadata, true);
    }

    addEmbedding(metadata) {
        metadata.id = Date.now();
        metadata.createdAt = new Date().toISOString();
        
        this.embeddings.unshift(metadata);
        this.saveEmbeddings();
        this.loadEmbeddings();
        
        window.errorHandler?.showSuccess('Link embedded successfully!');
    }

    renderEmbedding(data, isPreview = false) {
        const viewClass = this.currentView === 'list' ? 'list-item' : 'grid-item';
        
        let content = '';
        
        switch(data.type) {
            case 'youtube':
                content = `
                    <div class="embedding-card ${viewClass} youtube-embed">
                        <div class="embed-thumbnail">
                            <img src="${data.thumbnail}" alt="${data.title}">
                            <div class="play-overlay">▶</div>
                        </div>
                        <div class="embed-content">
                            <div class="embed-platform">
                                <span class="platform-icon">📺</span>
                                ${data.platform}
                            </div>
                            <h3 class="embed-title">${data.title}</h3>
                            <a href="${data.url}" target="_blank" class="embed-link">${data.url}</a>
                        </div>
                        ${!isPreview ? `
                            <button class="embed-delete" onclick="linkEmbeddings.deleteEmbedding(${data.id})">
                                <span>🗑️</span>
                            </button>
                        ` : ''}
                    </div>
                `;
                break;
                
            case 'twitter':
                content = `
                    <div class="embedding-card ${viewClass} twitter-embed">
                        <div class="embed-content">
                            <div class="embed-platform">
                                <span class="platform-icon">🐦</span>
                                ${data.platform}
                            </div>
                            <h3 class="embed-title">${data.title}</h3>
                            <a href="${data.url}" target="_blank" class="embed-link">View Tweet</a>
                        </div>
                        ${!isPreview ? `
                            <button class="embed-delete" onclick="linkEmbeddings.deleteEmbedding(${data.id})">
                                <span>🗑️</span>
                            </button>
                        ` : ''}
                    </div>
                `;
                break;
                
            case 'github':
                content = `
                    <div class="embedding-card ${viewClass} github-embed">
                        <div class="embed-content">
                            <div class="embed-platform">
                                <span class="platform-icon">🐙</span>
                                ${data.platform}
                            </div>
                            <h3 class="embed-title">${data.title}</h3>
                            <p class="embed-description">${data.description || 'No description'}</p>
                            <div class="github-stats">
                                ${data.stars ? `<span>⭐ ${data.stars}</span>` : ''}
                                ${data.forks ? `<span>🍴 ${data.forks}</span>` : ''}
                                ${data.language ? `<span>💻 ${data.language}</span>` : ''}
                            </div>
                            <a href="${data.url}" target="_blank" class="embed-link">${data.url}</a>
                        </div>
                        ${!isPreview ? `
                            <button class="embed-delete" onclick="linkEmbeddings.deleteEmbedding(${data.id})">
                                <span>🗑️</span>
                            </button>
                        ` : ''}
                    </div>
                `;
                break;
                
            default:
                content = `
                    <div class="embedding-card ${viewClass} article-embed">
                        ${data.image ? `
                            <div class="embed-thumbnail">
                                <img src="${data.image}" alt="${data.title}" onerror="this.parentElement.style.display='none'">
                            </div>
                        ` : ''}
                        <div class="embed-content">
                            <div class="embed-platform">
                                <span class="platform-icon">🌐</span>
                                ${data.siteName || data.platform}
                            </div>
                            <h3 class="embed-title">${data.title}</h3>
                            ${data.description ? `<p class="embed-description">${data.description}</p>` : ''}
                            <a href="${data.url}" target="_blank" class="embed-link">${data.url}</a>
                        </div>
                        ${!isPreview ? `
                            <button class="embed-delete" onclick="linkEmbeddings.deleteEmbedding(${data.id})">
                                <span>🗑️</span>
                            </button>
                        ` : ''}
                    </div>
                `;
        }
        
        return content;
    }

    loadEmbeddings() {
        const grid = document.getElementById('embeddings-grid');
        const emptyState = document.querySelector('.empty-embeddings');
        
        if (this.embeddings.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            grid.innerHTML = this.embeddings.map(embed => 
                this.renderEmbedding(embed)
            ).join('');
        }
    }

    deleteEmbedding(id) {
        if (confirm('Are you sure you want to remove this link?')) {
            this.embeddings = this.embeddings.filter(e => e.id !== id);
            this.saveEmbeddings();
            this.loadEmbeddings();
            window.errorHandler?.showSuccess('Link removed');
        }
    }

    toggleView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        const grid = document.getElementById('embeddings-grid');
        grid.className = view === 'list' ? 'embeddings-list' : 'embeddings-grid';
        
        this.loadEmbeddings();
    }

    saveEmbeddings() {
        localStorage.setItem('linkEmbeddings', JSON.stringify(this.embeddings));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.linkEmbeddings = new LinkEmbeddings();
});