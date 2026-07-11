export class GridStack {
    constructor(width, height, audioManager) {
        this.width = width;
        this.height = height;
        this.audio = audioManager;

        this.cols = 10;
        this.rows = 16;
        this.blockSize = 8;

        // Perfectly center board: 80px width on 160px canvas leaves 40px on left/right
        this.boardX = 40; 
        this.boardY = 20;

        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.isGameOver = false;

        this.shapes = [
            [[1, 1, 1, 1]],         // I
            [[1, 1], [1, 1]],       // O
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 0, 0], [1, 1, 1]], // L
            [[0, 0, 1], [1, 1, 1]]  // J
        ];

        this.nextShape = this.getRandomShape();
        this.spawnPiece();

        this.dropCounter = 0;
        this.dropInterval = 30;
    }

    getRandomShape() {
        return this.shapes[Math.floor(Math.random() * this.shapes.length)];
    }

    spawnPiece() {
        this.currentPiece = {
            shape: this.nextShape || this.getRandomShape(),
            x: Math.floor(this.cols / 2) - Math.floor((this.nextShape || this.shapes[0])[0].length / 2),
            y: 0
        };

        this.nextShape = this.getRandomShape();

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

    getGhostY() {
        let ghostY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
            ghostY++;
        }
        return ghostY;
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
                r++;
            }
        }
        if (linesCleared > 0) {
            this.lines += linesCleared;
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
            const rotated = this.currentPiece.shape[0].map((_, index) =>
                this.currentPiece.shape.map(row => row[index]).reverse()
            );
            if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
                this.currentPiece.shape = rotated;
            }
        } else if (action === 'A') {
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

    drawRetroBlock(ctx, px, py, isGhost = false) {
        const DARK = '#1a2405';
        const LIGHT = '#8b9d2e';

        if (isGhost) {
            ctx.strokeStyle = DARK;
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, this.blockSize - 1, this.blockSize - 1);
            return;
        }

        // Outer Dark Fill
        ctx.fillStyle = DARK;
        ctx.fillRect(px, py, this.blockSize, this.blockSize);

        // Top-Left Bevel Highlight
        ctx.fillStyle = LIGHT;
        ctx.fillRect(px + 1, py + 1, this.blockSize - 2, 1);
        ctx.fillRect(px + 1, py + 1, 1, this.blockSize - 2);

        // Core Dark Box
        ctx.fillStyle = DARK;
        ctx.fillRect(px + 2, py + 2, this.blockSize - 3, this.blockSize - 3);
    }

    render(ctx) {
        const DARK = '#1a2405';

        // 1. Header Score Indicator
        ctx.fillStyle = DARK;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`SCORE: ${this.score}`, this.width / 2, 5);

        // 2. Playfield Main Frame
        ctx.strokeStyle = DARK;
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.boardX - 1, 
            this.boardY - 1, 
            (this.cols * this.blockSize) + 2, 
            (this.rows * this.blockSize) + 2
        );

        // 3. Selective Matrix Grid Dots (Only drawn on empty cells)
        const ghostY = this.currentPiece ? this.getGhostY() : -1;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const isOccupied = this.grid[r][c] === 1;
                
                let isPiece = false;
                let isGhost = false;
                if (this.currentPiece) {
                    const p = this.currentPiece;
                    const pr = r - p.y;
                    const pc = c - p.x;
                    if (pr >= 0 && pr < p.shape.length && pc >= 0 && pc < p.shape[0].length && p.shape[pr][pc]) {
                        isPiece = true;
                    }

                    const gr = r - ghostY;
                    if (gr >= 0 && gr < p.shape.length && pc >= 0 && pc < p.shape[0].length && p.shape[gr][pc]) {
                        isGhost = true;
                    }
                }

                if (!isOccupied && !isPiece && !isGhost) {
                    ctx.fillStyle = DARK;
                    ctx.fillRect(this.boardX + c * this.blockSize + 3, this.boardY + r * this.blockSize + 3, 1, 1);
                }
            }
        }

        // 4. Ghost Drop Position
        if (this.currentPiece) {
            const shape = this.currentPiece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        this.drawRetroBlock(
                            ctx, 
                            this.boardX + (this.currentPiece.x + c) * this.blockSize, 
                            this.boardY + (ghostY + r) * this.blockSize,
                            true
                        );
                    }
                }
            }
        }

        // 5. Placed Grid Blocks
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) {
                    this.drawRetroBlock(ctx, this.boardX + c * this.blockSize, this.boardY + r * this.blockSize);
                }
            }
        }

        // 6. Active Falling Piece
        if (this.currentPiece) {
            const shape = this.currentPiece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        this.drawRetroBlock(
                            ctx, 
                            this.boardX + (this.currentPiece.x + c) * this.blockSize, 
                            this.boardY + (this.currentPiece.y + r) * this.blockSize
                        );
                    }
                }
            }
        }

        // 7. Clean Left HUD: Lines Count
        ctx.fillStyle = DARK;
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LINES', 20, 30);
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${this.lines}`, 20, 42);

        // 8. Clean Right HUD: Next Piece
        ctx.font = '7px monospace';
        ctx.fillText('NEXT', 140, 30);

        if (this.nextShape) {
            const nRows = this.nextShape.length;
            const nCols = this.nextShape[0].length;
            const startX = 140 - Math.floor((nCols * 4) / 2);
            const startY = 42;

            for (let r = 0; r < nRows; r++) {
                for (let c = 0; c < nCols; c++) {
                    if (this.nextShape[r][c]) {
                        ctx.fillRect(startX + c * 4, startY + r * 4, 3, 3);
                    }
                }
            }
        }
    }
}