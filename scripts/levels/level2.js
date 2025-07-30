/**
 * Level 2 - Underground Caverns
 * The second level of Super Arya World
 */

export default {
    name: "Underground Caverns",
    id: "level2",
    width: 3840,  // Level width in pixels
    height: 480,  // Level height in pixels
    playerStart: { x: 100, y: 350 },  // Starting position
    timeLimit: 300,  // Time limit in seconds
    theme: "night",  // Night theme for underground
    music: "music-level2",  // Background music
    
    // Background layers for parallax scrolling
    backgrounds: [
        {
            image: "bg_underground",
            scrollSpeed: 0.1,
            y: 0
        },
        {
            image: "bg_underground_crystals",
            scrollSpeed: 0.2,
            y: 50
        },
        {
            image: "bg_underground_stalactites",
            scrollSpeed: 0.3,
            y: 0
        }
    ],
    
    // Tile layers
    tileLayers: [
        // Ground layer
        {
            name: "ground",
            tiles: [
                // Main ground platforms
                { type: "ground", x: 0, y: 416, width: 640, height: 64 },  // Starting platform
                { type: "ground", x: 704, y: 416, width: 384, height: 64 },  // Second platform
                { type: "ground", x: 1152, y: 416, width: 512, height: 64 },  // Third platform
                { type: "ground", x: 1728, y: 416, width: 384, height: 64 },  // Fourth platform
                { type: "ground", x: 2176, y: 416, width: 640, height: 64 },  // Fifth platform
                { type: "ground", x: 2880, y: 416, width: 960, height: 64 },  // Final platform
                
                // Ceiling
                { type: "ground", x: 0, y: 0, width: 3840, height: 64 },  // Full ceiling
                
                // Stalactites (ceiling obstacles)
                { type: "ground", x: 320, y: 64, width: 32, height: 32 },
                { type: "ground", x: 512, y: 64, width: 32, height: 48 },
                { type: "ground", x: 768, y: 64, width: 32, height: 64 },
                { type: "ground", x: 1024, y: 64, width: 32, height: 32 },
                { type: "ground", x: 1280, y: 64, width: 32, height: 48 },
                { type: "ground", x: 1536, y: 64, width: 32, height: 32 },
                { type: "ground", x: 1792, y: 64, width: 32, height: 64 },
                { type: "ground", x: 2048, y: 64, width: 32, height: 32 },
                { type: "ground", x: 2304, y: 64, width: 32, height: 48 },
                { type: "ground", x: 2560, y: 64, width: 32, height: 32 },
                { type: "ground", x: 2816, y: 64, width: 32, height: 64 },
                { type: "ground", x: 3072, y: 64, width: 32, height: 32 },
                { type: "ground", x: 3328, y: 64, width: 32, height: 48 },
                { type: "ground", x: 3584, y: 64, width: 32, height: 32 },
                
                // Elevated platforms
                { type: "platform", x: 384, y: 320, width: 128, height: 32 },
                { type: "platform", x: 576, y: 256, width: 96, height: 32 },
                { type: "platform", x: 832, y: 320, width: 128, height: 32 },
                { type: "platform", x: 1024, y: 256, width: 96, height: 32 },
                { type: "platform", x: 1280, y: 320, width: 128, height: 32 },
                { type: "platform", x: 1472, y: 256, width: 96, height: 32 },
                { type: "platform", x: 1856, y: 320, width: 128, height: 32 },
                { type: "platform", x: 2048, y: 256, width: 96, height: 32 },
                { type: "platform", x: 2304, y: 320, width: 128, height: 32 },
                { type: "platform", x: 2496, y: 256, width: 96, height: 32 },
                { type: "platform", x: 2752, y: 320, width: 96, height: 32 },
                
                // Moving platforms
                { type: "movingPlatform", x: 640, y: 350, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1 },
                { type: "movingPlatform", x: 1088, y: 350, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1 },
                { type: "movingPlatform", x: 1664, y: 350, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1 },
                { type: "movingPlatform", x: 2112, y: 350, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1 },
                { type: "movingPlatform", x: 2816, y: 350, width: 64, height: 16, moveX: 64, moveY: 0, speed: 1.5 },
                
                // Blocks
                { type: "block", x: 448, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 480, y: 256, width: 32, height: 32, contains: "mushroom" },
                { type: "block", x: 896, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 928, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 1344, y: 256, width: 32, height: 32, contains: "fire" },
                { type: "block", x: 1376, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 1920, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 1952, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 2368, y: 256, width: 32, height: 32, contains: "star" },
                { type: "block", x: 2400, y: 256, width: 32, height: 32, contains: "coin" },
                
                // Hidden blocks
                { type: "hiddenBlock", x: 512, y: 256, width: 32, height: 32, contains: "1up" },
                { type: "hiddenBlock", x: 1408, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "hiddenBlock", x: 1984, y: 256, width: 32, height: 32, contains: "mushroom" },
                { type: "hiddenBlock", x: 2432, y: 256, width: 32, height: 32, contains: "coin" }
            ]
        }
    ],
    
    // Entity objects
    entities: [
        // Coins
        { type: "coin", x: 416, y: 280, value: 1 },
        { type: "coin", x: 448, y: 280, value: 1 },
        { type: "coin", x: 608, y: 216, value: 1 },
        { type: "coin", x: 640, y: 216, value: 1 },
        { type: "coin", x: 864, y: 280, value: 1 },
        { type: "coin", x: 896, y: 280, value: 1 },
        { type: "coin", x: 1056, y: 216, value: 1 },
        { type: "coin", x: 1088, y: 216, value: 1 },
        { type: "coin", x: 1312, y: 280, value: 1 },
        { type: "coin", x: 1344, y: 280, value: 1 },
        { type: "coin", x: 1504, y: 216, value: 1 },
        { type: "coin", x: 1536, y: 216, value: 1 },
        { type: "coin", x: 1888, y: 280, value: 1 },
        { type: "coin", x: 1920, y: 280, value: 1 },
        { type: "coin", x: 2080, y: 216, value: 1 },
        { type: "coin", x: 2112, y: 216, value: 1 },
        { type: "coin", x: 2336, y: 280, value: 1 },
        { type: "coin", x: 2368, y: 280, value: 1 },
        { type: "coin", x: 2528, y: 216, value: 1 },
        { type: "coin", x: 2560, y: 216, value: 1 },
        { type: "coin", x: 2784, y: 280, value: 1 },
        { type: "coin", x: 2816, y: 280, value: 1 },
        
        // Enemies
        { type: "enemy", x: 300, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 500, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 800, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 1000, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1200, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1400, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 1600, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1900, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 2200, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 2400, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 2600, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 3000, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 3200, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 3400, y: 384, enemyType: "goomba" },
        
        // Special enemy - piranha plant
        { type: "enemy", x: 1000, y: 384, enemyType: "piranha" },
        { type: "enemy", x: 2000, y: 384, enemyType: "piranha" },
        { type: "enemy", x: 3000, y: 384, enemyType: "piranha" },
        
        // Checkpoint
        { type: "checkpoint", x: 1920, y: 352, id: "checkpoint1" },
        
        // Goal
        { type: "goal", x: 3700, y: 320, goalType: "flag" }
    ]
};