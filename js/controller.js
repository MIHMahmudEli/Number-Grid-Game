export class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Bind persistent events
        this.view.bindCellClick(this.handleCellClick.bind(this));
        this.view.bindStartSelection(this.handleStartSelection.bind(this));
        this.view.bindReset(this.handleReset.bind(this));
        this.view.bindRulesToggle();

        this.init();
    }

    init() {
        // Show setup screen at start
        this.view.showSetup();
    }

    handleStartSelection(player) {
        this.view.hideSetup();
        this.model.reset(player);
        this.view.renderBoard(this.model.board, this.model.magicSquare);
        this.view.updateStatus(this.model.currentPlayer, this.model.gameOver);

        // If CPU starts, trigger it
        if (player === 'O') {
            setTimeout(() => this.makeAIMove(), 600);
        }
    }

    handleCellClick(index) {
        if (this.model.gameOver || this.model.currentPlayer !== 'X') return;

        if (this.model.makeMove(index)) {
            this.updateUI();

            if (!this.model.gameOver) {
                // AI turn
                setTimeout(() => this.makeAIMove(), 800);
            }
        }
    }

    makeAIMove() {
        if (this.model.gameOver) return;

        const bestMove = this.model.getBestMove();
        if (bestMove !== undefined) {
            this.model.makeMove(bestMove);
            this.updateUI();
        }
    }

    updateUI() {
        this.view.renderBoard(this.model.board, this.model.magicSquare);

        if (this.model.gameOver) {
            if (this.model.winner !== 'Draw' && this.model.winningLine) {
                this.view.showGameOver(this.model.winner, this.model.winningLine);
            } else {
                this.view.showGameOver('Draw');
            }
        } else {
            this.view.updateStatus(this.model.currentPlayer, this.model.gameOver);
        }
    }

    handleReset() {
        this.view.hideGameOver();
        this.view.showSetup();
    }
}
