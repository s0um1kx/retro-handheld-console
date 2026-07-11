export class CosmicGrid {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        // Player configuration
        this.player = {
            x: width / 2 - 6,
            y: height - 16,
            width: 12,
            height: 8,
            speed: 2.2
        };

        this.bullets = [];
        this.aliens = [];
        this.particles = [];
        this.stars = [];
        this.ufo = null;

        this.score = 0;
        this.isGameOver = false;

        this.alienDirection = 1;
        this.animFrame = 0;
        this.animTimer = 0;
        this.ufoTimer = 0;

        this.initStars();
        this.initAliens();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 10; i++) {
            this.stars.push({
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * (this.height - 20)) + 15,
                speed: 0.1 + Math.random() * 0.2
            });
        }
    }

    initAliens() {
        this.aliens = [];
        const rows = 3;
        const cols = 6;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.aliens.push({
                    x: 14 + c * 21,
                    y: 24 + r * 13,
                    width: 11,
                    height: 8,
                    type: r, // 0: Top/Scout, 1: Mid/Warrior, 2: Bot/Heavy
                    alive: true
                });
            }
        }
    }

    spawnUFO() {
        this.ufo = {
            x: -12,
            y: 16,
            width: 12,
            height: 6,
            speed: 1
        };
    }

    spawnExplosion(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x + 4 + (Math.random() * 4 - 2),
                y: y + 4 + (Math.random() * 4 - 2),
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 6
            });
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
                    x: this.player.x + Math.floor(this.player.width / 2) - 1,
                    y: this.player.y - 2,
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

        // 1. Update Starfield
        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y >= this.height - 10) {
                s.y = 15;
                s.x = Math.floor(Math.random() * this.width);
            }
        });

        // 2. Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed;
            if (b.y < 12) {
                this.bullets.splice(i, 1);
            }
        }

        // 3. UFO Logic
        this.ufoTimer++;
        if (this.ufoTimer > 400 && !this.ufo) {
            this.ufoTimer = 0;
            if (Math.random() > 0.4) this.spawnUFO();
        }

        if (this.ufo) {
            this.ufo.x += this.ufo.speed;
            if (this.ufo.x > this.width + 10) this.ufo = null;
        }

        // 4. Alien March & Animation
        this.animTimer++;
        if (this.animTimer > 15) {
            this.animTimer = 0;
            this.animFrame = 1 - this.animFrame;
        }

        let edgeReached = false;
        const activeAliens = this.aliens.filter(a => a.alive);

        if (activeAliens.length === 0) {
            this.initAliens();
            return;
        }

        activeAliens.forEach(a => {
            if ((a.x <= 4 && this.alienDirection === -1) || (a.x >= this.width - a.width - 4 && this.alienDirection === 1)) {
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
            const speedMultiplier = 1 + (18 - activeAliens.length) * 0.03;
            activeAliens.forEach(a => {
                a.x += 0.25 * this.alienDirection * speedMultiplier;
            });
        }

        // 5. Collision Detection
        for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
            const b = this.bullets[bIdx];
            if (!b) continue;

            // Bullet vs UFO
            if (this.ufo &&
                b.x < this.ufo.x + this.ufo.width &&
                b.x + b.width > this.ufo.x &&
                b.y < this.ufo.y + this.ufo.height &&
                b.y + b.height > this.ufo.y) {
                
                this.spawnExplosion(this.ufo.x, this.ufo.y);
                this.score += 100;
                this.ufo = null;
                this.bullets.splice(bIdx, 1);
                this.audio.playSFX('select');
                continue;
            }

            // Bullet vs Aliens
            for (let a of this.aliens) {
                if (a.alive &&
                    b.x < a.x + a.width &&
                    b.x + b.width > a.x &&
                    b.y < a.y + a.height &&
                    b.y + b.height > a.y) {
                    
                    a.alive = false;
                    this.spawnExplosion(a.x, a.y);
                    this.score += (3 - a.type) * 10;
                    this.bullets.splice(bIdx, 1);
                    break;
                }
            }
        }

        // 6. Update Particles
        for (let pIdx = this.particles.length - 1; pIdx >= 0; pIdx--) {
            const p = this.particles[pIdx];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(pIdx, 1);
        }
    }

    drawSprite(ctx, map, x, y, darkColor = '#1a2405') {
        ctx.fillStyle = darkColor;
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {
                if (map[r][c] === 1) {
                    ctx.fillRect(Math.floor(x) + c, Math.floor(y) + r, 1, 1);
                }
            }
        }
    }

    render(ctx) {
        const DARK = '#1a2405';

        // Header Score
        ctx.fillStyle = DARK;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE:${this.score}`, 6, 4);

        // Header Rule Line
        ctx.fillRect(4, 13, this.width - 8, 1);

        // Background Starfield
        this.stars.forEach(s => {
            ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
        });

        // Player Fighter Sprite (Detailed dual-wing laser ship)
        const playerSprite = [
            [0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,0,1,0,0,1,0,0,0],
            [1,0,1,1,1,1,1,1,0,1],
            [1,1,1,1,1,1,1,1,1,1],
            [1,1,0,1,1,1,1,0,1,1],
            [1,0,0,1,0,0,1,0,0,1]
        ];
        this.drawSprite(ctx, playerSprite, this.player.x, this.player.y);

        // UFO Sprite
        if (this.ufo) {
            const ufoSprite = [
                [0,0,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,0],
                [1,1,0,1,1,0,1,1],
                [1,1,1,1,1,1,1,1],
                [0,0,1,0,0,1,0,0]
            ];
            this.drawSprite(ctx, ufoSprite, this.ufo.x, this.ufo.y);
        }

        // Animated Alien Sprites
        const alienSprites = [
            // Type 0: Top Scout
            [
                [
                    [0,0,0,1,1,1,0,0,0],
                    [0,0,1,1,1,1,1,0,0],
                    [0,1,1,0,1,0,1,1,0],
                    [1,1,1,1,1,1,1,1,1],
                    [1,0,1,0,0,0,1,0,1],
                    [0,0,0,1,0,1,0,0,0]
                ],
                [
                    [0,0,0,1,1,1,0,0,0],
                    [0,0,1,1,1,1,1,0,0],
                    [0,1,1,0,1,0,1,1,0],
                    [1,1,1,1,1,1,1,1,1],
                    [0,1,0,1,0,1,0,1,0],
                    [1,0,0,0,0,0,0,0,1]
                ]
            ],
            // Type 1: Mid Warrior Crab
            [
                [
                    [1,0,0,0,0,0,0,0,1],
                    [0,1,0,1,1,1,0,1,0],
                    [0,1,1,1,1,1,1,1,0],
                    [1,1,0,1,1,1,0,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [0,0,1,0,0,0,1,0,0]
                ],
                [
                    [0,0,0,0,0,0,0,0,0],
                    [1,1,0,1,1,1,0,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,0,1,1,1,0,1,1],
                    [0,1,1,1,1,1,1,1,0],
                    [1,0,0,0,0,0,0,0,1]
                ]
            ],
            // Type 2: Bottom Heavy Invader
            [
                [
                    [0,0,1,1,1,1,1,0,0],
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,1,0,1,0,1,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [0,0,1,1,0,1,1,0,0],
                    [0,1,1,0,0,0,1,1,0]
                ],
                [
                    [0,0,1,1,1,1,1,0,0],
                    [1,1,1,1,1,1,1,1,1],
                    [1,1,1,0,1,0,1,1,1],
                    [1,1,1,1,1,1,1,1,1],
                    [0,1,1,0,0,0,1,1,0],
                    [1,0,0,0,0,0,0,0,1]
                ]
            ]
        ];

        // Render Aliens
        this.aliens.forEach(a => {
            if (a.alive) {
                const sprite = alienSprites[a.type][this.animFrame];
                this.drawSprite(ctx, sprite, a.x, a.y);
            }
        });

        // Render Lasers
        ctx.fillStyle = DARK;
        this.bullets.forEach(b => {
            ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.width, b.height);
        });

        // Render Explosion Particles
        this.particles.forEach(p => {
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
        });
    }
}