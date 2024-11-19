export class UI {
    constructor(scene) {
        this.scene = scene;
        this.scoreText = null;
        this.livesText = null;
        this.timerText = null;
        this.winText = null;
        this.gameOverText = null;
        this.timerBar = null;
        this.highScoreText = null;  // To display high score
        this.restartButton = null;  // To hold the restart button image
    }

    createUI() {
        // Get the center of the screen
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;

        // Display score, lives, and timer
        this.scoreText = this.scene.add.text(10, 10, 'Score: 0', { font: '16px Arial', fill: '#fff' });
        this.scoreText.setDepth(1); // Set depth to ensure UI is on top

        this.livesText = this.scene.add.text(10, 30, 'Lives: 3', { font: '16px Arial', fill: '#fff' });
        this.livesText.setDepth(1); // Set depth to ensure UI is on top

        this.timerText = this.scene.add.text(10, 50, 'Time: 30', { font: '16px Arial', fill: '#fff' });
        this.timerText.setDepth(1); // Set depth to ensure UI is on top

        this.timerBar = this.scene.add.rectangle(600, 20, 400, 20, 0x00ff00).setOrigin(0.5, 0.5);
        this.timerBar.setDepth(1); // Set depth to ensure UI is on top

        // "You Win!" and "Game Over" messages, centered based on the screen size
        this.winText = this.scene.add.text(centerX, centerY - 50, 'You Win!', { font: '100px Arial', fill: '#0f0' });
        this.winText.setVisible(false);
        this.winText.setOrigin(0.5, 0.5); // Center the text at (centerX, centerY)
        this.winText.setDepth(2); // Set depth to ensure UI is on top

        this.gameOverText = this.scene.add.text(centerX, centerY - 50, 'Game Over', { font: '100px Arial', fill: '#f00' });
        this.gameOverText.setVisible(false);
        this.gameOverText.setOrigin(0.5, 0.5); // Center the text at (centerX, centerY)
        this.gameOverText.setDepth(2); // Set depth to ensure UI is on top

        // High score display
        this.highScoreText = this.scene.add.text(10, 70, 'High Score: 0', { font: '16px Arial', fill: '#fff' });
        this.highScoreText.setDepth(1); // Set depth to ensure UI is on top

        // Load the restart button image (make sure to preload this image in the scene)
        this.scene.load.image('restart', 'assets/restart.png');
    }

    showRestartButton() {
        // Display the restart button after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            // Create the restart button image and make it interactive
            this.restartButton = this.scene.add.image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY + 50, 'restart');
            this.restartButton.setOrigin(0.5, 0.5); // Center the button
            this.restartButton.setDepth(3); // Ensure it's above the text
            this.restartButton.setInteractive(); // Make the button clickable

            // Hide the game over text
            this.gameOverText.setVisible(false);

            // Add click event listener for restarting the game
            this.restartButton.on('pointerdown', () => {
                this.restartGame();
            });
        });
    }

    restartGame() {
        // Restart the game by reloading the scene or resetting necessary game states
        this.scene.scene.restart(); // This will restart the current scene
    }

    updateScore(score) {
        this.scoreText.setText(`Score: ${score}`);
    }

    updateLives(lives) {
        this.livesText.setText(`Lives: ${lives}`);
    }

    updateTime(timeLeft) {
        this.timerText.setText(`Time: ${timeLeft}`);
    }

    updateTimerBar(timeLeft, baseTime) {
        const percentage = timeLeft / baseTime;
        const barWidth = 400 * percentage;
        let color = 0x00ff00; // Green

        if (percentage <= 0.33) {
            color = 0xff0000; // Red
        } else if (percentage <= 0.66) {
            color = 0xffa500; // Orange
        }

        this.timerBar.setSize(barWidth, 20);
        this.timerBar.setFillStyle(color);
    }

    showWinMessage() {
        this.winText.setVisible(true);
    }

    hideWinMessage() {
        this.winText.setVisible(false);
    }

    showGameOverMessage() {
        this.gameOverText.setVisible(true);
    }

    hideGameOverMessage() {
        this.gameOverText.setVisible(false);
    }

    updateHighScore(highScore) {
        this.highScoreText.setText(`High Score: ${highScore}`);
    }
}