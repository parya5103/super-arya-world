/**
 * Level 3 - Castle Boss
 * The final level of Super Arya World with a boss fight
 */

export default {
    name: "Castle Boss",
    id: "level3",
    width: 3200,  // Level width in pixels
    height: 480,  // Level height in pixels
    playerStart: { x: 100, y: 350 },  // Starting position
    timeLimit: 400,  // Time limit in seconds
    theme: "night",  // Night theme for castle
    music: "music-boss",  // Boss music
    
    // Background layers for parallax scrolling
    backgrounds: [
        {
            image: "bg_castle",
            scrollSpeed: 0.1,
            y: 0
        },
        {
            image: "bg_castle_torches",
            scrollSpeed: 0.2,
            y: 50
        },
        {
            image: "bg_castle_windows",
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
                { type: "ground", x: 0, y: 416, width: 1024, height: 64 },  // Starting platform
                { type: "ground", x: 1088, y: 416, width: 512, height: 64 },  // Middle platform
                { type: "ground", x: 1664, y: 416, width: 1536, height: 64 },  // Boss arena and final platform
                
                // Castle walls and ceiling
                { type: "ground", x: 0, y: 0, width: 3200, height: 64 },  // Full ceiling
                { type: "ground", x: 0, y: 64, width: 64, height: 352 },  // Left wall
                { type: "ground", x: 3136, y: 64, width: 64, height: 352 },  // Right wall
                
                // Obstacles and platforms in the castle
                { type: "ground", x: 256, y: 320, width: 64, height: 96 },  // Obstacle 1
                { type: "ground", x: 512, y: 256, width: 64, height: 160 },  // Obstacle 2
                { type: "ground", x: 768, y: 320, width: 64, height: 96 },  // Obstacle 3
                
                // Lava pits
                { type: "lava", x: 1024, y: 416, width: 64, height: 64 },  // Lava pit 1
                { type: "lava", x: 1600, y: 416, width: 64, height: 64 },  // Lava pit 2
                
                // Boss arena platforms
                { type: "platform", x: 1920, y: 320, width: 128, height: 32 },
                { type: "platform", x: 2176, y: 256, width: 128, height: 32 },
                { type: "platform", x: 2432, y: 320, width: 128, height: 32 },
                
                // Moving platforms in boss arena
                { type: "movingPlatform", x: 2048, y: 256, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1.5 },
                { type: "movingPlatform", x: 2304, y: 320, width: 64, height: 16, moveX: 0, moveY: -64, speed: 1.5 },
                
                // Blocks with power-ups
                { type: "block", x: 384, y: 256, width: 32, height: 32, contains: "mushroom" },
                { type: "block", x: 640, y: 256, width: 32, height: 32, contains: "fire" },
                { type: "block", x: 896, y: 256, width: 32, height: 32, contains: "star" },
                { type: "block", x: 1280, y: 320, width: 32, height: 32, contains: "fire" },
                { type: "block", x: 1440, y: 320, width: 32, height: 32, contains: "mushroom" },
                
                // Hidden blocks
                { type: "hiddenBlock", x: 416, y: 256, width: 32, height: 32, contains: "1up" },
                { type: "hiddenBlock", x: 1312, y: 320, width: 32, height: 32, contains: "fire" },
                { type: "hiddenBlock", x: 1472, y: 320, width: 32, height: 32, contains: "star" }
            ]
        }
    ],
    
    // Entity objects
    entities: [
        // Coins
        { type: "coin", x: 192, y: 320, value: 1 },
        { type: "coin", x: 224, y: 320, value: 1 },
        { type: "coin", x: 352, y: 320, value: 1 },
        { type: "coin", x: 384, y: 320, value: 1 },
        { type: "coin", x: 416, y: 320, value: 1 },
        { type: "coin", x: 448, y: 320, value: 1 },
        { type: "coin", x: 608, y: 224, value: 1 },
        { type: "coin", x: 640, y: 224, value: 1 },
        { type: "coin", x: 672, y: 224, value: 1 },
        { type: "coin", x: 864, y: 320, value: 1 },
        { type: "coin", x: 896, y: 320, value: 1 },
        { type: "coin", x: 928, y: 320, value: 1 },
        { type: "coin", x: 1152, y: 320, value: 1 },
        { type: "coin", x: 1184, y: 320, value: 1 },
        { type: "coin", x: 1216, y: 320, value: 1 },
        { type: "coin", x: 1248, y: 320, value: 1 },
        { type: "coin", x: 1504, y: 320, value: 1 },
        { type: "coin", x: 1536, y: 320, value: 1 },
        { type: "coin", x: 1568, y: 320, value: 1 },
        
        // Enemies before boss
        { type: "enemy", x: 200, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 400, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 600, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 700, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 900, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 1200, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 1400, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1500, y: 384, enemyType: "goomba" },
        
        // Piranha plants
        { type: "enemy", x: 300, y: 384, enemyType: "piranha" },
        { type: "enemy", x: 800, y: 384, enemyType: "piranha" },
        { type: "enemy", x: 1300, y: 384, enemyType: "piranha" },
        
        // Checkpoint before boss
        { type: "checkpoint", x: 1600, y: 352, id: "checkpoint1" },
        
        // Boss
        { type: "enemy", x: 2200, y: 320, enemyType: "boss", health: 5 },
        
        // Goal after boss
        { type: "goal", x: 3000, y: 320, goalType: "castle" }
    ]
}