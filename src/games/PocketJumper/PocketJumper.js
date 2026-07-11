export class PocketJumper {
    constructor(width, height, audio) {
        this.width = width;
        this.height = height;
        this.audio = audio;

        this.player = { x: 20, y: 120, vx: 0, vy: 0, w: 8, h: 10, grounded: false };
        this.platforms = [
            { x: 0, y: 150, w: 160, h: 20 },
            { x: 30, y: 120, w: 40, h: 6 },
            { x: 80, y: 90, w: 40, h: 6 },
            { x: 120, y: 60, w: 30, h: 6 }
        ];

        this.flag = { x: 135, y: 42, w: 8, h: 18 };
        this.score = 0;
        this.isGameOver = false;
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'LEFT') this.player.vx = -2;
        else if (action === 'RIGHT') this.player.vx = 2;
        else if (action === 'A' && this.player.grounded) {
            this.player.vy = -6.5;
            this.player.grounded = false;
            this.audio.playSFX('nav');
        }
    }

    update() {
        if (this.isGameOver) return;

        this.player.vy += 0.35; // Gravity
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        this.player.vx *= 0.8; // Friction

        // Platform collision
        this.player.grounded = false;
        this.platforms.forEach(p => {
            if (this.player.x + this.player.w > p.x && this.player.x < p.x + p.w &&
                this.player.y + this.player.h >= p.y && this.player.y + this.player.h <= p.y + p.h + 4 &&
                this.player.vy >= 0) {
                this.player.y = p.y - this.player.h;
                this.player.vy = 0;
                this.player.grounded = true;
            }
        });

        // Fall Off Pit
        if (this.player.y > this.height) {
            this.isGameOver = true;
            this.audio.playSFX('back');
        }

        // Win Flag
        if (this.player.x + this.player.w >= this.flag.x && this.player.y <= this.flag.y + this.flag.h) {
            this.score += 500;
            this.audio.playSFX('select');
            this.isGameOver = true;
        }
    }

    render(ctx) {
        ctx.fillStyle = '#1a2405';

        // Player
        ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);

        // Platforms
        this.platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

        // Flag
        ctx.fillRect(this.flag.x, this.flag.y, 2, this.flag.h);
        ctx.fillRect(this.flag.x + 2, this.flag.y, 6, 6);
    }
}