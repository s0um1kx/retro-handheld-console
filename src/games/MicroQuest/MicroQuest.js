export class MicroQuest {
    constructor(width, height, audio) {
        this.width = width;
        this.height = height;
        this.audio = audio;
        this.tileSize = 12;

        this.player = { x: 2, y: 2, hp: 20 };
        this.monster = { x: 6, y: 6, hp: 10, alive: true };
        this.exit = { x: 10, y: 10 };
        this.isGameOver = false;
        this.message = "Explore!";
    }

    handleInput(action) {
        if (this.isGameOver) return;

        let dx = 0, dy = 0;
        if (action === 'UP') dy = -1;
        else if (action === 'DOWN') dy = 1;
        else if (action === 'LEFT') dx = -1;
        else if (action === 'RIGHT') dx = 1;

        if (dx !== 0 || dy !== 0) {
            const nextX = this.player.x + dx;
            const nextY = this.player.y + dy;

            if (this.monster.alive && nextX === this.monster.x && nextY === this.monster.y) {
                // Battle
                this.monster.hp -= 5;
                this.player.hp -= 2;
                this.audio.playSFX('select');
                this.message = "Hit Monster!";

                if (this.monster.hp <= 0) {
                    this.monster.alive = false;
                    this.message = "Monster Defeated!";
                }
                if (this.player.hp <= 0) {
                    this.isGameOver = true;
                    this.audio.playSFX('back');
                }
            } else if (nextX >= 1 && nextX <= 11 && nextY >= 1 && nextY <= 11) {
                this.player.x = nextX;
                this.player.y = nextY;
                this.audio.playSFX('nav');
            }

            if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
                this.message = "Dungeon Cleared!";
                this.audio.playSFX('select');
                this.isGameOver = true;
            }
        }
    }

    update() {}

    render(ctx) {
        ctx.fillStyle = '#1a2405';

        // Draw Player
        ctx.fillRect(this.player.x * this.tileSize, this.player.y * this.tileSize, this.tileSize - 2, this.tileSize - 2);

        // Draw Monster
        if (this.monster.alive) {
            ctx.fillRect(this.monster.x * this.tileSize, this.monster.y * this.tileSize, this.tileSize - 2, this.tileSize - 2);
        }

        // Exit Stairs
        ctx.strokeRect(this.exit.x * this.tileSize, this.exit.y * this.tileSize, this.tileSize - 2, this.tileSize - 2);

        // UI
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(`HP:${this.player.hp}`, 5, 160);
        ctx.fillText(this.message, 50, 160);
    }
}