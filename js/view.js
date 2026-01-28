export class GameView {
    constructor() {
        this.numberPool = document.getElementById('number-pool');
        this.userCollection = document.getElementById('user-collection');
        this.cpuCollection = document.getElementById('cpu-collection');
        this.sumScanner = document.getElementById('sum-scanner');

        // Setup Screen
        this.setupOverlay = document.getElementById('setup-overlay');
        this.startUserBtn = document.getElementById('start-user');
        this.startCpuBtn = document.getElementById('start-cpu');

        // Main Controls
        this.resetBtn = document.getElementById('reset-btn');
        this.rulesBtn = document.getElementById('rules-btn');

        // Modals & Overlays
        this.rulesModal = document.getElementById('rules-modal');
        this.closeRulesBtn = document.getElementById('close-rules');
        this.winOverlay = document.getElementById('win-overlay');
        this.winMessage = document.getElementById('win-message');
        this.winCombinationText = document.getElementById('win-combination');
        this.playAgainBtn = document.getElementById('play-again');

        // Status
        this.turnIndicator = document.getElementById('turn-indicator');
        this.indicatorText = this.turnIndicator.querySelector('.indicator-text');

        this.appContainer = document.querySelector('.app-container');
    }

    showSetup() {
        this.setupOverlay.classList.remove('hidden');
    }

    hideSetup() {
        this.setupOverlay.classList.add('hidden');
    }

    renderBoard(board, magicSquare) {
        // 1. Render Pool
        this.numberPool.innerHTML = '';
        board.forEach((player, index) => {
            const numBtn = document.createElement('div');
            numBtn.className = 'pool-number';
            if (player) numBtn.classList.add('taken');
            numBtn.textContent = magicSquare[index];
            numBtn.dataset.index = index;
            this.numberPool.appendChild(numBtn);
        });

        // 2. Render Collections
        this.userCollection.innerHTML = '';
        this.cpuCollection.innerHTML = '';

        const userNums = [];
        board.forEach((player, index) => {
            if (player) {
                const item = document.createElement('div');
                item.className = 'collected-number';
                item.textContent = magicSquare[index];

                if (player === 'X') {
                    this.userCollection.appendChild(item);
                    userNums.push(magicSquare[index]);
                } else {
                    this.cpuCollection.appendChild(item);
                }
            }
        });

        this.updateScanner(userNums, board, magicSquare);
    }

    updateScanner(userNums, board, magicSquare) {
        if (userNums.length === 0) {
            this.sumScanner.innerHTML = '<span class="scanner-text">Collect numbers that <b>sum to 15</b>!</span>';
            return;
        }

        // Exhaustive subset sum check
        const currentSumsWithCounts = [];
        const n = userNums.length;
        for (let i = 1; i < (1 << n); i++) {
            let sum = 0;
            let count = 0;
            for (let j = 0; j < n; j++) {
                if ((i >> j) & 1) {
                    sum += userNums[j];
                    count++;
                }
            }
            currentSumsWithCounts.push({ sum, count });
        }

        // Find if any current sum + 1 available number = 15 AND total count >= 3
        for (let item of currentSumsWithCounts) {
            const needed = 15 - item.sum;
            if (needed > 0 && needed <= 9 && !userNums.includes(needed)) {
                const idx = magicSquare.indexOf(needed);
                if (board[idx] === null && (item.count + 1) >= 3) {
                    this.sumScanner.innerHTML = `<span class="scanner-text">Tactical Hint: Pick <b>${needed}</b> to reach 15!</span>`;
                    return;
                }
            }
        }

        this.sumScanner.innerHTML = '<span class="scanner-text">Building combinations... check the computer!</span>';
    }

    updateStatus(player, gameOver) {
        if (gameOver) return;

        if (this.indicatorText) {
            this.indicatorText.textContent = player === 'X' ? 'YOUR TURN' : 'COMPUTER TURN';
        }

        document.body.className = player === 'X' ? 'user-turn' : 'cpu-turn';

        const cpuSide = document.querySelector('.cpu-side');
        const userSide = document.querySelector('.user-side');
        if (cpuSide) cpuSide.classList.toggle('active-turn', player === 'O');
        if (userSide) userSide.classList.toggle('active-turn', player === 'X');
    }

    showGameOver(winner, combination = null) {
        this.winOverlay.classList.remove('hidden');
        if (winner === 'Draw') {
            this.winMessage.textContent = "DRAW";
            this.winCombinationText.textContent = "No one reached 15.";
        } else {
            this.winMessage.textContent = winner === 'X' ? 'YOU WIN!' : 'COMPUTER WINS!';
            if (combination) {
                this.winCombinationText.textContent = combination.join(' + ') + ' = 15';
            }
        }
    }

    hideGameOver() {
        this.winOverlay.classList.add('hidden');
    }

    toggleRules() {
        this.rulesModal.classList.toggle('hidden');
    }

    bindStartSelection(handler) {
        this.startUserBtn.addEventListener('click', () => handler('X'));
        this.startCpuBtn.addEventListener('click', () => handler('O'));
    }

    bindCellClick(handler) {
        this.numberPool.addEventListener('click', e => {
            const num = e.target.closest('.pool-number');
            if (num && !num.classList.contains('taken')) {
                handler(parseInt(num.dataset.index));
            }
        });
    }

    bindReset(handler) {
        if (this.resetBtn) this.resetBtn.addEventListener('click', handler);
        if (this.playAgainBtn) this.playAgainBtn.addEventListener('click', handler);
    }

    bindRulesToggle() {
        if (this.rulesBtn) this.rulesBtn.addEventListener('click', () => this.toggleRules());
        if (this.closeRulesBtn) this.closeRulesBtn.addEventListener('click', () => this.toggleRules());
    }
}
