document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const message = document.getElementById("message");
    const resetBtn = document.getElementById("reset-button");
    const scoreX = document.getElementById("score-x");
    const scoreO = document.getElementById("score-o");
    const scoreDraw = document.getElementById("score-draw");
    const playerModeBtn = document.getElementById("player-mode-btn");
    const difficultySelect = document.getElementById("difficulty-select");

    let board = Array(9).fill("");
    let currentPlayer = "X";
    let gameActive = true;
    let scores = { X: 0, O: 0, Draw: 0 };

    const STRIKE_CLASSES = [
        "strike-row-0", "strike-row-1", "strike-row-2",
        "strike-col-0", "strike-col-1", "strike-col-2",
        "strike-diag-0", "strike-diag-1"
    ];

    function renderBoard() {
        board.forEach((val, idx) => {
            cells[idx].textContent = val;
            cells[idx].classList.remove("winner", "disabled");
            if (val !== "") cells[idx].classList.add("disabled");
        });
    }

    function checkWinner() {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8], // rows
            [0,3,6],[1,4,7],[2,5,8], // cols
            [0,4,8],[2,4,6]          // diags
        ];
        for (let i = 0; i < wins.length; i++) {
            const [a, b, c] = wins[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                cells[a].classList.add("winner");
                cells[b].classList.add("winner");
                cells[c].classList.add("winner");
                showStrike(i); // <--- add this
                return board[a];
            }
        }
        if (board.every(cell => cell)) return "Draw";
        return null;
    }

    function updateScore(winner) {
        if (winner === "X" || winner === "O") {
            scores[winner]++;
        } else if (winner === "Draw") {
            scores.Draw++;
        }
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        scoreDraw.textContent = scores.Draw;
    }

    function aiMove() {
        let difficulty = difficultySelect ? difficultySelect.value : "easy";
        let move;

        if (difficulty === "easy") {
            // Random move
            move = getRandomMove();
        } else if (difficulty === "medium") {
            // 50% random, 50% smart (block/win)
            if (Math.random() < 0.5) {
                move = getRandomMove();
            } else {
                move = getSmartMove();
                if (move === null) move = getRandomMove();
            }
        } else if (difficulty === "hard") {
            // Minimax (unbeatable)
            move = getBestMove();
        }

        if (move !== null && gameActive) {
            board[move] = "O";
            renderBoard();
            const winner = checkWinner();
            if (winner) {
                message.textContent = winner === "Draw" ? "It's a Draw!" : `Ghost Wins!`;
                updateScore(winner);
                gameActive = false;
            } else {
                currentPlayer = "X";
                message.textContent = `Your turn`;
            }
        }
    }

    function getRandomMove() {
        let empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
        if (empty.length === 0) return null;
        return empty[Math.floor(Math.random() * empty.length)];
    }

    // Try to win or block
    function getSmartMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                if (checkWinner() === "O") {
                    board[i] = "";
                    return i;
                }
                board[i] = "";
            }
        }
        // Try to block X
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                if (checkWinner() === "X") {
                    board[i] = "";
                    return i;
                }
                board[i] = "";
            }
        }
        return null;
    }

    // Minimax for unbeatable AI
    function getBestMove() {
        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(newBoard, depth, isMaximizing) {
        let result = checkWinnerForMinimax(newBoard);
        if (result !== null) {
            if (result === "O") return 10 - depth;
            if (result === "X") return depth - 10;
            if (result === "Draw") return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (newBoard[i] === "") {
                    newBoard[i] = "O";
                    let score = minimax(newBoard, depth + 1, false);
                    newBoard[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (newBoard[i] === "") {
                    newBoard[i] = "X";
                    let score = minimax(newBoard, depth + 1, true);
                    newBoard[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // Helper for minimax to check winner on a given board
    function checkWinnerForMinimax(bd) {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (let i = 0; i < wins.length; i++) {
            const [a, b, c] = wins[i];
            if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
                return bd[a];
            }
        }
        if (bd.every(cell => cell)) return "Draw";
        return null;
    }

    function handleCellClick(e) {
        const idx = +e.target.dataset.index;
        if (!gameActive || board[idx] || currentPlayer !== "X") return;
        board[idx] = "X";
        renderBoard();
        const winner = checkWinner();
        if (winner) {
            message.textContent = winner === "Draw" ? "It's a Draw!" : `You Win!`;
            updateScore(winner);
            gameActive = false;
        } else {
            currentPlayer = "O";
            message.textContent = `Ghost's Turn...`;
            setTimeout(aiMove, 600);
        }
    }

    function resetGame() {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = true;
        message.textContent = `Player X's turn`;
        renderBoard();
        clearStrike(); // <--- add this
    }

    function showStrike(index) {
        const strike = document.getElementById("strike");
        strike.innerHTML = ""; // Clear previous
        const line = document.createElement("div");
        line.classList.add("strike-line", STRIKE_CLASSES[index]);
        strike.appendChild(line);
    }

    function clearStrike() {
        const strike = document.getElementById("strike");
        if (strike) strike.innerHTML = "";
    }

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    resetBtn.addEventListener("click", resetGame);

    // Mode switch
    if (playerModeBtn) {
        playerModeBtn.addEventListener("click", () => {
            window.location.href = "playermode.html";
        });
    }

    // Initial render
    renderBoard();
});