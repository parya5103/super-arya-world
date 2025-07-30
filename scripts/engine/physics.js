/**
 * Physics
 * Handles physics simulation, collision detection, and resolution
 */

export class Physics {
    constructor(config) {
        // Physics configuration
        this.gravity = config.gravity || 0.5;
        this.friction = config.friction || 0.8;
        this.terminalVelocity = config.terminalVelocity || 10;
        
        // Collision groups
        this.colliders = [];
        this.staticColliders = [];
        this.dynamicColliders = [];
        
        // Collision layers and masks
        this.layers = {
            DEFAULT: 0x0001,
            PLAYER: 0x0002,
            ENEMY: 0x0004,
            PLATFORM: 0x0008,
            ITEM: 0x0010,
            PROJECTILE: 0x0020,
            TRIGGER: 0x0040,
            HAZARD: 0x0080
        };
        
        // Bind methods
        this.update = this.update.bind(this);
        this.addCollider = this.addCollider.bind(this);
        this.removeCollider = this.removeCollider.bind(this);
        this.checkCollision = this.checkCollision.bind(this);
        this.resolveCollision = this.resolveCollision.bind(this);
        this.applyGravity = this.applyGravity.bind(this);
        this.applyFriction = this.applyFriction.bind(this);
        this.raycast = this.raycast.bind(this);
    }
    
    /**
     * Update physics for all entities
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update dynamic colliders
        for (const collider of this.dynamicColliders) {
            // Skip inactive colliders
            if (!collider.active) continue;
            
            // Store previous position
            collider.prevX = collider.x;
            collider.prevY = collider.y;
            
            // Apply gravity if entity is affected by gravity
            if (collider.affectedByGravity) {
                this.applyGravity(collider, deltaTime);
            }
            
            // Apply friction if entity is on ground
            if (collider.onGround) {
                this.applyFriction(collider, deltaTime);
            }
            
            // Update position based on velocity
            collider.x += collider.velocityX * deltaTime;
            collider.y += collider.velocityY * deltaTime;
            
            // Check for collisions with static colliders
            for (const staticCollider of this.staticColliders) {
                // Skip inactive colliders
                if (!staticCollider.active) continue;
                
                // Skip if layers don't match
                if (!(collider.collisionMask & staticCollider.collisionLayer)) continue;
                
                // Check for collision
                if (this.checkCollision(collider, staticCollider)) {
                    // Resolve collision
                    this.resolveCollision(collider, staticCollider);
                    
                    // Trigger collision callbacks
                    if (collider.onCollision) {
                        collider.onCollision(staticCollider);
                    }
                    
                    if (staticCollider.onCollision) {
                        staticCollider.onCollision(collider);
                    }
                }
            }
            
            // Check for collisions with other dynamic colliders
            for (const otherCollider of this.dynamicColliders) {
                // Skip self or inactive colliders
                if (collider === otherCollider || !otherCollider.active) continue;
                
                // Skip if layers don't match
                if (!(collider.collisionMask & otherCollider.collisionLayer)) continue;
                
                // Check for collision
                if (this.checkCollision(collider, otherCollider)) {
                    // Resolve collision
                    this.resolveCollision(collider, otherCollider);
                    
                    // Trigger collision callbacks
                    if (collider.onCollision) {
                        collider.onCollision(otherCollider);
                    }
                    
                    if (otherCollider.onCollision) {
                        otherCollider.onCollision(collider);
                    }
                }
            }
            
            // Update ground state
            collider.onGround = false;
            
            // Check if entity is on ground
            for (const staticCollider of this.staticColliders) {
                // Skip inactive colliders
                if (!staticCollider.active) continue;
                
                // Skip if layers don't match
                if (!(collider.collisionMask & staticCollider.collisionLayer)) continue;
                
                // Check if entity is standing on this collider
                if (this.checkGrounded(collider, staticCollider)) {
                    collider.onGround = true;
                    break;
                }
            }
        }
    }
    
    /**
     * Add a collider to the physics system
     * @param {Object} collider - The collider to add
     */
    addCollider(collider) {
        // Set default properties if not defined
        collider.velocityX = collider.velocityX || 0;
        collider.velocityY = collider.velocityY || 0;
        collider.affectedByGravity = collider.affectedByGravity !== undefined ? collider.affectedByGravity : true;
        collider.isStatic = collider.isStatic !== undefined ? collider.isStatic : false;
        collider.collisionLayer = collider.collisionLayer || this.layers.DEFAULT;
        collider.collisionMask = collider.collisionMask || 0xFFFF; // Collide with everything by default
        collider.active = collider.active !== undefined ? collider.active : true;
        collider.onGround = false;
        
        // Add to appropriate collider list
        this.colliders.push(collider);
        
        if (collider.isStatic) {
            this.staticColliders.push(collider);
        } else {
            this.dynamicColliders.push(collider);
        }
        
        return collider;
    }
    
    /**
     * Remove a collider from the physics system
     * @param {Object} collider - The collider to remove
     */
    removeCollider(collider) {
        // Remove from main collider list
        const index = this.colliders.indexOf(collider);
        if (index !== -1) {
            this.colliders.splice(index, 1);
        }
        
        // Remove from appropriate collider list
        if (collider.isStatic) {
            const staticIndex = this.staticColliders.indexOf(collider);
            if (staticIndex !== -1) {
                this.staticColliders.splice(staticIndex, 1);
            }
        } else {
            const dynamicIndex = this.dynamicColliders.indexOf(collider);
            if (dynamicIndex !== -1) {
                this.dynamicColliders.splice(dynamicIndex, 1);
            }
        }
    }
    
    /**
     * Check if two colliders are intersecting
     * @param {Object} colliderA - First collider
     * @param {Object} colliderB - Second collider
     * @returns {boolean} - Whether the colliders are intersecting
     */
    checkCollision(colliderA, colliderB) {
        // AABB collision check
        return (
            colliderA.x < colliderB.x + colliderB.width &&
            colliderA.x + colliderA.width > colliderB.x &&
            colliderA.y < colliderB.y + colliderB.height &&
            colliderA.y + colliderA.height > colliderB.y
        );
    }
    
    /**
     * Resolve collision between two colliders
     * @param {Object} colliderA - First collider (dynamic)
     * @param {Object} colliderB - Second collider
     */
    resolveCollision(colliderA, colliderB) {
        // Calculate overlap on each axis
        const overlapX = Math.min(
            colliderA.x + colliderA.width - colliderB.x,
            colliderB.x + colliderB.width - colliderA.x
        );
        
        const overlapY = Math.min(
            colliderA.y + colliderA.height - colliderB.y,
            colliderB.y + colliderB.height - colliderA.y
        );
        
        // Determine which axis has the smallest overlap
        if (overlapX < overlapY) {
            // Resolve X-axis collision
            if (colliderA.x < colliderB.x) {
                colliderA.x = colliderB.x - colliderA.width;
            } else {
                colliderA.x = colliderB.x + colliderB.width;
            }
            
            // Bounce with reduced velocity
            colliderA.velocityX = -colliderA.velocityX * 0.5;
        } else {
            // Resolve Y-axis collision
            if (colliderA.y < colliderB.y) {
                colliderA.y = colliderB.y - colliderA.height;
                colliderA.onGround = true;
                colliderA.velocityY = 0;
            } else {
                colliderA.y = colliderB.y + colliderB.height;
                colliderA.velocityY = 0;
            }
        }
    }
    
    /**
     * Check if a collider is standing on another collider
     * @param {Object} collider - The collider to check
     * @param {Object} ground - The potential ground collider
     * @returns {boolean} - Whether the collider is on the ground
     */
    checkGrounded(collider, ground) {
        // Small offset for ground detection
        const groundCheckOffset = 1;
        
        // Check if collider is just above the ground and overlapping horizontally
        return (
            Math.abs(collider.y + collider.height - ground.y) <= groundCheckOffset &&
            collider.x < ground.x + ground.width &&
            collider.x + collider.width > ground.x
        );
    }
    
    /**
     * Apply gravity to a collider
     * @param {Object} collider - The collider to apply gravity to
     * @param {number} deltaTime - Time since last update in seconds
     */
    applyGravity(collider, deltaTime) {
        // Don't apply gravity if on ground and not moving upward
        if (collider.onGround && collider.velocityY >= 0) {
            collider.velocityY = 0;
            return;
        }
        
        // Apply gravity
        collider.velocityY += this.gravity * deltaTime;
        
        // Limit to terminal velocity
        if (collider.velocityY > this.terminalVelocity) {
            collider.velocityY = this.terminalVelocity;
        }
    }
    
    /**
     * Apply friction to a collider
     * @param {Object} collider - The collider to apply friction to
     * @param {number} deltaTime - Time since last update in seconds
     */
    applyFriction(collider, deltaTime) {
        // Apply friction to horizontal movement
        if (Math.abs(collider.velocityX) > 0.01) {
            collider.velocityX *= this.friction;
        } else {
            collider.velocityX = 0;
        }
    }
    
    /**
     * Perform a raycast to check for collisions along a line
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} endX - Ending X position
     * @param {number} endY - Ending Y position
     * @param {number} [collisionMask] - Collision mask for filtering
     * @returns {Object|null} - Hit information or null if no hit
     */
    raycast(startX, startY, endX, endY, collisionMask = 0xFFFF) {
        // Direction vector
        const dirX = endX - startX;
        const dirY = endY - startY;
        const distance = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Normalized direction
        const normDirX = dirX / distance;
        const normDirY = dirY / distance;
        
        // Check each collider for intersection
        let closestHit = null;
        let closestDistance = Infinity;
        
        for (const collider of this.colliders) {
            // Skip inactive colliders or those that don't match the collision mask
            if (!collider.active || !(collider.collisionLayer & collisionMask)) continue;
            
            // Check intersection with collider bounds
            const hit = this.raycastCollider(startX, startY, normDirX, normDirY, distance, collider);
            
            if (hit && hit.distance < closestDistance) {
                closestHit = hit;
                closestDistance = hit.distance;
            }
        }
        
        return closestHit;
    }
    
    /**
     * Raycast against a single collider
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} dirX - Normalized direction X
     * @param {number} dirY - Normalized direction Y
     * @param {number} maxDistance - Maximum distance to check
     * @param {Object} collider - The collider to check against
     * @returns {Object|null} - Hit information or null if no hit
     */
    raycastCollider(startX, startY, dirX, dirY, maxDistance, collider) {
        // Collider bounds
        const minX = collider.x;
        const minY = collider.y;
        const maxX = collider.x + collider.width;
        const maxY = collider.y + collider.height;
        
        // Calculate intersection with each edge of the collider
        let tMin = -Infinity;
        let tMax = Infinity;
        let hitNormalX = 0;
        let hitNormalY = 0;
        
        // Check X-axis intersection
        if (dirX !== 0) {
            const t1 = (minX - startX) / dirX;
            const t2 = (maxX - startX) / dirX;
            
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
            
            if (tMin === t1) hitNormalX = -1;
            if (tMin === t2) hitNormalX = 1;
        }
        
        // Check Y-axis intersection
        if (dirY !== 0) {
            const t1 = (minY - startY) / dirY;
            const t2 = (maxY - startY) / dirY;
            
            const tMinOld = tMin;
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
            
            if (tMin !== tMinOld) {
                hitNormalX = 0;
                if (tMin === t1) hitNormalY = -1;
                if (tMin === t2) hitNormalY = 1;
            }
        }
        
        // Check if there's a valid intersection
        if (tMax >= tMin && tMin >= 0 && tMin <= maxDistance) {
            return {
                collider,
                distance: tMin,
                point: {
                    x: startX + dirX * tMin,
                    y: startY + dirY * tMin
                },
                normal: {
                    x: hitNormalX,
                    y: hitNormalY
                }
            };
        }
        
        return null;
    }
}