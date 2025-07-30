/**
 * FloatingText Entity
 * Represents floating text for scores, messages, etc.
 */

import { Entity } from './entity.js';

export class FloatingText extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'floatingText',
            collisionLayer: 0, // No collision
            solid: false, // Text doesn't block movement
            gravity: false, // Text doesn't fall unless specified
            width: 0, // Width will be calculated based on text
            height: 0, // Height will be calculated based on text
            zIndex: 11 // Render above most entities
        });
        
        // FloatingText-specific properties
        this.text = config.text || '';
        this.font = config.font || '16px "Press Start 2P", monospace';
        this.color = config.color || '#FFFFFF';
        this.lifetime = config.lifetime || 2; // Maximum lifetime in seconds
        this.timeAlive = 0;
        this.fadeOut = config.fadeOut !== undefined ? config.fadeOut : true;
        this.fadeIn = config.fadeIn || false;
        this.fadeInDuration = config.fadeInDuration || 0.1;
        this.fadeOutDuration = config.fadeOutDuration || 0.5;
        this.growDuration = config.growDuration || 0;
        this.shrinkDuration = config.shrinkDuration || 0;
        this.initialScale = config.initialScale || 1;
        this.finalScale = config.finalScale || 1;
        this.currentScale = this.initialScale;
        this.opacity = config.fadeIn ? 0 : 1;
        this.shadow = config.shadow || false;
        this.shadowColor = config.shadowColor || '#000000';
        this.shadowBlur = config.shadowBlur || 4;
        this.outline = config.outline || false;
        this.outlineColor = config.outlineColor || '#000000';
        this.outlineWidth = config.outlineWidth || 2;
        this.textAlign = config.textAlign || 'center';
        this.followEntity = config.followEntity || null;
        this.offsetX = config.offsetX || 0;
        this.offsetY = config.offsetY || 0;
    }
    
    /**
     * Update floating text state
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
            this.currentScale = this.initialScale + (this.finalScale - this.initialScale) * growProgress;
        }
        
        // Handle shrink
        if (this.shrinkDuration > 0 && lifeProgress > 1 - this.shrinkDuration / this.lifetime) {
            const shrinkProgress = (lifeProgress - (1 - this.shrinkDuration / this.lifetime)) / (this.shrinkDuration / this.lifetime);
            this.currentScale = this.finalScale - (this.finalScale - this.initialScale) * shrinkProgress;
        }
        
        // Follow entity if specified
        if (this.followEntity && this.followEntity.active) {
            this.x = this.followEntity.x + this.offsetX;
            this.y = this.followEntity.y + this.offsetY;
        }
        
        // Apply physics
        super.update(deltaTime);
    }
    
    /**
     * Render the floating text
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Skip rendering if opacity is 0
        if (this.opacity <= 0) return;
        
        // Save context for transformations
        renderer.context.save();
        
        // Apply opacity
        renderer.context.globalAlpha = this.opacity;
        
        // Set font and text alignment
        renderer.context.font = this.font;
        renderer.context.textAlign = this.textAlign;
        renderer.context.textBaseline = 'middle';
        
        // Calculate screen position
        const screenX = renderer.worldToScreenX(this.x);
        const screenY = renderer.worldToScreenY(this.y);
        
        // Apply scale transformation
        if (this.currentScale !== 1) {
            renderer.context.translate(screenX, screenY);
            renderer.context.scale(this.currentScale, this.currentScale);
            renderer.context.translate(-screenX, -screenY);
        }
        
        // Apply shadow if enabled
        if (this.shadow) {
            renderer.context.shadowColor = this.shadowColor;
            renderer.context.shadowBlur = this.shadowBlur;
        }
        
        // Draw outline if enabled
        if (this.outline) {
            renderer.context.strokeStyle = this.outlineColor;
            renderer.context.lineWidth = this.outlineWidth;
            renderer.context.strokeText(this.text, screenX, screenY);
        }
        
        // Draw text
        renderer.context.fillStyle = this.color;
        renderer.context.fillText(this.text, screenX, screenY);
        
        // Restore context
        renderer.context.shadowBlur = 0;
        renderer.context.globalAlpha = 1;
        renderer.context.restore();
    }
}