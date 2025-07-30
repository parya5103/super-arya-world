/**
 * Player Entity
 * The main character controlled by the player
 */

import { Entity } from './entity.js';

export class Player extends Entity {
    constructor(config) {
        // Call parent constructor with extended config
        super({
            ...config,
            type: 'player',
            collisionLayer: 1,
            collisionMask: 1 | 2 | 4, // Collide with terrain, enemies, and collectibles
            width: 32,
            height: 64,
            friction: 0.85,
            colliderOffsetX: 4,
            colliderOffsetY: 2,
            zIndex: 10 // Player should be rendered above most entities
        });
        
        // Player-specific properties
        this.moveSpeed = 200;
        this.jumpForce = 500;
        this.maxJumpTime = 0.3; // Maximum time in seconds that jump can be held
        this.currentJumpTime = 0;
        this.isJumping = false;
        this.canJump = false;
        this.direction = 1; // 1 for right, -1 for left
        this.state = 'idle'; // idle, running, jumping, falling, ducking, growing, shrinking, dead
        
        // Power-up state
        this.powerupState = 'small'; // small, big, fire, invincible
        this.invincibilityTime = 0;
        this.invincibilityDuration = 10; // seconds of invincibility from star
        this.hurtInvincibilityTime = 0;
        this.hurtInvincibilityDuration = 2; // seconds of invincibility after being hurt
        this.isInvincible = false;
        this.isBlinking = false;
        this.blinkTime = 0;
        this.blinkInterval = 0.1; // seconds between blinks
        
        // Animation states
        this.animations = {
            small: {
                idle: {
                    frames: ['player_small_idle'],
                    frameDuration: 0.1
                },
                running: {
                    frames: ['player_small_run_1', 'player_small_run_2', 'player_small_run_3'],
                    frameDuration: 0.1
                },
                jumping: {
                    frames: ['player_small_jump'],
                    frameDuration: 0.1
                },
                falling: {
                    frames: ['player_small_fall'],
                    frameDuration: 0.1
                },
                ducking: {
                    frames: ['player_small_duck'],
                    frameDuration: 0.1
                },
                dead: {
                    frames: ['player_small_dead'],
                    frameDuration: 0.1
                }
            },
            big: {
                idle: {
                    frames: ['player_big_idle'],
                    frameDuration: 0.1
                },
                running: {
                    frames: ['player_big_run_1', 'player_big_run_2', 'player_big_run_3'],
                    frameDuration: 0.1
                },
                jumping: {
                    frames: ['player_big_jump'],
                    frameDuration: 0.1
                },
                falling: {
                    frames: ['player_big_fall'],
                    frameDuration: 0.1
                },
                ducking: {
                    frames: ['player_big_duck'],
                    frameDuration: 0.1
                }
            },
            fire: {
                idle: {
                    frames: ['player_fire_idle'],
                    frameDuration: 0.1
                },
                running: {
                    frames: ['player_fire_run_1', 'player_fire_run_2', 'player_fire_run_3'],
                    frameDuration: 0.1
                },
                jumping: {
                    frames: ['player_fire_jump'],
                    frameDuration: 0.1
                },
                falling: {
                    frames: ['player_fire_fall'],
                    frameDuration: 0.1
                },
                ducking: {
                    frames: ['player_fire_duck'],
                    frameDuration: 0.1
                },
                shooting: {
                    frames: ['player_fire_shoot'],
                    frameDuration: 0.1
                }
            }
        };
        
        // Set initial animation
        this.setAnimation('idle');
        
        // Bind additional methods
        this.handleInput = this.handleInput.bind(this);
        this.jump = this.jump.bind(this);
        this.stopJump = this.stopJump.bind(this);
        this.duck = this.duck.bind(this);
        this.stopDuck = this.stopDuck.bind(this);
        this.shoot = this.shoot.bind(this);
        this.getPowerup = this.getPowerup.bind(this);
        this.getHurt = this.getHurt.bind(this);
        this.die = this.die.bind(this);
        this.setAnimation = this.setAnimation.bind(this);
        this.updateState = this.updateState.bind(this);
    }
    
    /**
     * Update player state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Handle player input
        this.handleInput(deltaTime);
        
        // Update player state based on physics
        this.updateState();
        
        // Update invincibility timers
        if (this.invincibilityTime > 0) {
            this.invincibilityTime -= deltaTime;
            this.isInvincible = true;
            
            // Blink effect
            this.blinkTime += deltaTime;
            if (this.blinkTime >= this.blinkInterval) {
                this.blinkTime = 0;
                this.isBlinking = !this.isBlinking;
            }
            
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
                this.isBlinking = false;
                
                // If this was a star powerup, revert to previous state
                if (this.powerupState === 'invincible') {
                    this.powerupState = 'big'; // Default to big after star
                }
            }
        }
        
        // Update hurt invincibility timer
        if (this.hurtInvincibilityTime > 0) {
            this.hurtInvincibilityTime -= deltaTime;
            
            // Blink effect
            this.blinkTime += deltaTime;
            if (this.blinkTime >= this.blinkInterval) {
                this.blinkTime = 0;
                this.isBlinking = !this.isBlinking;
            }
            
            if (this.hurtInvincibilityTime <= 0) {
                this.isBlinking = false;
            }
        }
        
        // Call parent update method for physics and animation
        super.update(deltaTime);
    }
    
    /**
     * Handle player input
     * @param {number} deltaTime - Time since last update in seconds
     */
    handleInput(deltaTime) {
        const inputManager = this.game.inputManager;
        
        // Don't process input if player is dead
        if (this.state === 'dead') {
            this.velocityX = 0;
            return;
        }
        
        // Horizontal movement
        if (inputManager.isActionPressed('left')) {
            this.velocityX = -this.moveSpeed;
            this.direction = -1;
            this.flipX = true;
        } else if (inputManager.isActionPressed('right')) {
            this.velocityX = this.moveSpeed;
            this.direction = 1;
            this.flipX = false;
        } else {
            // Apply friction to slow down
            this.velocityX *= this.friction;
            
            // Stop completely if velocity is very low
            if (Math.abs(this.velocityX) < 10) {
                this.velocityX = 0;
            }
        }
        
        // Jumping
        if (inputManager.isActionJustPressed('jump')) {
            this.jump();
        } else if (inputManager.isActionJustReleased('jump')) {
            this.stopJump();
        }
        
        // Continue jump if button is held
        if (this.isJumping && inputManager.isActionPressed('jump')) {
            this.currentJumpTime += deltaTime;
            
            if (this.currentJumpTime < this.maxJumpTime) {
                // Apply additional upward force while jump is held
                this.velocityY -= this.jumpForce * 0.5 * deltaTime;
            } else {
                this.stopJump();
            }
        }
        
        // Ducking
        if (inputManager.isActionJustPressed('down')) {
            this.duck();
        } else if (inputManager.isActionJustReleased('down')) {
            this.stopDuck();
        }
        
        // Shooting (fire flower power)
        if (inputManager.isActionJustPressed('action') && this.powerupState === 'fire') {
            this.shoot();
        }
    }
    
    /**
     * Update player state based on physics
     */
    updateState() {
        // Determine if player is on ground
        const wasOnGround = this.canJump;
        this.canJump = false;
        
        // Check for collision with ground
        const groundHit = this.game.physics.raycast(
            this.x + this.width / 2,
            this.y + this.height,
            0,
            5,
            1 // Collision mask for terrain
        );
        
        if (groundHit) {
            this.canJump = true;
            
            // If we just landed, play sound and create dust effect
            if (!wasOnGround && this.velocityY > 0) {
                this.game.audioManager.playSound('sfx-land');
                this.createLandDustEffect();
            }
            
            // Create run dust when running on ground
            if (Math.abs(this.velocityX) > 50) {
                this.createRunDustEffect();
            }
        }
        
        // Update player state based on velocity and input
        if (this.state === 'dead') {
            // Keep dead state
            return;
        } else if (this.state === 'growing' || this.state === 'shrinking') {
            // Keep transformation state until animation completes
            return;
        } else if (this.state === 'ducking' && this.canJump) {
            // Keep ducking state if on ground
            return;
        } else if (!this.canJump) {
            // In the air
            if (this.velocityY < 0) {
                this.setState('jumping');
            } else {
                this.setState('falling');
            }
        } else {
            // On the ground
            if (Math.abs(this.velocityX) > 10) {
                this.setState('running');
            } else {
                this.setState('idle');
            }
        }
    }
    
    /**
     * Set player state and update animation
     * @param {string} newState - New player state
     */
    setState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.setAnimation(newState);
        }
    }
    
    /**
     * Set player animation based on state and powerup
     * @param {string} state - Player state
     */
    setAnimation(state) {
        // Get animation for current powerup state and player state
        const powerupAnimations = this.animations[this.powerupState] || this.animations.small;
        const animation = powerupAnimations[state] || powerupAnimations.idle;
        
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
     * Make the player jump
     */
    jump() {
        if (this.canJump) {
            this.velocityY = -this.jumpForce;
            this.isJumping = true;
            this.currentJumpTime = 0;
            this.canJump = false;
            
            // Play jump sound
            this.game.audioManager.playSound('sfx-jump');
            
            // Create jump dust effect
            this.createJumpDustEffect();
            
            // Set jumping state
            this.setState('jumping');
        }
    }
    
    /**
     * Stop the jump (called when jump button is released)
     */
    stopJump() {
        this.isJumping = false;
    }
    
    /**
     * Create dust effect when player jumps
     */
    createJumpDustEffect() {
        // Use particle system to create jump dust effect
        this.game.particleSystem.createEffect(
            'jumpDust',
            this.x + this.width / 2,
            this.y + this.height
        );
    }
    
    /**
     * Create dust effect when player lands
     */
    createLandDustEffect() {
        // Use particle system to create land dust effect
        this.game.particleSystem.createEffect(
            'landDust',
            this.x + this.width / 2,
            this.y + this.height
        );
    }
    
    /**
     * Create dust effect when player is running
     */
    createRunDustEffect() {
        // Only create run dust occasionally to avoid too many particles
        if (Math.random() < 0.2) {
            // Use particle system to create run dust effect
            this.game.particleSystem.createEffect(
                'runDust',
                this.x + (this.direction > 0 ? 0 : this.width), // Create dust behind the player
                this.y + this.height
            );
        }
    }
    
    /**
     * Make the player duck
     */
    duck() {
        if (this.canJump && this.powerupState !== 'small') {
            this.setState('ducking');
            
            // Adjust collider for ducking
            this.collider.height = this.height / 2;
            this.collider.offsetY = this.height / 2;
            
            // Update collider position
            this.updateCollider();
        }
    }
    
    /**
     * Stop ducking
     */
    stopDuck() {
        if (this.state === 'ducking') {
            // Reset collider
            this.collider.height = this.height - 2 * this.collider.offsetX;
            this.collider.offsetY = 2;
            
            // Update collider position
            this.updateCollider();
            
            // Update state
            this.setState('idle');
        }
    }
    
    /**
     * Shoot a fireball (when in fire powerup state)
     */
    shoot() {
        if (this.powerupState === 'fire') {
            // Create fireball entity
            const fireball = this.game.entityManager.addEntity({
                type: 'fireball',
                x: this.x + (this.direction > 0 ? this.width : 0),
                y: this.y + this.height / 4,
                width: 16,
                height: 16,
                velocityX: this.direction * 300,
                velocityY: -50,
                direction: this.direction,
                game: this.game
            });
            
            // Play fireball sound
            this.game.audioManager.playSound('sfx-fireball');
            
            // Briefly show shooting animation
            const currentState = this.state;
            this.setState('shooting');
            
            // Return to previous state after a short delay
            setTimeout(() => {
                this.setState(currentState);
            }, 200);
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
            case 'enemy':
                this.handleEnemyCollision(other, collision);
                break;
                
            case 'powerup':
                this.getPowerup(other.powerupType);
                other.collect();
                break;
                
            case 'coin':
                this.game.gameManager.addCoin();
                other.collect();
                break;
                
            case 'checkpoint':
                this.game.gameManager.setCheckpoint(other.x, other.y);
                other.activate();
                break;
                
            case 'goal':
                this.game.gameManager.levelComplete();
                break;
                
            case 'block':
                // Check if player is hitting the block from below
                if (collision.normal.y > 0 && this.velocityY < 0) {
                    // Player is moving upward and hit the block from below
                    if (other.hit) {
                        other.hit();
                    }
                }
                break;
        }
    }
    
    /**
     * Handle collision with an enemy
     * @param {Object} enemy - The enemy entity
     * @param {Object} collision - Collision data
     */
    handleEnemyCollision(enemy, collision) {
        // If player is invincible, defeat the enemy
        if (this.isInvincible || this.powerupState === 'invincible') {
            enemy.defeat();
            this.game.gameManager.addScore(100);
            return;
        }
        
        // If player is in hurt invincibility period, ignore collision
        if (this.hurtInvincibilityTime > 0) {
            return;
        }
        
        // Check if player is jumping on top of the enemy
        if (collision.normal.y < 0 && this.velocityY > 0) {
            // Bounce off enemy
            this.velocityY = -this.jumpForce * 0.5;
            
            // Defeat the enemy
            enemy.defeat();
            
            // Add score
            this.game.gameManager.addScore(100);
            
            // Play stomp sound
            this.game.audioManager.playSound('sfx-stomp');
        } else {
            // Player is hit by enemy from the side or below
            this.getHurt();
        }
    }
    
    /**
     * Get a powerup
     * @param {string} type - Powerup type (mushroom, fire, star)
     */
    getPowerup(type) {
        // Play powerup sound
        this.game.audioManager.playSound('sfx-powerup');
        
        switch (type) {
            case 'mushroom':
                if (this.powerupState === 'small') {
                    // Grow from small to big
                    this.setState('growing');
                    this.powerupState = 'big';
                    
                    // Adjust height for big state
                    this.height = 64;
                    
                    // After growth animation completes
                    setTimeout(() => {
                        this.setState('idle');
                    }, 500);
                }
                break;
                
            case 'fire':
                if (this.powerupState !== 'fire') {
                    // Change to fire state
                    this.powerupState = 'fire';
                    this.setState('idle');
                    
                    // Ensure height is set for big state
                    this.height = 64;
                }
                break;
                
            case 'star':
                // Activate invincibility
                this.powerupState = 'invincible';
                this.invincibilityTime = this.invincibilityDuration;
                this.isInvincible = true;
                
                // Play star music
                this.game.audioManager.playMusic('music-star', true);
                break;
                
            case '1up':
                // Add extra life
                this.game.gameManager.addLife();
                break;
        }
        
        // Add score
        this.game.gameManager.addScore(1000);
    }
    
    /**
     * Handle player getting hurt
     */
    getHurt() {
        // If already invincible or dead, ignore
        if (this.isInvincible || this.state === 'dead') {
            return;
        }
        
        // Play hurt sound
        this.game.audioManager.playSound('sfx-hurt');
        
        if (this.powerupState === 'small') {
            // If small, die
            this.die();
        } else {
            // If powered up, downgrade
            if (this.powerupState === 'fire') {
                this.powerupState = 'big';
            } else if (this.powerupState === 'big') {
                this.powerupState = 'small';
                
                // Adjust height for small state
                this.height = 32;
            }
            
            // Set temporary invincibility
            this.hurtInvincibilityTime = this.hurtInvincibilityDuration;
            
            // Set shrinking state briefly
            this.setState('shrinking');
            
            // After shrink animation completes
            setTimeout(() => {
                this.setState('idle');
            }, 500);
        }
    }
    
    /**
     * Handle player death
     */
    die() {
        // Set dead state
        this.setState('dead');
        
        // Play death animation
        this.velocityY = -this.jumpForce * 0.5;
        this.gravity = true;
        this.solid = false;
        
        // Play death sound
        this.game.audioManager.playSound('sfx-death');
        
        // Notify game manager
        setTimeout(() => {
            this.game.gameManager.loseLife();
        }, 1500);
    }
    
    /**
     * Render the player
     * @param {Object} renderer - Renderer instance
     */
    render(renderer) {
        // Skip rendering if blinking during invincibility
        if (this.isBlinking) {
            return;
        }
        
        // Call parent render method
        super.render(renderer);
    }
}