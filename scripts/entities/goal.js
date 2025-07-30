/**
 * Goal Entity
 * Represents the end goal of a level (flag or castle)
 */

import { Entity } from './entity.js';

export class Goal extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'goal',
            collisionLayer: 4, // Collectible layer
            solid: false, // Goals don't block movement
            gravity: false, // Goals don't fall
            width: 48,
            height: 96,
            zIndex: 6 // Render above platforms but below player
        });
        
        // Goal-specific properties
        this.goalType = config.goalType || 'flag'; // flag or castle
        this.reached = false;
        this.reachedTime = 0;
        this.flagSlideProgress = 0;
        this.flagSlideSpeed = 0.5; // Speed of flag sliding animation
        this.playerSlideX = 0;
        this.playerSlideY = 0;
        
        // Set up animations
        this.setupAnimations();
    }
    
    /**
     * Set up goal animations
     */
    setupAnimations() {
        if (this.goalType === 'flag') {
            this.animations = {
                idle: {
                    frames: ['goal_flag_1', 'goal_flag_2', 'goal_flag_3', 'goal_flag_2'],
                    frameDuration: 0.2
                },
                reached: {
                    frames: ['goal_flag_reached'],
                    frameDuration: 0.1
                }
            };
        } else { // castle
            this.animations = {
                idle: {
                    frames: ['goal_castle'],
                    frameDuration: 0.1
                },
                reached: {
                    frames: ['goal_castle_flag'],
                    frameDuration: 0.1
                }
            };
        }
        
        // Set initial animation
        this.setAnimation('idle');
    }
    
    /**
     * Set goal animation
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
     * Update goal state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Handle flag slide animation for flag type
        if (this.reached && this.goalType === 'flag') {
            this.reachedTime += deltaTime;
            
            // Slide flag down animation
            if (this.flagSlideProgress < 1) {
                this.flagSlideProgress = Math.min(1, this.flagSlideProgress + this.flagSlideSpeed * deltaTime);
            }
        }
        
        // Call parent update for animation
        super.update(deltaTime);
    }
    
    /**
     * Reach the goal
     * @param {Object} player - Player entity that reached the goal
     */
    reach(player) {
        if (this.reached) return;
        
        this.reached = true;
        this.setAnimation('reached');
        
        // Store player position for flag slide animation
        if (this.goalType === 'flag') {
            this.playerSlideX = player.x;
            this.playerSlideY = player.y;
            
            // Disable player controls
            player.disableControls = true;
            player.velocityX = 0;
            player.velocityY = 0;
        }
        
        // Play goal reached sound
        this.game.audioManager.playSound('sfx-goal');
        
        // Create goal reached effect
        this.createReachedEffect();
        
        // Notify game manager that level is complete
        setTimeout(() => {
            this.game.gameManager.levelComplete();
        }, 3000); // Wait 3 seconds before completing level
    }
    
    /**
     * Create particle effect when goal is reached
     */
    createReachedEffect() {
        // Use particle system to create goal reached effect
        this.game.particleSystem.createEffect(
            'goalReached',
            this.x + this.width / 2,
            this.goalType === 'flag' ? this.y + this.height * 0.2 : this.y + this.height * 0.7
        );
        
        // Create fireworks effect for castle
        if (this.goalType === 'castle') {
            this.createFireworks();
        }
    }
    
    /**
     * Create fireworks effect for castle goal
     */
    createFireworks() {
        // Create multiple fireworks with delay
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = this.x + Math.random() * this.width * 3 - this.width;
                const y = this.y - this.height - Math.random() * 100;
                
                // Use particle system to create firework effect
                this.game.particleSystem.createEffect('firework', x, y);
                
                // Play firework sound
                this.game.audioManager.playSound('sfx-firework');
                
            }, i * 500); // Stagger fireworks every 0.5 seconds
        }
    }
    
    /**
     * Render the goal
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        if (this.goalType === 'flag') {
            // Render pole
            renderer.drawRect(
                this.x + this.width / 2 - 3,
                this.y,
                6,
                this.height,
                '#8B4513' // Brown pole
            );
            
            // Render flag at appropriate height based on slide progress
            if (this.reached) {
                const flagY = this.y + this.height * this.flagSlideProgress;
                
                // Draw flag
                renderer.drawRect(
                    this.x + this.width / 2,
                    flagY - this.height * 0.2,
                    this.width / 2,
                    this.height * 0.2,
                    '#FF0000' // Red flag
                );
                
                // Draw player sliding down if in flag slide animation
                if (this.flagSlideProgress < 1) {
                    const player = this.game.entityManager.getEntitiesByType('player')[0];
                    if (player) {
                        player.x = this.x + this.width / 2 - player.width / 2;
                        player.y = flagY - player.height;
                    }
                }
            }
        }
        
        // Call parent render method for animation
        super.render(renderer);
    }
}