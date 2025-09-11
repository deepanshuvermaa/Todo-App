// SMART SCREENSHOTS - Extract text from images with OCR

class SmartScreenshots {
    constructor() {
        this.screenshots = JSON.parse(localStorage.getItem('smartScreenshots') || '[]');
        this.currentView = 'grid';
        this.ocrWorker = null;
        this.init();
    }

    init() {
        this.createUI();
        this.loadScreenshots();
        this.setupEventListeners();
        this.initializeOCR();
    }

    async initializeOCR() {
        // Load Tesseract.js for OCR functionality
        if (typeof Tesseract === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
            script.async = true;
            script.onload = () => {
                console.log('Tesseract.js loaded successfully');
            };
            document.head.appendChild(script);
        }
    }

    createUI() {
        const container = document.getElementById('screenshots-view');
        if (!container) return;

        container.innerHTML = `
            <div class="screenshots-container">
                <div class="screenshots-header">
                    <h2>📸 Smart Screenshots</h2>
                    <div class="screenshots-controls">
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
                        <button class="btn btn-primary upload-screenshot-btn">
                            <span>📤</span> Upload Image
                        </button>
                        <button class="btn btn-secondary paste-screenshot-btn">
                            <span>📋</span> Paste Image
                        </button>
                    </div>
                </div>

                <div class="screenshot-upload-zone" style="display: none;">
                    <div class="upload-area" id="upload-area">
                        <div class="upload-icon">📸</div>
                        <h3>Drop image here or click to upload</h3>
                        <p>Support for PNG, JPG, GIF (Max 10MB)</p>
                        <input type="file" id="screenshot-file-input" accept="image/*" style="display: none;">
                        <button class="btn btn-primary select-file-btn">Select File</button>
                    </div>
                    <div class="upload-actions">
                        <button class="btn btn-secondary cancel-upload">Cancel</button>
                    </div>
                </div>

                <div class="screenshot-processing" style="display: none;">
                    <div class="processing-card">
                        <div class="processing-preview">
                            <img id="processing-image" src="" alt="Processing">
                        </div>
                        <div class="processing-status">
                            <div class="processing-loader">
                                <div class="loader-spinner"></div>
                            </div>
                            <h3>Extracting Text...</h3>
                            <p class="processing-message">Using OCR to extract text from your image</p>
                            <div class="processing-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="ocr-progress"></div>
                                </div>
                                <span class="progress-text">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="screenshots-grid" id="screenshots-grid">
                    <!-- Screenshots will be rendered here -->
                </div>

                <div class="empty-screenshots" style="display: none;">
                    <div class="empty-icon">🖼️</div>
                    <h3>No Screenshots Yet</h3>
                    <p>Upload or paste images to extract text with OCR</p>
                    <button class="btn btn-primary add-first-screenshot">
                        Add Your First Screenshot
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Upload button
        document.querySelector('.upload-screenshot-btn')?.addEventListener('click', () => {
            this.showUploadZone();
        });

        document.querySelector('.add-first-screenshot')?.addEventListener('click', () => {
            this.showUploadZone();
        });

        // Paste button
        document.querySelector('.paste-screenshot-btn')?.addEventListener('click', () => {
            this.promptPaste();
        });

        // Cancel upload
        document.querySelector('.cancel-upload')?.addEventListener('click', () => {
            this.hideUploadZone();
        });

        // File input
        const fileInput = document.getElementById('screenshot-file-input');
        fileInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Select file button
        document.querySelector('.select-file-btn')?.addEventListener('click', () => {
            fileInput?.click();
        });

        // Drag and drop
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });

            uploadArea.addEventListener('click', (e) => {
                if (e.target === uploadArea || e.target.closest('.upload-icon')) {
                    fileInput?.click();
                }
            });
        }

        // Paste event listener
        document.addEventListener('paste', (e) => {
            const activeView = document.querySelector('.view.active');
            if (activeView?.id === 'screenshots-view') {
                this.handlePaste(e);
            }
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Search functionality
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                const activeView = document.querySelector('.view.active');
                if (activeView?.id === 'screenshots-view') {
                    e.preventDefault();
                    this.showSearchDialog();
                }
            }
        });
    }

    showUploadZone() {
        const zone = document.querySelector('.screenshot-upload-zone');
        zone.style.display = 'block';
        zone.scrollIntoView({ behavior: 'smooth' });
    }

    hideUploadZone() {
        const zone = document.querySelector('.screenshot-upload-zone');
        zone.style.display = 'none';
        document.getElementById('screenshot-file-input').value = '';
    }

    promptPaste() {
        window.errorHandler?.showInfo({
            title: 'Paste Image',
            message: 'Press Ctrl+V (or Cmd+V on Mac) to paste an image from your clipboard',
            icon: '📋',
            actions: ['dismiss']
        });
    }

    async handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    e.preventDefault();
                    await this.processImage(blob);
                }
            }
        }
    }

    async handleFileSelect(file) {
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            window.errorHandler?.showError({
                title: 'Invalid File',
                message: 'Please select an image file (PNG, JPG, GIF)',
                icon: '❌',
                actions: ['dismiss']
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            window.errorHandler?.showError({
                title: 'File Too Large',
                message: 'Please select an image smaller than 10MB',
                icon: '📏',
                actions: ['dismiss']
            });
            return;
        }

        await this.processImage(file);
    }

    async processImage(file) {
        this.hideUploadZone();
        
        // Show processing UI
        const processingDiv = document.querySelector('.screenshot-processing');
        processingDiv.style.display = 'block';

        // Create image preview
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            document.getElementById('processing-image').src = imageData;

            try {
                // Perform OCR
                const extractedText = await this.performOCR(imageData);
                
                // Create screenshot object
                const screenshot = {
                    id: Date.now(),
                    name: file.name || `Screenshot_${new Date().toISOString()}`,
                    image: imageData,
                    extractedText: extractedText,
                    timestamp: new Date().toISOString(),
                    size: file.size,
                    type: file.type
                };

                // Save screenshot
                this.addScreenshot(screenshot);
                
                // Hide processing
                processingDiv.style.display = 'none';
                
                // Show success
                window.errorHandler?.showSuccess('Text extracted successfully!');
                
            } catch (error) {
                console.error('OCR Error:', error);
                processingDiv.style.display = 'none';
                
                window.errorHandler?.showError({
                    title: 'Extraction Failed',
                    message: 'Could not extract text from image. Saving image anyway.',
                    icon: '⚠️',
                    actions: ['dismiss']
                });

                // Save without text
                const screenshot = {
                    id: Date.now(),
                    name: file.name || `Screenshot_${new Date().toISOString()}`,
                    image: imageData,
                    extractedText: '',
                    timestamp: new Date().toISOString(),
                    size: file.size,
                    type: file.type
                };
                this.addScreenshot(screenshot);
            }
        };

        reader.readAsDataURL(file);
    }

    async performOCR(imageData) {
        // Check if Tesseract is loaded
        if (typeof Tesseract === 'undefined') {
            throw new Error('OCR library not loaded');
        }

        return new Promise((resolve, reject) => {
            const progressBar = document.getElementById('ocr-progress');
            const progressText = document.querySelector('.progress-text');
            
            Tesseract.recognize(
                imageData,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            if (progressBar) progressBar.style.width = `${progress}%`;
                            if (progressText) progressText.textContent = `${progress}%`;
                        }
                    }
                }
            ).then(({ data: { text } }) => {
                resolve(text);
            }).catch(error => {
                reject(error);
            });
        });
    }

    addScreenshot(screenshot) {
        this.screenshots.unshift(screenshot);
        this.saveScreenshots();
        this.loadScreenshots();
    }

    renderScreenshot(screenshot) {
        const viewClass = this.currentView === 'list' ? 'list-item' : 'grid-item';
        
        const truncatedText = screenshot.extractedText 
            ? screenshot.extractedText.substring(0, 200) + (screenshot.extractedText.length > 200 ? '...' : '')
            : 'No text extracted';

        return `
            <div class="screenshot-card ${viewClass}" data-id="${screenshot.id}">
                <div class="screenshot-image">
                    <img src="${screenshot.image}" alt="${screenshot.name}">
                    <div class="screenshot-overlay">
                        <button class="screenshot-action view-full" onclick="smartScreenshots.viewFullImage('${screenshot.id}')">
                            <span>🔍</span>
                        </button>
                        <button class="screenshot-action copy-text" onclick="smartScreenshots.copyText('${screenshot.id}')">
                            <span>📋</span>
                        </button>
                    </div>
                </div>
                <div class="screenshot-content">
                    <h3 class="screenshot-title">${screenshot.name}</h3>
                    <div class="screenshot-meta">
                        <span class="meta-item">
                            <span>📅</span>
                            ${new Date(screenshot.timestamp).toLocaleDateString()}
                        </span>
                        <span class="meta-item">
                            <span>📝</span>
                            ${screenshot.extractedText ? screenshot.extractedText.split(/\s+/).length + ' words' : 'No text'}
                        </span>
                    </div>
                    <div class="extracted-text">
                        ${truncatedText}
                    </div>
                    <div class="screenshot-actions">
                        <button class="action-btn" onclick="smartScreenshots.viewExtractedText('${screenshot.id}')">
                            View Text
                        </button>
                        <button class="action-btn" onclick="smartScreenshots.downloadText('${screenshot.id}')">
                            Download
                        </button>
                        <button class="action-btn delete" onclick="smartScreenshots.deleteScreenshot('${screenshot.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadScreenshots() {
        const grid = document.getElementById('screenshots-grid');
        const emptyState = document.querySelector('.empty-screenshots');
        
        if (this.screenshots.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            grid.style.display = this.currentView === 'list' ? 'flex' : 'grid';
            emptyState.style.display = 'none';
            
            grid.innerHTML = this.screenshots.map(screenshot => 
                this.renderScreenshot(screenshot)
            ).join('');
        }
    }

    viewFullImage(id) {
        const screenshot = this.screenshots.find(s => s.id == id);
        if (!screenshot) return;

        // Create modal for full image view
        const modal = document.createElement('div');
        modal.className = 'image-viewer-modal';
        modal.innerHTML = `
            <div class="image-viewer-container">
                <button class="close-viewer">✕</button>
                <img src="${screenshot.image}" alt="${screenshot.name}">
                <div class="viewer-controls">
                    <button onclick="smartScreenshots.zoomIn()">➕</button>
                    <button onclick="smartScreenshots.zoomOut()">➖</button>
                    <button onclick="smartScreenshots.resetZoom()">Reset</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    viewExtractedText(id) {
        const screenshot = this.screenshots.find(s => s.id == id);
        if (!screenshot) return;

        // Create modal for text view
        const modal = document.createElement('div');
        modal.className = 'text-viewer-modal';
        modal.innerHTML = `
            <div class="text-viewer-container">
                <div class="text-viewer-header">
                    <h3>Extracted Text</h3>
                    <button class="close-viewer">✕</button>
                </div>
                <div class="text-viewer-content">
                    <textarea readonly>${screenshot.extractedText || 'No text extracted'}</textarea>
                </div>
                <div class="text-viewer-actions">
                    <button class="btn btn-secondary" onclick="smartScreenshots.copyToClipboard('${screenshot.extractedText}')">
                        Copy to Clipboard
                    </button>
                    <button class="btn btn-primary" onclick="smartScreenshots.saveAsNote('${id}')">
                        Save as Note
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    copyText(id) {
        const screenshot = this.screenshots.find(s => s.id == id);
        if (!screenshot || !screenshot.extractedText) {
            window.errorHandler?.showWarning('No text to copy');
            return;
        }

        this.copyToClipboard(screenshot.extractedText);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            window.errorHandler?.showSuccess('Text copied to clipboard!');
        }).catch(() => {
            window.errorHandler?.showError({
                title: 'Copy Failed',
                message: 'Could not copy text to clipboard',
                icon: '❌',
                actions: ['dismiss']
            });
        });
    }

    saveAsNote(id) {
        const screenshot = this.screenshots.find(s => s.id == id);
        if (!screenshot || !screenshot.extractedText) return;

        // Create a new note with the extracted text
        const note = {
            id: Date.now(),
            title: `OCR: ${screenshot.name}`,
            content: screenshot.extractedText,
            category: 'OCR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to notes (assuming notes system exists)
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.unshift(note);
        localStorage.setItem('notes', JSON.stringify(notes));

        window.errorHandler?.showSuccess('Saved as note!');
        
        // Close modal
        const modal = document.querySelector('.text-viewer-modal');
        if (modal) document.body.removeChild(modal);
    }

    downloadText(id) {
        const screenshot = this.screenshots.find(s => s.id == id);
        if (!screenshot || !screenshot.extractedText) {
            window.errorHandler?.showWarning('No text to download');
            return;
        }

        // Create download link
        const blob = new Blob([screenshot.extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${screenshot.name}_extracted_text.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.errorHandler?.showSuccess('Text downloaded!');
    }

    deleteScreenshot(id) {
        if (confirm('Are you sure you want to delete this screenshot?')) {
            this.screenshots = this.screenshots.filter(s => s.id != id);
            this.saveScreenshots();
            this.loadScreenshots();
            window.errorHandler?.showSuccess('Screenshot deleted');
        }
    }

    toggleView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        const grid = document.getElementById('screenshots-grid');
        grid.className = view === 'list' ? 'screenshots-list' : 'screenshots-grid';
        
        this.loadScreenshots();
    }

    showSearchDialog() {
        const searchText = prompt('Search in extracted text:');
        if (!searchText) return;

        const results = this.screenshots.filter(s => 
            s.extractedText && s.extractedText.toLowerCase().includes(searchText.toLowerCase())
        );

        if (results.length === 0) {
            window.errorHandler?.showInfo({
                title: 'No Results',
                message: `No screenshots found with text containing "${searchText}"`,
                icon: '🔍',
                actions: ['dismiss']
            });
        } else {
            // Highlight search results
            this.highlightSearchResults(results, searchText);
        }
    }

    highlightSearchResults(results, searchText) {
        // Clear previous highlights
        document.querySelectorAll('.screenshot-card').forEach(card => {
            card.classList.remove('highlighted');
        });

        // Highlight matching cards
        results.forEach(screenshot => {
            const card = document.querySelector(`.screenshot-card[data-id="${screenshot.id}"]`);
            if (card) {
                card.classList.add('highlighted');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        window.errorHandler?.showInfo({
            title: 'Search Results',
            message: `Found ${results.length} screenshot(s) containing "${searchText}"`,
            icon: '🔍',
            actions: ['dismiss']
        });
    }

    saveScreenshots() {
        localStorage.setItem('smartScreenshots', JSON.stringify(this.screenshots));
    }

    // Zoom functions for image viewer
    zoomIn() {
        const img = document.querySelector('.image-viewer-container img');
        if (img) {
            const currentScale = parseFloat(img.style.transform?.replace('scale(', '').replace(')', '') || 1);
            img.style.transform = `scale(${Math.min(currentScale + 0.2, 3)})`;
        }
    }

    zoomOut() {
        const img = document.querySelector('.image-viewer-container img');
        if (img) {
            const currentScale = parseFloat(img.style.transform?.replace('scale(', '').replace(')', '') || 1);
            img.style.transform = `scale(${Math.max(currentScale - 0.2, 0.5)})`;
        }
    }

    resetZoom() {
        const img = document.querySelector('.image-viewer-container img');
        if (img) {
            img.style.transform = 'scale(1)';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.smartScreenshots = new SmartScreenshots();
});