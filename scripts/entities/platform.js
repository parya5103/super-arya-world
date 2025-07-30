/**
 * Platform Entity
 * Represents static and moving platforms in the game
 */

import { Entity } from './entity.js';

export class Platform extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'platform',
            collisionLayer: 1, // Terrain layer
            solid: true,
            gravity: false,
            zIndex: 5 // Render below player but above background
        });
        
        // Platform-specific properties
        this.isMoving = config.isMoving || false;
        this.moveSpeed = config.moveSpeed || 50;
        this.moveDistance = config.moveDistance || 100;
        this.moveDirection = config.moveDirection || 'horizontal'; // horizontal or vertical
        this.initialX = this.x;
        this.initialY = this.y;
        this.movementProgress = 0;
        this.movingForward = true;
        
        // Tileset image and tile ID for rendering
        this.tilesetImage = config.tilesetImage || null;
        this.tileId = config.tileId || null;
        
        // Set sprite based on tileset if available
        if (this.tilesetImage && this.tileId !== null) {
            this.sprite = this.tilesetImage;
        }
    }
    
    /**
     * Update platform state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Handle moving platforms
        if (this.isMoving) {
            this.updateMovement(deltaTime);
        }
        
        // Call parent update method
        super.update(deltaTime);
    }
    
    /**
     * Update platform movement
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateMovement(deltaTime) {
        // Calculate movement based on sine wave for smooth back-and-forth
        this.movementProgress += deltaTime * this.moveSpeed * 0.05;
        
        // Keep progress within 0-2π range
        if (this.movementProgress > Math.PI * 2) {
            this.movementProgress -= Math.PI * 2;
        }
        
        // Calculate position offset using sine wave
        const offset = Math.sin(this.movementProgress) * this.moveDistance;
        
        // Apply offset based on movement direction
        if (this.moveDirection === 'horizontal') {
            this.x = this.initialX + offset;
        } else if (this.moveDirection === 'vertical') {
            this.y = this.initialY + offset;
        }
        
        // Update collider position
        this.updateCollider();
        
        // Check for entities standing on this platform and move them along with it
        this.moveEntitiesOnPlatform(deltaTime);
    }
    
    /**
     * Move entities that are standing on this platform
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveEntitiesOnPlatform(deltaTime) {
        // Get all entities that might be standing on this platform
        const entities = this.game.entityManager.entities.filter(entity => {
            // Skip non-solid entities and this platform itself
            if (!entity.solid || entity === this) return false;
            
            // Check if entity is standing on this platform
            return this.isEntityOnPlatform(entity);
        });
        
        // Move entities along with the platform
        entities.forEach(entity => {
            // Calculate platform's velocity
            let platformVelocityX = 0;
            let platformVelocityY = 0;
            
            if (this.moveDirection === 'horizontal') {
                // Calculate instantaneous velocity based on position change
                platformVelocityX = (this.x - this.prevX) / deltaTime;
                this.prevX = this.x;
            } else if (this.moveDirection === 'vertical') {
                // Calculate instantaneous velocity based on position change
                platformVelocityY = (this.y - this.prevY) / deltaTime;
                this.prevY = this.y;
            }
            
            // Apply platform's velocity to the entity
            entity.x += platformVelocityX * deltaTime;
            
            // Only push entities up with platform, not down
            if (platformVelocityY < 0) {
                entity.y += platformVelocityY * deltaTime;
            }
            
            // Update entity's collider
            entity.updateCollider();
        });
    }
    
    /**
     * Check if an entity is standing on this platform
     * @param {Object} entity - Entity to check
     * @returns {boolean} - True if entity is standing on platform
     */
    isEntityOnPlatform(entity) {
        // Entity must be above the platform
        const entityBottom = entity.y + entity.height;
        const platformTop = this.y;
        
        // Check if entity's bottom is at or slightly above platform's top
        const verticalMatch = Math.abs(entityBottom - platformTop) < 5;
        
        // Check horizontal overlap
        const horizontalOverlap = entity.x + entity.width > this.x && 
                                entity.x < this.x + this.width;
        
        return verticalMatch && horizontalOverlap;
    }
    
    /**
     * Render the platform
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        if (this.tilesetImage && this.tileId !== null) {
            // Render from tileset
            renderer.drawTile(
                this.tilesetImage,
                this.tileId,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Render default rectangle if no tileset
            renderer.drawRect(
                this.x,
                this.y,
                this.width,
                this.height,
                '#8B4513' // Brown color for platforms
            );
        }
        
        // Render collider in debug mode
        if (this.game.debug) {
            renderer.drawRect(
                this.collider.x,
                this.collider.y,
                this.collider.width,
                this.collider.height,
                'rgba(0, 255, 0, 0.3)'
            );
        }
    }
    
    /**
     * Initialize platform
     * Store initial position for movement calculations
     */
    init() {
        this.prevX = this.x;
        this.prevY = this.y;
    }
}