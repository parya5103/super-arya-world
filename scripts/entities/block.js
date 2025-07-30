/**
 * Block Entity
 * Represents interactive blocks that can be hit from below
 */

import { Platform } from './platform.js';
import { Powerup } from './powerup.js';
import { Coin } from './coin.js';

export class Block extends Platform {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'block',
            collisionLayer: 1, // Terrain layer
            solid: true,
            gravity: false,
            zIndex: 5 // Render below player but above background
        });
        
        // Block-specific properties
        this.isHidden = config.isHidden || false;
        this.contains = config.contains || null; // Can contain powerups, coins, etc.
        this.isHit = false; // Whether the block has been hit
        this.hitAnimationTime = 0;
        this.hitAnimationDuration = 0.2; // seconds
        this.hitOffset = 0; // Vertical offset for hit animation
        this.maxHitOffset = 8; // Maximum vertical offset when hit
        
        // Bind methods
        this.hit = this.hit.bind(this);
        this.releaseContents = this.releaseContents.bind(this);
    }
    
    /**
     * Update block state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update hit animation if active
        if (this.hitAnimationTime > 0) {
            this.hitAnimationTime -= deltaTime;
            
            // Calculate hit offset using sine wave for smooth animation
            const progress = 1 - (this.hitAnimationTime / this.hitAnimationDuration);
            this.hitOffset = Math.sin(progress * Math.PI) * this.maxHitOffset;
            
            // Reset when animation completes
            if (this.hitAnimationTime <= 0) {
                this.hitOffset = 0;
                this.hitAnimationTime = 0;
            }
        }
        
        // Call parent update method
        super.update(deltaTime);
    }
    
    /**
     * Handle the block being hit from below
     */
    hit() {
        // Only respond if not already hit or if hit animation is not active
        if (!this.isHit && this.hitAnimationTime <= 0) {
            // Start hit animation
            this.hitAnimationTime = this.hitAnimationDuration;
            
            // Play hit sound
            this.game.audioManager.playSound('sfx-block-hit');
            
            // Create particle effect
            this.game.particleSystem.createEffect(
                'blockHit',
                this.x + this.width / 2,
                this.y + this.height
            );
            
            // Release contents if any
            if (this.contains) {
                this.releaseContents();
                
                // Mark as hit if it contained something
                this.isHit = true;
            }
        }
    }
    
    /**
     * Release the contents of the block
     */
    releaseContents() {
        switch (this.contains) {
            case 'coin':
                // Create coin effect
                this.game.particleSystem.createEffect(
                    'coinCollect',
                    this.x + this.width / 2,
                    this.y - 10
                );
                
                // Add coin to player's count
                this.game.gameManager.addCoin();
                
                // Play coin sound
                this.game.audioManager.playSound('sfx-coin');
                break;
                
            case 'mushroom':
            case 'fire':
            case 'star':
            case '1up':
                // Create powerup appear effect
                this.game.particleSystem.createEffect(
                    'powerupAppear',
                    this.x + this.width / 2,
                    this.y - this.height / 2
                );
                
                // Create powerup entity
                const powerup = new Powerup({
                    x: this.x,
                    y: this.y - this.height,
                    width: 32,
                    height: 32,
                    game: this.game,
                    powerupType: this.contains
                });
                
                // Add powerup to entity manager
                this.game.entityManager.addEntity(powerup);
                
                // Play powerup appear sound
                this.game.audioManager.playSound('sfx-powerup-appear');
                break;
        }
    }