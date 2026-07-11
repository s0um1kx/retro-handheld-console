export class CosmicGrid {
    constructor(width, height, audio) {
        this.width = width;
        this.height = height;
        this.audio = audio;
        this.isGameOver = false;
        this.score = 0;

        this.player = { x: width / 2 - 6, y: height - 20, w: 12, h: 6 };
        this.bullets = [];
        this.invaders = [];
        this.invaderDir = 1;
        this.invaderStepTimer = 0;

        this.initInvaders();
    }

    initInvaders() {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
                this.invaders.push({
                    x: 15 + (c * 20),
                    y: 20 + (r * 15),
                    w: 10,
                    h: 8,
                    alive: true
                });
            }
        }
    }

    handleInput(action) {
        if (this.isGameOver) return;
        if (action === 'LEFT' && this.player.x > 5) {
            this.player.x -= 6;
        } else if (action === 'RIGHT' && this.player.x < this.width - 17) {
            this.player.x += 6;
        } else if (action === 'A' && this.bullets.length < 2) {
            this.bullets.push({ x: this.player.x + 5, y: this.player.y - 4, w: 2, h: 4 });
            this.audio.playSFX('select');
        }
    }

    update() {
        if (this.isGameOver) return;

        // Bullets logic
        this.bullets.forEach((b, idx) => {
            b.y -= 4;
            if (b.y < 0) this.bullets.splice(idx, 1);
        });

        // Invader movement
        this.invaderStepTimer++;
        if (this.invaderStepTimer > 25) {
            this.invaderStepTimer = 0;
            let edgeReached = false;

            this.invaders.forEach(inv => {
                if (!inv.alive) return;
                inv.x += this.invaderDir * 4;
                if (inv.x <= 5 || inv.x >= this.width - 15) edgeReached = true;
            });

            if (edgeReached) {
                this.invaderDir *= -1;
                this.invaders.forEach(inv => {
                    if (inv.alive) inv.y += 6;
                    if (inv.alive && inv.y >= this.player.y - 8) this.isGameOver = true;
                });
            }
        }

        // Bullet-Invader Collisions
        this.bullets.forEach((b, bIdx) => {
            this.invaders.forEach(inv => {
                if (inv.alive && b.x >= inv.x && b.x <= inv.x + inv.w && b.y >= inv.y && b.y <= inv.y + inv.h) {
                    inv.alive = false;
                    this.bullets.splice(bIdx, 1);
                    this.score += 50;
                    this.audio.playSFX('nav');
                }
            });
        });

        if (this.invaders.every(i => !i.alive)) {
            this.initInvaders();
        }
    }

    render(ctx) {
        ctx.fillStyle = '#1a2405';

        // Draw Player Ship
        ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
        ctx.fillRect(this.player.x + 4, this.player.y - 3, 4, 3);

        // Draw Bullets
        this.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

        // Draw Invaders
        this.invaders.forEach(inv => {
            if (inv.alive) {
                ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
            }
        });

        // Draw Score
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(`SCORE: ${this.score}`, 10, 10);
    }
}