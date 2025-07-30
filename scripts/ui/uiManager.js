/**
 * UI Manager
 * Handles all game UI elements and interactions
 */

export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.activeScreen = 'loading';
        this.touchControls = false;
        this.dayTheme = true;
        
        // Initialize UI elements
        this.initializeUI();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Get all UI containers
        this.elements.loading = document.getElementById('loading-screen');
        this.elements.start = document.getElementById('start-menu');
        this.elements.levelSelect = document.getElementById('level-select');
        this.elements.options = document.getElementById('options-menu');
        this.elements.help = document.getElementById('help-menu');
        this.elements.hud = document.getElementById('game-hud');
        this.elements.pause = document.getElementById('pause-menu');
        this.elements.gameOver = document.getElementById('game-over');
        this.elements.levelComplete = document.getElementById('level-complete');
        this.elements.gameComplete = document.getElementById('game-complete');
        this.elements.leaderboard = document.getElementById('leaderboard');
        this.elements.touchControls = document.getElementById('touch-controls');
        
        // Get HUD elements
        this.elements.score = document.getElementById('score-value');
        this.elements.lives = document.getElementById('lives-value');
        this.elements.coins = document.getElementById('coins-value');
        this.elements.time = document.getElementById('time-value');
        this.elements.level = document.getElementById('level-name');
        
        // Get buttons
        this.elements.startButton = document.getElementById('start-button');
        this.elements.levelSelectButton = document.getElementById('level-select-button');
        this.elements.optionsButton = document.getElementById('options-button');
        this.elements.helpButton = document.getElementById('help-button');
        this.elements.resumeButton = document.getElementById('resume-button');
        this.elements.restartButton = document.getElementById('restart-button');
        this.elements.quitButton = document.getElementById('quit-button');
        this.elements.backButtons = document.querySelectorAll('.back-button');
        this.elements.retryButton = document.getElementById('retry-button');
        this.elements.continueButton = document.getElementById('continue-button');
        this.elements.nextLevelButton = document.getElementById('next-level-button');
        
        // Get options elements
        this.elements.musicVolumeSlider = document.getElementById('music-volume');
        this.elements.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.elements.themeToggle = document.getElementById('theme-toggle');
        
        // Get touch control elements
        this.elements.leftButton = document.getElementById('touch-left');
        this.elements.rightButton = document.getElementById('touch-right');
        this.elements.jumpButton = document.getElementById('touch-jump');
        this.elements.actionButton = document.getElementById('touch-action');
        this.elements.pauseButton = document.getElementById('touch-pause');
        
        // Hide all screens initially
        this.hideAllScreens();
        
        // Show loading screen initially
        this.showScreen('loading');
    }
    
    /**
     * Add event listeners to UI elements
     */
    addEventListeners() {
        // Start menu buttons
        this.elements.startButton.addEventListener('click', () => this.onStartGame());
        this.elements.levelSelectButton.addEventListener('click', () => this.showScreen('levelSelect'));
        this.elements.optionsButton.addEventListener('click', () => this.showScreen('options'));
        this.elements.helpButton.addEventListener('click', () => this.showScreen('help'));
        
        // Back buttons
        this.elements.backButtons.forEach(button => {
            button.addEventListener('click', () => this.onBackButton());
        });
        
        // Pause menu buttons
        this.elements.resumeButton.addEventListener('click', () => this.onResumeGame());
        this.elements.restartButton.addEventListener('click', () => this.onRestartLevel());
        this.elements.quitButton.addEventListener('click', () => this.onQuitGame());
        
        // Game over buttons
        this.elements.retryButton.addEventListener('click', () => this.onRestartLevel());
        
        // Level complete buttons
        this.elements.continueButton.addEventListener('click', () => this.onContinueGame());
        this.elements.nextLevelButton.addEventListener('click', () => this.onNextLevel());
        
        // Options menu
        this.elements.musicVolumeSlider.addEventListener('input', (e) => this.onMusicVolumeChange(e.target.value));
        this.elements.sfxVolumeSlider.addEventListener('input', (e) => this.onSfxVolumeChange(e.target.value));
        this.elements.themeToggle.addEventListener('change', (e) => this.onThemeToggle(e.target.checked));
        
        // Touch controls
        this.elements.leftButton.addEventListener('touchstart', () => this.onTouchLeft(true));
        this.elements.leftButton.addEventListener('touchend', () => this.onTouchLeft(false));
        this.elements.rightButton.addEventListener('touchstart', () => this.onTouchRight(true));
        this.elements.rightButton.addEventListener('touchend', () => this.onTouchRight(false));
        this.elements.jumpButton.addEventListener('touchstart', () => this.onTouchJump(true));
        this.elements.jumpButton.addEventListener('touchend', () => this.onTouchJump(false));
        this.elements.actionButton.addEventListener('touchstart', () => this.onTouchAction(true));
        this.elements.actionButton.addEventListener('touchend', () => this.onTouchAction(false));
        this.elements.pauseButton.addEventListener('click', () => this.onTouchPause());
        
        // Prevent default touch behavior on touch controls
        const touchElements = document.querySelectorAll('.touch-button');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', (e) => e.preventDefault());
            element.addEventListener('touchmove', (e) => e.preventDefault());
            element.addEventListener('touchend', (e) => e.preventDefault());
        });
    }
    
    /**
     * Hide all UI screens
     */
    hideAllScreens() {
        for (const key in this.elements) {
            if (this.elements[key] && this.elements[key].classList && this.elements[key].classList.contains('screen')) {
                this.elements[key].classList.add('hidden');
            }
        }
    }
    
    /**
     * Show a specific UI screen
     * @param {string} screenName - Name of the screen to show
     */
    showScreen(screenName) {
        // Hide all screens first
        this.hideAllScreens();
        
        // Show the requested screen
        if (this.elements[screenName]) {
            this.elements[screenName].classList.remove('hidden');
            this.activeScreen = screenName;
            
            // Special handling for certain screens
            if (screenName === 'levelSelect') {
                this.populateLevelSelect();
            } else if (screenName === 'options') {
                this.updateOptionsUI();
            } else if (screenName === 'leaderboard') {
                this.populateLeaderboard();
            }
        }
        
        // Show/hide touch controls
        if (screenName === 'hud') {
            if (this.touchControls) {
                this.elements.touchControls.classList.remove('hidden');
            } else {
                this.elements.touchControls.classList.add('hidden');
            }
        } else {
            this.elements.touchControls.classList.add('hidden');
        }
    }
    
    /**
     * Update HUD elements
     * @param {Object} gameState - Current game state
     */
    updateHUD(gameState) {
        if (!gameState) return;
        
        // Update score
        this.elements.score.textContent = gameState.score.toString().padStart(6, '0');
        
        // Update lives
        this.elements.lives.textContent = 'x' + gameState.lives;
        
        // Update coins
        this.elements.coins.textContent = 'x' + gameState.coins;
        
        // Update time
        const timeLeft = Math.max(0, Math.floor(gameState.timeLeft));
        this.elements.time.textContent = timeLeft.toString().padStart(3, '0');
        
        // Update level name
        if (gameState.currentLevel) {
            this.elements.level.textContent = gameState.currentLevel.name;
        }
    }
    
    /**
     * Populate level select screen with available levels
     */
    populateLevelSelect() {
        const levelContainer = document.getElementById('level-buttons');
        levelContainer.innerHTML = '';
        
        // Get completed levels from game manager
        const completedLevels = this.game.gameManager.getCompletedLevels();
        
        // Get all levels
        const levels = this.game.levelManager.getAllLevels();
        
        // Create a button for each level
        levels.forEach((level, index) => {
            const levelButton = document.createElement('div');
            levelButton.className = 'level-button';
            
            // Check if level is unlocked
            const isUnlocked = index === 0 || completedLevels.includes(levels[index - 1].id);
            
            // Check if level is completed
            const isCompleted = completedLevels.includes(level.id);
            
            // Set button text and class
            levelButton.textContent = `${index + 1}. ${level.name}`;
            
            if (isCompleted) {
                levelButton.classList.add('completed');
            } else if (isUnlocked) {
                levelButton.classList.add('unlocked');
            } else {
                levelButton.classList.add('locked');
            }
            
            // Add click event if level is unlocked
            if (isUnlocked) {
                levelButton.addEventListener('click', () => {
                    this.onSelectLevel(level.id);
                });
            }
            
            // Add button to container
            levelContainer.appendChild(levelButton);
        });
    }
    
    /**
     * Update options UI with current settings
     */
    updateOptionsUI() {
        // Update volume sliders
        this.elements.musicVolumeSlider.value = this.game.audioManager.getMusicVolume() * 100;
        this.elements.sfxVolumeSlider.value = this.game.audioManager.getSfxVolume() * 100;
        
        // Update theme toggle
        this.elements.themeToggle.checked = !this.dayTheme;
    }
    
    /**
     * Populate leaderboard with high scores
     */
    populateLeaderboard() {
        const leaderboardContainer = document.getElementById('leaderboard-entries');
        leaderboardContainer.innerHTML = '';
        
        // Get high scores from game manager
        const highScores = this.game.gameManager.getHighScores();
        
        // Create an entry for each high score
        highScores.forEach((entry, index) => {
            const scoreEntry = document.createElement('div');
            scoreEntry.className = 'leaderboard-entry';
            
            const rank = document.createElement('span');
            rank.className = 'rank';
            rank.textContent = `${index + 1}.`;
            
            const name = document.createElement('span');
            name.className = 'name';
            name.textContent = entry.name;
            
            const score = document.createElement('span');
            score.className = 'score';
            score.textContent = entry.score.toString().padStart(6, '0');
            
            scoreEntry.appendChild(rank);
            scoreEntry.appendChild(name);
            scoreEntry.appendChild(score);
            
            leaderboardContainer.appendChild(scoreEntry);
        });
        
        // If no high scores, show a message
        if (highScores.length === 0) {
            const noScores = document.createElement('div');
            noScores.className = 'no-scores';
            noScores.textContent = 'No high scores yet!';
            leaderboardContainer.appendChild(noScores);
        }
    }
    
    /**
     * Show level complete screen with stats
     * @param {Object} stats - Level completion statistics
     */
    showLevelComplete(stats) {
        // Update level complete screen with stats
        document.getElementById('level-complete-name').textContent = stats.levelName;
        document.getElementById('level-complete-score').textContent = stats.score.toString().padStart(6, '0');
        document.getElementById('level-complete-time').textContent = Math.floor(stats.timeLeft).toString().padStart(3, '0');
        document.getElementById('level-complete-coins').textContent = stats.coins;
        
        // Calculate time bonus
        const timeBonus = Math.floor(stats.timeLeft) * 10;
        document.getElementById('level-complete-time-bonus').textContent = timeBonus.toString().padStart(6, '0');
        
        // Calculate coin bonus
        const coinBonus = stats.coins * 100;
        document.getElementById('level-complete-coin-bonus').textContent = coinBonus.toString().padStart(6, '0');
        
        // Calculate total score
        const totalScore = stats.score + timeBonus + coinBonus;
        document.getElementById('level-complete-total').textContent = totalScore.toString().padStart(6, '0');
        
        // Show or hide next level button
        if (stats.isLastLevel) {
            this.elements.nextLevelButton.classList.add('hidden');
        } else {
            this.elements.nextLevelButton.classList.remove('hidden');
        }
        
        // Show level complete screen
        this.showScreen('levelComplete');
    }
    
    /**
     * Show game complete screen with stats
     * @param {Object} stats - Game completion statistics
     */
    showGameComplete(stats) {
        // Update game complete screen with stats
        document.getElementById('game-complete-score').textContent = stats.totalScore.toString().padStart(6, '0');
        document.getElementById('game-complete-time').textContent = Math.floor(stats.totalTime / 60) + ':' + (stats.totalTime % 60).toString().padStart(2, '0');
        document.getElementById('game-complete-coins').textContent = stats.totalCoins;
        document.getElementById('game-complete-deaths').textContent = stats.totalDeaths;
        
        // Show name input for high score
        const nameInput = document.getElementById('high-score-name');
        nameInput.value = localStorage.getItem('playerName') || 'PLAYER';
        
        // Show game complete screen
        this.showScreen('gameComplete');
    }
    
    /**
     * Show game over screen
     */
    showGameOver() {
        this.showScreen('gameOver');
    }
    
    /**
     * Set touch controls visibility
     * @param {boolean} visible - Whether touch controls should be visible
     */
    setTouchControlsVisible(visible) {
        this.touchControls = visible;
        
        if (this.activeScreen === 'hud') {
            if (visible) {
                this.elements.touchControls.classList.remove('hidden');
            } else {
                this.elements.touchControls.classList.add('hidden');
            }
        }
    }
    
    /**
     * Set theme (day/night)
     * @param {boolean} isDayTheme - Whether to use day theme
     */
    setTheme(isDayTheme) {
        this.dayTheme = isDayTheme;
        
        // Update body class for CSS theme
        if (isDayTheme) {
            document.body.classList.remove('night-theme');
            document.body.classList.add('day-theme');
        } else {
            document.body.classList.remove('day-theme');
            document.body.classList.add('night-theme');
        }
    }
    
    /**
     * Handle start game button click
     */
    onStartGame() {
        // Start the first level
        this.game.gameManager.startGame();
        
        // Show HUD
        this.showScreen('hud');
        
        // Play game start sound
        this.game.audioManager.playSound('sfx-start');
    }
    
    /**
     * Handle back button click
     */
    onBackButton() {
        // Go back to start menu
        this.showScreen('start');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle resume game button click
     */
    onResumeGame() {
        // Resume the game
        this.game.gameManager.resumeGame();
        
        // Show HUD
        this.showScreen('hud');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle restart level button click
     */
    onRestartLevel() {
        // Restart the current level
        this.game.gameManager.restartLevel();
        
        // Show HUD
        this.showScreen('hud');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle quit game button click
     */
    onQuitGame() {
        // Quit the game
        this.game.gameManager.quitGame();
        
        // Show start menu
        this.showScreen('start');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle continue game button click
     */
    onContinueGame() {
        // Continue to level select
        this.showScreen('levelSelect');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle next level button click
     */
    onNextLevel() {
        // Load the next level
        this.game.gameManager.loadNextLevel();
        
        // Show HUD
        this.showScreen('hud');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle level selection
     * @param {string} levelId - ID of the selected level
     */
    onSelectLevel(levelId) {
        // Load the selected level
        this.game.gameManager.loadLevel(levelId);
        
        // Show HUD
        this.showScreen('hud');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle music volume change
     * @param {number} value - New music volume (0-100)
     */
    onMusicVolumeChange(value) {
        // Update music volume
        this.game.audioManager.setMusicVolume(value / 100);
    }
    
    /**
     * Handle sound effects volume change
     * @param {number} value - New SFX volume (0-100)
     */
    onSfxVolumeChange(value) {
        // Update SFX volume
        this.game.audioManager.setSfxVolume(value / 100);
        
        // Play a sound to preview volume
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle theme toggle
     * @param {boolean} isNightTheme - Whether night theme is selected
     */
    onThemeToggle(isNightTheme) {
        // Update theme
        this.setTheme(!isNightTheme);
        
        // Save theme preference
        this.game.gameManager.saveSettings({ dayTheme: !isNightTheme });
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
    
    /**
     * Handle touch left button
     * @param {boolean} isPressed - Whether button is pressed
     */
    onTouchLeft(isPressed) {
        this.game.inputManager.setTouchInput('left', isPressed);
    }
    
    /**
     * Handle touch right button
     * @param {boolean} isPressed - Whether button is pressed
     */
    onTouchRight(isPressed) {
        this.game.inputManager.setTouchInput('right', isPressed);
    }
    
    /**
     * Handle touch jump button
     * @param {boolean} isPressed - Whether button is pressed
     */
    onTouchJump(isPressed) {
        this.game.inputManager.setTouchInput('jump', isPressed);
    }
    
    /**
     * Handle touch action button
     * @param {boolean} isPressed - Whether button is pressed
     */
    onTouchAction(isPressed) {
        this.game.inputManager.setTouchInput('action', isPressed);
    }
    
    /**
     * Handle touch pause button
     */
    onTouchPause() {
        // Pause the game
        this.game.gameManager.pauseGame();
        
        // Show pause menu
        this.showScreen('pause');
        
        // Play menu sound
        this.game.audioManager.playSound('sfx-menu');
    }
}