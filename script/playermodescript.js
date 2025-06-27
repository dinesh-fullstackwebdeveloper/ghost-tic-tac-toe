document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const message = document.getElementById("message");
    const resetBtn = document.getElementById("reset-button");
    const scoreX = document.getElementById("score-x");
    const scoreO = document.getElementById("score-o");
    const scoreDraw = document.getElementById("score-draw");
    const ghostModeBtn = document.getElementById("ghost-mode-btn");
    const strike = document.getElementById("strike");

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

    function showStrike(index) {
        if (!strike) return;
        strike.innerHTML = "";
        const line = document.createElement("div");
        line.className = "strike-line " + STRIKE_CLASSES[index];
        strike.appendChild(line);
    }

    function clearStrike() {
        if (strike) strike.innerHTML = "";
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
                showStrike(i); // Show the strike line
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

    function handleCellClick(e) {
        const idx = +e.target.dataset.index;
        if (!gameActive || board[idx]) return;
        board[idx] = currentPlayer;
        renderBoard();
        const winner = checkWinner();
        if (winner) {
            message.textContent = winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`;
            updateScore(winner);
            gameActive = false;
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            message.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    function resetGame() {
        board = Array(9).fill("");
        currentPlayer = "X";
        gameActive = true;
        message.textContent = `Player X's turn`;
        renderBoard();
        clearStrike();
    }

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    resetBtn.addEventListener("click", resetGame);

    if (ghostModeBtn) {
        ghostModeBtn.addEventListener("click", () => {
            window.location.href = "ghostmode.html";
        });
    }

    renderBoard();
    clearStrike();
});