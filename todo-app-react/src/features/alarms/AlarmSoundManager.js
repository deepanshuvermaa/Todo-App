// Advanced Alarm Sound Manager with multiple sound options
export class AlarmSoundManager {
  constructor() {
    this.audioContext = null;
    this.currentAlarm = null;
    this.isPlaying = false;
    this.fadeInterval = null;
    this.beepInterval = null;
    this.volume = 0.7;
    this.soundType = 'classic';

    this.soundPatterns = {
      classic: { frequency: 800, duration: 500, interval: 600 },
      urgent: { frequency: 1000, duration: 300, interval: 400 },
      gentle: { frequency: 600, duration: 800, interval: 1200 },
      beep: { frequency: 880, duration: 200, interval: 300 },
      siren: { frequency: [800, 1200], duration: 1000, interval: 100 },
      bell: { frequency: 1000, duration: 1500, interval: 2000 }
    };

    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  async startAlarm(soundType = 'classic', volume = 0.7) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.soundType = soundType;
    this.volume = volume;
    this.isPlaying = true;

    this.playAlarmPattern();
  }

  playAlarmPattern() {
    if (!this.isPlaying || !this.audioContext) return;

    const pattern = this.soundPatterns[this.soundType];

    if (this.soundType === 'siren') {
      this.playSiren(pattern);
    } else {
      this.playTone(pattern.frequency, pattern.duration);
    }

    // Schedule next beep
    this.beepInterval = setTimeout(() => {
      this.playAlarmPattern();
    }, pattern.interval);
  }

  playTone(frequency, duration) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    // Smooth attack and decay
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playSiren(pattern) {
    if (!this.audioContext) return;

    const [freq1, freq2] = pattern.frequency;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';

    // Create siren effect
    oscillator.frequency.setValueAtTime(freq1, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(freq2, this.audioContext.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(freq1, this.audioContext.currentTime + 1);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + pattern.duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + pattern.duration / 1000);
  }

  stopAlarm() {
    this.isPlaying = false;

    if (this.beepInterval) {
      clearTimeout(this.beepInterval);
      this.beepInterval = null;
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  snooze(minutes = 5) {
    this.stopAlarm();

    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.isPlaying) { // Check if not manually dismissed
          this.startAlarm(this.soundType, this.volume);
        }
        resolve();
      }, minutes * 60 * 1000);
    });
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setSoundType(soundType) {
    if (this.soundPatterns[soundType]) {
      this.soundType = soundType;
    }
  }

  // Test sound for preview
  playTestSound(soundType, duration = 2000) {
    const originalType = this.soundType;
    const originalPlaying = this.isPlaying;

    this.soundType = soundType;
    this.isPlaying = true;
    this.playAlarmPattern();

    setTimeout(() => {
      this.stopAlarm();
      this.soundType = originalType;
      this.isPlaying = originalPlaying;
    }, duration);
  }

  // Get available sound types
  getSoundTypes() {
    return Object.keys(this.soundPatterns);
  }

  // Vibration support for mobile devices
  vibrate(pattern = [200, 100, 200, 100, 200]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  startVibratingAlarm() {
    this.vibrate();

    // Repeat vibration every 2 seconds
    this.vibrateInterval = setInterval(() => {
      if (this.isPlaying) {
        this.vibrate();
      } else {
        clearInterval(this.vibrateInterval);
      }
    }, 2000);
  }
}

export default new AlarmSoundManager();