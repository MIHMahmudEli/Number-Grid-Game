export class GameModel {
    constructor() {
        this.magicSquare = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.secretPath = [1, 5, 9];
        this.reset();
    }

    reset(startingPlayer = 'X') {
        this.board = Array(9).fill(null);
        this.currentPlayer = startingPlayer;
        this.gameOver = false;
        this.winner = null;
        this.winningLine = null;
        this.secretPathIgnored = false;

        this.shufflePool();
    }

    shufflePool() {
        for (let i = this.magicSquare.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.magicSquare[i], this.magicSquare[j]] = [this.magicSquare[j], this.magicSquare[i]];
        }
    }

    makeMove(index) {
        if (this.board[index] || this.gameOver) return false;

        this.board[index] = this.currentPlayer;
        const combination = this.checkWin(this.currentPlayer);

        if (combination) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.winningLine = combination;
        } else if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            this.winner = 'Draw';
        } else {
            this.switchPlayer();
        }
        return true;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    checkWin(player) {
        const playerNums = this.board
            .map((p, i) => p === player ? this.magicSquare[i] : null)
            .filter(n => n !== null);

        return this.findSubsetSum(playerNums, 15, 3);
    }

    findSubsetSum(numbers, target, minElements = 1) {
        const n = numbers.length;
        const solve = (start, currentSum, currentSubset) => {
            if (currentSum === target) {
                return currentSubset.length >= minElements ? currentSubset : null;
            }
            if (currentSum > target || start === n) return null;

            const include = solve(start + 1, currentSum + numbers[start], [...currentSubset, numbers[start]]);
            if (include) return include;

            return solve(start + 1, currentSum, currentSubset);
        };
        return solve(0, 0, []);
    }

    getAvailableMoves() {
        return this.board
            .map((val, idx) => val === null ? idx : null)
            .filter(val => val !== null);
    }

    // Grandmaster Minimax AI
    getBestMove() {
        const availableMoves = this.getAvailableMoves();
        const scores = [];

        const userNums = this.board
            .map((p, i) => p === 'X' ? this.magicSquare[i] : null)
            .filter(n => n !== null);


        const canCompleteSecret = userNums.includes(1) && userNums.includes(5) && !this.secretPathIgnored;

        for (const index of availableMoves) {
            this.board[index] = 'O';
            let score = this.minimax(this.board, 0, false);
            this.board[index] = null;

            if (canCompleteSecret && this.magicSquare[index] === 9) {
                score = -50;
            }

            scores.push({ index, score });
        }

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);


        const bestScore = scores[0].score;
        const bestMoves = scores.filter(s => s.score === bestScore);
        const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)].index;


        if (canCompleteSecret && this.magicSquare[selectedMove] !== 9) {
            this.secretPathIgnored = true;
        }

        return selectedMove;
    }

    minimax(board, depth, isMaximizing) {
        if (this.checkWin('O')) return 10 - depth;
        if (this.checkWin('X')) return depth - 10;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
}
