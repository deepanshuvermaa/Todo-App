// Notes Manager - Rich note-taking with folders, tags, and formatting
class NotesManager {
    constructor() {
        this.notes = [];
        this.currentNoteId = null;
        this.currentFolder = 'all';
        this.searchQuery = '';
        this.sortBy = 'modified';
        this.autoSaveTimer = null;
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.renderNotesList();
        this.updateFolderCounts();
        this.updateTagsCloud();
        
        // Create default note if no notes exist
        if (this.notes.length === 0) {
            this.createNewNote();
        } else {
            this.loadNote(this.notes[0].id);
        }
        
        // Sync with Google Sheets if authenticated
        if (window.todoApp && window.todoApp.isAuthenticated) {
            this.syncFromSheets();
        }
    }

    setupEventListeners() {
        // New note button
        document.getElementById('new-note-btn')?.addEventListener('click', () => this.createNewNote());
        
        // Search
        document.getElementById('notes-search-input')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderNotesList();
        });
        
        // Folders
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
                item.classList.add('active');
                this.currentFolder = item.dataset.folder;
                document.getElementById('notes-list-title').textContent = item.querySelector('.folder-name').textContent;
                this.renderNotesList();
            });
        });
        
        // Sort
        document.getElementById('notes-sort')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderNotesList();
        });
        
        // Editor
        const editor = document.getElementById('notes-editor');
        if (editor) {
            editor.addEventListener('input', () => this.handleEditorChange());
            editor.addEventListener('paste', (e) => this.handlePaste(e));
        }
        
        // Title input
        document.getElementById('note-title-input')?.addEventListener('input', () => this.handleTitleChange());
        
        // Formatting buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyFormat(btn.dataset.format));
        });
        
        // Color pickers
        document.getElementById('text-color')?.addEventListener('change', (e) => {
            this.applyFormat('color', e.target.value);
        });
        
        document.getElementById('highlight-color')?.addEventListener('change', (e) => {
            this.applyFormat('highlight', e.target.value);
        });
        
        // Note actions
        document.getElementById('note-pin')?.addEventListener('click', () => this.togglePin());
        document.getElementById('note-favorite')?.addEventListener('click', () => this.toggleFavorite());
        document.getElementById('note-lock')?.addEventListener('click', () => this.toggleLock());
        document.getElementById('note-share')?.addEventListener('click', () => this.shareNote());
        document.getElementById('note-delete')?.addEventListener('click', () => this.deleteCurrentNote());
        
        // Tags
        document.getElementById('note-tags-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTag(e.target.value);
                e.target.value = '';
            }
        });
        
        // Add folder button
        document.getElementById('add-folder-btn')?.addEventListener('click', () => this.addFolder());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentNote();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.applyFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormat('underline');
                        break;
                    case 'n':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.createNewNote();
                        }
                        break;
                }
            }
        });
    }

    createNewNote() {
        const note = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '<p>Start typing your note here...</p>',
            plainText: 'Start typing your note here...',
            folder: 'personal',
            tags: [],
            isPinned: false,
            isFavorite: false,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: 0,
            charCount: 0
        };
        
        this.notes.unshift(note);
        this.currentNoteId = note.id;
        this.saveNotes();
        this.renderNotesList();
        this.loadNote(note.id);
        this.updateFolderCounts();
        
        // Focus on title
        document.getElementById('note-title-input')?.focus();
    }

    loadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNoteId = noteId;
        
        // Update UI
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('notes-editor').innerHTML = note.content;
        
        // Update action buttons
        this.updateActionButtons(note);
        
        // Update tags
        this.renderTags(note.tags);
        
        // Update metadata
        this.updateMetadata(note);
        
        // Highlight in list
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.noteId) === noteId) {
                item.classList.add('active');
            }
        });
    }

    saveCurrentNote() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        note.title = document.getElementById('note-title-input').value || 'Untitled Note';
        note.content = document.getElementById('notes-editor').innerHTML;
        note.plainText = document.getElementById('notes-editor').innerText;
        note.updatedAt = new Date().toISOString();
        note.wordCount = this.countWords(note.plainText);
        note.charCount = note.plainText.length;
        
        this.saveNotes();
        this.syncToSheets();
        this.renderNotesList();
        this.updateMetadata(note);
        
        // Show save indicator
        document.getElementById('note-last-saved').textContent = 'Saved just now';
        
        this.showNotification('Note saved');
    }

    handleEditorChange() {
        // Clear existing timer
        clearTimeout(this.autoSaveTimer);
        
        // Auto-save after 2 seconds of inactivity
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000);
        
        // Update word/char count
        const text = document.getElementById('notes-editor').innerText;
        document.getElementById('note-word-count').textContent = `${this.countWords(text)} words`;
        document.getElementById('note-char-count').textContent = `${text.length} characters`;
    }

    handleTitleChange() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 1000);
    }

    applyFormat(format, value = null) {
        const editor = document.getElementById('notes-editor');
        editor.focus();
        
        switch(format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'strikethrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'heading':
                document.execCommand('formatBlock', false, 'h2');
                break;
            case 'bullet':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'number':
                document.execCommand('insertOrderedList', false, null);
                break;
            case 'checklist':
                this.insertChecklist();
                break;
            case 'code':
                this.insertCodeBlock();
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) document.execCommand('createLink', false, url);
                break;
            case 'image':
                const imgUrl = prompt('Enter image URL:');
                if (imgUrl) document.execCommand('insertImage', false, imgUrl);
                break;
            case 'color':
                document.execCommand('foreColor', false, value);
                break;
            case 'highlight':
                document.execCommand('backColor', false, value);
                break;
        }
        
        this.handleEditorChange();
    }

    insertChecklist() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'note-checkbox';
        
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' Task item'));
        
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.appendChild(label);
        
        range.insertNode(div);
        range.collapse(false);
    }

    insertCodeBlock() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = '// Your code here';
        pre.appendChild(code);
        
        range.insertNode(pre);
        range.collapse(false);
    }

    handlePaste(e) {
        e.preventDefault();
        
        const text = e.clipboardData.getData('text/plain');
        const selection = window.getSelection();
        
        if (!selection.rangeCount) return;
        
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(text));
        selection.collapseToEnd();
    }

    togglePin() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            note.isPinned = !note.isPinned;
            this.saveNotes();
            this.renderNotesList();
            this.updateActionButtons(note);
        }
    }

    toggleFavorite() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            note.isFavorite = !note.isFavorite;
            this.saveNotes();
            this.updateActionButtons(note);
        }
    }

    toggleLock() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            if (note.isLocked) {
                const password = prompt('Enter password to unlock:');
                if (password === note.password) {
                    note.isLocked = false;
                    note.password = null;
                    this.updateActionButtons(note);
                } else {
                    alert('Incorrect password');
                }
            } else {
                const password = prompt('Enter password to lock note:');
                if (password) {
                    note.isLocked = true;
                    note.password = password;
                    this.updateActionButtons(note);
                }
            }
            this.saveNotes();
        }
    }

    shareNote() {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            const shareData = {
                title: note.title,
                text: note.plainText,
                url: window.location.href
            };
            
            if (navigator.share) {
                navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                const text = `${note.title}\n\n${note.plainText}`;
                navigator.clipboard.writeText(text);
                this.showNotification('Note copied to clipboard');
            }
        }
    }

    deleteCurrentNote() {
        if (!this.currentNoteId) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
            this.saveNotes();
            this.syncToSheets();
            
            // Load next note or create new if none
            if (this.notes.length > 0) {
                this.loadNote(this.notes[0].id);
            } else {
                this.createNewNote();
            }
            
            this.renderNotesList();
            this.updateFolderCounts();
            this.updateTagsCloud();
        }
    }

    addTag(tag) {
        if (!tag.trim()) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note && !note.tags.includes(tag)) {
            note.tags.push(tag);
            this.saveNotes();
            this.renderTags(note.tags);
            this.updateTagsCloud();
        }
    }

    removeTag(tag) {
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            note.tags = note.tags.filter(t => t !== tag);
            this.saveNotes();
            this.renderTags(note.tags);
            this.updateTagsCloud();
        }
    }

    renderTags(tags) {
        const container = document.getElementById('note-tags-list');
        container.innerHTML = tags.map(tag => `
            <span class="tag-item">
                ${tag}
                <button class="tag-remove" onclick="notesManager.removeTag('${tag}')">×</button>
            </span>
        `).join('');
    }

    renderNotesList() {
        let filteredNotes = [...this.notes];
        
        // Filter by folder
        if (this.currentFolder !== 'all') {
            if (this.currentFolder === 'archive') {
                filteredNotes = filteredNotes.filter(n => n.isArchived);
            } else {
                filteredNotes = filteredNotes.filter(n => n.folder === this.currentFolder && !n.isArchived);
            }
        }
        
        // Filter by search
        if (this.searchQuery) {
            filteredNotes = filteredNotes.filter(n => 
                n.title.toLowerCase().includes(this.searchQuery) ||
                n.plainText.toLowerCase().includes(this.searchQuery) ||
                n.tags.some(t => t.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Sort
        filteredNotes.sort((a, b) => {
            // Pinned notes first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            switch(this.sortBy) {
                case 'modified':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        const listContainer = document.getElementById('notes-list');
        
        if (filteredNotes.length === 0) {
            listContainer.innerHTML = '<li class="empty-notes">No notes found</li>';
            return;
        }
        
        listContainer.innerHTML = filteredNotes.map(note => `
            <li class="note-item ${note.id === this.currentNoteId ? 'active' : ''}" 
                data-note-id="${note.id}"
                onclick="notesManager.loadNote(${note.id})">
                <div class="note-item-header">
                    <span class="note-item-title">${note.title}</span>
                    ${note.isPinned ? '<span class="note-pin-indicator">📌</span>' : ''}
                    ${note.isFavorite ? '<span class="note-fav-indicator">⭐</span>' : ''}
                    ${note.isLocked ? '<span class="note-lock-indicator">🔒</span>' : ''}
                </div>
                <div class="note-item-preview">${this.truncate(note.plainText, 50)}</div>
                <div class="note-item-meta">
                    <span class="note-item-date">${this.formatDate(note.updatedAt)}</span>
                    ${note.tags.length > 0 ? `<span class="note-item-tags">${note.tags.slice(0, 2).join(', ')}</span>` : ''}
                </div>
            </li>
        `).join('');
    }

    updateFolderCounts() {
        const counts = {
            all: this.notes.length,
            personal: this.notes.filter(n => n.folder === 'personal' && !n.isArchived).length,
            work: this.notes.filter(n => n.folder === 'work' && !n.isArchived).length,
            ideas: this.notes.filter(n => n.folder === 'ideas' && !n.isArchived).length,
            archive: this.notes.filter(n => n.isArchived).length
        };
        
        document.querySelectorAll('.folder-item').forEach(item => {
            const folder = item.dataset.folder;
            const countEl = item.querySelector('.folder-count');
            if (countEl) {
                countEl.textContent = counts[folder] || 0;
            }
        });
    }

    updateTagsCloud() {
        const allTags = {};
        this.notes.forEach(note => {
            note.tags.forEach(tag => {
                allTags[tag] = (allTags[tag] || 0) + 1;
            });
        });
        
        const container = document.getElementById('tags-cloud');
        const sortedTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        container.innerHTML = sortedTags.map(([tag, count]) => `
            <span class="tag-cloud-item" onclick="notesManager.filterByTag('${tag}')" title="${count} notes">
                #${tag}
            </span>
        `).join('');
    }

    filterByTag(tag) {
        this.searchQuery = tag;
        document.getElementById('notes-search-input').value = tag;
        this.renderNotesList();
    }

    updateActionButtons(note) {
        document.getElementById('note-pin').classList.toggle('active', note.isPinned);
        document.getElementById('note-favorite').classList.toggle('active', note.isFavorite);
        document.getElementById('note-lock').classList.toggle('active', note.isLocked);
    }

    updateMetadata(note) {
        document.getElementById('note-word-count').textContent = `${note.wordCount} words`;
        document.getElementById('note-char-count').textContent = `${note.charCount} characters`;
        document.getElementById('note-last-saved').textContent = `Last saved ${this.formatDate(note.updatedAt)}`;
    }

    addFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            // This would need to be saved to settings
            this.showNotification(`Folder "${name}" created`);
        }
    }

    // Utility functions
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        
        return date.toLocaleDateString();
    }

    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notes-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }

    // Storage
    saveNotes() {
        localStorage.setItem('userNotes', JSON.stringify(this.notes));
    }

    loadNotes() {
        const stored = localStorage.getItem('userNotes');
        if (stored) {
            try {
                this.notes = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading notes:', e);
                this.notes = [];
            }
        }
    }

    // Google Sheets Sync
    async syncToSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) return;

        try {
            await this.ensureNotesSheet();
            
            const values = this.notes.map(note => [
                note.id,
                note.title,
                note.content,
                note.plainText,
                note.folder,
                note.tags.join(','),
                note.isPinned ? 'Y' : 'N',
                note.isFavorite ? 'Y' : 'N',
                note.isLocked ? 'Y' : 'N',
                note.createdAt,
                note.updatedAt,
                note.wordCount,
                note.charCount
            ]);

            if (values.length > 0) {
                await gapi.client.sheets.spreadsheets.values.clear({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'Notes!A2:M1000'
                });

                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: `Notes!A2:M${values.length + 1}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values }
                });
            }
        } catch (error) {
            console.error('Failed to sync notes:', error);
        }
    }

    async syncFromSheets() {
        if (!window.todoApp || !window.todoApp.isAuthenticated || !window.todoApp.sheetId) return;

        try {
            await this.ensureNotesSheet();
            
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: window.todoApp.sheetId,
                range: 'Notes!A2:M1000'
            });

            if (response.result.values && response.result.values.length > 0) {
                this.notes = response.result.values.map(row => ({
                    id: parseInt(row[0]) || Date.now(),
                    title: row[1] || 'Untitled',
                    content: row[2] || '',
                    plainText: row[3] || '',
                    folder: row[4] || 'personal',
                    tags: row[5] ? row[5].split(',') : [],
                    isPinned: row[6] === 'Y',
                    isFavorite: row[7] === 'Y',
                    isLocked: row[8] === 'Y',
                    createdAt: row[9] || new Date().toISOString(),
                    updatedAt: row[10] || new Date().toISOString(),
                    wordCount: parseInt(row[11]) || 0,
                    charCount: parseInt(row[12]) || 0
                }));

                this.saveNotes();
                this.renderNotesList();
                this.updateFolderCounts();
                this.updateTagsCloud();
                
                if (this.notes.length > 0) {
                    this.loadNote(this.notes[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to load notes from sheets:', error);
        }
    }

    async ensureNotesSheet() {
        if (!window.todoApp || !window.todoApp.sheetId) return;

        try {
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: window.todoApp.sheetId
            });

            const sheets = response.result.sheets;
            const notesSheet = sheets.find(sheet => sheet.properties.title === 'Notes');

            if (!notesSheet) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: window.todoApp.sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Notes',
                                    gridProperties: {
                                        rowCount: 1000,
                                        columnCount: 13
                                    },
                                    tabColor: {
                                        red: 0.9,
                                        green: 0.7,
                                        blue: 0.4
                                    }
                                }
                            }
                        }]
                    }
                });

                // Add headers
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: window.todoApp.sheetId,
                    range: 'Notes!A1:M1',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [['ID', 'Title', 'Content', 'PlainText', 'Folder', 'Tags', 'Pinned', 'Favorite', 'Locked', 'Created', 'Updated', 'Words', 'Chars']]
                    }
                });
            }
        } catch (error) {
            console.error('Error ensuring notes sheet:', error);
        }
    }
}

// Initialize notes manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notesManager = new NotesManager();
});