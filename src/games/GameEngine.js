export class GameEngine {
    constructor(container, audioManager) {
        this.container = container;
        this.audio = audioManager;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    handleInput(key) {
        // Overridden by individual games
    }
}