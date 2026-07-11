export class ByteEater {
    constructor(width, height, audio) {
        this.width = width;
        this.height = height;
        this.audio = audio;
        this.gridSize = 8;
        this.cols = Math.floor(width / this.gridSize);
        this.rows = Math.floor(height / this.gridSize);

        this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
        this.dir = { x: 1, y: 0 };
        this.food = { x: 10, y: 10 };
        this.score = 0;
        this.isGameOver = false;
        this.tickTimer = 0;

        this.spawnFood();
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.cols - 2)) + 1,
            y: Math.floor(Math.random() * (this.rows - 2)) + 1
        };
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'UP' && this.dir.y === 0) this.dir = { x: 0, y: -1 };
        else if (action === 'DOWN' && this.dir.y === 0) this.dir = { x: 0, y: 1 };
        else if (action === 'LEFT' && this.dir.x === 0) this.dir = { x: -1, y: 0 };
        else if (action === 'RIGHT' && this.dir.x === 0) this.dir = { x: 1, y: 0 };
    }

    update() {
        if (this.isGameOver) return;

        this.tickTimer++;
        if (this.tickTimer < 8) return;
        this.tickTimer = 0;

        const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

        // Wall Collision
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.isGameOver = true;
            this.audio.playSFX('back');
            return;
        }

        // Self Collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.isGameOver = true;
            this.audio.playSFX('back');
            return;
        }

        this.snake.unshift(head);

        // Food Eating
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.audio.playSFX('select');
            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    render(ctx) {
        ctx.fillStyle = '#1a2405';

        // Draw Snake
        this.snake.forEach(seg => {
            ctx.fillRect(seg.x * this.gridSize, seg.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
        });

        // Draw Food
        ctx.fillRect(this.food.x * this.gridSize + 1, this.food.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);

        // Score
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(`BYTES: ${this.score}`, 5, 10);
    }
}