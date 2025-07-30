/**
 * Game Manager
 * Manages the overall game state, levels, and game flow
 */

import { Player } from '../entities/player.js';

export class GameManager {
    constructor(game) {
        this.game = game;
        
        // Game state
        this.currentState = 'loading'; // loading, menu, playing, paused, gameOver, levelComplete, gameComplete
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        this.time = 300; // Level time in seconds
        this.timeElapsed = 0;
        this.currentLevel = null;
        this.currentLevelId = '';
        this.currentWorldId = 1;
        this.currentStageId = 1;
        
        // Player reference
        this.player = null;
        
        // Level completion tracking
        this.completedLevels = {};
        this.checkpoints = {};
        
        // Game statistics
        this.stats = {
            totalScore: 0,
            totalCoins: 0,
            totalTime: 0,
            deaths: 0,
            enemiesDefeated: 0,
            powerupsCollected: 0
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.update = this.update.bind(this);
        this.startGame = this.startGame.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.levelComplete = this.levelComplete.bind(this);
        this.loadLevel = this.loadLevel.bind(this);
        this.restartLevel = this.restartLevel.bind(this);
        this.addScore = this.addScore.bind(this);
        this.addCoin = this.addCoin.bind(this);
        this.addLife = this.addLife.bind(this);
        this.loseLife = this.loseLife.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.setCheckpoint = this.setCheckpoint.bind(this);
    }
    
    /**
     * Initialize the game manager
     */
    init() {
        console.log('Initializing Game Manager...');
        
        // Set up event listeners for UI buttons
        this.setupEventListeners();
        
        // Load saved game data
        this.loadGameData();
        
        // Generate level select buttons
        this.generateLevelSelectButtons();
    }
    
    /**
     * Set up event listeners for UI buttons
     */
    setupEventListeners() {
        // Start menu buttons
        const playButton = document.getElementById('play-button');
        const levelSelectButton = document.getElementById('level-select-button');
        const optionsButton = document.getElementById('options-button');
        const helpButton = document.getElementById('help-button');
        
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        if (levelSelectButton) {
            levelSelectButton.addEventListener('click', () => {
                document.getElementById('start-menu').classList.add('hidden');
                document.getElementById('level-select').classList.remove('hidden');
            });
        }
        
        if (optionsButton) {
            optionsButton.addEventListener('click', () => {
                document.getElementById('start-menu').classList.add('hidden');
                document.getElementById('options-menu').classList.remove('hidden');
            });
        }
        
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                document.getElementById('start-menu').classList.add('hidden');
                document.getElementById('help-menu').classList.remove('hidden');
            });
        }
        
        // Back buttons
        const backFromLevelsButton = document.getElementById('back-from-levels');
        const backFromOptionsButton = document.getElementById('back-from-options');
        const backFromHelpButton = document.getElementById('back-from-help');
        
        if (backFromLevelsButton) {
            backFromLevelsButton.addEventListener('click', () => {
                document.getElementById('level-select').classList.add('hidden');
                document.getElementById('start-menu').classList.remove('hidden');
            });
        }
        
        if (backFromOptionsButton) {
            backFromOptionsButton.addEventListener('click', () => {
                document.getElementById('options-menu').classList.add('hidden');
                document.getElementById('start-menu').classList.remove('hidden');
            });
        }
        
        if (backFromHelpButton) {
            backFromHelpButton.addEventListener('click', () => {
                document.getElementById('help-menu').classList.add('hidden');
                document.getElementById('start-menu').classList.remove('hidden');
            });
        }
        
        // Game UI buttons
        const pauseBtn = document.getElementById('pause-btn');
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.currentState === 'playing') {
                    this.pauseGame();
                }
            });
        }
        
        // Pause menu buttons
        const resumeBtn = document.getElementById('resume-btn');
        const restartBtn = document.getElementById('restart-btn');
        const exitToMenuBtn = document.getElementById('exit-to-menu-btn');
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeGame();
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartLevel();
            });
        }
        
        if (exitToMenuBtn) {
            exitToMenuBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
        
        // Game over buttons
        const tryAgainBtn = document.getElementById('try-again-btn');
        const gameOverExitBtn = document.getElementById('game-over-exit-btn');
        
        if (tryAgainBtn) {
            tryAgainBtn.addEventListener('click', () => {
                this.restartLevel();
            });
        }
        
        if (gameOverExitBtn) {
            gameOverExitBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
        
        // Level complete buttons
        const nextLevelBtn = document.getElementById('next-level-btn');
        const levelCompleteExitBtn = document.getElementById('level-complete-exit-btn');
        
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.loadNextLevel();
            });
        }
        
        if (levelCompleteExitBtn) {
            levelCompleteExitBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
        
        // Game complete buttons
        const playAgainBtn = document.getElementById('play-again-btn');
        const gameCompleteExitBtn = document.getElementById('game-complete-exit-btn');
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        if (gameCompleteExitBtn) {
            gameCompleteExitBtn.addEventListener('click', () => {
                this.exitToMenu();
            });
        }
        
        // Theme toggle button
        const themeToggleBtn = document.getElementById('theme-toggle');
        
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    /**
     * Generate level select buttons based on completed levels
     */
    generateLevelSelectButtons() {
        const levelGrid = document.getElementById('level-grid');
        if (!levelGrid) return;
        
        // Clear existing buttons
        levelGrid.innerHTML = '';
        
        // Create buttons for each level
        for (let world = 1; world <= 3; world++) {
            for (let stage = 1; stage <= 3; stage++) {
                const levelId = `${world}-${stage}`;
                const isCompleted = this.completedLevels[levelId];
                const isUnlocked = world === 1 && stage === 1 || // First level is always unlocked
                                  this.completedLevels[`${world}-${stage-1}`] || // Previous stage completed
                                  (stage === 1 && this.completedLevels[`${world-1}-3`]); // Last stage of previous world completed
                
                const levelButton = document.createElement('button');
                levelButton.className = `level-button ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;
                levelButton.textContent = levelId;
                
                if (isUnlocked) {
                    levelButton.addEventListener('click', () => {
                        this.loadLevel(world, stage);
                    });
                }
                
                levelGrid.appendChild(levelButton);
            }
        }
    }
    
    /**
     * Load saved game data from localStorage
     */
    loadGameData() {
        // Load completed levels
        const savedCompletedLevels = localStorage.getItem('completedLevels');
        if (savedCompletedLevels) {
            this.completedLevels = JSON.parse(savedCompletedLevels);
        }
        
        // Load checkpoints
        const savedCheckpoints = localStorage.getItem('checkpoints');
        if (savedCheckpoints) {
            this.checkpoints = JSON.parse(savedCheckpoints);
        }
        
        // Load game statistics
        const savedStats = localStorage.getItem('gameStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }
    
    /**
     * Save game data to localStorage
     */
    saveGameData() {
        // Save completed levels
        localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        
        // Save checkpoints
        localStorage.setItem('checkpoints', JSON.stringify(this.checkpoints));
        
        // Save game statistics
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Only update time and game logic if the game is playing
        if (this.currentState === 'playing') {
            // Update time
            this.updateTime(deltaTime);
            
            // Check for game over conditions
            if (this.time <= 0) {
                this.loseLife();
            }
            
            // Check for player falling off the level
            if (this.player && this.player.y > this.game.levelManager.levelHeight) {
                this.loseLife();
            }
        }
    }
    
    /**
     * Start a new game
     */
    startGame() {
        console.log('Starting new game...');
        
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.coins = 0;
        
        // Hide menus and show game UI
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        // Set game as running
        this.game.isRunning = true;
        this.currentState = 'playing';
        
        // Load the first level
        this.loadLevel(1, 1);
    }
    
    /**
     * Load a specific level
     * @param {number} world - World number
     * @param {number} stage - Stage number
     */
    loadLevel(world, stage) {
        console.log(`Loading level ${world}-${stage}...`);
        
        // Set current level info
        this.currentWorldId = world;
        this.currentStageId = stage;
        this.currentLevelId = `${world}-${stage}`;
        
        // Reset level state
        this.time = 300; // Reset time for new level
        this.timeElapsed = 0;
        
        // Hide menus and show game UI
        document.getElementById('level-select').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        // Update level name in UI
        document.getElementById('level-name').textContent = this.currentLevelId;
        
        // Clear existing level and entities
        this.game.entityManager.clearEntities();
        this.game.physics.colliders = [];
        this.game.physics.staticColliders = [];
        this.game.physics.dynamicColliders = [];
        
        // Load level data
        const levelData = this.game.assetLoader.getLevel(`level-${this.currentLevelId}`);
        
        if (levelData) {
            // Initialize level
            this.game.levelManager.loadLevel(levelData);
            
            // Create player
            this.createPlayer();
            
            // Set camera to follow player
            this.game.renderer.followTarget(this.player);
            
            // Set camera bounds based on level size
            this.game.renderer.setCameraBounds(
                0,
                this.game.levelManager.levelWidth,
                0,
                this.game.levelManager.levelHeight
            );
            
            // Check if there's a checkpoint for this level
            if (this.checkpoints[this.currentLevelId]) {
                // Spawn player at checkpoint
                this.player.x = this.checkpoints[this.currentLevelId].x;
                this.player.y = this.checkpoints[this.currentLevelId].y;
            }
            
            // Play level music
            if (world === 3 && stage === 3) {
                // Boss music for final level
                this.game.audioManager.playMusic('music-boss', true);
            } else if (stage === 2) {
                // Underground music for second stage of each world
                this.game.audioManager.playMusic('music-underground', true);
            } else {
                // Main theme for other levels
                this.game.audioManager.playMusic('music-main-theme', true);
            }
            
            // Set game state to playing
            this.currentState = 'playing';
            this.game.isRunning = true;
        } else {
            console.error(`Level ${this.currentLevelId} not found!`);
            this.exitToMenu();
        }
    }
    
    /**
     * Create the player character
     */
    createPlayer() {
        // Create player entity
        this.player = new Player({
            x: 100,
            y: 100,
            width: 32,
            height: 64,
            game: this.game
        });
        
        // Add player to entity manager
        this.game.entityManager.addEntity(this.player);
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        if (this.currentState !== 'playing') return;
        
        console.log('Pausing game...');
        
        // Show pause menu
        document.getElementById('pause-menu').classList.remove('hidden');
        
        // Pause audio
        this.game.audioManager.pauseAll();
        
        // Set game state
        this.currentState = 'paused';
        this.game.isPaused = true;
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        if (this.currentState !== 'paused') return;
        
        console.log('Resuming game...');
        
        // Hide pause menu
        document.getElementById('pause-menu').classList.add('hidden');
        
        // Resume audio
        this.game.audioManager.resumeAll();
        
        // Set game state
        this.currentState = 'playing';
        this.game.isPaused = false;
    }
    
    /**
     * Game over
     */
    gameOver() {
        console.log('Game over!');
        
        // Update stats
        this.stats.deaths++;
        
        // Show game over screen
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-time').textContent = Math.floor(this.timeElapsed);
        
        // Play game over music
        this.game.audioManager.playMusic('music-game-over', false);
        
        // Set game state
        this.currentState = 'gameOver';
        
        // Save game data
        this.saveGameData();
    }
    
    /**
     * Level complete
     */
    levelComplete() {
        console.log('Level complete!');
        
        // Mark level as completed
        this.completedLevels[this.currentLevelId] = true;
        
        // Update stats
        this.stats.totalScore += this.score;
        this.stats.totalCoins += this.coins;
        this.stats.totalTime += this.timeElapsed;
        
        // Show level complete screen
        document.getElementById('level-complete').classList.remove('hidden');
        document.getElementById('level-score').textContent = this.score;
        document.getElementById('level-time').textContent = Math.floor(this.timeElapsed);
        document.getElementById('level-coins').textContent = this.coins;
        
        // Play level complete music
        this.game.audioManager.playMusic('music-level-complete', false);
        
        // Set game state
        this.currentState = 'levelComplete';
        
        // Save game data
        this.saveGameData();
        
        // Update level select buttons
        this.generateLevelSelectButtons();
    }
    
    /**
     * Game complete (all levels finished)
     */
    gameComplete() {
        console.log('Game complete!');
        
        // Show game complete screen
        document.getElementById('game-complete').classList.remove('hidden');
        document.getElementById('total-score').textContent = this.stats.totalScore;
        document.getElementById('total-time').textContent = Math.floor(this.stats.totalTime);
        document.getElementById('total-coins').textContent = this.stats.totalCoins;
        
        // Play level complete music
        this.game.audioManager.playMusic('music-level-complete', false);
        
        // Set game state
        this.currentState = 'gameComplete';
        
        // Save game data
        this.saveGameData();
    }
    
    /**
     * Load the next level
     */
    loadNextLevel() {
        let nextWorld = this.currentWorldId;
        let nextStage = this.currentStageId + 1;
        
        // Check if we need to move to the next world
        if (nextStage > 3) {
            nextStage = 1;
            nextWorld++;
        }
        
        // Check if we've completed all levels
        if (nextWorld > 3) {
            this.gameComplete();
            return;
        }
        
        // Load the next level
        this.loadLevel(nextWorld, nextStage);
    }
    
    /**
     * Restart the current level
     */
    restartLevel() {
        // Hide all menus
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        
        // Reload the current level
        this.loadLevel(this.currentWorldId, this.currentStageId);
    }
    
    /**
     * Exit to main menu
     */
    exitToMenu() {
        console.log('Exiting to menu...');
        
        // Hide all game screens
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('level-complete').classList.add('hidden');
        document.getElementById('game-complete').classList.add('hidden');
        
        // Show start menu
        document.getElementById('start-menu').classList.remove('hidden');
        
        // Play menu music
        this.game.audioManager.playMusic('music-main-theme', true);
        
        // Set game state
        this.currentState = 'menu';
        this.game.isRunning = false;
        this.game.isPaused = false;
    }
    
    /**
     * Add score
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.score += points;
        
        // Update score display
        document.getElementById('score').textContent = this.score;
        
        // Award extra life for every 10000 points
        if (Math.floor(this.score / 10000) > Math.floor((this.score - points) / 10000)) {
            this.addLife();
        }
    }
    
    /**
     * Add coin
     */
    addCoin() {
        this.coins++;
        this.addScore(100);
        
        // Play coin sound
        this.game.audioManager.playSound('sfx-coin');
        
        // Award extra life for every 100 coins
        if (this.coins % 100 === 0) {
            this.addLife();
        }
    }
    
    /**
     * Add life
     */
    addLife() {
        this.lives++;
        
        // Update lives display
        document.getElementById('lives').textContent = this.lives;
        
        // Play 1up sound
        this.game.audioManager.playSound('sfx-1up');
    }
    
    /**
     * Lose life
     */
    loseLife() {
        this.lives--;
        
        // Update lives display
        document.getElementById('lives').textContent = this.lives;
        
        // Play death sound
        this.game.audioManager.playSound('sfx-death');
        
        // Check for game over
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Restart level after a short delay
            setTimeout(() => {
                this.restartLevel();
            }, 1000);
        }
    }
    
    /**
     * Update time
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateTime(deltaTime) {
        // Update elapsed time
        this.timeElapsed += deltaTime;
        
        // Update remaining time
        this.time -= deltaTime;
        if (this.time < 0) this.time = 0;
        
        // Update time display
        document.getElementById('time').textContent = Math.ceil(this.time);
    }
    
    /**
     * Set a checkpoint
     * @param {number} x - Checkpoint X position
     * @param {number} y - Checkpoint Y position
     */
    setCheckpoint(x, y) {
        console.log(`Checkpoint set at ${x}, ${y}`);
        
        // Save checkpoint for current level
        this.checkpoints[this.currentLevelId] = { x, y };
        
        // Save game data
        this.saveGameData();
        
        // Play checkpoint sound
        this.game.audioManager.playSound('sfx-pipe');
    }
    
    /**
     * Toggle between day and night theme
     */
    toggleTheme() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.toggle('night-theme');
        
        // Update theme toggle button text
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = gameContainer.classList.contains('night-theme') ? 'Day' : 'Night';
        }
    }
}