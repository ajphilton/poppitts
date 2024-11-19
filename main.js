import { UI } from './ui.js'; // Correct import for UI

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

let bubbles = [];
let score = 0;
let lives = 3;
let timeLeft = 30;
let baseTime = 30; // Base time for timer reductions
let level = 1;
let gameOver = false;
let timerEvent;
let particleEmitter;
let particles;

let ui; // UI instance
let highScore = 0; // Variable to store the high score

// Declare popSound globally for Howler integration
let popSound;
let errorSound;
let winSound;
let gameOverSound;
let backgroundMusic;

// Function to handle Howler audio setup and playback
function preload() {
    // Ensure audio context is resumed at the beginning
    ensureAudioContextResumed();

    this.load.image('bubble', 'assets/bubble.png');
    this.load.image('bubble_active', 'assets/bubble_active.png');
    this.load.image('particle', 'assets/particle.png');
    this.load.image('restart', 'assets/restart.png');
    // No need to preload 'pop' sound, as we'll use Howler for playback
}

function create() {
    // Load the high score from localStorage (if it exists)
    highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

    // Initialize UI
    ui = new UI(this);
    ui.createUI();
    ui.updateHighScore(highScore); // Display the high score on the UI

    // Initialize background music
    if (!backgroundMusic) {
        backgroundMusic = new Howl({
            src: ['assets/loop.wav'], // Path to your looping music
            loop: true,              // Enable looping
            volume: 0.5,             // Adjust volume if needed
            onplayerror: function () {
                console.error('Error playing background music');
            },
        });

        backgroundMusic.play(); // Start playing the music
    }

    // Initialize other sounds
    if (!popSound) {
        popSound = new Howl({
            src: ['assets/pop.wav'],
            volume: 0.5,
            onplayerror: function () {
                console.error('Error playing pop sound');
            },
        });
    }

    if (!winSound) {
        winSound = new Howl({
            src: ['assets/win.wav'],
            volume: 0.7,
            onplayerror: function () {
                console.error('Error playing win sound');
            },
        });
    }

    if (!errorSound) {
        errorSound = new Howl({
            src: ['assets/error.mp3'],
            volume: 0.5,
            onplayerror: function () {
                console.error('Error playing error sound');
            },
        });
    }

    if (!gameOverSound) {
        gameOverSound = new Howl({
            src: ['assets/gameover.wav'],
            volume: 0.7,
            onplayerror: function () {
                console.error('Error playing game over sound');
            },
        });
    }

    // Create bubble grid
    createBubbleGrid(this);

    // Add particle effect
    particles = this.add.particles('particle');

    // Start timer
    startTimer(this);

    // Listen for bubble clicks
    this.input.on('gameobjectdown', onBubbleClick, this);
}

// Force audio context to resume on first interaction
function ensureAudioContextResumed() {
    if (Phaser.Sound.WebAudioContext && Phaser.Sound.WebAudioContext.state === 'suspended') {
        Phaser.Sound.WebAudioContext.resume()
            .then(() => {
                console.log('Audio context resumed');
            })
            .catch((err) => {
                console.error('Audio context resume error:', err);
            });
    }
}

function update() {
    if (gameOver) {
        if (backgroundMusic && backgroundMusic.playing()) {
            backgroundMusic.stop(); // Stop the background music
        }
        return;
    }

    if (lives <= 0) {
        gameOver = true;
        timerEvent.paused = true;
        ui.showGameOverMessage(); // Display "Game Over"

        // Play the game over sound
        if (gameOverSound && !gameOverSound.playing()) {
            gameOverSound.play();
        }

        // Longer vibration at game over
        if (navigator.vibrate) {
            navigator.vibrate(500); // Longer vibration for game over
        }

        // Save high score if it's a new one
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore); // Save to localStorage
            ui.updateHighScore(highScore); // Update UI
        }

        // Refresh the page after 2 seconds
        setTimeout(() => {
            location.reload(); // Force a refresh
        }, 2000); // 2000ms delay
    }
}

// Create a grid of bubbles
function createBubbleGrid(scene) {
    const rows = 5; // Number of rows
    const cols = 8; // Number of columns
    const bubbleSize = 80; // Base size of the bubble
    const spacing = 20; // Space between bubbles
    const gridWidth = (bubbleSize + spacing) * cols - spacing; // Total grid width
    const gridHeight = (bubbleSize + spacing) * rows - spacing; // Total grid height
    const xOffset = (config.width - gridWidth) / 1.5; // Center horizontally
    const yOffset = (config.height - gridHeight) / 1; // Center vertically

    bubbles = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const x = xOffset + j * (bubbleSize + spacing); // Horizontal position
            const y = yOffset + i * (bubbleSize + spacing); // Vertical position
            let bubble = scene.add.sprite(x, y, 'bubble').setInteractive();
            bubble.setScale(bubbleSize / 500); // Scale bubble proportionally
            bubble.active = false; // Set to inactive initially
            bubbles.push(bubble);
        }
    }

    updateBubbleStates(); // Update active/inactive states for the bubbles
}

// Update the active/inactive state of bubbles
function updateBubbleStates() {
    console.log("Updating bubble states for level:", level);

    bubbles.forEach(bubble => {
        bubble.setTexture('bubble');
        bubble.active = false;
    });

    const maxActive = level > 9 ? 9 : level;
    const bubblesToActivate = Phaser.Math.Between(1, maxActive);
    const activeBubbles = Phaser.Utils.Array.Shuffle(bubbles).slice(0, bubblesToActivate);

    activeBubbles.forEach(bubble => {
        bubble.setTexture('bubble_active');
        bubble.active = true;
    });

    console.log("Active bubbles:", activeBubbles.length);
}

// Handle bubble clicks
function onBubbleClick(pointer, bubble) {
    if (gameOver) return;

    if (bubble.active) {
        // Correct tap: Increase score, update UI, create particle effect, and play sound
        score++;
        bubble.setTexture('bubble');
        bubble.active = false;
        ui.updateScore(score); // Update the score UI
        createParticleEffect(bubble.x, bubble.y);

        // Play the pop sound using Howler
        if (popSound && !popSound.playing()) {
            popSound.play();
        }

        // Short vibration for correct tap
        if (navigator.vibrate) {
            navigator.vibrate(100); // Short vibration for correct tap
        }
    } else {
        // Incorrect tap: Decrease lives and update UI
        lives--;
        ui.updateLives(lives); // Update the lives UI

        // Play the error sound using Howler
        if (errorSound && !errorSound.playing()) {
        errorSound.play();
        }

        // Short vibration for incorrect tap
        if (navigator.vibrate) {
            navigator.vibrate(100); // Short vibration for incorrect tap
        }
    }

    // Check if all active bubbles are clicked
    if (bubbles.every(b => !b.active)) {
        winLevel(this);
    }
}

// Start the timer
function startTimer(scene) {
    timerEvent = scene.time.addEvent({
        delay: 1000,  // Timer decreases every second
        callback: () => {
            if (gameOver) return;

            timeLeft--; // Decrease time each second
            ui.updateTime(timeLeft); // Update the timer UI
            ui.updateTimerBar(timeLeft, baseTime); // Update the timer bar UI

            if (timeLeft <= 0) {
                lives--; // Lose a life when time runs out
                ui.updateLives(lives); // Update the lives UI
                if (lives > 0) {
                    resetLevel(); // Reset level if lives are left
                }
            }
        },
        loop: true,
    });
}

// Reset bubbles and timer for the next level
function resetLevel() {
    timerEvent.paused = true; // Pause the timer during reset

    if (level > 9) {
        const levelReduction = Math.pow(0.95, level - 9);
        timeLeft = Math.ceil(baseTime * levelReduction);
    } else {
        timeLeft = baseTime;
    }

    updateBubbleStates(); // Update active/inactive bubbles
    ui.updateTime(timeLeft);
    ui.updateTimerBar(timeLeft, baseTime);

    // Ensure everything is properly reset before resuming
    this.time.delayedCall(100, () => {
        timerEvent.paused = false; // Resume timer after short delay
    });
}

// Handle winning the level
function winLevel(scene) {
    timerEvent.paused = true; // Pause the timer during win state
    ui.showWinMessage();

    // Play the win sound
    if (winSound) {
        winSound.play();
    }

    // Pop sound continues playing if it's already triggered
    // No need to stop it!

    // Delayed reset for the next level
    scene.time.delayedCall(2000, () => {
        ui.hideWinMessage();
        level++;

        // Reset the level and ensure the grid is ready
        resetLevel.call(scene);

        // Resume timer explicitly
        timerEvent.paused = false;
    });
}

// Create a particle effect
function createParticleEffect(x, y) {
    if (particleEmitter) {
        particleEmitter.stop();
    }

    particleEmitter = particles.createEmitter({
        x: x,
        y: y,
        speed: { min: -200, max: 200 },
        scale: { start: 0.5, end: 0 },
        lifespan: 500,
        quantity: 10,
        blendMode: 'ADD',
    });

    setTimeout(() => {
        if (particleEmitter) particleEmitter.stop();
    }, 500);
}