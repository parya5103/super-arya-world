/**
 * Powerup Entity
 * Represents various powerups like mushrooms, fire flowers, and stars
 */

import { Entity } from './entity.js';

export class Powerup extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'powerup',
            collisionLayer: 4, // Collectible layer
            solid: false, // Powerups don't block movement
            gravity: true, // Powerups are affected by gravity
            width: 24,
            height: 24,
            zIndex: 7 // Render above platforms but below player
        });
        
        // Powerup-specific properties
        this.powerupType = config.powerupType || 'mushroom'; // mushroom, fire, star, 1up
        this.collected = false;
        this.moveSpeed = 50;
        this.direction = 1; // Initial direction (1 right, -1 left)
        this.emergeProgress = 0;
        this.emergeSpeed = 50; // Speed at which powerup emerges from block
        this.isEmerging = config.isEmerging || false;
        this.initialY = this.y;
        
        // Set up animation based on powerup type
        this.setupAnimation();
    }
    
    /**
     * Set up animation based on powerup type
     */
    setupAnimation() {
        switch (this.powerupType) {
            case 'mushroom':
                this.sprite = this.game.assetLoader.getImage('powerup_mushroom');
                break;
                
            case 'fire':
                this.animation = {
                    frames: [
                        'powerup_fire_1',
                        'powerup_fire_2',
                        'powerup_fire_3',
                        'powerup_fire_4'
                    ].map(frame => this.game.assetLoader.getImage(frame)),
                    frameDuration: 0.1
                };
                break;
                
            case 'star':
                this.animation = {
                    frames: [
                        'powerup_star_1',
                        'powerup_star_2',
                        'powerup_star_3',
                        'powerup_star_4'
                    ].map(frame => this.game.assetLoader.getImage(frame)),
                    frameDuration: 0.1
                };
                break;
                
            case '1up':
                this.sprite = this.game.assetLoader.getImage('powerup_1up');
                break;
        }
    }
    
    /**
     * Update powerup state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Skip update if collected
        if (this.collected) return;
        
        // Handle emerging from block
        if (this.isEmerging) {
            this.updateEmerging(deltaTime);
            return;
        }
        
        // Move horizontally
        if (this.powerupType !== 'fire') { // Fire flowers don't move
            this.velocityX = this.direction * this.moveSpeed;
        } else {
            this.velocityX = 0;
        }
        
        // Special behavior for star powerup - bouncy
        if (this.powerupType === 'star') {
            // If on ground, bounce
            if (this.canJump) {
                this.velocityY = -300;
                this.canJump = false;
            }
        }
        
        // Check for obstacles or edges
        this.checkForObstacles();
        
        // Call parent update for physics and animation
        super.update(deltaTime);
    }
    
    /**
     * Update emerging animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateEmerging(deltaTime) {
        // Move upward until fully emerged
        this.emergeProgress += this.emergeSpeed * deltaTime;
        
        if (this.emergeProgress >= this.height) {
            // Fully emerged
            this.isEmerging = false;
            this.y = this.initialY - this.height;
            
            // Start moving for mushrooms and stars
            if (this.powerupType === 'mushroom' || this.powerupType === 'star' || this.powerupType === '1up') {
                this.velocityX = this.direction * this.moveSpeed;
            }
        } else {
            // Still emerging
            this.y = this.initialY - this.emergeProgress;
        }
        
        // Call parent update for animation only
        this.frameTime += deltaTime;
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.currentFrame = (this.currentFrame + 1) % (this.animation ? this.animation.frames.length : 1);
        }
    }
    
    /**
     * Check for obstacles or edges and change direction if needed
     */
    checkForObstacles() {
        // Check for wall in front of powerup
        const wallCheckX = this.direction > 0 ? 
            this.x + this.width + 5 : 
            this.x - 5;
        
        const wallHit = this.game.physics.raycast(
            wallCheckX,
            this.y + this.height / 2,
            this.direction,
            5,
            1 // Collision mask for terrain
        );
        
        // Check for edge in front of powerup
        const edgeCheckX = this.direction > 0 ? 
            this.x + this.width + 5 : 
            this.x - 5;
        
        const groundHit = this.game.physics.raycast(
            edgeCheckX,
            this.y + this.height + 5,
            0,
            10,
            1 // Collision mask for terrain
        );
        
        // If there's a wall ahead or no ground ahead, reverse direction
        if (wallHit || !groundHit) {
            this.direction *= -1;
        }
    }
    
    /**
     * Collect the powerup
     */
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Remove the powerup
        this.destroy();
    }
    
    /**
     * Create particle effect when powerup is collected
     */
    createCollectionEffect() {
        // Determine color based on powerup type
        let particleColor;
        switch (this.powerupType) {
            case 'mushroom':
                particleColor = '#FF0000'; // Red
                break;
            case 'fire':
                particleColor = '#FFA500'; // Orange
                break;
            case 'star':
                particleColor = '#FFFF00'; // Yellow
                break;
            case '1up':
                particleColor = '#00FF00'; // Green
                break;
            default:
                particleColor = '#FFFFFF'; // White
        }
        
        // Use particle system to create collection effect
        this.game.particleSystem.createEffect(
            'coinCollect', // Reuse the coin collect effect but customize it
            this.x + this.width / 2,
            this.y + this.height / 2,
            {
                color: particleColor,
                count: 12,
                velocity: { min: 40, max: 80 },
                lifetime: { min: 0.6, max: 0.8 }
            }
        );
    }
    
    /**
     * Render the powerup
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Skip rendering if collected
        if (this.collected) return;
        
        // Call parent render method
        super.render(renderer);
    }
}