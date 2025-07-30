/**
 * Particle System
 * Manages and optimizes particle effects
 */

import { Particle } from '../entities/particle.js';

export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.maxParticles = 200; // Maximum number of particles to prevent performance issues
        this.presets = this.createPresets();
    }
    
    /**
     * Create particle effect presets
     * @returns {Object} Particle effect presets
     */
    createPresets() {
        return {
            // Coin collection effect
            coinCollect: {
                count: 8,
                color: '#FFD700', // Gold
                size: { width: 4, height: 4 },
                velocity: { min: 30, max: 60 },
                gravity: true,
                lifetime: { min: 0.5, max: 0.8 },
                fadeOut: true,
                pattern: 'circle'
            },
            
            // Jump dust effect
            jumpDust: {
                count: 5,
                color: '#CCCCCC', // Light gray
                size: { width: 6, height: 6 },
                velocity: { min: 10, max: 30 },
                gravity: false,
                lifetime: { min: 0.3, max: 0.5 },
                fadeOut: true,
                pattern: 'cone',
                direction: 'down'
            },
            
            // Land dust effect
            landDust: {
                count: 8,
                color: '#CCCCCC', // Light gray
                size: { width: 8, height: 4 },
                velocity: { min: 20, max: 40 },
                gravity: false,
                lifetime: { min: 0.3, max: 0.6 },
                fadeOut: true,
                pattern: 'horizontal'
            },
            
            // Run dust effect
            runDust: {
                count: 1,
                color: '#CCCCCC', // Light gray
                size: { width: 5, height: 3 },
                velocity: { min: 5, max: 15 },
                gravity: false,
                lifetime: { min: 0.2, max: 0.4 },
                fadeOut: true,
                pattern: 'point'
            },
            
            // Enemy defeat effect
            enemyDefeat: {
                count: 12,
                color: '#FF6347', // Tomato red
                size: { width: 6, height: 6 },
                velocity: { min: 40, max: 80 },
                gravity: true,
                lifetime: { min: 0.5, max: 1 },
                fadeOut: true,
                pattern: 'circle'
            },
            
            // Block hit effect
            blockHit: {
                count: 6,
                color: '#B8860B', // Dark goldenrod
                size: { width: 4, height: 4 },
                velocity: { min: 30, max: 60 },
                gravity: true,
                lifetime: { min: 0.3, max: 0.6 },
                fadeOut: true,
                pattern: 'cone',
                direction: 'up'
            },
            
            // Powerup appear effect
            powerupAppear: {
                count: 10,
                color: '#FFFFFF', // White
                size: { width: 5, height: 5 },
                velocity: { min: 20, max: 40 },
                gravity: false,
                lifetime: { min: 0.5, max: 0.8 },
                fadeOut: true,
                pattern: 'circle'
            },
            
            // Fireball trail effect
            fireballTrail: {
                count: 1,
                color: '#FFA500', // Orange
                size: { width: 6, height: 6 },
                velocity: { min: 5, max: 15 },
                gravity: false,
                lifetime: { min: 0.2, max: 0.3 },
                fadeOut: true,
                pattern: 'point'
            },
            
            // Fireball explosion effect
            fireballExplosion: {
                count: 15,
                color: '#FFA500', // Orange
                size: { width: 6, height: 6 },
                velocity: { min: 40, max: 80 },
                gravity: false,
                lifetime: { min: 0.4, max: 0.7 },
                fadeOut: true,
                pattern: 'circle'
            },
            
            // Star power effect
            starPower: {
                count: 1,
                colors: ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'], // Rainbow
                size: { width: 4, height: 4 },
                velocity: { min: 10, max: 30 },
                gravity: false,
                lifetime: { min: 0.3, max: 0.5 },
                fadeOut: true,
                pattern: 'point'
            },
            
            // Checkpoint activation effect
            checkpointActivate: {
                count: 20,
                color: '#FFFFFF', // White
                size: { width: 5, height: 5 },
                velocity: { min: 30, max: 70 },
                gravity: true,
                lifetime: { min: 0.5, max: 1 },
                fadeOut: true,
                pattern: 'fountain'
            },
            
            // Goal reached effect
            goalReached: {
                count: 30,
                colors: ['#FFFF00', '#FFD700', '#FFFFFF'], // Yellow, gold, white
                size: { width: 6, height: 6 },
                velocity: { min: 50, max: 100 },
                gravity: true,
                lifetime: { min: 1, max: 1.5 },
                fadeOut: true,
                pattern: 'fountain'
            },
            
            // Firework effect
            firework: {
                count: 30,
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'], // Multiple colors
                size: { width: 4, height: 4 },
                velocity: { min: 50, max: 100 },
                gravity: true,
                lifetime: { min: 0.8, max: 1.2 },
                fadeOut: true,
                pattern: 'circle'
            }
        };
    }
    
    /**
     * Create a particle effect at the specified position
     * @param {string} presetName - Name of the particle effect preset
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Additional options to override preset values
     */
    createEffect(presetName, x, y, options = {}) {
        // Get preset or use empty object if preset doesn't exist
        const preset = this.presets[presetName] || {};
        
        // Merge preset with options
        const settings = { ...preset, ...options };
        
        // Determine number of particles to create
        const count = settings.count || 10;
        
        // Create particles
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, settings, i, count);
        }
    }
    
    /**
     * Create a single particle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} settings - Particle settings
     * @param {number} index - Particle index
     * @param {number} total - Total number of particles
     */
    createParticle(x, y, settings, index, total) {
        // Check if we've reached the maximum number of particles
        if (this.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldestParticle = this.particles.shift();
            if (oldestParticle && oldestParticle.active) {
                oldestParticle.destroy();
            }
        }
        
        // Determine particle color
        let color;
        if (settings.colors) {
            // If multiple colors are specified, choose one randomly
            color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
        } else {
            color = settings.color || '#FFFFFF';
        }
        
        // Determine particle size
        const width = settings.size ? settings.size.width : 4;
        const height = settings.size ? settings.size.height : 4;
        
        // Determine particle lifetime
        const lifetime = settings.lifetime ?
            settings.lifetime.min + Math.random() * (settings.lifetime.max - settings.lifetime.min) :
            0.5 + Math.random() * 0.5;
        
        // Determine particle velocity based on pattern
        let velocityX = 0;
        let velocityY = 0;
        
        const minVelocity = settings.velocity ? settings.velocity.min : 20;
        const maxVelocity = settings.velocity ? settings.velocity.max : 50;
        const velocity = minVelocity + Math.random() * (maxVelocity - minVelocity);
        
        switch (settings.pattern) {
            case 'circle':
                // Particles emit in a circle
                const angle = (index / total) * Math.PI * 2;
                velocityX = Math.cos(angle) * velocity;
                velocityY = Math.sin(angle) * velocity;
                break;
                
            case 'cone':
                // Particles emit in a cone shape
                let coneAngle;
                if (settings.direction === 'up') {
                    coneAngle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
                } else if (settings.direction === 'down') {
                    coneAngle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
                } else if (settings.direction === 'left') {
                    coneAngle = Math.PI + (Math.random() - 0.5) * Math.PI / 2;
                } else { // right or default
                    coneAngle = 0 + (Math.random() - 0.5) * Math.PI / 2;
                }
                velocityX = Math.cos(coneAngle) * velocity;
                velocityY = Math.sin(coneAngle) * velocity;
                break;
                
            case 'horizontal':
                // Particles emit horizontally
                velocityX = (Math.random() * 2 - 1) * velocity;
                velocityY = (Math.random() - 0.5) * (velocity / 3);
                break;
                
            case 'fountain':
                // Particles emit upward like a fountain
                velocityX = (Math.random() * 2 - 1) * velocity;
                velocityY = -velocity - Math.random() * (maxVelocity - minVelocity);
                break;
                
            case 'point':
            default:
                // Particles emit from a point in random directions
                const randomAngle = Math.random() * Math.PI * 2;
                velocityX = Math.cos(randomAngle) * velocity;
                velocityY = Math.sin(randomAngle) * velocity;
                break;
        }
        
        // Create the particle entity
        const particle = new Particle({
            x: x,
            y: y,
            width: width,
            height: height,
            velocityX: velocityX,
            velocityY: velocityY,
            gravity: settings.gravity !== undefined ? settings.gravity : true,
            color: color,
            lifetime: lifetime,
            fadeOut: settings.fadeOut !== undefined ? settings.fadeOut : true,
            fadeIn: settings.fadeIn || false,
            rotationSpeed: settings.rotationSpeed || (Math.random() - 0.5) * 5,
            game: this.game
        });
        
        // Add to particles array and entity manager
        this.particles.push(particle);
        this.game.entityManager.addEntity(particle);
        
        return particle;
    }
    
    /**
     * Update the particle system
     * Remove references to destroyed particles
     */
    update() {
        // Filter out destroyed particles
        this.particles = this.particles.filter(particle => particle.active);
    }
    
    /**
     * Clear all particles
     */
    clearAll() {
        // Destroy all particles
        this.particles.forEach(particle => {
            if (particle.active) {
                particle.destroy();
            }
        });
        
        // Clear array
        this.particles = [];
    }
}