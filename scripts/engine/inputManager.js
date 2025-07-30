/**
 * Input Manager
 * Handles keyboard and touch input for the game
 */

export class InputManager {
    constructor() {
        // Input state
        this.keys = {};
        this.touches = {};
        this.gamepadState = {};
        
        // Input configuration
        this.keyMap = {
            // Movement
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'jump',
            'Space': 'jump',
            
            // Actions
            'z': 'action1',
            'x': 'action2',
            'Z': 'action1',
            'X': 'action2',
            
            // Game control
            'p': 'pause',
            'P': 'pause',
            'Escape': 'pause',
            'm': 'mute',
            'M': 'mute'
        };
        
        // Touch controls
        this.touchControls = {
            leftBtn: null,
            rightBtn: null,
            jumpBtn: null,
            actionBtn: null
        };
        
        // Input mode
        this.inputMode = 'keyboard'; // 'keyboard' or 'touch'
        
        // Cheat code sequence
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.konamiSequence = [];
        this.onKonamiCode = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleGamepadConnected = this.handleGamepadConnected.bind(this);
        this.handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);
        this.updateGamepadState = this.updateGamepadState.bind(this);
        this.isPressed = this.isPressed.bind(this);
        this.toggleInputMode = this.toggleInputMode.bind(this);
    }
    
    /**
     * Initialize the input manager
     */
    init() {
        console.log('Initializing Input Manager...');
        
        // Set up keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Set up touch event listeners
        window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        
        // Set up gamepad event listeners
        window.addEventListener('gamepadconnected', this.handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        
        // Get touch control elements
        this.touchControls.leftBtn = document.getElementById('left-btn');
        this.touchControls.rightBtn = document.getElementById('right-btn');
        this.touchControls.jumpBtn = document.getElementById('jump-btn');
        this.touchControls.actionBtn = document.getElementById('action-btn');
        
        // Add touch event listeners to touch control buttons
        if (this.touchControls.leftBtn) {
            this.touchControls.leftBtn.addEventListener('touchstart', () => this.keys['left'] = true);
            this.touchControls.leftBtn.addEventListener('touchend', () => this.keys['left'] = false);
        }
        
        if (this.touchControls.rightBtn) {
            this.touchControls.rightBtn.addEventListener('touchstart', () => this.keys['right'] = true);
            this.touchControls.rightBtn.addEventListener('touchend', () => this.keys['right'] = false);
        }
        
        if (this.touchControls.jumpBtn) {
            this.touchControls.jumpBtn.addEventListener('touchstart', () => this.keys['jump'] = true);
            this.touchControls.jumpBtn.addEventListener('touchend', () => this.keys['jump'] = false);
        }
        
        if (this.touchControls.actionBtn) {
            this.touchControls.actionBtn.addEventListener('touchstart', () => this.keys['action1'] = true);
            this.touchControls.actionBtn.addEventListener('touchend', () => this.keys['action1'] = false);
        }
        
        // Set up input mode toggle button
        const controlsToggleBtn = document.getElementById('controls-toggle');
        if (controlsToggleBtn) {
            controlsToggleBtn.addEventListener('click', this.toggleInputMode);
        }
        
        // Detect initial input mode based on device
        this.detectInputMode();
    }
    
    /**
     * Detect the initial input mode based on the device
     */
    detectInputMode() {
        // Check if device is likely a mobile/touch device
        const isTouchDevice = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             navigator.msMaxTouchPoints > 0;
        
        if (isTouchDevice) {
            this.setInputMode('touch');
        } else {
            this.setInputMode('keyboard');
        }
    }
    
    /**
     * Set the input mode
     * @param {string} mode - 'keyboard' or 'touch'
     */
    setInputMode(mode) {
        this.inputMode = mode;
        
        // Show/hide touch controls based on mode
        const touchControls = document.getElementById('touch-controls');
        if (touchControls) {
            if (mode === 'touch') {
                touchControls.classList.remove('hidden');
            } else {
                touchControls.classList.add('hidden');
            }
        }
        
        // Update controls toggle button text if it exists
        const controlsToggleBtn = document.getElementById('controls-toggle');
        if (controlsToggleBtn) {
            controlsToggleBtn.textContent = mode === 'keyboard' ? 'Keyboard' : 'Touch';
        }
        
        console.log(`Input mode set to: ${mode}`);
    }
    
    /**
     * Toggle between keyboard and touch input modes
     */
    toggleInputMode() {
        const newMode = this.inputMode === 'keyboard' ? 'touch' : 'keyboard';
        this.setInputMode(newMode);
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keydown event
     */
    handleKeyDown(event) {
        const key = event.code || event.key;
        
        // Map the key to an action if defined in keyMap
        if (this.keyMap[key]) {
            this.keys[this.keyMap[key]] = true;
            
            // Prevent default for game control keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key)) {
                event.preventDefault();
            }
        }
        
        // Check for Konami code
        this.checkKonamiCode(key);
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - The keyup event
     */
    handleKeyUp(event) {
        const key = event.code || event.key;
        
        // Map the key to an action if defined in keyMap
        if (this.keyMap[key]) {
            this.keys[this.keyMap[key]] = false;
            
            // Prevent default for game control keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key)) {
                event.preventDefault();
            }
        }
    }
    
    /**
     * Handle touchstart events
     * @param {TouchEvent} event - The touchstart event
     */
    handleTouchStart(event) {
        // Set input mode to touch if not already
        if (this.inputMode !== 'touch') {
            this.setInputMode('touch');
        }
        
        // Store touch positions
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY
            };
        }
    }
    
    /**
     * Handle touchend events
     * @param {TouchEvent} event - The touchend event
     */
    handleTouchEnd(event) {
        // Remove ended touches
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            delete this.touches[touch.identifier];
        }
    }
    
    /**
     * Handle touchmove events
     * @param {TouchEvent} event - The touchmove event
     */
    handleTouchMove(event) {
        // Update touch positions
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier] = {
                    x: touch.clientX,
                    y: touch.clientY
                };
            }
        }
    }
    
    /**
     * Handle gamepad connected event
     * @param {GamepadEvent} event - The gamepad event
     */
    handleGamepadConnected(event) {
        console.log(`Gamepad connected: ${event.gamepad.id}`);
        this.gamepadState[event.gamepad.index] = event.gamepad;
    }
    
    /**
     * Handle gamepad disconnected event
     * @param {GamepadEvent} event - The gamepad event
     */
    handleGamepadDisconnected(event) {
        console.log(`Gamepad disconnected: ${event.gamepad.id}`);
        delete this.gamepadState[event.gamepad.index];
    }
    
    /**
     * Update gamepad state
     * Called each frame to update gamepad input
     */
    updateGamepadState() {
        // Get all connected gamepads
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        
        // Update state for each connected gamepad
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            
            if (gamepad) {
                // Map gamepad buttons to actions
                this.keys['left'] = this.keys['left'] || gamepad.buttons[14].pressed || (gamepad.axes[0] < -0.5);
                this.keys['right'] = this.keys['right'] || gamepad.buttons[15].pressed || (gamepad.axes[0] > 0.5);
                this.keys['jump'] = this.keys['jump'] || gamepad.buttons[0].pressed || gamepad.buttons[12].pressed;
                this.keys['action1'] = this.keys['action1'] || gamepad.buttons[1].pressed;
                this.keys['action2'] = this.keys['action2'] || gamepad.buttons[2].pressed;
                this.keys['pause'] = this.keys['pause'] || gamepad.buttons[9].pressed;
            }
        }
    }
    
    /**
     * Check if a key/action is currently pressed
     * @param {string} action - The action to check
     * @returns {boolean} - Whether the action is currently active
     */
    isPressed(action) {
        return this.keys[action] === true;
    }
    
    /**
     * Get the horizontal input axis (-1 to 1)
     * @returns {number} - The horizontal axis value
     */
    getHorizontalAxis() {
        let value = 0;
        if (this.isPressed('left')) value -= 1;
        if (this.isPressed('right')) value += 1;
        return value;
    }
    
    /**
     * Get the vertical input axis (-1 to 1)
     * @returns {number} - The vertical axis value
     */
    getVerticalAxis() {
        let value = 0;
        if (this.isPressed('up')) value -= 1;
        if (this.isPressed('down')) value += 1;
        return value;
    }
    
    /**
     * Check for Konami code sequence
     * @param {string} key - The key that was pressed
     */
    checkKonamiCode(key) {
        // Add the key to the sequence
        this.konamiSequence.push(key);
        
        // Keep only the last N keys where N is the length of the Konami code
        if (this.konamiSequence.length > this.konamiCode.length) {
            this.konamiSequence.shift();
        }
        
        // Check if the sequence matches the Konami code
        const isKonamiCode = this.konamiSequence.length === this.konamiCode.length &&
            this.konamiSequence.every((k, i) => k.toLowerCase() === this.konamiCode[i].toLowerCase());
        
        // Trigger the Konami code callback if it matches
        if (isKonamiCode && this.onKonamiCode) {
            this.onKonamiCode();
            this.konamiSequence = []; // Reset the sequence
        }
    }
    
    /**
     * Update the input state
     * Called each frame to update input state
     */
    update() {
        // Update gamepad state
        this.updateGamepadState();
        
        // Reset one-shot inputs (like pause)
        if (this.keys['pause']) {
            this.keys['pause'] = false;
        }
    }
    
    /**
     * Reset all input states
     * Useful when changing game states or screens
     */
    reset() {
        // Reset all key states
        for (const key in this.keys) {
            this.keys[key] = false;
        }
        
        // Reset all touch states
        this.touches = {};
    }
}