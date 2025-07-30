/**
 * Save Manager
 * Handles saving and loading game progress
 */

export class SaveManager {
    constructor() {
        this.saveKey = 'super_arya_world_save';
    }

    /**
     * Save game state to localStorage
     * @param {Object} state - Game state to save
     */
    save(state) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(state));
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object} Saved game state or null if none exists
     */
    load() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            return saveData ? JSON.parse(saveData) : null;
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    /**
     * Clear saved game data
     */
    clear() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (error) {
            console.error('Error clearing save:', error);
            return false;
        }
    }
}
