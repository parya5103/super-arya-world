/**
 * Base Entity Class
 * Parent class for all game entities
 */

export class Entity {
    constructor(config) {
        // Basic properties
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.game = config.game;
        
        // Physics properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
        this.friction = config.friction || 0.8;
        this.gravity = config.gravity !== undefined ? config.gravity : true;
        this.solid = config.solid !== undefined ? config.solid : true;
        this.mass = config.mass || 1;
        this.bounciness = config.bounciness || 0;
        
        // Collision properties
        this.collider = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            offsetX: config.colliderOffsetX || 0,
            offsetY: config.colliderOffsetY || 0
        };
        this.collisionLayer = config.collisionLayer || 1;
        this.collisionMask = config.collisionMask || 1;
        
        // Visual properties
        this.sprite = config.sprite || null;
        this.animation = config.animation || null;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameDuration = config.frameDuration || 0.1; // seconds per frame
        this.flipX = config.flipX || false;
        this.flipY = config.flipY || false;
        this.opacity = config.opacity !== undefined ? config.opacity : 1;
        this.zIndex = config.zIndex || 0;
        this.visible = config.visible !== undefined ? config.visible : true;
        
        // State properties
        this.type = config.type || 'entity';
        this.active = true;
        this.tags = config.tags || [];
        this.id = config.id || `entity_${Math.floor(Math.random() * 10000)}`;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.updateCollider = this.updateCollider.bind(this);
        this.onCollision = this.onCollision.bind(this);
        this.destroy = this.destroy.bind(this);
    }
    
    /**
     * Update entity state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Apply acceleration
        this.velocityX += this.accelerationX * deltaTime;
        this.velocityY += this.accelerationY * deltaTime;
        
        // Apply gravity if enabled
        if (this.gravity) {
            this.velocityY += this.game.physics.gravity * this.mass * deltaTime;
        }
        
        // Apply friction
        this.velocityX *= this.friction;
        
        // Apply terminal velocity
        if (this.velocityX > this.game.physics.terminalVelocity) {
            this.velocityX = this.game.physics.terminalVelocity;
        } else if (this.velocityX < -this.game.physics.terminalVelocity) {
            this.velocityX = -this.game.physics.terminalVelocity;
        }
        
        if (this.velocityY > this.game.physics.terminalVelocity) {
            this.velocityY = this.game.physics.terminalVelocity;
        } else if (this.velocityY < -this.game.physics.terminalVelocity) {
            this.velocityY = -this.game.physics.terminalVelocity;
        }
        
        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Update collider position
        this.updateCollider();
        
        // Update animation
        if (this.animation) {
            this.frameTime += deltaTime;
            if (this.frameTime >= this.frameDuration) {
                this.frameTime = 0;
                this.currentFrame = (this.currentFrame + 1) % this.animation.frames.length;
            }
        }
    }
    
    /**
     * Render the entity
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        if (!this.visible) return;
        
        if (this.sprite) {
            // Render sprite
            renderer.drawSprite(this.sprite, this.x, this.y, this.width, this.height, this.flipX, this.flipY, this.opacity);
        } else if (this.animation) {
            // Render animation frame
            const frameSprite = this.animation.frames[this.currentFrame];
            renderer.drawSprite(frameSprite, this.x, this.y, this.width, this.height, this.flipX, this.flipY, this.opacity);
        } else {
            // Render default rectangle if no sprite or animation
            renderer.drawRect(this.x, this.y, this.width, this.height, 'rgba(255, 0, 0, 0.5)');
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
     * Update collider position to match entity position
     */
    updateCollider() {
        this.collider.x = this.x + this.collider.offsetX;
        this.collider.y = this.y + this.collider.offsetY;
        this.collider.width = this.width - 2 * this.collider.offsetX;
        this.collider.height = this.height - 2 * this.collider.offsetY;
    }
    
    /**
     * Handle collision with another entity
     * @param {Object} other - The entity collided with
     * @param {Object} collision - Collision data
     */
    onCollision(other, collision) {
        // Base collision response - can be overridden by subclasses
        if (this.solid && other.solid) {
            // Resolve collision
            if (collision.normal.x !== 0) {
                // Horizontal collision
                this.x += collision.overlap * collision.normal.x;
                this.velocityX = 0;
                this.accelerationX = 0;
            }
            
            if (collision.normal.y !== 0) {
                // Vertical collision
                this.y += collision.overlap * collision.normal.y;
                
                // Apply bounce if entity has bounciness
                if (this.bounciness > 0) {
                    this.velocityY = -this.velocityY * this.bounciness;
                } else {
                    this.velocityY = 0;
                }
                
                this.accelerationY = 0;
            }
            
            // Update collider after position change
            this.updateCollider();
        }
    }
    
    /**
     * Destroy the entity
     */
    destroy() {
        this.active = false;
        this.game.entityManager.removeEntity(this);
    }
}