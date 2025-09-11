// VOICE NOTES - Audio recording for ideas and thoughts

class VoiceNotes {
    constructor() {
        this.recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
        this.currentView = 'grid';
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.init();
    }

    init() {
        this.createUI();
        this.loadRecordings();
        this.setupEventListeners();
        this.checkMicrophonePermission();
    }

    async checkMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('Microphone permission granted');
        } catch (error) {
            console.log('Microphone permission not granted');
        }
    }

    createUI() {
        const container = document.getElementById('voice-notes-view');
        if (!container) return;

        container.innerHTML = `
            <div class="voice-notes-container">
                <div class="voice-notes-header">
                    <h2>🎙️ Voice Notes</h2>
                    <div class="voice-notes-controls">
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
                        <button class="btn btn-primary new-recording-btn">
                            <span>🎤</span> New Recording
                        </button>
                    </div>
                </div>

                <div class="recording-studio" style="display: none;">
                    <div class="studio-card">
                        <div class="studio-header">
                            <h3>Recording Studio</h3>
                            <button class="close-studio">✕</button>
                        </div>
                        
                        <div class="studio-content">
                            <div class="recording-visualizer">
                                <canvas id="visualizer-canvas" width="400" height="100"></canvas>
                            </div>
                            
                            <div class="recording-timer">
                                <span class="timer-display">00:00</span>
                            </div>
                            
                            <div class="recording-controls">
                                <button class="control-btn record-btn" id="record-btn">
                                    <span class="record-icon">🔴</span>
                                    <span class="record-text">Start Recording</span>
                                </button>
                                <button class="control-btn pause-btn" id="pause-btn" disabled>
                                    <span>⏸️</span> Pause
                                </button>
                                <button class="control-btn stop-btn" id="stop-btn" disabled>
                                    <span>⏹️</span> Stop
                                </button>
                            </div>
                            
                            <div class="recording-metadata">
                                <input type="text" 
                                       id="recording-title" 
                                       class="recording-title-input" 
                                       placeholder="Enter a title for your recording..."
                                       maxlength="100">
                                <textarea id="recording-notes" 
                                          class="recording-notes-input" 
                                          placeholder="Add notes or description..."
                                          rows="3"></textarea>
                                <div class="recording-tags">
                                    <input type="text" 
                                           id="recording-tags" 
                                           class="tags-input" 
                                           placeholder="Add tags (comma separated)">
                                </div>
                            </div>
                        </div>
                        
                        <div class="studio-preview" style="display: none;">
                            <h4>Preview Recording</h4>
                            <audio controls id="preview-audio"></audio>
                            <div class="preview-actions">
                                <button class="btn btn-secondary discard-recording">Discard</button>
                                <button class="btn btn-primary save-recording">Save Recording</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="quick-record-widget">
                    <button class="quick-record-btn" id="quick-record">
                        <span class="mic-icon">🎤</span>
                        <span class="recording-pulse" style="display: none;"></span>
                    </button>
                    <div class="quick-record-timer" style="display: none;">
                        <span class="timer">00:00</span>
                        <button class="quick-stop">Stop</button>
                    </div>
                </div>

                <div class="recordings-grid" id="recordings-grid">
                    <!-- Recordings will be rendered here -->
                </div>

                <div class="empty-recordings" style="display: none;">
                    <div class="empty-icon">🎙️</div>
                    <h3>No Voice Notes Yet</h3>
                    <p>Record your ideas, thoughts, and reminders with voice</p>
                    <button class="btn btn-primary start-first-recording">
                        Start Recording
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // New recording button
        document.querySelector('.new-recording-btn')?.addEventListener('click', () => {
            this.openRecordingStudio();
        });

        document.querySelector('.start-first-recording')?.addEventListener('click', () => {
            this.openRecordingStudio();
        });

        // Close studio
        document.querySelector('.close-studio')?.addEventListener('click', () => {
            this.closeRecordingStudio();
        });

        // Recording controls
        document.getElementById('record-btn')?.addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.pauseRecording();
        });

        document.getElementById('stop-btn')?.addEventListener('click', () => {
            this.stopRecording();
        });

        // Save/Discard
        document.querySelector('.save-recording')?.addEventListener('click', () => {
            this.saveRecording();
        });

        document.querySelector('.discard-recording')?.addEventListener('click', () => {
            this.discardRecording();
        });

        // Quick record
        document.getElementById('quick-record')?.addEventListener('click', () => {
            this.toggleQuickRecord();
        });

        document.querySelector('.quick-stop')?.addEventListener('click', () => {
            this.stopQuickRecord();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            const activeView = document.querySelector('.view.active');
            if (activeView?.id === 'voice-notes-view') {
                if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.openRecordingStudio();
                }
                if (e.key === ' ' && this.isRecording) {
                    e.preventDefault();
                    this.pauseRecording();
                }
            }
        });
    }

    openRecordingStudio() {
        const studio = document.querySelector('.recording-studio');
        studio.style.display = 'block';
        studio.scrollIntoView({ behavior: 'smooth' });
        this.initializeVisualizer();
    }

    closeRecordingStudio() {
        if (this.isRecording) {
            if (!confirm('Recording in progress. Are you sure you want to close?')) {
                return;
            }
            this.stopRecording();
        }
        
        const studio = document.querySelector('.recording-studio');
        studio.style.display = 'none';
        this.resetStudio();
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            recordBtn.classList.add('recording');
            recordBtn.querySelector('.record-text').textContent = 'Recording...';
            recordBtn.querySelector('.record-icon').textContent = '⏺️';
            
            document.getElementById('pause-btn').disabled = false;
            document.getElementById('stop-btn').disabled = false;
            
            // Start timer
            this.startTimer();
            
            // Start visualizer
            this.startVisualizer(stream);
            
            window.errorHandler?.showSuccess('Recording started');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            window.errorHandler?.showError({
                title: 'Recording Failed',
                message: 'Could not access microphone. Please check permissions.',
                icon: '🎤',
                actions: ['dismiss']
            });
        }
    }

    pauseRecording() {
        if (this.mediaRecorder && this.isRecording) {
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.pause();
                document.getElementById('pause-btn').textContent = '▶️ Resume';
                this.stopTimer();
            } else if (this.mediaRecorder.state === 'paused') {
                this.mediaRecorder.resume();
                document.getElementById('pause-btn').innerHTML = '<span>⏸️</span> Pause';
                this.startTimer();
            }
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.stopTimer();
            
            // Update UI
            const recordBtn = document.getElementById('record-btn');
            recordBtn.classList.remove('recording');
            recordBtn.querySelector('.record-text').textContent = 'Start Recording';
            recordBtn.querySelector('.record-icon').textContent = '🔴';
            
            document.getElementById('pause-btn').disabled = true;
            document.getElementById('stop-btn').disabled = true;
        }
    }

    processRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Show preview
        const preview = document.querySelector('.studio-preview');
        preview.style.display = 'block';
        
        const previewAudio = document.getElementById('preview-audio');
        previewAudio.src = audioUrl;
        
        // Store blob for saving
        this.currentRecordingBlob = audioBlob;
        this.currentRecordingUrl = audioUrl;
    }

    async saveRecording() {
        const title = document.getElementById('recording-title').value || `Recording ${new Date().toLocaleString()}`;
        const notes = document.getElementById('recording-notes').value;
        const tags = document.getElementById('recording-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const recording = {
                id: Date.now(),
                title: title,
                notes: notes,
                tags: tags,
                audio: reader.result,
                duration: this.getRecordingDuration(),
                timestamp: new Date().toISOString(),
                size: this.currentRecordingBlob.size
            };
            
            this.addRecording(recording);
            this.closeRecordingStudio();
            window.errorHandler?.showSuccess('Voice note saved successfully!');
        };
        
        reader.readAsDataURL(this.currentRecordingBlob);
    }

    discardRecording() {
        if (confirm('Are you sure you want to discard this recording?')) {
            this.resetStudio();
            document.querySelector('.studio-preview').style.display = 'none';
        }
    }

    resetStudio() {
        document.getElementById('recording-title').value = '';
        document.getElementById('recording-notes').value = '';
        document.getElementById('recording-tags').value = '';
        document.querySelector('.timer-display').textContent = '00:00';
        document.querySelector('.studio-preview').style.display = 'none';
        
        if (this.currentRecordingUrl) {
            URL.revokeObjectURL(this.currentRecordingUrl);
        }
        
        this.currentRecordingBlob = null;
        this.currentRecordingUrl = null;
    }

    startTimer() {
        const timerDisplay = document.querySelector('.timer-display');
        const quickTimer = document.querySelector('.quick-record-timer .timer');
        
        this.recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            const timeString = `${minutes}:${seconds}`;
            
            if (timerDisplay) timerDisplay.textContent = timeString;
            if (quickTimer) quickTimer.textContent = timeString;
        }, 1000);
    }

    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    getRecordingDuration() {
        if (this.recordingStartTime) {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            return elapsed;
        }
        return 0;
    }

    initializeVisualizer() {
        const canvas = document.getElementById('visualizer-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(248, 249, 250)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    startVisualizer(stream) {
        const canvas = document.getElementById('visualizer-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!this.isRecording) return;
            
            requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgb(248, 249, 250)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;
                
                ctx.fillStyle = `rgb(0, 123, 255)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }

    async toggleQuickRecord() {
        const quickBtn = document.getElementById('quick-record');
        const quickTimer = document.querySelector('.quick-record-timer');
        const pulse = document.querySelector('.recording-pulse');
        
        if (!this.isRecording) {
            // Start quick recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                
                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };
                
                this.mediaRecorder.onstop = () => {
                    this.processQuickRecording();
                };
                
                this.mediaRecorder.start();
                this.isRecording = true;
                this.recordingStartTime = Date.now();
                
                // Update UI
                quickBtn.classList.add('recording');
                pulse.style.display = 'block';
                quickTimer.style.display = 'flex';
                
                // Start timer
                this.startTimer();
                
                window.errorHandler?.showSuccess('Quick recording started');
                
            } catch (error) {
                console.error('Error starting quick recording:', error);
                window.errorHandler?.showError({
                    title: 'Recording Failed',
                    message: 'Could not access microphone',
                    icon: '🎤',
                    actions: ['dismiss']
                });
            }
        }
    }

    stopQuickRecord() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.stopTimer();
            
            // Update UI
            const quickBtn = document.getElementById('quick-record');
            const quickTimer = document.querySelector('.quick-record-timer');
            const pulse = document.querySelector('.recording-pulse');
            
            quickBtn.classList.remove('recording');
            pulse.style.display = 'none';
            quickTimer.style.display = 'none';
        }
    }

    processQuickRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Convert to base64 and save immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            const recording = {
                id: Date.now(),
                title: `Quick Note ${new Date().toLocaleString()}`,
                notes: '',
                tags: ['quick'],
                audio: reader.result,
                duration: this.getRecordingDuration(),
                timestamp: new Date().toISOString(),
                size: audioBlob.size
            };
            
            this.addRecording(recording);
            window.errorHandler?.showSuccess('Quick note saved!');
        };
        
        reader.readAsDataURL(audioBlob);
    }

    addRecording(recording) {
        this.recordings.unshift(recording);
        this.saveRecordings();
        this.loadRecordings();
    }

    renderRecording(recording) {
        const viewClass = this.currentView === 'list' ? 'list-item' : 'grid-item';
        const duration = this.formatDuration(recording.duration);
        const date = new Date(recording.timestamp).toLocaleDateString();
        const time = new Date(recording.timestamp).toLocaleTimeString();
        const size = this.formatFileSize(recording.size);
        
        const tags = recording.tags?.length > 0 
            ? recording.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        return `
            <div class="recording-card ${viewClass}" data-id="${recording.id}">
                <div class="recording-icon">
                    <span class="icon">🎙️</span>
                    <span class="duration">${duration}</span>
                </div>
                <div class="recording-content">
                    <h3 class="recording-title">${recording.title}</h3>
                    ${recording.notes ? `<p class="recording-notes">${recording.notes}</p>` : ''}
                    ${tags ? `<div class="recording-tags">${tags}</div>` : ''}
                    <div class="recording-meta">
                        <span class="meta-item">📅 ${date}</span>
                        <span class="meta-item">🕐 ${time}</span>
                        <span class="meta-item">💾 ${size}</span>
                    </div>
                    <audio controls class="recording-player">
                        <source src="${recording.audio}" type="audio/webm">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="recording-actions">
                        <button class="action-btn" onclick="voiceNotes.transcribeRecording('${recording.id}')">
                            Transcribe
                        </button>
                        <button class="action-btn" onclick="voiceNotes.downloadRecording('${recording.id}')">
                            Download
                        </button>
                        <button class="action-btn delete" onclick="voiceNotes.deleteRecording('${recording.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadRecordings() {
        const grid = document.getElementById('recordings-grid');
        const emptyState = document.querySelector('.empty-recordings');
        
        if (this.recordings.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            grid.style.display = this.currentView === 'list' ? 'flex' : 'grid';
            emptyState.style.display = 'none';
            
            grid.innerHTML = this.recordings.map(recording => 
                this.renderRecording(recording)
            ).join('');
        }
    }

    transcribeRecording(id) {
        const recording = this.recordings.find(r => r.id == id);
        if (!recording) return;
        
        window.errorHandler?.showInfo({
            title: 'Transcription',
            message: 'Audio transcription requires a speech-to-text API. This is a placeholder for future implementation.',
            icon: '📝',
            actions: ['dismiss']
        });
    }

    downloadRecording(id) {
        const recording = this.recordings.find(r => r.id == id);
        if (!recording) return;
        
        // Create download link
        const a = document.createElement('a');
        a.href = recording.audio;
        a.download = `${recording.title.replace(/[^a-z0-9]/gi, '_')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.errorHandler?.showSuccess('Recording downloaded!');
    }

    deleteRecording(id) {
        if (confirm('Are you sure you want to delete this voice note?')) {
            this.recordings = this.recordings.filter(r => r.id != id);
            this.saveRecordings();
            this.loadRecordings();
            window.errorHandler?.showSuccess('Voice note deleted');
        }
    }

    toggleView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        const grid = document.getElementById('recordings-grid');
        grid.className = view === 'list' ? 'recordings-list' : 'recordings-grid';
        
        this.loadRecordings();
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    saveRecordings() {
        localStorage.setItem('voiceRecordings', JSON.stringify(this.recordings));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceNotes = new VoiceNotes();
});