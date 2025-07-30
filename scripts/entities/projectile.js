/**
 * Projectile Entity
 * Represents projectiles like fireballs and enemy projectiles
 */

import { Entity } from './entity.js';

export class Projectile extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'projectile',
            collisionLayer: 8, // Projectile layer
            solid: false, // Projectiles don't block movement
            gravity: config.gravity !== undefined ? config.gravity : true, // Most projectiles are affected by gravity
            width: config.width || 16,
            height: config.height || 16,
            zIndex: 8 // Render above most entities
        });
        
        // Projectile-specific properties
        this.projectileType = config.projectileType || 'fireball'; // fireball, enemyProjectile
        this.damage = config.damage || 1;
        this.owner = config.owner || null; // Who fired this projectile
        this.direction = config.direction || 1; // 1 right, -1 left
        this.speed = config.speed || 200;
        this.bounceHeight = config.bounceHeight || 150;
        this.lifetime = config.lifetime || 5; // Maximum lifetime in seconds
        this.timeAlive = 0;
        this.bounceCount = 0;
        this.maxBounces = config.maxBounces || 3;
        this.penetrating = config.penetrating || false; // Whether projectile can hit multiple targets
        this.hitEntities = []; // Track entities that have been hit (for penetrating projectiles)
        
        // Set initial velocity
        this.velocityX = this.direction * this.speed;
        
        // Set up animation based on projectile type
        this.setupAnimation();
    }
    
    /**
     * Set up animation based on projectile type
     */
    setupAnimation() {
        switch (this.projectileType) {
            case 'fireball':
                this.animation = {
                    frames: [
                        'projectile_fireball_1',
                        'projectile_fireball_2',
                        'projectile_fireball_3',
                        'projectile_fireball_4'
                    ].map(frame => this.game.assetLoader.getImage(frame)),
                    frameDuration: 0.05
                };
                break;
                
            case 'enemyProjectile':
                this.animation = {
                    frames: [
                        'projectile_enemy_1',
                        'projectile_enemy_2'
                    ].map(frame => this.game.assetLoader.getImage(frame)),
                    frameDuration: 0.1
                };
                break;
                
            case 'bossFireball':
                this.animation = {
                    frames: [
                        'projectile_boss_1',
                        'projectile_boss_2',
                        'projectile_boss_3'
                    ].map(frame => this.game.assetLoader.getImage(frame)),
                    frameDuration: 0.08
                };
                break;
        }
    }
    
    /**
     * Update projectile state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update lifetime
        this.timeAlive += deltaTime;
        if (this.timeAlive >= this.lifetime) {
            this.destroy();
            return;
        }
        
        // Create trail effect
        this.createTrailEffect(deltaTime);
        
        // Call parent update for physics and animation
        super.update(deltaTime);
    }
    
    /**
     * Create trail effect particles
     * @param {number} deltaTime - Time since last update in seconds
     */
    createTrailEffect(deltaTime) {
        // Only create trail effects occasionally
        if (Math.random() < 0.3) {
            let trailColor;
            
            switch (this.projectileType) {
                case 'fireball':
                    trailColor = '#FFA500'; // Orange
                    break;
                case 'enemyProjectile':
                    trailColor = '#800080'; // Purple
                    break;
                case 'bossFireball':
                    trailColor = '#FF0000'; // Red
                    break;
                default:
                    trailColor = '#FFFFFF'; // White
            }
            
            // Use particle system to create trail effect
            this.game.particleSystem.createEffect(
                'fireballTrail',
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                {
                    color: trailColor,
                    size: { width: this.width / 2, height: this.height / 2 },
                    lifetime: { min: 0.3, max: 0.5 }
                }
            );
        }
    }
    
    /**
     * Handle collision with terrain
     * @param {Object} collision - Collision information
     */
    onCollision(collision) {
        // Handle collision with terrain
        if (collision.other.collisionLayer === 1) { // Terrain layer
            if (collision.direction === 'bottom' && this.projectileType === 'fireball') {
                // Bounce on ground for fireballs
                this.velocityY = -this.bounceHeight;
                this.bounceCount++;
                
                // Play bounce sound
                this.game.audioManager.playSound('sfx-bounce');
                
                // Destroy after max bounces
                if (this.bounceCount >= this.maxBounces) {
                    this.explode();
                }
            } else {
                // Hit wall or ceiling, explode
                this.explode();
            }
        }
        
        // Handle collision with entities based on projectile type
        if (this.projectileType === 'fireball') {
            // Player fireballs hit enemies
            if (collision.other.type === 'enemy' && !this.hitEntities.includes(collision.other.id)) {
                collision.other.hit(this.damage, this);
                this.hitEntities.push(collision.other.id);
                
                if (!this.penetrating) {
                    this.explode();
                }
            }
        } else {
            // Enemy projectiles hit player
            if (collision.other.type === 'player' && !this.hitEntities.includes(collision.other.id)) {
                collision.other.hurt(this.damage);
                this.hitEntities.push(collision.other.id);
                this.explode();
            }
        }
    }
    
    /**
     * Explode the projectile
     */
    explode() {
        // Create explosion effect
        this.createExplosionEffect();
        
        // Play explosion sound
        switch (this.projectileType) {
            case 'fireball':
                this.game.audioManager.playSound('sfx-fireball-explode');
                break;
            case 'enemyProjectile':
            case 'bossFireball':
                this.game.audioManager.playSound('sfx-enemy-explode');
                break;
        }
        
        // Destroy the projectile
        this.destroy();
    }
    
    /**
     * Create explosion effect particles
     */
    createExplosionEffect() {
        // Determine color based on projectile type
        let explosionColor;
        switch (this.projectileType) {
            case 'fireball':
                explosionColor = '#FFA500'; // Orange
                break;
            case 'enemyProjectile':
                explosionColor = '#800080'; // Purple
                break;
            case 'bossFireball':
                explosionColor = '#FF0000'; // Red
                break;
            default:
                explosionColor = '#FFFFFF'; // White
        }
        
        // Use particle system to create explosion effect
        this.game.particleSystem.createEffect(
            'fireballExplosion',
            this.x + this.width / 2,
            this.y + this.height / 2,
            {
                color: explosionColor,
                count: 10
            }
        );
    }
}