export class ByteEater {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        this.gridSize = 8;
        this.cols = Math.floor(width / this.gridSize);
        this.rows = Math.floor((height - 16) / this.gridSize);

        this.offsetY = 16; // Top margin for header score bar

        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };

        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.isGameOver = false;

        this.stepCounter = 0;
        this.stepInterval = 10; // Frames per step

        this.spawnFood();
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * this.cols),
            y: Math.floor(Math.random() * this.rows)
        };
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

        this.stepCounter++;
        if (this.stepCounter >= this.stepInterval) {
            this.stepCounter = 0;
            this.dir = { ...this.nextDir };

            const head = {
                x: this.snake[0].x + this.dir.x,
                y: this.snake[0].y + this.dir.y
            };

            // Wall Collision Check
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
                this.isGameOver = true;
                return;
            }

            // Self Collision Check
            for (let segment of this.snake) {
                if (segment.x === head.x && segment.y === head.y) {
                    this.isGameOver = true;
                    return;
                }
            }

            this.snake.unshift(head);

            // Eat Food Check
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.audio.playSFX('select');
                this.spawnFood();
            } else {
                this.snake.pop();
            }
        }
    }

    render(ctx) {
        // Draw Score Overlay Top-Left
        ctx.fillStyle = '#1a2405';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE: ${this.score}`, 6, 6);

        // Draw Food
        ctx.fillRect(
            this.food.x * this.gridSize + 1,
            this.offsetY + this.food.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // Draw Snake
        this.snake.forEach((seg, index) => {
            if (index === 0) {
                // Head
                ctx.fillRect(
                    seg.x * this.gridSize,
                    this.offsetY + seg.y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            } else {
                // Body
                ctx.fillRect(
                    seg.x * this.gridSize + 1,
                    this.offsetY + seg.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            }
        });
    }
}