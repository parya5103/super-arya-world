/**
 * Super Arya World - Main Game Entry Point
 * A Mario-style 3D side-scrolling platformer game
 */

// Import game modules
import { AssetLoader } from '/scripts/engine/assetLoader.js';
import { AudioManager } from '/scripts/engine/audioManager.js';
import { InputManager } from '/scripts/engine/inputManager.js';
import { Renderer } from '/scripts/engine/renderer.js';
import { Physics } from '/scripts/engine/physics.js';
import { EntityManager } from '/scripts/engine/entityManager.js';
import { LevelManager } from '/scripts/engine/levelManager.js';
import { UIManager } from '/scripts/ui/uiManager.js';
import { SaveManager } from '/scripts/engine/saveManager.js';
import { GameManager } from '/scripts/engine/gameManager.js';
import { CheatManager } from '/scripts/engine/cheatManager.js';
import { ParticleSystem } from '/scripts/engine/particleSystem.js';

// Game configuration
const CONFIG = {
    canvas: {
        width: 1280,
        height: 720
    },
    physics: {
        gravity: 0.5,
        friction: 0.8,
        terminalVelocity: 10
    },
    player: {
        speed: 5,
        jumpForce: 12,
        lives: 3
    },
    game: {
        initialLevel: '1-1',
        timeLimit: 300,
        totalLevels: 9 // 3 worlds with 3 levels each
    }
};

// Game assets to preload
const ASSETS = {
    images: [
        // Player sprites
        { id: 'player-idle', src: '/assets/images/player/idle.png' },
        { id: 'player-run', src: '/assets/images/player/run.png' },
        { id: 'player-jump', src: '/assets/images/player/jump.png' },
        { id: 'player-fall', src: '/assets/images/player/fall.png' },
        { id: 'player-power-up', src: '/assets/images/player/power-up.png' },
        
        // Enemy sprites
        { id: 'enemy-goomba', src: '/assets/images/enemies/goomba.png' },
        { id: 'enemy-koopa', src: '/assets/images/enemies/koopa.png' },
        { id: 'enemy-boss', src: '/assets/images/enemies/boss.png' },
        
        // Item sprites
        { id: 'item-coin', src: '/assets/images/items/coin.png' },
        { id: 'item-mushroom', src: '/assets/images/items/mushroom.png' },
        { id: 'item-fire-flower', src: 'assets/images/items/fire-flower.png' },
        { id: 'item-star', src: 'assets/images/items/star.png' },
        { id: 'item-1up', src: 'assets/images/items/1up.png' },
        
        // Tile sprites
        { id: 'tiles-ground', src: 'assets/images/tiles/ground.png' },
        { id: 'tiles-brick', src: 'assets/images/tiles/brick.png' },
        { id: 'tiles-question', src: 'assets/images/tiles/question.png' },
        { id: 'tiles-pipe', src: 'assets/images/tiles/pipe.png' },
        
        // Background layers
        { id: 'bg-sky', src: 'assets/images/backgrounds/sky.png' },
        { id: 'bg-clouds', src: 'assets/images/backgrounds/clouds.png' },
        { id: 'bg-mountains', src: 'assets/images/backgrounds/mountains.png' },
        { id: 'bg-trees', src: 'assets/images/backgrounds/trees.png' },
        
        // UI elements
        { id: 'ui-heart', src: 'assets/images/ui/heart.png' },
        { id: 'ui-coin', src: 'assets/images/ui/coin.png' },
        { id: 'ui-clock', src: 'assets/images/ui/clock.png' }
    ],
    audio: [
        // Music
        { id: 'music-main-theme', src: 'assets/audio/music/main-theme.mp3' },
        { id: 'music-underground', src: 'assets/audio/music/underground.mp3' },
        { id: 'music-boss', src: 'assets/audio/music/boss.mp3' },
        { id: 'music-star', src: 'assets/audio/music/star.mp3' },
        { id: 'music-game-over', src: 'assets/audio/music/game-over.mp3' },
        { id: 'music-level-complete', src: 'assets/audio/music/level-complete.mp3' },
        
        // Sound effects
        { id: 'sfx-jump', src: 'assets/audio/sfx/jump.mp3' },
        { id: 'sfx-coin', src: 'assets/audio/sfx/coin.mp3' },
        { id: 'sfx-power-up', src: 'assets/audio/sfx/power-up.mp3' },
        { id: 'sfx-power-down', src: 'assets/audio/sfx/power-down.mp3' },
        { id: 'sfx-stomp', src: 'assets/audio/sfx/stomp.mp3' },
        { id: 'sfx-break', src: 'assets/audio/sfx/break.mp3' },
        { id: 'sfx-pipe', src: 'assets/audio/sfx/pipe.mp3' },
        { id: 'sfx-1up', src: 'assets/audio/sfx/1up.mp3' },
        { id: 'sfx-fireball', src: 'assets/audio/sfx/fireball.mp3' },
        { id: 'sfx-kick', src: 'assets/audio/sfx/kick.mp3' },
        { id: 'sfx-death', src: 'assets/audio/sfx/death.mp3' }
    ],
    fonts: [
        { id: 'pixel-font', src: 'assets/fonts/pixel.ttf' }
    ],
    levels: [
        { id: 'level-1-1', src: 'scripts/levels/1-1.js' },
        { id: 'level-1-2', src: 'scripts/levels/1-2.js' },
        { id: 'level-1-3', src: 'scripts/levels/1-3.js' },
        { id: 'level-2-1', src: 'scripts/levels/2-1.js' },
        { id: 'level-2-2', src: 'scripts/levels/2-2.js' },
        { id: 'level-2-3', src: 'scripts/levels/2-3.js' },
    ]
};

// Main Game Class
class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        // Initialize game modules
        this.assetLoader = new AssetLoader();
        this.audioManager = new AudioManager();
        this.inputManager = new InputManager();
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.physics = new Physics(CONFIG.physics);
        this.entityManager = new EntityManager();
        this.levelManager = new LevelManager();
        this.uiManager = new UIManager();
        this.saveManager = new SaveManager();
        this.gameManager = new GameManager(this);
        this.cheatManager = new CheatManager(this);
        this.particleSystem = new ParticleSystem(this);
        
        // Game state
        this.isLoading = true;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadAssets = this.loadAssets.bind(this);
        this.start = this.start.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.resize = this.resize.bind(this);
        
        // Initialize the game
        this.init();
    }
    
    // Initialize the game
    init() {
        console.log('Initializing Super Arya World...');
        
        // Set up event listeners
        window.addEventListener('resize', this.resize);
        
        // Initialize UI
        this.uiManager.init();
        
        // Initialize input manager
        this.inputManager.init();
        
        // Initialize cheat manager
        this.cheatManager.init();
        
        // Load saved game data
        this.saveManager.loadGameData();
        
        // Load assets
        try {
            this.loadAssets();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            // Show error message
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Failed to initialize game. Press any key to continue...';
                this.setupKeyPressListener();
            }
        }
    }
    
    // Load all game assets
    loadAssets() {
        const loadingBar = document.querySelector('.progress');
        const loadingText = document.querySelector('.loading-text');
        
        // Set up asset loading callbacks
        this.assetLoader.onProgress = (progress) => {
            loadingBar.style.width = `${progress}%`;
            loadingText.textContent = `Loading... ${Math.floor(progress)}%`;
        };
        
        // Handle successful asset loading
        this.assetLoader.onComplete = () => {
            console.log('All assets loaded!');
            loadingText.textContent = 'Press any key to start';
            
            // Set up key press listener
            this.setupKeyPressListener();
        };
        
        // Handle asset loading errors
        this.assetLoader.onError = (error) => {
            console.error('Asset loading error:', error);
            loadingText.textContent = 'Error loading assets. Press any key to continue...';
            
            // Set up key press listener
            this.setupKeyPressListener();
        };
        
        try {
            // Start loading assets
            this.assetLoader.loadAssets(ASSETS);
        } catch (error) {
            console.error('Failed to start asset loading:', error);
            loadingText.textContent = 'Failed to load game. Press any key to continue...';
            
            // Set up key press listener
            this.setupKeyPressListener();
        }
    }
    
    // Helper method to set up key press listener
    setupKeyPressListener() {
        document.addEventListener('keydown', (e) => {
            if (this.isLoading) {
                this.isLoading = false;
                const loadingScreen = document.getElementById('loading-screen');
                const startMenu = document.getElementById('start-menu');
                
                // Hide loading screen and show start menu
                loadingScreen.classList.add('hidden');
                startMenu.classList.remove('hidden');
                
                // Initialize game manager
                this.gameManager.init();
                
                // Start game loop
                this.start();
            }
        }, { once: true });
    }

    // Start the game
    start() {
        console.log('Starting game...');
        
        // Hide loading screen and show start menu
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('start-menu').classList.remove('hidden');
        
        // Initialize audio
        this.audioManager.init(this.assetLoader);
        this.audioManager.playMusic('music-main-theme', true);
        
        // Initialize game manager
        this.gameManager.init();
        
        // Set game as running
        this.isLoading = false;
        
        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }

    // Main game loop
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update and render the game
        if (this.isRunning && !this.isPaused) {
            this.update(deltaTime / 1000); // Convert to seconds
        }
        
        this.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop);
    }

    // Update game state
    update(deltaTime) {
        // Update game manager
        this.gameManager.update(deltaTime);
        
        // Update physics
        this.physics.update(deltaTime);
        
        // Update entities
        this.entityManager.update(deltaTime);
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Update level
        this.levelManager.update(deltaTime);
        
        // Update UI
        this.uiManager.update(deltaTime);
    }

    // Render the game
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render the game
        if (this.isRunning) {
            // Render level
            this.levelManager.render(this.renderer);
            
            // Render entities
            this.entityManager.render(this.renderer);
            
            // Render particles
            this.particleSystem.render(this.renderer);
        }
        
        // Render UI
        this.uiManager.render(this.renderer);
    }

    // Handle window resize
    resize() {
        // Maintain aspect ratio
        const container = document.getElementById('game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const aspectRatio = CONFIG.canvas.width / CONFIG.canvas.height;
        let width, height;
        
        if (containerWidth / containerHeight > aspectRatio) {
            height = containerHeight;
            width = height * aspectRatio;
        } else {
            width = containerWidth;
            height = width / aspectRatio;
        }
        
        // Apply the new dimensions
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Make game accessible globally for debugging
    window.game = game;
});

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    // Make game accessible globally for debugging
    window.game = game;
});