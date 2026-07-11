export class GridStack {
    constructor(width, height, audio) {
        this.width = width;
        this.height = height;
        this.audio = audio;
        
        this.cols = 10;
        this.rows = 18;
        this.cellSize = 8;
        this.offsetX = Math.floor((width - (this.cols * this.cellSize)) / 2);
        this.offsetY = 10;

        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.isGameOver = false;

        this.shapes = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 0, 0], [1, 1, 1]], // L
            [[0, 0, 1], [1, 1, 1]]  // J
        ];

        this.spawnPiece();
        this.dropCounter = 0;
        this.dropInterval = 30;
    }

    spawnPiece() {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        this.currentPiece = {
            shape,
            x: Math.floor(this.cols / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.isGameOver = true;
            this.audio.playSFX('back');
        }
    }

    checkCollision(x, y, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = x + c;
                    const newY = y + r;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
                    if (newY >= 0 && this.grid[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'LEFT') {
            if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
                this.currentPiece.x--;
                this.audio.playSFX('nav');
            }
        } else if (action === 'RIGHT') {
            if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
                this.currentPiece.x++;
                this.audio.playSFX('nav');
            }
        } else if (action === 'DOWN') {
            this.drop();
        } else if (action === 'UP') {
            this.rotate();
        } else if (action === 'A') {
            while (!this.drop()) {}
        }
    }

    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            this.audio.playSFX('nav');
        }
    }

    drop() {
        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
            this.currentPiece.y++;
            return false;
        } else {
            this.lockPiece();
            return true;
        }
    }

    lockPiece() {
        const shape = this.currentPiece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    this.grid[this.currentPiece.y + r][this.currentPiece.x + c] = 1;
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let cleared = 0;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell === 1)) {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                cleared++;
                r++;
            }
        }
        if (cleared > 0) {
            this.score += cleared * 100;
            this.audio.playSFX('select');
        }
    }

    update() {
        if (this.isGameOver) return;
        this.dropCounter++;
        if (this.dropCounter >= this.dropInterval) {
            this.drop();
            this.dropCounter = 0;
        }
    }

    render(ctx) {
        // Draw Border
        ctx.strokeStyle = '#1a2405';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.offsetX - 1, this.offsetY - 1, (this.cols * this.cellSize) + 2, (this.rows * this.cellSize) + 2);

        // Draw Locked Grid
        ctx.fillStyle = '#1a2405';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) {
                    ctx.fillRect(this.offsetX + (c * this.cellSize), this.offsetY + (r * this.cellSize), this.cellSize - 1, this.cellSize - 1);
                }
            }
        }

        // Draw Current Piece
        if (this.currentPiece) {
            for (let r = 0; r < this.currentPiece.shape.length; r++) {
                for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                    if (this.currentPiece.shape[r][c]) {
                        ctx.fillRect(
                            this.offsetX + ((this.currentPiece.x + c) * this.cellSize),
                            this.offsetY + ((this.currentPiece.y + r) * this.cellSize),
                            this.cellSize - 1,
                            this.cellSize - 1
                        );
                    }
                }
            }
        }

        // Score UI
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText(`SCORE: ${this.score}`, 120, 20);
    }
}