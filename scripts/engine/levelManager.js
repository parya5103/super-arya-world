/**
 * Level Manager
 * Handles level loading, parsing, and management
 */

import { Platform } from '../entities/platform.js';
import { Coin } from '../entities/coin.js';
import { Enemy } from '../entities/enemy.js';
import { Powerup } from '../entities/powerup.js';
import { Checkpoint } from '../entities/checkpoint.js';
import { Goal } from '../entities/goal.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        
        // Level properties
        this.currentLevel = null;
        this.levelWidth = 0;
        this.levelHeight = 0;
        this.tileSize = 32; // Default tile size
        
        // Background layers for parallax
        this.backgroundLayers = [];
        
        // Bind methods
        this.loadLevel = this.loadLevel.bind(this);
        this.parseLevel = this.parseLevel.bind(this);
        this.createEntity = this.createEntity.bind(this);
    }
    
    /**
     * Load a level from level data
     * @param {Object} levelData - Level data object
     */
    loadLevel(levelData) {
        console.log('Loading level:', levelData.name);
        
        this.currentLevel = levelData;
        
        // Set level dimensions
        this.levelWidth = levelData.width * this.tileSize;
        this.levelHeight = levelData.height * this.tileSize;
        
        // Set background layers
        this.backgroundLayers = levelData.backgroundLayers || [];
        
        // Parse level data and create entities
        this.parseLevel(levelData);
    }
    
    /**
     * Parse level data and create entities
     * @param {Object} levelData - Level data object
     */
    parseLevel(levelData) {
        // Create static platforms and objects from the level data
        if (levelData.layers) {
            levelData.layers.forEach(layer => {
                if (layer.type === 'tilelayer') {
                    this.parseTileLayer(layer, levelData.tilesets);
                } else if (layer.type === 'objectgroup') {
                    this.parseObjectLayer(layer);
                }
            });
        }
    }
    
    /**
     * Parse a tile layer and create corresponding entities
     * @param {Object} layer - Tile layer data
     * @param {Array} tilesets - Tilesets used in the level
     */
    parseTileLayer(layer, tilesets) {
        const { width, height, data } = layer;
        
        // Process each tile in the layer
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileIndex = y * width + x;
                const tileId = data[tileIndex];
                
                // Skip empty tiles (tileId === 0)
                if (tileId === 0) continue;
                
                // Find the tileset for this tile
                const tileset = this.findTilesetForTile(tileId, tilesets);
                if (!tileset) continue;
                
                // Calculate the local tile ID within the tileset
                const localTileId = tileId - tileset.firstgid;
                
                // Create entity based on tile properties
                this.createEntityFromTile(x, y, localTileId, tileset, layer.name);
            }
        }
    }
    
    /**
     * Find the tileset that contains a specific tile
     * @param {number} tileId - Global tile ID
     * @param {Array} tilesets - Available tilesets
     * @returns {Object|null} - Matching tileset or null if not found
     */
    findTilesetForTile(tileId, tilesets) {
        // Sort tilesets by firstgid in descending order
        const sortedTilesets = [...tilesets].sort((a, b) => b.firstgid - a.firstgid);
        
        // Find the first tileset where the tile ID is greater than or equal to the firstgid
        return sortedTilesets.find(tileset => tileId >= tileset.firstgid) || null;
    }
    
    /**
     * Create an entity from a tile
     * @param {number} x - Tile X position
     * @param {number} y - Tile Y position
     * @param {number} localTileId - Local tile ID within the tileset
     * @param {Object} tileset - Tileset data
     * @param {string} layerName - Name of the layer
     */
    createEntityFromTile(x, y, localTileId, tileset, layerName) {
        // Convert tile coordinates to world coordinates
        const worldX = x * this.tileSize;
        const worldY = y * this.tileSize;
        
        // Get tile properties from tileset
        const tileProps = this.getTileProperties(localTileId, tileset);
        
        // Create different entities based on tile properties
        if (tileProps && tileProps.type) {
            switch (tileProps.type) {
                case 'platform':
                    this.createPlatform(worldX, worldY, tileProps, tileset, localTileId);
                    break;
                case 'coin':
                    this.createCoin(worldX, worldY, tileProps);
                    break;
                case 'enemy':
                    this.createEnemy(worldX, worldY, tileProps);
                    break;
                case 'powerup':
                    this.createPowerup(worldX, worldY, tileProps);
                    break;
                case 'checkpoint':
                    this.createCheckpoint(worldX, worldY, tileProps);
                    break;
                case 'goal':
                    this.createGoal(worldX, worldY, tileProps);
                    break;
                default:
                    // Default to platform for unknown types
                    this.createPlatform(worldX, worldY, tileProps, tileset, localTileId);
            }
        } else {
            // If no specific type, create a platform by default for solid layers
            if (layerName === 'solid' || layerName === 'platforms') {
                this.createPlatform(worldX, worldY, {}, tileset, localTileId);
            }
        }
    }
    
    /**
     * Get properties for a specific tile
     * @param {number} localTileId - Local tile ID within the tileset
     * @param {Object} tileset - Tileset data
     * @returns {Object} - Tile properties
     */
    getTileProperties(localTileId, tileset) {
        if (!tileset.tiles) return {};
        
        // Find the tile in the tileset's tiles array
        const tileData = tileset.tiles.find(tile => tile.id === localTileId);
        
        // Return the properties or an empty object
        return tileData ? tileData.properties || {} : {};
    }
    
    /**
     * Parse an object layer and create corresponding entities
     * @param {Object} layer - Object layer data
     */
    parseObjectLayer(layer) {
        if (!layer.objects) return;
        
        layer.objects.forEach(obj => {
            // Convert object coordinates to world coordinates
            const worldX = obj.x;
            const worldY = obj.y;
            
            // Create entity based on object type
            this.createEntity(obj.type, worldX, worldY, obj.width, obj.height, obj.properties || {});
        });
    }
    
    /**
     * Create an entity based on type and properties
     * @param {string} type - Entity type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} properties - Additional properties
     * @returns {Object} - Created entity
     */
    createEntity(type, x, y, width, height, properties = {}) {
        let entity = null;
        
        switch (type) {
            case 'platform':
                entity = this.createPlatform(x, y, properties, null, null, width, height);
                break;
            case 'block':
            case 'hiddenBlock':
                entity = this.createBlock(x, y, properties, null, null, width, height);
                break;
            case 'coin':
                entity = this.createCoin(x, y, properties);
                break;
            case 'enemy':
                entity = this.createEnemy(x, y, properties, width, height);
                break;
            case 'powerup':
                entity = this.createPowerup(x, y, properties);
                break;
            case 'checkpoint':
                entity = this.createCheckpoint(x, y, properties);
                break;
            case 'goal':
                entity = this.createGoal(x, y, properties, width, height);
                break;
            default:
                console.warn(`Unknown entity type: ${type}`);
        }
        
        return entity;
    }
    
    /**
     * Create a platform entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Platform properties
     * @param {Object} tileset - Tileset data (optional)
     * @param {number} tileId - Tile ID (optional)
     * @param {number} width - Width (optional, defaults to tileSize)
     * @param {number} height - Height (optional, defaults to tileSize)
     * @returns {Object} - Created platform entity
     */
    createPlatform(x, y, properties, tileset = null, tileId = null, width = null, height = null) {
        const platformWidth = width || this.tileSize;
        const platformHeight = height || this.tileSize;
        
        // Create platform entity
        const platform = new Platform({
            x,
            y,
            width: platformWidth,
            height: platformHeight,
            game: this.game,
            isMoving: properties.isMoving || false,
            moveSpeed: properties.moveSpeed || 1,
            moveDistance: properties.moveDistance || 0,
            moveDirection: properties.moveDirection || 'horizontal',
            tilesetImage: tileset ? tileset.image : null,
            tileId
        });
        
        // Add platform to entity manager
        return this.game.entityManager.addEntity(platform);
    }
    
    /**
     * Create a block entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Block properties
     * @param {Object} tileset - Tileset data (optional)
     * @param {number} tileId - Tile ID (optional)
     * @param {number} width - Width (optional, defaults to tileSize)
     * @param {number} height - Height (optional, defaults to tileSize)
     * @returns {Object} - Created block entity
     */
    createBlock(x, y, properties, tileset = null, tileId = null, width = null, height = null) {
        const blockWidth = width || this.tileSize;
        const blockHeight = height || this.tileSize;
        
        // Create block entity
        const block = new this.game.entityClasses.Block({
            x,
            y,
            width: blockWidth,
            height: blockHeight,
            game: this.game,
            isHidden: properties.isHidden || false,
            contains: properties.contains || null,
            tilesetImage: tileset ? tileset.image : null,
            tileId
        });
        
        // Add block to entity manager
        this.game.entityManager.addEntity(block);
        return block;
    }
    
    /**
     * Create a coin entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Coin properties
     * @returns {Object} - Created coin entity
     */
    createCoin(x, y, properties) {
        // Create coin entity
        const coin = new Coin({
            x,
            y,
            width: 16,
            height: 16,
            game: this.game,
            value: properties.value || 1
        });
        
        // Add coin to entity manager
        return this.game.entityManager.addEntity(coin);
    }
    
    /**
     * Create an enemy entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Enemy properties
     * @param {number} width - Width (optional)
     * @param {number} height - Height (optional)
     * @returns {Object} - Created enemy entity
     */
    createEnemy(x, y, properties, width = 32, height = 32) {
        // Create enemy entity
        const enemy = new Enemy({
            x,
            y,
            width,
            height,
            game: this.game,
            type: properties.enemyType || 'goomba',
            patrolDistance: properties.patrolDistance || 100,
            speed: properties.speed || 50,
            isBoss: properties.isBoss || false
        });
        
        // Add enemy to entity manager
        return this.game.entityManager.addEntity(enemy);
    }
    
    /**
     * Create a powerup entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Powerup properties
     * @returns {Object} - Created powerup entity
     */
    createPowerup(x, y, properties) {
        // Create powerup entity
        const powerup = new Powerup({
            x,
            y,
            width: 24,
            height: 24,
            game: this.game,
            type: properties.powerupType || 'mushroom'
        });
        
        // Add powerup to entity manager
        return this.game.entityManager.addEntity(powerup);
    }
    
    /**
     * Create a checkpoint entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Checkpoint properties
     * @returns {Object} - Created checkpoint entity
     */
    createCheckpoint(x, y, properties) {
        // Create checkpoint entity
        const checkpoint = new Checkpoint({
            x,
            y,
            width: 32,
            height: 64,
            game: this.game,
            id: properties.id || 'checkpoint'
        });
        
        // Add checkpoint to entity manager
        return this.game.entityManager.addEntity(checkpoint);
    }
    
    /**
     * Create a goal entity
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} properties - Goal properties
     * @param {number} width - Width (optional)
     * @param {number} height - Height (optional)
     * @returns {Object} - Created goal entity
     */
    createGoal(x, y, properties, width = 32, height = 64) {
        // Create goal entity
        const goal = new Goal({
            x,
            y,
            width,
            height,
            game: this.game,
            type: properties.goalType || 'flag'
        });
        
        // Add goal to entity manager
        return this.game.entityManager.addEntity(goal);
    }
}