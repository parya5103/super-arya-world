/**
 * Cheat Manager
 * Handles game cheats and debug features
 */

export class CheatManager {
    constructor() {
        this.cheats = {
            godMode: false,
            infiniteLives: false,
            infiniteTime: false,
            debugMode: false
        };
    }

    /**
     * Activate a cheat
     * @param {string} cheatName - Name of the cheat to activate
     */
    activate(cheatName) {
        if (this.cheats[cheatName] !== undefined) {
            this.cheats[cheatName] = true;
            console.log(`Cheat activated: ${cheatName}`);
        }
    }

    /**
     * Deactivate a cheat
     * @param {string} cheatName - Name of the cheat to deactivate
     */
    deactivate(cheatName) {
        if (this.cheats[cheatName] !== undefined) {
            this.cheats[cheatName] = false;
            console.log(`Cheat deactivated: ${cheatName}`);
        }
    }

    /**
     * Check if a cheat is active
     * @param {string} cheatName - Name of the cheat to check
     * @returns {boolean} Whether the cheat is active
     */
    isActive(cheatName) {
        return this.cheats[cheatName] || false;
    }
}
