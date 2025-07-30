/**
 * Renderer
 * Handles rendering the game world, entities, and UI
 */

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Camera properties
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            target: null,
            bounds: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            },
            lerp: 0.1 // Camera smoothing factor (0-1)
        };
        
        // Parallax background layers
        this.backgroundLayers = [];
        
        // Debug mode
        this.debugMode = false;
        
        // Bind methods
        this.clear = this.clear.bind(this);
        this.setCamera = this.setCamera.bind(this);
        this.followTarget = this.followTarget.bind(this);
        this.updateCamera = this.updateCamera.bind(this);
        this.drawSprite = this.drawSprite.bind(this);
        this.drawAnimatedSprite = this.drawAnimatedSprite.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.drawText = this.drawText.bind(this);
        this.drawBackground = this.drawBackground.bind(this);
        this.addBackgroundLayer = this.addBackgroundLayer.bind(this);
        this.toggleDebugMode = this.toggleDebugMode.bind(this);
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    /**
     * Set camera position
     * @param {number} x - Camera x position
     * @param {number} y - Camera y position
     */
    setCamera(x, y) {
        // Apply camera bounds
        const boundedX = Math.max(this.camera.bounds.left, Math.min(x, this.camera.bounds.right - this.camera.width));
        const boundedY = Math.max(this.camera.bounds.top, Math.min(y, this.camera.bounds.bottom - this.camera.height));
        
        // Apply camera smoothing (lerp)
        this.camera.x += (boundedX - this.camera.x) * this.camera.lerp;
        this.camera.y += (boundedY - this.camera.y) * this.camera.lerp;
    }
    
    /**
     * Set a target for the camera to follow
     * @param {Object} target - The target object with x and y properties
     */
    followTarget(target) {
        this.camera.target = target;
    }
    
    /**
     * Set camera bounds
     * @param {number} left - Left bound
     * @param {number} right - Right bound
     * @param {number} top - Top bound
     * @param {number} bottom - Bottom bound
     */
    setCameraBounds(left, right, top, bottom) {
        this.camera.bounds = { left, right, top, bottom };
    }
    
    /**
     * Update camera position based on target
     */
    updateCamera() {
        if (this.camera.target) {
            // Center camera on target
            const targetX = this.camera.target.x - this.camera.width / 2;
            const targetY = this.camera.target.y - this.camera.height / 2;
            
            this.setCamera(targetX, targetY);
        }
    }
    
    /**
     * Convert world coordinates to screen coordinates
     * @param {number} x - World x coordinate
     * @param {number} y - World y coordinate
     * @returns {Object} - Screen coordinates {x, y}
     */
    worldToScreen(x, y) {
        return {
            x: x - this.camera.x,
            y: y - this.camera.y
        };
    }
    
    /**
     * Check if an object is visible on screen
     * @param {number} x - Object x position
     * @param {number} y - Object y position
     * @param {number} width - Object width
     * @param {number} height - Object height
     * @returns {boolean} - Whether the object is visible
     */
    isVisible(x, y, width, height) {
        return (
            x + width > this.camera.x &&
            x < this.camera.x + this.camera.width &&
            y + height > this.camera.y &&
            y < this.camera.y + this.camera.height
        );
    }
    
    /**
     * Draw a sprite
     * @param {HTMLImageElement} image - The sprite image
     * @param {number} x - X position in world coordinates
     * @param {number} y - Y position in world coordinates
     * @param {number} width - Width to draw
     * @param {number} height - Height to draw
     * @param {Object} [options] - Additional drawing options
     */
    drawSprite(image, x, y, width, height, options = {}) {
        // Convert world coordinates to screen coordinates
        const screen = this.worldToScreen(x, y);
        
        // Check if sprite is visible on screen
        if (!this.isVisible(x, y, width, height)) {
            return;
        }
        
        // Save context state
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(screen.x + width / 2, screen.y + height / 2);
        
        // Apply scale (for flipping)
        this.ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
        
        // Apply rotation
        if (options.rotation) {
            this.ctx.rotate(options.rotation);
        }
        
        // Apply opacity
        if (options.opacity !== undefined) {
            this.ctx.globalAlpha = options.opacity;
        }
        
        // Draw the sprite
        this.ctx.drawImage(
            image,
            options.sourceX || 0,
            options.sourceY || 0,
            options.sourceWidth || image.width,
            options.sourceHeight || image.height,
            -width / 2,
            -height / 2,
            width,
            height
        );
        
        // Restore context state
        this.ctx.restore();
        
        // Draw debug information if debug mode is enabled
        if (this.debugMode) {
            this.drawRect(x, y, width, height, 'rgba(255, 0, 0, 0.3)');
        }
    }
    
    /**
     * Draw an animated sprite
     * @param {HTMLImageElement} spritesheet - The spritesheet image
     * @param {number} x - X position in world coordinates
     * @param {number} y - Y position in world coordinates
     * @param {number} width - Width to draw
     * @param {number} height - Height to draw
     * @param {Object} animation - Animation data
     * @param {Object} [options] - Additional drawing options
     */
    drawAnimatedSprite(spritesheet, x, y, width, height, animation, options = {}) {
        // Calculate the current frame
        const frameIndex = Math.floor(animation.currentFrame) % animation.frames;
        const framesPerRow = Math.floor(spritesheet.width / animation.frameWidth);
        const row = Math.floor(frameIndex / framesPerRow);
        const col = frameIndex % framesPerRow;
        
        // Draw the sprite with the current frame
        this.drawSprite(
            spritesheet,
            x,
            y,
            width,
            height,
            {
                ...options,
                sourceX: col * animation.frameWidth,
                sourceY: row * animation.frameHeight,
                sourceWidth: animation.frameWidth,
                sourceHeight: animation.frameHeight
            }
        );
    }
    
    /**
     * Draw a rectangle
     * @param {number} x - X position in world coordinates
     * @param {number} y - Y position in world coordinates
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Fill color
     * @param {Object} [options] - Additional drawing options
     */
    drawRect(x, y, width, height, color, options = {}) {
        // Convert world coordinates to screen coordinates
        const screen = this.worldToScreen(x, y);
        
        // Check if rectangle is visible on screen
        if (!this.isVisible(x, y, width, height)) {
            return;
        }
        
        // Save context state
        this.ctx.save();
        
        // Apply opacity
        if (options.opacity !== undefined) {
            this.ctx.globalAlpha = options.opacity;
        }
        
        // Set fill style
        this.ctx.fillStyle = color;
        
        // Draw the rectangle
        this.ctx.fillRect(screen.x, screen.y, width, height);
        
        // Draw stroke if specified
        if (options.stroke) {
            this.ctx.strokeStyle = options.stroke;
            this.ctx.lineWidth = options.lineWidth || 1;
            this.ctx.strokeRect(screen.x, screen.y, width, height);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Draw text
     * @param {string} text - The text to draw
     * @param {number} x - X position in world coordinates
     * @param {number} y - Y position in world coordinates
     * @param {Object} [options] - Text options
     */
    drawText(text, x, y, options = {}) {
        // Convert world coordinates to screen coordinates
        const screen = this.worldToScreen(x, y);
        
        // Save context state
        this.ctx.save();
        
        // Set text properties
        this.ctx.font = options.font || '16px PixelFont';
        this.ctx.fillStyle = options.color || 'white';
        this.ctx.textAlign = options.align || 'left';
        this.ctx.textBaseline = options.baseline || 'top';
        
        // Apply opacity
        if (options.opacity !== undefined) {
            this.ctx.globalAlpha = options.opacity;
        }
        
        // Draw text shadow if specified
        if (options.shadow) {
            this.ctx.shadowColor = options.shadow.color || 'black';
            this.ctx.shadowBlur = options.shadow.blur || 4;
            this.ctx.shadowOffsetX = options.shadow.offsetX || 2;
            this.ctx.shadowOffsetY = options.shadow.offsetY || 2;
        }
        
        // Draw the text
        this.ctx.fillText(text, screen.x, screen.y);
        
        // Draw stroke if specified
        if (options.stroke) {
            this.ctx.strokeStyle = options.stroke.color || 'black';
            this.ctx.lineWidth = options.stroke.width || 1;
            this.ctx.strokeText(text, screen.x, screen.y);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Add a background layer for parallax scrolling
     * @param {HTMLImageElement} image - The background image
     * @param {number} scrollFactor - Parallax scroll factor (0-1)
     * @param {Object} [options] - Additional options
     */
    addBackgroundLayer(image, scrollFactor, options = {}) {
        this.backgroundLayers.push({
            image,
            scrollFactor,
            x: options.x || 0,
            y: options.y || 0,
            width: options.width || image.width,
            height: options.height || image.height,
            repeat: options.repeat !== undefined ? options.repeat : true,
            speed: options.speed || { x: 0, y: 0 }
        });
        
        // Sort layers by scroll factor (back to front)
        this.backgroundLayers.sort((a, b) => a.scrollFactor - b.scrollFactor);
    }
    
    /**
     * Clear all background layers
     */
    clearBackgroundLayers() {
        this.backgroundLayers = [];
    }
    
    /**
     * Draw the parallax background layers
     */
    drawBackground() {
        // Draw each background layer
        for (const layer of this.backgroundLayers) {
            // Calculate parallax offset
            const parallaxX = this.camera.x * layer.scrollFactor;
            const parallaxY = this.camera.y * layer.scrollFactor;
            
            // Calculate animation offset based on time
            const time = Date.now() / 1000;
            const animX = layer.speed.x * time;
            const animY = layer.speed.y * time;
            
            // Calculate the total offset
            const offsetX = parallaxX + animX;
            const offsetY = parallaxY + animY;
            
            if (layer.repeat) {
                // Draw repeated background
                const repeatX = Math.ceil(this.width / layer.width) + 1;
                const repeatY = Math.ceil(this.height / layer.height) + 1;
                
                // Calculate the starting position
                const startX = -offsetX % layer.width;
                const startY = -offsetY % layer.height;
                
                // Draw the repeated background
                for (let x = 0; x < repeatX; x++) {
                    for (let y = 0; y < repeatY; y++) {
                        this.ctx.drawImage(
                            layer.image,
                            startX + x * layer.width,
                            startY + y * layer.height,
                            layer.width,
                            layer.height
                        );
                    }
                }
            } else {
                // Draw single background
                const x = layer.x - offsetX;
                const y = layer.y - offsetY;
                
                this.ctx.drawImage(
                    layer.image,
                    x,
                    y,
                    layer.width,
                    layer.height
                );
            }
        }
    }
    
    /**
     * Toggle debug mode
     * @returns {boolean} - New debug mode state
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        return this.debugMode;
    }
    
    /**
     * Set debug mode
     * @param {boolean} enabled - Whether debug mode should be enabled
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}