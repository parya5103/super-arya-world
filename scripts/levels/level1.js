/**
 * Level 1 - Grassy Plains
 * The first level of Super Arya World
 */

export default {
    name: "Grassy Plains",
    id: "level1",
    width: 3200,  // Level width in pixels
    height: 480,  // Level height in pixels
    playerStart: { x: 100, y: 350 },  // Starting position
    timeLimit: 300,  // Time limit in seconds
    theme: "day",  // Day theme
    music: "music-level1",  // Background music
    
    // Background layers for parallax scrolling
    backgrounds: [
        {
            image: "bg_sky",
            scrollSpeed: 0.1,
            y: 0
        },
        {
            image: "bg_clouds",
            scrollSpeed: 0.2,
            y: 50
        },
        {
            image: "bg_mountains",
            scrollSpeed: 0.3,
            y: 100
        },
        {
            image: "bg_trees",
            scrollSpeed: 0.4,
            y: 150
        }
    ],
    
    // Tile layers
    tileLayers: [
        // Ground layer
        {
            name: "ground",
            tiles: [
                // Ground platforms
                { type: "ground", x: 0, y: 416, width: 800, height: 64 },  // Starting platform
                { type: "ground", x: 864, y: 416, width: 400, height: 64 },  // Second platform
                { type: "ground", x: 1328, y: 416, width: 640, height: 64 },  // Third platform
                { type: "ground", x: 2048, y: 416, width: 1152, height: 64 },  // Final platform
                
                // Elevated platforms
                { type: "platform", x: 400, y: 320, width: 128, height: 32 },
                { type: "platform", x: 592, y: 256, width: 96, height: 32 },
                { type: "platform", x: 752, y: 320, width: 64, height: 32 },
                { type: "platform", x: 1040, y: 320, width: 128, height: 32 },
                { type: "platform", x: 1200, y: 256, width: 64, height: 32 },
                { type: "platform", x: 1520, y: 320, width: 96, height: 32 },
                { type: "platform", x: 1680, y: 256, width: 128, height: 32 },
                { type: "platform", x: 1872, y: 320, width: 96, height: 32 },
                
                // Moving platforms
                { type: "movingPlatform", x: 800, y: 350, width: 64, height: 16, moveX: 64, moveY: 0, speed: 1 },
                { type: "movingPlatform", x: 1264, y: 350, width: 64, height: 16, moveX: 0, moveY: 64, speed: 1 },
                { type: "movingPlatform", x: 1968, y: 300, width: 64, height: 16, moveX: 0, moveY: 80, speed: 1.5 },
                
                // Blocks
                { type: "block", x: 480, y: 256, width: 32, height: 32 },
                { type: "block", x: 512, y: 256, width: 32, height: 32 },
                { type: "block", x: 1104, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 1136, y: 256, width: 32, height: 32, contains: "mushroom" },
                { type: "block", x: 1168, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 1744, y: 192, width: 32, height: 32, contains: "star" },
                { type: "block", x: 2240, y: 320, width: 32, height: 32, contains: "fire" },
                { type: "block", x: 2272, y: 320, width: 32, height: 32, contains: "coin" },
                { type: "block", x: 2304, y: 320, width: 32, height: 32, contains: "coin" },
                
                // Hidden blocks
                { type: "hiddenBlock", x: 544, y: 256, width: 32, height: 32, contains: "1up" },
                { type: "hiddenBlock", x: 1616, y: 256, width: 32, height: 32, contains: "coin" },
                { type: "hiddenBlock", x: 2400, y: 320, width: 32, height: 32, contains: "mushroom" }
            ]
        }
    ],
    
    // Entity objects
    entities: [
        // Coins
        { type: "coin", x: 432, y: 280, value: 1 },
        { type: "coin", x: 464, y: 280, value: 1 },
        { type: "coin", x: 496, y: 280, value: 1 },
        { type: "coin", x: 624, y: 216, value: 1 },
        { type: "coin", x: 656, y: 216, value: 1 },
        { type: "coin", x: 784, y: 280, value: 1 },
        { type: "coin", x: 1072, y: 280, value: 1 },
        { type: "coin", x: 1104, y: 280, value: 1 },
        { type: "coin", x: 1136, y: 280, value: 1 },
        { type: "coin", x: 1552, y: 280, value: 1 },
        { type: "coin", x: 1584, y: 280, value: 1 },
        { type: "coin", x: 1712, y: 216, value: 1 },
        { type: "coin", x: 1744, y: 216, value: 1 },
        { type: "coin", x: 1776, y: 216, value: 1 },
        { type: "coin", x: 1904, y: 280, value: 1 },
        { type: "coin", x: 1936, y: 280, value: 1 },
        { type: "coin", x: 2112, y: 376, value: 1 },
        { type: "coin", x: 2144, y: 376, value: 1 },
        { type: "coin", x: 2176, y: 376, value: 1 },
        { type: "coin", x: 2208, y: 376, value: 1 },
        
        // Enemies
        { type: "enemy", x: 500, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 600, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1000, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1100, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1400, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 1600, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 1700, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 2200, y: 384, enemyType: "koopa" },
        { type: "enemy", x: 2400, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 2500, y: 384, enemyType: "goomba" },
        { type: "enemy", x: 2600, y: 384, enemyType: "koopa" },
        
        // Checkpoint
        { type: "checkpoint", x: 1600, y: 352, id: "checkpoint1" },
        
        // Goal
        { type: "goal", x: 3000, y: 320, goalType: "flag" }
    ]
};