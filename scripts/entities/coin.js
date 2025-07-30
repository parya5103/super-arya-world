/**
 * Coin Entity
 * Collectible coins that add to the player's score
 */

import { Entity } from './entity.js';

export class Coin extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'coin',
            collisionLayer: 4, // Collectible layer
            solid: false, // Coins don't block movement
            gravity: false, // Coins don't fall
            width: 16,
            height: 16,
            zIndex: 7 // Render above platforms but below player
        });
        
        // Coin-specific properties
        this.value = config.value || 1;
        this.collected = false;
        this.bobHeight = 5; // How high the coin bobs up and down
        this.bobSpeed = 2; // Speed of bobbing animation
        this.initialY = this.y;
        this.rotationSpeed = 5; // Speed of rotation animation
        this.sparkleTime = 0;
        this.sparkleInterval = 1; // Time between sparkle effects
        
        // Set up animation
        this.setupAnimation();
    }
    
    /**
     * Set up coin animation
     */
    setupAnimation() {
        this.animation = {
            frames: [
                'coin_1',
                'coin_2',
                'coin_3',
                'coin_4',
                'coin_3',
                'coin_2'
            ].map(frame => this.game.assetLoader.getImage(frame)),
            frameDuration: 0.1
        };
    }
    
    /**
     * Update coin state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Skip update if collected
        if (this.collected) return;
        
        // Bob up and down
        this.y = this.initialY + Math.sin(this.game.time * this.bobSpeed) * this.bobHeight;
        
        // Update sparkle effect timer
        this.sparkleTime += deltaTime;
        if (this.sparkleTime >= this.sparkleInterval) {
            this.sparkleTime = 0;
            this.createSparkleEffect();
        }
        
        // Call parent update for animation
        super.update(deltaTime);
    }
    
    /**
     * Create sparkle effect particles
     */
    createSparkleEffect() {
        // Only create sparkle effects occasionally
        if (Math.random() < 0.3) {
            // Use particle system to create sparkle effect
            this.game.particleSystem.createEffect(
                'coinCollect', // Reuse the coin collect effect but customize it
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                {
                    count: 1,
                    color: '#FFD700', // Gold color
                    velocity: { min: 10, max: 30 },
                    lifetime: { min: 0.5, max: 1.0 }
                }
            );
        }
    }
    
    /**
     * Collect the coin
     */
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        
        // Create collection effect
        this.createCollectionEffect();
        
        // Remove the coin
        this.destroy();
    }
    
    /**
     * Create particle effect when coin is collected
     */
    createCollectionEffect() {
        // Use particle system to create collection effect
        this.game.particleSystem.createEffect(
            'coinCollect',
            this.x + this.width / 2,
            this.y + this.height / 2
        );
        
        // Create score text that floats up
        const scoreText = this.game.entityManager.addEntity({
            type: 'floatingText',
            x: this.x,
            y: this.y,
            text: `+${this.value * 100}`,
            color: '#FFD700',
            velocityY: -50,
            lifetime: 1,
            fadeOut: true,
            game: this.game
        });
    }
    
    /**
     * Render the coin
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Skip rendering if collected
        if (this.collected) return;
        
        // Call parent render method
        super.render(renderer);
    }
}