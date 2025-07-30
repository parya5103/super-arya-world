/**
 * Checkpoint Entity
 * Represents a checkpoint where the player can respawn after death
 */

import { Entity } from './entity.js';

export class Checkpoint extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'checkpoint',
            collisionLayer: 4, // Collectible layer
            solid: false, // Checkpoints don't block movement
            gravity: false, // Checkpoints don't fall
            width: 32,
            height: 64,
            zIndex: 6 // Render above platforms but below player
        });
        
        // Checkpoint-specific properties
        this.id = config.id || 'checkpoint';
        this.activated = false;
        this.activationTime = 0;
        this.flagRaiseProgress = 0;
        this.flagRaiseSpeed = 1; // Speed of flag raising animation
        
        // Set up animations
        this.setupAnimations();
    }
    
    /**
     * Set up checkpoint animations
     */
    setupAnimations() {
        this.animations = {
            inactive: {
                frames: ['checkpoint_inactive'],
                frameDuration: 0.1
            },
            activating: {
                frames: ['checkpoint_activating_1', 'checkpoint_activating_2'],
                frameDuration: 0.2
            },
            active: {
                frames: ['checkpoint_active_1', 'checkpoint_active_2'],
                frameDuration: 0.3
            }
        };
        
        // Set initial animation
        this.setAnimation('inactive');
    }
    
    /**
     * Set checkpoint animation
     * @param {string} animationName - Name of the animation to set
     */
    setAnimation(animationName) {
        if (!this.animations || !this.animations[animationName]) {
            return;
        }
        
        const animation = this.animations[animationName];
        
        // Set animation
        this.animation = {
            frames: animation.frames.map(frame => this.game.assetLoader.getImage(frame)),
            frameDuration: animation.frameDuration
        };
        
        // Reset animation frame
        this.currentFrame = 0;
        this.frameTime = 0;
    }
    
    /**
     * Update checkpoint state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Handle activation animation
        if (this.activated && this.flagRaiseProgress < 1) {
            this.activationTime += deltaTime;
            
            // Raise flag animation
            this.flagRaiseProgress = Math.min(1, this.flagRaiseProgress + this.flagRaiseSpeed * deltaTime);
            
            // Switch to active animation when flag is fully raised
            if (this.flagRaiseProgress >= 1 && this.animation !== this.animations.active) {
                this.setAnimation('active');
            }
        }
        
        // Call parent update for animation
        super.update(deltaTime);
    }
    
    /**
     * Activate the checkpoint
     */
    activate() {
        if (this.activated) return;
        
        this.activated = true;
        this.setAnimation('activating');
        
        // Play checkpoint activation sound
        this.game.audioManager.playSound('sfx-checkpoint');
        
        // Create activation effect
        this.createActivationEffect();
    }
    
    /**
     * Create particle effect when checkpoint is activated
     */
    createActivationEffect() {
        // Use particle system to create activation effect
        this.game.particleSystem.createEffect(
            'checkpointActivate',
            this.x + this.width / 2,
            this.y + this.height / 4
        );
    }
    
    /**
     * Render the checkpoint
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Render pole
        renderer.drawRect(
            this.x + this.width / 2 - 2,
            this.y,
            4,
            this.height,
            '#8B4513' // Brown pole
        );
        
        // Render flag at appropriate height based on raise progress
        if (this.activated) {
            const flagHeight = this.height * 0.3;
            const flagY = this.y + this.height * (1 - this.flagRaiseProgress) - flagHeight;
            
            renderer.drawRect(
                this.x + this.width / 2,
                flagY,
                this.width / 2,
                flagHeight,
                this.activated ? '#00FF00' : '#FF0000' // Green if activated, red if not
            );
        }
        
        // Call parent render method for animation
        super.render(renderer);
    }
}