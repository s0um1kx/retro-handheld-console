export class CosmicGrid {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        this.player = {
            x: width / 2 - 6,
            y: height - 15,
            width: 12,
            height: 6,
            speed: 2
        };

        this.bullets = [];
        this.aliens = [];
        this.score = 0;
        this.isGameOver = false;

        this.alienDirection = 1;
        this.alienStepDown = false;

        this.initAliens();
    }

    initAliens() {
        this.aliens = [];
        const rows = 3;
        const cols = 6;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.aliens.push({
                    x: 15 + c * 20,
                    y: 25 + r * 14,
                    width: 10,
                    height: 8,
                    alive: true
                });
            }
        }
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'LEFT') {
            this.player.x = Math.max(4, this.player.x - this.player.speed);
        } else if (action === 'RIGHT') {
            this.player.x = Math.min(this.width - this.player.width - 4, this.player.x + this.player.speed);
        } else if (action === 'A') {
            if (this.bullets.length < 3) {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 1,
                    y: this.player.y,
                    width: 2,
                    height: 4,
                    speed: 4
                });
                this.audio.playSFX('select');
            }
        }
    }

    update() {
        if (this.isGameOver) return;

        // Bullets logic
        this.bullets.forEach((b, index) => {
            b.y -= b.speed;
            if (b.y < 0) this.bullets.splice(index, 1);
        });

        // Alien movement
        let edgeReached = false;
        const activeAliens = this.aliens.filter(a => a.alive);

        if (activeAliens.length === 0) {
            this.initAliens();
            return;
        }

        activeAliens.forEach(a => {
            if ((a.x <= 5 && this.alienDirection === -1) || (a.x >= this.width - a.width - 5 && this.alienDirection === 1)) {
                edgeReached = true;
            }
        });

        if (edgeReached) {
            this.alienDirection *= -1;
            activeAliens.forEach(a => {
                a.y += 4;
                if (a.y + a.height >= this.player.y) {
                    this.isGameOver = true;
                }
            });
        } else {
            activeAliens.forEach(a => {
                a.x += 0.3 * this.alienDirection;
            });
        }

        // Bullet & Alien Collision Detection
        this.bullets.forEach((b, bIdx) => {
            this.aliens.forEach(a => {
                if (a.alive &&
                    b.x < a.x + a.width &&
                    b.x + b.width > a.x &&
                    b.y < a.y + a.height &&
                    b.y + b.height > a.y) {
                    a.alive = false;
                    this.bullets.splice(bIdx, 1);
                    this.score += 20;
                }
            });
        });
    }

    render(ctx) {
        // Draw Score Overlay Top-Left
        ctx.fillStyle = '#1a2405';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE: ${this.score}`, 6, 6);

        // Draw Player Ship
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.fillRect(this.player.x + 4, this.player.y - 2, 4, 2);

        // Draw Bullets
        this.bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Draw Aliens
        this.aliens.forEach(a => {
            if (a.alive) {
                ctx.fillRect(a.x, a.y, a.width, a.height);
            }
        });
    }
}