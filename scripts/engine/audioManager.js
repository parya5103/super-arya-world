/**
 * Audio Manager
 * Handles playing and managing all game audio (music and sound effects)
 */

export class AudioManager {
    constructor() {
        // Audio storage
        this.sounds = {};
        this.music = null;
        this.currentMusic = '';
        
        // Audio settings
        this.musicVolume = 0.7; // 70%
        this.sfxVolume = 0.8;   // 80%
        this.isMuted = false;
        this.isMusicMuted = false; // Separate flag for music mute
        this.isSfxMuted = false;   // Separate flag for SFX mute
        
        // Asset loader reference
        this.assetLoader = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.playSound = this.playSound.bind(this);
        this.playMusic = this.playMusic.bind(this);
        this.stopMusic = this.stopMusic.bind(this);
        this.setMusicVolume = this.setMusicVolume.bind(this);
        this.setSfxVolume = this.setSfxVolume.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
        this.toggleMusicMute = this.toggleMusicMute.bind(this);
        this.toggleSfxMute = this.toggleSfxMute.bind(this);
        this.getMusicVolume = this.getMusicVolume.bind(this);
        this.getSfxVolume = this.getSfxVolume.bind(this);
    }
    
    /**
     * Initialize the audio manager
     * @param {AssetLoader} assetLoader - Reference to the asset loader
     */
    init(assetLoader) {
        console.log('Initializing Audio Manager...');
        this.assetLoader = assetLoader;
        
        // Load saved audio settings from localStorage
        this.loadSettings();
        
        // Set up volume control event listeners
        const musicVolumeSlider = document.getElementById('music-volume');
        const sfxVolumeSlider = document.getElementById('sfx-volume');
        
        if (musicVolumeSlider) {
            musicVolumeSlider.value = this.musicVolume * 100;
            musicVolumeSlider.addEventListener('input', (e) => {
                this.setMusicVolume(e.target.value / 100);
            });
        }
        
        if (sfxVolumeSlider) {
            sfxVolumeSlider.value = this.sfxVolume * 100;
            sfxVolumeSlider.addEventListener('input', (e) => {
                this.setSfxVolume(e.target.value / 100);
            });
        }
    }
    
    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSfxVolume = localStorage.getItem('sfxVolume');
        const savedMuted = localStorage.getItem('isMuted');
        const savedMusicMuted = localStorage.getItem('isMusicMuted');
        const savedSfxMuted = localStorage.getItem('isSfxMuted');
        
        if (savedMusicVolume !== null) {
            this.musicVolume = parseFloat(savedMusicVolume);
        }
        
        if (savedSfxVolume !== null) {
            this.sfxVolume = parseFloat(savedSfxVolume);
        }
        
        if (savedMuted !== null) {
            this.isMuted = savedMuted === 'true';
        }
        
        if (savedMusicMuted !== null) {
            this.isMusicMuted = savedMusicMuted === 'true';
        }
        
        if (savedSfxMuted !== null) {
            this.isSfxMuted = savedSfxMuted === 'true';
        }
    }
    
    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('musicVolume', this.musicVolume.toString());
        localStorage.setItem('sfxVolume', this.sfxVolume.toString());
        localStorage.setItem('isMuted', this.isMuted.toString());
        localStorage.setItem('isMusicMuted', this.isMusicMuted.toString());
        localStorage.setItem('isSfxMuted', this.isSfxMuted.toString());
    }
    
    /**
     * Play a sound effect
     * @param {string} id - Sound effect identifier
     * @param {number} [volume] - Optional volume override (0.0 to 1.0)
     */
    playSound(id, volume = null) {
        if (this.isMuted || this.isSfxMuted) return;
        
        // Get the sound from the asset loader
        const sound = this.assetLoader.getAudio(id);
        if (!sound) return;
        
        // Clone the audio element to allow multiple instances of the same sound
        const soundInstance = sound.cloneNode();
        
        // Set volume
        soundInstance.volume = volume !== null ? volume : this.sfxVolume;
        
        // Play the sound
        soundInstance.play().catch(error => {
            console.warn(`Error playing sound ${id}:`, error);
        });
        
        // Clean up the sound instance when it's done playing
        soundInstance.onended = () => {
            soundInstance.onended = null;
        };
    }
    
    /**
     * Play background music
     * @param {string} id - Music identifier
     * @param {boolean} [loop=true] - Whether to loop the music
     * @param {number} [volume] - Optional volume override (0.0 to 1.0)
     */
    playMusic(id, loop = true, volume = null) {
        // Don't restart the same music
        if (this.currentMusic === id && this.music && !this.music.paused) {
            return;
        }
        
        // Stop current music if playing
        this.stopMusic();
        
        // Get the music from the asset loader
        const music = this.assetLoader.getAudio(id);
        if (!music) return;
        
        // Set as current music
        this.music = music;
        this.currentMusic = id;
        
        // Configure music
        this.music.loop = loop;
        this.music.volume = (this.isMuted || this.isMusicMuted) ? 0 : (volume !== null ? volume : this.musicVolume);
        
        // Play the music
        if (!this.isMuted && !this.isMusicMuted) {
            this.music.play().catch(error => {
                console.warn(`Error playing music ${id}:`, error);
            });
        }
    }
    
    /**
     * Stop the currently playing music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.currentMusic = '';
        }
    }
    
    /**
     * Set the music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music && !this.isMuted && !this.isMusicMuted) {
            this.music.volume = this.musicVolume;
        }
        
        // Update UI slider if it exists
        const musicVolumeSlider = document.getElementById('music-volume');
        if (musicVolumeSlider) {
            musicVolumeSlider.value = this.musicVolume * 100;
        }
        
        // Save settings
        this.saveSettings();
    }
    
    /**
     * Set the sound effects volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update UI slider if it exists
        const sfxVolumeSlider = document.getElementById('sfx-volume');
        if (sfxVolumeSlider) {
            sfxVolumeSlider.value = this.sfxVolume * 100;
        }
        
        // Save settings
        this.saveSettings();
    }
    
    /**
     * Toggle mute state for all audio
     * @returns {boolean} - New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // Update music volume
        if (this.music) {
            this.music.volume = (this.isMuted || this.isMusicMuted) ? 0 : this.musicVolume;
        }
        
        // Save settings
        this.saveSettings();
        
        return this.isMuted;
    }
    
    /**
     * Set mute state
     * @param {boolean} muted - Whether audio should be muted
     */
    setMuted(muted) {
        if (this.isMuted !== muted) {
            this.toggleMute();
        }
    }
    
    /**
     * Pause all audio (for when game is paused)
     */
    pauseAll() {
        if (this.music && !this.music.paused) {
            this.music.pause();
        }
    }
    
    /**
     * Resume all audio (for when game is resumed)
     */
    resumeAll() {
        if (this.music && this.music.paused && this.currentMusic) {
            this.music.play().catch(error => {
                console.warn(`Error resuming music:`, error);
            });
        }
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
     * Toggle music mute
     * @returns {boolean} New mute state
     */
    toggleMusicMute() {
        this.isMusicMuted = !this.isMusicMuted;
        
        // Update music volume
        if (this.music) {
            this.music.volume = this.isMusicMuted ? 0 : this.musicVolume;
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
}