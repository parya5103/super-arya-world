/**
 * Input Manager
 * Handles keyboard and touch input for the game
 */

export class InputManager {
    constructor(game) {
        this.game = game;
        
        // Input state
        this.keys = {};
        this.touchInputs = {
            left: false,
            right: false,
            jump: false,
            action: false
        };
        
        // Cheat code tracking
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiIndex = 0;
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Add event listeners for keyboard and touch input
     */
    addEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Prevent default behavior for game keys
        window.addEventListener('keydown', (e) => {
            // Prevent default for arrow keys, space, and other game controls
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'p', 'Escape'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Handle window blur (stop all input when window loses focus)
        window.addEventListener('blur', () => {
            this.resetInputState();
        });
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.resetInputState();
            }
        });
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        // Update key state
        this.keys[e.key] = true;
        
        // Check for pause key
        if (e.key === 'p' || e.key === 'Escape') {
            this.handlePauseKey();
        }
        
        // Check for Konami code
        this.checkKonamiCode(e.key);
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyUp(e) {
        // Update key state
        this.keys[e.key] = false;
    }
    
    /**
     * Set touch input state
     * @param {string} input - The touch input (left, right, jump, action)
     * @param {boolean} isActive - Whether the input is active
     */
    setTouchInput(input, isActive) {
        if (this.touchInputs.hasOwnProperty(input)) {
            this.touchInputs[input] = isActive;
        }
    }
    
    /**
     * Reset all input state
     */
    resetInputState() {
        // Reset keyboard state
        this.keys = {};
        
        // Reset touch state
        for (const key in this.touchInputs) {
            this.touchInputs[key] = false;
        }
    }
    
    /**
     * Handle pause key press
     */
    handlePauseKey() {
        // Only handle pause if game is active
        if (this.game.gameManager.isGameActive()) {
            if (this.game.gameManager.isPaused()) {
                // Resume game
                this.game.gameManager.resumeGame();
                this.game.uiManager.showScreen('hud');
            } else {
                // Pause game
                this.game.gameManager.pauseGame();
                this.game.uiManager.showScreen('pause');
            }
            
            // Play menu sound
            this.game.audioManager.playSound('sfx-menu');
        }
    }
    
    /**
     * Check for Konami code sequence
     * @param {string} key - The pressed key
     */
    checkKonamiCode(key) {
        // Check if the pressed key matches the next key in the sequence
        if (key === this.konamiCode[this.konamiIndex]) {
            this.konamiIndex++;
            
            // If the entire sequence is entered
            if (this.konamiIndex === this.konamiCode.length) {
                this.activateCheatMode();
                this.konamiIndex = 0; // Reset for next time
            }
        } else {
            // Reset the sequence if wrong key is pressed
            this.konamiIndex = 0;
        }
    }
    
    /**
     * Activate cheat mode
     */
    activateCheatMode() {
        // Toggle cheat mode in game manager
        this.game.gameManager.toggleCheatMode();
        
        // Play special sound
        this.game.audioManager.playSound('sfx-powerup');
        
        // Show message
        this.game.entityManager.addEntity({
            type: 'floatingText',
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height / 2,
            text: 'CHEAT MODE ' + (this.game.gameManager.isCheatModeActive() ? 'ACTIVATED!' : 'DEACTIVATED!'),
            color: '#FFD700',
            fontSize: 24,
            lifetime: 2000,
            fadeOut: true,
            growEffect: true
        });
    }
    
    /**
     * Check if left movement is active
     * @returns {boolean} Whether left movement is active
     */
    isLeftActive() {
        return this.keys['ArrowLeft'] || this.keys['a'] || this.touchInputs.left;
    }
    
    /**
     * Check if right movement is active
     * @returns {boolean} Whether right movement is active
     */
    isRightActive() {
        return this.keys['ArrowRight'] || this.keys['d'] || this.touchInputs.right;
    }
    
    /**
     * Check if jump is active
     * @returns {boolean} Whether jump is active
     */
    isJumpActive() {
        return this.keys['ArrowUp'] || this.keys['w'] || this.keys[' '] || this.touchInputs.jump;
    }
    
    /**
     * Check if action is active
     * @returns {boolean} Whether action is active
     */
    isActionActive() {
        return this.keys['z'] || this.keys['j'] || this.touchInputs.action;
    }
    
    /**
     * Check if down is active
     * @returns {boolean} Whether down is active
     */
    isDownActive() {
        return this.keys['ArrowDown'] || this.keys['s'];
    }
    
    /**
     * Check if any movement keys are active
     * @returns {boolean} Whether any movement keys are active
     */
    isAnyMovementActive() {
        return this.isLeftActive() || this.isRightActive() || this.isJumpActive() || this.isDownActive();
    }
}