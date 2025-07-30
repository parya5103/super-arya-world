/**
 * Particle Entity
 * Represents visual effects like explosions, dust, sparkles
 */

import { Entity } from './entity.js';

export class Particle extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'particle',
            collisionLayer: 0, // No collision
            solid: false, // Particles don't block movement
            width: config.width || 4,
            height: config.height || 4,
            zIndex: 10 // Render above most entities
        });
        
        // Particle-specific properties
        this.lifetime = config.lifetime || 1; // Maximum lifetime in seconds
        this.timeAlive = 0;
        this.color = config.color || '#FFFFFF';
        this.fadeOut = config.fadeOut !== undefined ? config.fadeOut : true;
        this.fadeIn = config.fadeIn || false;
        this.fadeInDuration = config.fadeInDuration || 0.1;
        this.fadeOutDuration = config.fadeOutDuration || 0.3;
        this.growDuration = config.growDuration || 0;
        this.shrinkDuration = config.shrinkDuration || 0;
        this.initialSize = { width: this.width, height: this.height };
        this.finalSize = config.finalSize || { width: this.width, height: this.height };
        this.rotationSpeed = config.rotationSpeed || 0;
        this.rotation = config.rotation || 0;
        this.sprite = config.sprite || null;
        this.opacity = 1;
        
        // For sprite-based particles
        if (config.spriteName) {
            this.sprite = this.game.assetLoader.getImage(config.spriteName);
        }
        
        // For animated particles
        if (config.animationFrames) {
            this.animation = {
                frames: config.animationFrames.map(frame => this.game.assetLoader.getImage(frame)),
                frameDuration: config.frameDuration || 0.1
            };
        }
    }
    
    /**
     * Update particle state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update lifetime
        this.timeAlive += deltaTime;
        if (this.timeAlive >= this.lifetime) {
            this.destroy();
            return;
        }
        
        // Calculate life progress (0 to 1)
        const lifeProgress = this.timeAlive / this.lifetime;
        
        // Handle fade in
        if (this.fadeIn && lifeProgress < this.fadeInDuration / this.lifetime) {
            this.opacity = lifeProgress / (this.fadeInDuration / this.lifetime);
        }
        
        // Handle fade out
        if (this.fadeOut && lifeProgress > 1 - this.fadeOutDuration / this.lifetime) {
            this.opacity = 1 - (lifeProgress - (1 - this.fadeOutDuration / this.lifetime)) / (this.fadeOutDuration / this.lifetime);
        }
        
        // Handle grow
        if (this.growDuration > 0 && lifeProgress < this.growDuration / this.lifetime) {
            const growProgress = lifeProgress / (this.growDuration / this.lifetime);
            this.width = this.initialSize.width + (this.finalSize.width - this.initialSize.width) * growProgress;
            this.height = this.initialSize.height + (this.finalSize.height - this.initialSize.height) * growProgress;
        }
        
        // Handle shrink
        if (this.shrinkDuration > 0 && lifeProgress > 1 - this.shrinkDuration / this.lifetime) {
            const shrinkProgress = (lifeProgress - (1 - this.shrinkDuration / this.lifetime)) / (this.shrinkDuration / this.lifetime);
            this.width = this.finalSize.width - (this.finalSize.width - this.initialSize.width) * shrinkProgress;
            this.height = this.finalSize.height - (this.finalSize.height - this.initialSize.height) * shrinkProgress;
        }
        
        // Handle rotation
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed * deltaTime;
        }
        
        // Apply physics
        super.update(deltaTime);
    }
    
    /**
     * Render the particle
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Skip rendering if opacity is 0
        if (this.opacity <= 0) return;
        
        // Save context for rotation
        renderer.context.save();
        
        // Translate to center of particle for rotation
        renderer.context.translate(
            renderer.worldToScreenX(this.x + this.width / 2),
            renderer.worldToScreenY(this.y + this.height / 2)
        );
        
        // Apply rotation
        if (this.rotation !== 0) {
            renderer.context.rotate(this.rotation);
        }
        
        // Apply opacity
        renderer.context.globalAlpha = this.opacity;
        
        // Render based on type
        if (this.sprite) {
            // Render sprite
            renderer.context.drawImage(
                this.sprite,
                -this.width / 2 * renderer.scale,
                -this.height / 2 * renderer.scale,
                this.width * renderer.scale,
                this.height * renderer.scale
            );
        } else if (this.animation) {
            // Render animation frame
            const frame = this.animation.frames[this.currentFrame];
            if (frame) {
                renderer.context.drawImage(
                    frame,
                    -this.width / 2 * renderer.scale,
                    -this.height / 2 * renderer.scale,
                    this.width * renderer.scale,
                    this.height * renderer.scale
                );
            }
        } else {
            // Render colored rectangle
            renderer.context.fillStyle = this.color;
            renderer.context.fillRect(
                -this.width / 2 * renderer.scale,
                -this.height / 2 * renderer.scale,
                this.width * renderer.scale,
                this.height * renderer.scale
            );
        }
        
        // Restore context
        renderer.context.globalAlpha = 1;
        renderer.context.restore();
    }
}