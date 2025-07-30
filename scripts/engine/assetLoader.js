/**
 * Asset Loader
 * Handles loading and managing all game assets (images, audio, fonts, etc.)
 */

export class AssetLoader {
    constructor() {
        // Asset storage
        this.images = {};
        this.audio = {};
        this.fonts = {};
        this.levels = {};
        
        // Loading state
        this.totalAssets = 0;
        this.loadedAssets = 0;
        
        // Callbacks
        this.onProgress = null;
        this.onComplete = null;
        
        // Bind methods
        this.loadAssets = this.loadAssets.bind(this);
        this.loadImage = this.loadImage.bind(this);
        this.loadAudio = this.loadAudio.bind(this);
        this.loadFont = this.loadFont.bind(this);
        this.loadLevel = this.loadLevel.bind(this);
        this.assetLoaded = this.assetLoaded.bind(this);
        this.getImage = this.getImage.bind(this);
        this.getAudio = this.getAudio.bind(this);
    }
    
    /**
     * Load all game assets
     * @param {Object} assets - Object containing arrays of assets to load
     */
    loadAssets(assets) {
        console.log('Loading assets...');
        
        // Calculate total assets to load
        this.totalAssets = 0;
        if (assets.images) this.totalAssets += assets.images.length;
        if (assets.audio) this.totalAssets += assets.audio.length;
        if (assets.fonts) this.totalAssets += assets.fonts.length;
        if (assets.levels) this.totalAssets += assets.levels.length;
        
        // Reset loaded assets counter
        this.loadedAssets = 0;
        
        // Load assets by type
        if (assets.images) {
            assets.images.forEach(image => this.loadImage(image.id, image.src));
        }
        
        if (assets.audio) {
            assets.audio.forEach(audio => this.loadAudio(audio.id, audio.src));
        }
        
        if (assets.fonts) {
            assets.fonts.forEach(font => this.loadFont(font.id, font.src));
        }
        
        if (assets.levels) {
            assets.levels.forEach(level => this.loadLevel(level.id, level.src));
        }
        
        // Handle case where there are no assets to load
        if (this.totalAssets === 0 && this.onComplete) {
            this.onComplete();
        }
    }
    
    /**
     * Load an image asset
     * @param {string} id - Unique identifier for the image
     * @param {string} src - Source path for the image
     */
    loadImage(id, src) {
        // Add leading slash for Vite
        const normalizedSrc = src.startsWith('/') ? src : '/' + src;
        const image = new Image();
        
        image.onload = () => {
            console.log(`Loaded image: ${id}`);
            this.images[id] = image;
            this.assetLoaded();
        };
        image.onerror = () => {
            console.warn(`Failed to load image: ${id} (${src})`);
            // Create a fallback image
            this.images[id] = new Image();
            this.images[id].width = 32;
            this.images[id].height = 32;
            this.images[id].src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            this.assetLoaded();
        };
        image.src = normalizedSrc;
    }
    
    /**
     * Load an audio asset
     * @param {string} id - Unique identifier for the audio
     * @param {string} src - Source path for the audio
     */
    loadAudio(id, src) {
        const audio = new Audio();
        
        audio.oncanplaythrough = () => {
            this.audio[id] = audio;
            this.assetLoaded();
            // Remove the event listener to prevent it from firing again
            audio.oncanplaythrough = null;
        };
        
        audio.onerror = (error) => {
            console.error(`Error loading audio ${id} from ${src}:`, error);
            this.assetLoaded();
        };
        
        // For browsers that don't support oncanplaythrough
        audio.addEventListener('error', () => {
            console.error(`Error loading audio ${id} from ${src}`);
            this.assetLoaded();
        });
        
        audio.src = src;
        audio.load();
    }
    
    /**
     * Load a font asset using FontFace API
     * @param {string} id - Unique identifier for the font
     * @param {string} src - Source path for the font
     */
    loadFont(id, src) {
        // Check if FontFace API is supported
        if (typeof FontFace !== 'undefined') {
            const fontName = id;
            const font = new FontFace(fontName, `url(${src})`);
            
            font.load().then(() => {
                // Add font to document fonts
                document.fonts.add(font);
                this.fonts[id] = fontName;
                this.assetLoaded();
            }).catch(error => {
                console.error(`Error loading font ${id} from ${src}:`, error);
                this.assetLoaded();
            });
        } else {
            // Fallback for browsers that don't support FontFace API
            const fontStyle = document.createElement('style');
            fontStyle.textContent = `
                @font-face {
                    font-family: '${id}';
                    src: url('${src}') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            `;
            document.head.appendChild(fontStyle);
            
            // Create a test element to check if font is loaded
            const testElement = document.createElement('span');
            testElement.style.fontFamily = id;
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            testElement.textContent = 'Font Test';
            document.body.appendChild(testElement);
            
            // Check if font is loaded every 100ms
            const checkFont = () => {
                if (document.fonts && document.fonts.check(`1em ${id}`)) {
                    this.fonts[id] = id;
                    this.assetLoaded();
                    document.body.removeChild(testElement);
                } else {
                    setTimeout(checkFont, 100);
                }
            };
            
            // Start checking
            setTimeout(checkFont, 100);
        }
    }
    
    /**
     * Load a level module
     * @param {string} id - Unique identifier for the level
     * @param {string} src - Source path for the level module
     */
    loadLevel(id, src) {
        import(/* webpackIgnore: true */ `/${src}`)
            .then(module => {
                this.levels[id] = module.default;
                this.assetLoaded();
            })
            .catch(error => {
                console.error(`Error loading level ${id} from ${src}:`, error);
                this.assetLoaded();
            });
    }
    
    /**
     * Update loading progress when an asset is loaded
     */
    assetLoaded() {
        this.loadedAssets++;
        
        // Calculate loading progress
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        
        // Call progress callback if defined
        if (this.onProgress) {
            this.onProgress(progress);
        }
        
        // Call complete callback if all assets are loaded
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }
    
    /**
     * Get a loaded image by ID
     * @param {string} id - Image identifier
     * @returns {HTMLImageElement|null} - The loaded image or null if not found
     */
    getImage(id) {
        if (this.images[id]) {
            return this.images[id];
        }
        console.warn(`Image ${id} not found`);
        return null;
    }
    
    /**
     * Get a loaded audio by ID
     * @param {string} id - Audio identifier
     * @returns {HTMLAudioElement|null} - The loaded audio or null if not found
     */
    getAudio(id) {
        if (this.audio[id]) {
            return this.audio[id];
        }
        console.warn(`Audio ${id} not found`);
        return null;
    }
    
    /**
     * Get a loaded font by ID
     * @param {string} id - Font identifier
     * @returns {string|null} - The font name or null if not found
     */
    getFont(id) {
        if (this.fonts[id]) {
            return this.fonts[id];
        }
        console.warn(`Font ${id} not found`);
        return null;
    }
    
    /**
     * Get a loaded level by ID
     * @param {string} id - Level identifier
     * @returns {Object|null} - The level data or null if not found
     */
    getLevel(id) {
        if (this.levels[id]) {
            return this.levels[id];
        }
        console.warn(`Level ${id} not found`);
        return null;
    }
}