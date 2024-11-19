export class TimerManager {
    constructor(scene, ui) {
        this.scene = scene;
        this.ui = ui;
        this.timerEvent = null;
        this.baseTime = 30;
        this.timeLeft = 30;
        this.level = 1;
    }

    startTimer() {
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.gameOver) return;

                this.timeLeft--;
                this.ui.updateTime(this.timeLeft);
                this.ui.updateTimerBar(this.timeLeft, this.baseTime);

                if (this.timeLeft <= 0) {
                    this.scene.lives--;
                    this.ui.updateLives(this.scene.lives);

                    if (this.scene.lives > 0) {
                        this.resetLevel();
                    } else {
                        this.scene.gameOver = true;
                        this.timerEvent.paused = true;
                        this.scene.add.text(400, 300, 'GAME OVER', { font: '32px Arial', fill: '#f00' });
                    }
                }
            },
            loop: true,
        });
    }

    resetLevel() {
        if (this.level > 9) {
            const levelReduction = Math.pow(0.95, this.level - 9);
            this.timeLeft = Math.ceil(this.baseTime * levelReduction);
        } else {
            this.timeLeft = this.baseTime;
        }

        this.ui.updateTime(this.timeLeft);
        this.ui.updateTimerBar(this.timeLeft, this.baseTime);
    }
}