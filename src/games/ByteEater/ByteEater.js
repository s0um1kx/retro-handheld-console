export class ByteEater {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        this.gridSize = 8;
        this.margin = 16;
        this.playArea = {
            x: 8,
            y: 20,
            cols: Math.floor((width - 16) / this.gridSize), // 18 cols
            rows: Math.floor((height - 28) / this.gridSize)  // 17 rows
        };

        this.score = 0;
        this.isGameOver = false;

        // Snake state
        this.snake = [
            { x: 5, y: 8 },
            { x: 4, y: 8 },
            { x: 3, y: 8 }
        ];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };

        // Food & Particles
        this.food = { x: 12, y: 8 };
        this.particles = [];

        // Dynamic Speed Tuning
        this.tickCount = 0;
        this.animTick = 0;

        this.spawnFood();
    }

    // Dynamic speed formula: Starts relaxed (14), speeds up as score increases
    getTickInterval() {
        return Math.max(5, 14 - Math.floor(this.score / 30));
    }

    spawnFood() {
        let valid = false;
        while (!valid) {
            this.food.x = Math.floor(Math.random() * this.playArea.cols);
            this.food.y = Math.floor(Math.random() * this.playArea.rows);

            valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y);
        }
    }

    spawnEatParticles(gx, gy) {
        const px = this.playArea.x + gx * this.gridSize + 4;
        const py = this.playArea.y + gy * this.gridSize + 4;
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 8
            });
        }
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'UP' && this.dir.y === 0) {
            this.nextDir = { x: 0, y: -1 };
        } else if (action === 'DOWN' && this.dir.y === 0) {
            this.nextDir = { x: 0, y: 1 };
        } else if (action === 'LEFT' && this.dir.x === 0) {
            this.nextDir = { x: -1, y: 0 };
        } else if (action === 'RIGHT' && this.dir.x === 0) {
            this.nextDir = { x: 1, y: 0 };
        }
    }

    update() {
        if (this.isGameOver) return;

        this.animTick++;

        // Particle updates
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.tickCount++;
        if (this.tickCount < this.getTickInterval()) return;
        this.tickCount = 0;

        // Apply direction update
        this.dir = { ...this.nextDir };

        const head = {
            x: this.snake[0].x + this.dir.x,
            y: this.snake[0].y + this.dir.y
        };

        // Wall Collision
        if (
            head.x < 0 || head.x >= this.playArea.cols ||
            head.y < 0 || head.y >= this.playArea.rows
        ) {
            this.isGameOver = true;
            return;
        }

        // Self Collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.isGameOver = true;
            return;
        }

        this.snake.unshift(head);

        // Food Eating
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.spawnEatParticles(this.food.x, this.food.y);
            this.spawnFood();
            this.audio.playSFX('select');
        } else {
            this.snake.pop();
        }
    }

    drawHead(ctx, px, py) {
        const DARK = '#1a2405';
        const LIGHT = '#8b9d2e';

        // Base rounded head fill
        ctx.fillStyle = DARK;
        ctx.fillRect(px + 1, py + 1, 6, 6);

        // Render Eyes based on direction
        ctx.fillStyle = LIGHT;
        if (this.dir.x === 1) { // Right
            ctx.fillRect(px + 5, py + 2, 1, 1);
            ctx.fillRect(px + 5, py + 5, 1, 1);
        } else if (this.dir.x === -1) { // Left
            ctx.fillRect(px + 2, py + 2, 1, 1);
            ctx.fillRect(px + 2, py + 5, 1, 1);
        } else if (this.dir.y === -1) { // Up
            ctx.fillRect(px + 2, py + 2, 1, 1);
            ctx.fillRect(px + 5, py + 2, 1, 1);
        } else if (this.dir.y === 1) { // Down
            ctx.fillRect(px + 2, py + 5, 1, 1);
            ctx.fillRect(px + 5, py + 5, 1, 1);
        }
    }

    drawBodySegment(ctx, px, py) {
        const DARK = '#1a2405';
        const LIGHT = '#8b9d2e';

        ctx.fillStyle = DARK;
        ctx.fillRect(px + 1, py + 1, 6, 6);

        // Center light highlight (matching Screenshot 2026-07-11 160508.png pattern)
        ctx.fillStyle = LIGHT;
        ctx.fillRect(px + 3, py + 3, 2, 2);
    }

    drawTailSegment(ctx, px, py) {
        const DARK = '#1a2405';
        ctx.fillStyle = DARK;
        ctx.fillRect(px + 2, py + 2, 4, 4);
    }

    render(ctx) {
        const DARK = '#1a2405';

        // 1. Header Display
        ctx.fillStyle = DARK;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE:${this.score}`, 8, 5);

        // Speed level indicator in header
        const speedLvl = Math.floor(this.score / 30) + 1;
        ctx.textAlign = 'right';
        ctx.fillText(`SPD:${speedLvl}`, this.width - 8, 5);

        // Header Border Line
        ctx.fillRect(6, 15, this.width - 12, 1);

        // 2. Outer Border Frame
        const bx = this.playArea.x - 2;
        const by = this.playArea.y - 2;
        const bw = this.playArea.cols * this.gridSize + 4;
        const bh = this.playArea.rows * this.gridSize + 4;

        ctx.strokeStyle = DARK;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);

        // 3. Render Food ("Byte" Sprite with pulse)
        const fx = this.playArea.x + this.food.x * this.gridSize;
        const fy = this.playArea.y + this.food.y * this.gridSize;

        ctx.fillStyle = DARK;
        ctx.fillRect(fx + 2, fy + 1, 4, 6);
        ctx.fillRect(fx + 1, fy + 2, 6, 4);

        if (Math.floor(this.animTick / 15) % 2 === 0) {
            ctx.fillStyle = '#8b9d2e';
            ctx.fillRect(fx + 3, fy + 3, 2, 2);
        }

        // 4. Render Snake
        for (let i = 0; i < this.snake.length; i++) {
            const seg = this.snake[i];
            const px = this.playArea.x + seg.x * this.gridSize;
            const py = this.playArea.y + seg.y * this.gridSize;

            if (i === 0) {
                this.drawHead(ctx, px, py);
            } else if (i === this.snake.length - 1) {
                this.drawTailSegment(ctx, px, py);
            } else {
                this.drawBodySegment(ctx, px, py);
            }
        }

        // 5. Render Particles
        ctx.fillStyle = DARK;
        this.particles.forEach(p => {
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
        });
    }
}