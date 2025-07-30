/**
 * Audio Manager
 * Handles all game audio including music and sound effects
 */

export class AudioManager {
    constructor(game) {
        this.game = game;
        
        // Audio settings
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMusicMuted = false;
        this.isSfxMuted = false;
        
        // Audio elements
        this.musicElements = {};
        this.soundElements = {};
        
        // Current music
        this.currentMusic = null;
        
        // Load settings from localStorage
        this.loadSettings();
        
        // Initialize audio
        this.initializeAudio();
    }
    
    /**
     * Initialize audio elements
     */
    initializeAudio() {
        // Music tracks
        this.loadMusic('music-title', 'assets/audio/music/title.mp3');
        this.loadMusic('music-level1', 'assets/audio/music/level1.mp3');
        this.loadMusic('music-level2', 'assets/audio/music/level2.mp3');
        this.loadMusic('music-boss', 'assets/audio/music/boss.mp3');
        this.loadMusic('music-complete', 'assets/audio/music/level-complete.mp3');
        this.loadMusic('music-gameover', 'assets/audio/music/game-over.mp3');
        
        // Sound effects
        this.loadSound('sfx-jump', 'assets/audio/sfx/jump.mp3');
        this.loadSound('sfx-coin', 'assets/audio/sfx/coin.mp3');
        this.loadSound('sfx-powerup', 'assets/audio/sfx/powerup.mp3');
        this.loadSound('sfx-powerdown', 'assets/audio/sfx/powerdown.mp3');
        this.loadSound('sfx-stomp', 'assets/audio/sfx/stomp.mp3');
        this.loadSound('sfx-break', 'assets/audio/sfx/break.mp3');
        this.loadSound('sfx-bump', 'assets/audio/sfx/bump.mp3');
        this.loadSound('sfx-fireball', 'assets/audio/sfx/fireball.mp3');
        this.loadSound('sfx-kick', 'assets/audio/sfx/kick.mp3');
        this.loadSound('sfx-pipe', 'assets/audio/sfx/pipe.mp3');
        this.loadSound('sfx-death', 'assets/audio/sfx/death.mp3');
        this.loadSound('sfx-gameover', 'assets/audio/sfx/gameover.mp3');
        this.loadSound('sfx-levelcomplete', 'assets/audio/sfx/level-complete.mp3');
        this.loadSound('sfx-worldcomplete', 'assets/audio/sfx/world-complete.mp3');
        this.loadSound('sfx-menu', 'assets/audio/sfx/menu.mp3');
        this.loadSound('sfx-start', 'assets/audio/sfx/start.mp3');
        this.loadSound('sfx-1up', 'assets/audio/sfx/1up.mp3');
        this.loadSound('sfx-flag', 'assets/audio/sfx/flag.mp3');
        this.loadSound('sfx-checkpoint', 'assets/audio/sfx/checkpoint.mp3');
        this.loadSound('sfx-boss-hit', 'assets/audio/sfx/boss-hit.mp3');
        this.loadSound('sfx-boss-defeat', 'assets/audio/sfx/boss-defeat.mp3');
    }
    
    /**
     * Load a music track
     * @param {string} id - The music ID
     * @param {string} src - The music file path
     */
    loadMusic(id, src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = this.musicVolume;
        audio.preload = 'auto';
        
        this.musicElements[id] = audio;
    }
    
    /**
     * Load a sound effect
     * @param {string} id - The sound ID
     * @param {string} src - The sound file path
     */
    loadSound(id, src) {
        const audio = new Audio(src);
        audio.volume = this.sfxVolume;
        audio.preload = 'auto';
        
        this.soundElements[id] = audio;
    }
    
    /**
     * Play a music track
     * @param {string} id - The music ID
     */
    playMusic(id) {
        // Stop current music if playing
        this.stopMusic();
        
        // Play new music if not muted
        if (!this.isMusicMuted && this.musicElements[id]) {
            this.currentMusic = id;
            this.musicElements[id].currentTime = 0;
            this.musicElements[id].play().catch(error => {
                console.warn('Music playback prevented by browser:', error);
            });
        }
    }
    
    /**
     * Stop the current music
     */
    stopMusic() {
        if (this.currentMusic && this.musicElements[this.currentMusic]) {
            this.musicElements[this.currentMusic].pause();
            this.musicElements[this.currentMusic].currentTime = 0;
            this.currentMusic = null;
        }
    }
    
    /**
     * Pause the current music
     */
    pauseMusic() {
        if (this.currentMusic && this.musicElements[this.currentMusic]) {
            this.musicElements[this.currentMusic].pause();
        }
    }
    
    /**
     * Resume the current music
     */
    resumeMusic() {
        if (!this.isMusicMuted && this.currentMusic && this.musicElements[this.currentMusic]) {
            this.musicElements[this.currentMusic].play().catch(error => {
                console.warn('Music playback prevented by browser:', error);
            });
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} id - The sound ID
     */
    playSound(id) {
        if (!this.isSfxMuted && this.soundElements[id]) {
            // Clone the audio element to allow overlapping sounds
            const sound = this.soundElements[id].cloneNode();
            sound.volume = this.sfxVolume;
            
            sound.play().catch(error => {
                console.warn('Sound playback prevented by browser:', error);
            });
        }
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Update all music elements
        for (const id in this.musicElements) {
            this.musicElements[id].volume = this.musicVolume;
        }
        
        // Save settings
        this.saveSettings();
    }
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound elements
        for (const id in this.soundElements) {
            this.soundElements[id].volume = this.sfxVolume;
        }
        
        // Save settings
        this.saveSettings();
    }
    
    /**
     * Toggle music mute
     * @returns {boolean} New mute state
     */
    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        
        if (this.isMusicMuted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
        
        // Save settings
        this.saveSettings();
        
        return this.isMusicMuted;
    }
    
    /**
     * Toggle sound effects mute
     * @returns {boolean} New mute state
     */
    toggleSfxMute() {
        this.isSfxMuted = !this.isSfxMuted;
        
        // Save settings
        this.saveSettings();
        
        return this.isSfxMuted;
    }
    
    /**
     * Get music volume
     * @returns {number} Music volume (0-1)
     */
    getMusicVolume() {
        return this.musicVolume;
    }
    
    /**
     * Get sound effects volume
     * @returns {number} SFX volume (0-1)
     */
    getSfxVolume() {
        return this.sfxVolume;
    }
    
    /**
     * Check if music is muted
     * @returns {boolean} Whether music is muted
     */
    isMusicMuted() {
        return this.isMusicMuted;
    }
    
    /**
     * Check if sound effects are muted
     * @returns {boolean} Whether SFX are muted
     */
    isSfxMuted() {
        return this.isSfxMuted;
    }
    
    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        const settings = {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMusicMuted: this.isMusicMuted,
            isSfxMuted: this.isSfxMuted
        };
        
        localStorage.setItem('audioSettings', JSON.stringify(settings));
    }
    
    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        const settings = localStorage.getItem('audioSettings');
        
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            
            this.musicVolume = parsedSettings.musicVolume !== undefined ? parsedSettings.musicVolume : this.musicVolume;
            this.sfxVolume = parsedSettings.sfxVolume !== undefined ? parsedSettings.sfxVolume : this.sfxVolume;
            this.isMusicMuted = parsedSettings.isMusicMuted !== undefined ? parsedSettings.isMusicMuted : this.isMusicMuted;
            this.isSfxMuted = parsedSettings.isSfxMuted !== undefined ? parsedSettings.isSfxMuted : this.isSfxMuted;
        }
    }
}