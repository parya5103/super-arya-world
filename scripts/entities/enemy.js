/**
 * Enemy Entity
 * Represents various enemy types in the game
 */

import { Entity } from './entity.js';

export class Enemy extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'enemy',
            collisionLayer: 2, // Enemy layer
            collisionMask: 1 | 2, // Collide with terrain and other enemies
            zIndex: 8 // Render above platforms but below player
        });
        
        // Enemy-specific properties
        this.enemyType = config.enemyType || 'goomba';
        this.speed = config.speed || 50;
        this.direction = -1; // Initial direction (-1 left, 1 right)
        this.patrolDistance = config.patrolDistance || 100;
        this.initialX = this.x;
        this.initialY = this.y;
        this.isBoss = config.isBoss || false;
        this.health = this.isBoss ? 3 : 1;
        this.isDefeated = false;
        this.defeatTime = 0;
        this.defeatDuration = 0.5; // Time in seconds for defeat animation
        
        // AI behavior
        this.behaviorType = config.behaviorType || 'patrol';
        this.detectionRange = config.detectionRange || 200;
        this.attackCooldown = 0;
        this.attackCooldownDuration = 2; // Time in seconds between attacks
        
        // Set up animations based on enemy type
        this.setupAnimations();
    }
    
    /**
     * Set up animations based on enemy type
     */
    setupAnimations() {
        switch (this.enemyType) {
            case 'goomba':
                this.animations = {
                    walk: {
                        frames: ['enemy_goomba_1', 'enemy_goomba_2'],
                        frameDuration: 0.2
                    },
                    defeat: {
                        frames: ['enemy_goomba_defeat'],
                        frameDuration: 0.1
                    }
                };
                break;
                
            case 'koopa':
                this.animations = {
                    walk: {
                        frames: ['enemy_koopa_1', 'enemy_koopa_2'],
                        frameDuration: 0.2
                    },
                    shell: {
                        frames: ['enemy_koopa_shell'],
                        frameDuration: 0.1
                    },
                    shellMove: {
                        frames: ['enemy_koopa_shell_1', 'enemy_koopa_shell_2'],
                        frameDuration: 0.1
                    }
                };
                break;
                
            case 'piranha':
                this.animations = {
                    idle: {
                        frames: ['enemy_piranha_1', 'enemy_piranha_2'],
                        frameDuration: 0.3
                    }
                };
                // Piranha plants don't move horizontally
                this.behaviorType = 'stationary';
                break;
                
            case 'boss':
                this.animations = {
                    walk: {
                        frames: ['enemy_boss_1', 'enemy_boss_2'],
                        frameDuration: 0.3
                    },
                    attack: {
                        frames: ['enemy_boss_attack_1', 'enemy_boss_attack_2'],
                        frameDuration: 0.2
                    },
                    hurt: {
                        frames: ['enemy_boss_hurt'],
                        frameDuration: 0.1
                    }
                };
                // Boss has special behavior
                this.behaviorType = 'boss';
                break;
                
            default:
                // Default animation if type not recognized
                this.animations = {
                    walk: {
                        frames: ['enemy_default_1', 'enemy_default_2'],
                        frameDuration: 0.2
                    }
                };
        }
        
        // Set initial animation
        this.setAnimation('walk');
    }
    
    /**
     * Set enemy animation
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
     * Update enemy state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Skip update if defeated and waiting for removal
        if (this.isDefeated) {
            this.defeatTime += deltaTime;
            
            // Remove enemy after defeat animation completes
            if (this.defeatTime >= this.defeatDuration) {
                this.destroy();
            }
            
            // Call parent update for animation
            super.update(deltaTime);
            return;
        }
        
        // Update behavior based on type
        switch (this.behaviorType) {
            case 'patrol':
                this.updatePatrolBehavior(deltaTime);
                break;
                
            case 'chase':
                this.updateChaseBehavior(deltaTime);
                break;
                
            case 'stationary':
                this.updateStationaryBehavior(deltaTime);
                break;
                
            case 'shell':
                this.updateShellBehavior(deltaTime);
                break;
                
            case 'boss':
                this.updateBossBehavior(deltaTime);
                break;
        }
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Call parent update for physics and animation
        super.update(deltaTime);
    }
    
    /**
     * Update patrol behavior (move back and forth)
     * @param {number} deltaTime - Time since last update in seconds
     */
    updatePatrolBehavior(deltaTime) {
        // Move in current direction
        this.velocityX = this.direction * this.speed;
        
        // Flip sprite based on direction
        this.flipX = this.direction > 0;
        
        // Check if we've reached the patrol limit
        if (Math.abs(this.x - this.initialX) > this.patrolDistance) {
            // Reverse direction
            this.direction *= -1;
        }
        
        // Check for obstacles or edges
        this.checkForObstacles();
    }
    
    /**
     * Update chase behavior (follow player when in range)
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateChaseBehavior(deltaTime) {
        // Get player reference
        const player = this.game.gameManager.player;
        
        if (!player) return;
        
        // Calculate distance to player
        const distanceToPlayer = Math.abs(player.x - this.x);
        
        if (distanceToPlayer < this.detectionRange) {
            // Player is in detection range, chase them
            this.direction = player.x > this.x ? 1 : -1;
            this.velocityX = this.direction * this.speed;
            
            // Flip sprite based on direction
            this.flipX = this.direction > 0;
        } else {
            // Player out of range, return to patrol behavior
            this.updatePatrolBehavior(deltaTime);
        }
        
        // Check for obstacles or edges
        this.checkForObstacles();
    }
    
    /**
     * Update stationary behavior (don't move horizontally)
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateStationaryBehavior(deltaTime) {
        // Stationary enemies don't move horizontally
        this.velocityX = 0;
        
        // For piranha plants, move up and down
        if (this.enemyType === 'piranha') {
            // Simple up and down movement
            this.y = this.initialY + Math.sin(this.game.time * 2) * 20;
        }
    }
    
    /**
     * Update shell behavior (for koopa shells)
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateShellBehavior(deltaTime) {
        // Shell moves fast in the current direction
        this.velocityX = this.direction * this.speed * 3;
        
        // Check for obstacles or edges
        this.checkForObstacles();
    }
    
    /**
     * Update boss behavior
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateBossBehavior(deltaTime) {
        // Get player reference
        const player = this.game.gameManager.player;
        
        if (!player) return;
        
        // Calculate distance to player
        const distanceToPlayer = Math.abs(player.x - this.x);
        
        if (distanceToPlayer < this.detectionRange) {
            // Player is in detection range
            this.direction = player.x > this.x ? 1 : -1;
            
            // Flip sprite based on direction
            this.flipX = this.direction > 0;
            
            // Move slower than regular enemies
            this.velocityX = this.direction * (this.speed * 0.7);
            
            // Attack if cooldown is ready and player is close
            if (this.attackCooldown <= 0 && distanceToPlayer < 100) {
                this.attack();
            }
        } else {
            // Player out of range, patrol
            this.updatePatrolBehavior(deltaTime);
        }
        
        // Check for obstacles or edges
        this.checkForObstacles();
    }
    
    /**
     * Check for obstacles or edges and change direction if needed
     */
    checkForObstacles() {
        // Check for wall in front of enemy
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
        
        // Check for edge in front of enemy
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
     * Perform an attack (for boss enemies)
     */
    attack() {
        // Set attack animation
        this.setAnimation('attack');
        
        // Reset attack cooldown
        this.attackCooldown = this.attackCooldownDuration;
        
        // Create projectile or perform special attack
        if (this.enemyType === 'boss') {
            // Create fireball projectile
            const fireball = this.game.entityManager.addEntity({
                type: 'enemyProjectile',
                x: this.x + (this.direction > 0 ? this.width : 0),
                y: this.y + this.height / 3,
                width: 16,
                height: 16,
                velocityX: this.direction * 200,
                velocityY: -100,
                direction: this.direction,
                game: this.game
            });
            
            // Play attack sound
            this.game.audioManager.playSound('sfx-enemy-attack');
        }
        
        // Return to walk animation after a short delay
        setTimeout(() => {
            this.setAnimation('walk');
        }, 500);
    }
    
    /**
     * Handle enemy being defeated
     */
    defeat() {
        if (this.isDefeated) return;
        
        // Reduce health (for boss)
        if (this.isBoss) {
            this.health--;
            
            if (this.health > 0) {
                // Boss not defeated yet, just hurt
                this.setAnimation('hurt');
                
                // Play hurt sound
                this.game.audioManager.playSound('sfx-boss-hurt');
                
                // Return to walk animation after a short delay
                setTimeout(() => {
                    this.setAnimation('walk');
                }, 500);
                
                return;
            }
        }
        
        // Special handling for koopas - turn into shell
        if (this.enemyType === 'koopa' && this.behaviorType !== 'shell') {
            this.behaviorType = 'shell';
            this.setAnimation('shell');
            this.velocityX = 0;
            this.height = this.height / 2;
            this.updateCollider();
            
            // Play shell sound
            this.game.audioManager.playSound('sfx-shell');
            
            return;
        }
        
        // Mark as defeated
        this.isDefeated = true;
        this.solid = false;
        this.velocityX = 0;
        
        // Set defeat animation
        if (this.animations && this.animations.defeat) {
            this.setAnimation('defeat');
        }
        
        // Play defeat sound
        if (this.isBoss) {
            this.game.audioManager.playSound('sfx-boss-defeat');
        } else {
            this.game.audioManager.playSound('sfx-enemy-defeat');
        }
        
        // Create defeat particle effect
        this.createDefeatEffect();
    }
    
    /**
     * Create particle effect when enemy is defeated
     */
    createDefeatEffect() {
        // Use particle system to create enemy defeat effect
        this.game.particleSystem.createEffect(
            'enemyDefeat',
            this.x + this.width / 2,
            this.y + this.height / 2,
            {
                // Customize colors for different enemy types
                color: this.getEnemyColor()
            }
        );
    }
    
    /**
     * Get appropriate color for enemy type
     * @returns {string} Color hex code
     */
    getEnemyColor() {
        switch (this.enemyType) {
            case 'goomba':
                return '#8B4513'; // Brown
            case 'koopa':
                return '#228B22'; // Forest green
            case 'piranha':
                return '#FF6347'; // Tomato red
            case 'boss':
                return '#B22222'; // Firebrick red
            default:
                return '#FF6347'; // Default tomato red
        }
    }
    
    /**
     * Handle collision with another entity
     * @param {Object} other - The entity collided with
     * @param {Object} collision - Collision data
     */
    onCollision(other, collision) {
        // Call parent collision handler for basic physics response
        super.onCollision(other, collision);
        
        // Handle specific collisions based on entity type
        switch (other.type) {
            case 'fireball':
                // Player's fireball defeats enemy
                this.defeat();
                other.destroy();
                break;
                
            case 'enemy':
                // If this is a shell and moving, defeat other enemies
                if (this.enemyType === 'koopa' && 
                    this.behaviorType === 'shell' && 
                    Math.abs(this.velocityX) > 50) {
                    other.defeat();
                    
                    // Play hit sound
                    this.game.audioManager.playSound('sfx-shell-hit');
                }
                break;
        }
    }
    
    /**
     * Handle being stomped on by player
     */
    stomp() {
        // If koopa shell, activate or deactivate
        if (this.enemyType === 'koopa' && this.behaviorType === 'shell') {
            if (Math.abs(this.velocityX) < 10) {
                // Activate shell
                this.direction = this.game.gameManager.player.x > this.x ? -1 : 1;
                this.setAnimation('shellMove');
            } else {
                // Deactivate shell
                this.velocityX = 0;
                this.setAnimation('shell');
            }
        } else {
            // Regular stomp defeat
            this.defeat();
        }
    }
}