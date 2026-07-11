import { PreGameCardRenderer } from './PreGameCard.js';

export class GameEngine {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = audioManager;
        
        this.width = canvas.width = 160;
        this.height = canvas.height = 170;

        this.state = 'IDLE'; // IDLE, CARD, PLAYING, GAME_OVER
        this.currentGameKey = null;
        this.currentGameInstance = null;
        this.animationFrameId = null;
    }

    launchCard(gameKey, gameConstructor) {
        this.currentGameKey = gameKey;
        this.gameConstructor = gameConstructor;
        this.state = 'CARD';
        this.startLoop();
    }

    startGame() {
        if (!this.gameConstructor) return;
        this.currentGameInstance = new this.gameConstructor(this.width, this.height, this.audio);
        this.state = 'PLAYING';
    }

    stop() {
        this.state = 'IDLE';
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    handleInput(action) {
        if (this.state === 'CARD') {
            if (action === 'A') {
                this.audio.playSFX('select');
                this.startGame();
            } else if (action === 'B') {
                this.audio.playSFX('back');
                this.stop();
                return 'EXIT';
            }
        } else if (this.state === 'PLAYING' && this.currentGameInstance) {
            if (action === 'B' && this.currentGameInstance.isGameOver) {
                this.stop();
                return 'EXIT';
            }
            this.currentGameInstance.handleInput(action);
        }
        return 'CONTINUE';
    }

    startLoop() {
        const loop = () => {
            this.update();
            this.render();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(loop);
    }

    update() {
        if (this.state === 'PLAYING' && this.currentGameInstance) {
            this.currentGameInstance.update();
            if (this.currentGameInstance.isGameOver) {
                this.state = 'GAME_OVER';
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#8b9d2e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.state === 'CARD') {
            PreGameCardRenderer.render(this.ctx, this.width, this.height, this.currentGameKey);
        } else if ((this.state === 'PLAYING' || this.state === 'GAME_OVER') && this.currentGameInstance) {
            this.currentGameInstance.render(this.ctx);
            if (this.state === 'GAME_OVER') {
                this.renderGameOver();
            }
        }
    }

    renderGameOver() {
        this.ctx.fillStyle = 'rgba(26, 36, 5, 0.85)';
        this.ctx.fillRect(10, 50, 140, 60);

        this.ctx.fillStyle = '#8b9d2e';
        this.ctx.font = 'bold 12px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', 80, 75);
        this.ctx.font = '9px "Courier New", monospace';
        this.ctx.fillText('Press [B] to Exit', 80, 95);
    }
}