/**
 * Entity Manager
 * Manages all game entities, including creation, updating, and removal
 */

export class EntityManager {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.entityTypes = {}; // For quick filtering by type
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.addEntity = this.addEntity.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
        this.clearEntities = this.clearEntities.bind(this);
        this.getEntitiesByType = this.getEntitiesByType.bind(this);
        this.getEntitiesInArea = this.getEntitiesInArea.bind(this);
    }
    
    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Process entities to add
        if (this.entitiesToAdd.length > 0) {
            this.entities = [...this.entities, ...this.entitiesToAdd];
            
            // Add to type mapping
            this.entitiesToAdd.forEach(entity => {
                if (!this.entityTypes[entity.type]) {
                    this.entityTypes[entity.type] = [];
                }
                this.entityTypes[entity.type].push(entity);
            });
            
            this.entitiesToAdd = [];
        }
        
        // Update all entities
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.active) {
                entity.update(deltaTime);
            }
        }
        
        // Process entities to remove
        if (this.entitiesToRemove.length > 0) {
            // Remove from type mapping
            this.entitiesToRemove.forEach(entity => {
                if (this.entityTypes[entity.type]) {
                    const index = this.entityTypes[entity.type].indexOf(entity);
                    if (index !== -1) {
                        this.entityTypes[entity.type].splice(index, 1);
                    }
                }
            });
            
            // Remove from main entities array
            this.entities = this.entities.filter(entity => !this.entitiesToRemove.includes(entity));
            this.entitiesToRemove = [];
        }
    }
    
    /**
     * Render all entities
     */
    render() {
        // Sort entities by z-index for proper layering
        const sortedEntities = [...this.entities].sort((a, b) => a.zIndex - b.zIndex);
        
        // Render only entities that are visible on screen
        for (let i = 0; i < sortedEntities.length; i++) {
            const entity = sortedEntities[i];
            if (entity.active && this.game.renderer.isVisible(entity)) {
                entity.render(this.game.renderer);
            }
        }
    }
    
    /**
     * Add an entity to the manager
     * @param {Object} entity - Entity to add
     */
    addEntity(entity) {
        // Add to pending list to avoid modifying array during update
        this.entitiesToAdd.push(entity);
        return entity;
    }
    
    /**
     * Remove an entity from the manager
     * @param {Object} entity - Entity to remove
     */
    removeEntity(entity) {
        // Add to pending list to avoid modifying array during update
        this.entitiesToRemove.push(entity);
    }
    
    /**
     * Clear all entities
     */
    clearEntities() {
        this.entities = [];
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this.entityTypes = {};
    }
    
    /**
     * Get entities by type
     * @param {string} type - Entity type to filter by
     * @returns {Array} - Array of entities of the specified type
     */
    getEntitiesByType(type) {
        return this.entityTypes[type] || [];
    }
    
    /**
     * Get entities in a specific area
     * @param {number} x - X coordinate of the area
     * @param {number} y - Y coordinate of the area
     * @param {number} width - Width of the area
     * @param {number} height - Height of the area
     * @param {string} [type] - Optional entity type to filter by
     * @returns {Array} - Array of entities in the specified area
     */
    getEntitiesInArea(x, y, width, height, type) {
        const entitiesToCheck = type ? this.getEntitiesByType(type) : this.entities;
        
        return entitiesToCheck.filter(entity => {
            return entity.active && 
                   entity.x < x + width && 
                   entity.x + entity.width > x && 
                   entity.y < y + height && 
                   entity.y + entity.height > y;
        });
    }
}