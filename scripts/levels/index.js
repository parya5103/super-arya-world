/**
 * Level Index
 * Exports all levels and provides level management utilities
 */

import level1 from './level1.js';
import level2 from './level2.js';
import level3 from './level3.js';

// Export all levels in an array
const levels = [
    level1,
    level2,
    level3
];

/**
 * Get level by ID
 * @param {string} id - Level ID to find
 * @returns {Object|null} - Level object or null if not found
 */
export function getLevelById(id) {
    return levels.find(level => level.id === id) || null;
}

/**
 * Get level by index
 * @param {number} index - Level index (0-based)
 * @returns {Object|null} - Level object or null if index is out of bounds
 */
export function getLevelByIndex(index) {
    if (index >= 0 && index < levels.length) {
        return levels[index];
    }
    return null;
}

/**
 * Get total number of levels
 * @returns {number} - Total number of levels
 */
export function getLevelCount() {
    return levels.length;
}

/**
 * Get level index by ID
 * @param {string} id - Level ID to find
 * @returns {number} - Level index (0-based) or -1 if not found
 */
export function getLevelIndexById(id) {
    return levels.findIndex(level => level.id === id);
}

/**
 * Get next level after the given level ID
 * @param {string} currentLevelId - Current level ID
 * @returns {Object|null} - Next level object or null if current level is the last one
 */
export function getNextLevel(currentLevelId) {
    const currentIndex = getLevelIndexById(currentLevelId);
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
        return null;
    }
    return levels[currentIndex + 1];
}

/**
 * Get previous level before the given level ID
 * @param {string} currentLevelId - Current level ID
 * @returns {Object|null} - Previous level object or null if current level is the first one
 */
export function getPreviousLevel(currentLevelId) {
    const currentIndex = getLevelIndexById(currentLevelId);
    if (currentIndex <= 0) {
        return null;
    }
    return levels[currentIndex - 1];
}

// Export default levels array
export default levels;