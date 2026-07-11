export class GridStack {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        this.cols = 10;
        this.rows = 16;
        this.blockSize = 8;

        this.boardX = Math.floor((this.width - this.cols * this.blockSize) / 2);
        this.boardY = 18; // Pushed down to leave room for top score header

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
        this.dropInterval = 30; // Frames per drop
    }

    spawnPiece() {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        this.currentPiece = {
            shape: shape,
            x: Math.floor(this.cols / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };

        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.isGameOver = true;
        }
    }

    checkCollision(offsetX, offsetY, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const newX = offsetX + c;
                    const newY = offsetY + r;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
                    if (newY >= 0 && this.grid[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    mergePiece() {
        const shape = this.currentPiece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridY = this.currentPiece.y + r;
                    const gridX = this.currentPiece.x + c;
                    if (gridY >= 0) this.grid[gridY][gridX] = 1;
                }
            }
        }
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell === 1)) {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                r++; // Re-check line at current index
            }
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
            this.audio.playSFX('select');
        }
    }

    handleInput(action) {
        if (this.isGameOver) return;

        if (action === 'LEFT') {
            if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
                this.currentPiece.x--;
            }
        } else if (action === 'RIGHT') {
            if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
                this.currentPiece.x++;
            }
        } else if (action === 'DOWN') {
            if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                this.currentPiece.y++;
            }
        } else if (action === 'UP') {
            // Rotate
            const rotated = this.currentPiece.shape[0].map((_, index) =>
                this.currentPiece.shape.map(row => row[index]).reverse()
            );
            if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
                this.currentPiece.shape = rotated;
            }
        } else if (action === 'A') {
            // Hard Drop
            while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                this.currentPiece.y++;
            }
            this.mergePiece();
        }
    }

    update() {
        if (this.isGameOver) return;

        this.dropCounter++;
        if (this.dropCounter >= this.dropInterval) {
            this.dropCounter = 0;
            if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
                this.currentPiece.y++;
            } else {
                this.mergePiece();
            }
        }
    }

    render(ctx) {
        // Draw Header Score
        ctx.fillStyle = '#1a2405';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE: ${this.score}`, this.width / 2, 6);

        // Draw Board Outer Frame
        ctx.strokeStyle = '#1a2405';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.boardX - 2, this.boardY - 2, (this.cols * this.blockSize) + 4, (this.rows * this.blockSize) + 4);

        // Draw Board Grid Cells
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) {
                    ctx.fillStyle = '#1a2405';
                    ctx.fillRect(this.boardX + c * this.blockSize, this.boardY + r * this.blockSize, this.blockSize - 1, this.blockSize - 1);
                }
            }
        }

        // Draw Falling Piece
        if (this.currentPiece) {
            ctx.fillStyle = '#1a2405';
            const shape = this.currentPiece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        ctx.fillRect(
                            this.boardX + (this.currentPiece.x + c) * this.blockSize,
                            this.boardY + (this.currentPiece.y + r) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }
}