    const statusText = document.getElementById('status');
    const restartBtn = document.getElementById('restartBtn');
    const boxes = Array.from(document.getElementsByClassName('box'));
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const cardX = document.getElementById('card-X');
    const cardO = document.getElementById('card-O');

    const X_TEXT = "X";
    const O_TEXT = "O";
    let currentPlayer = X_TEXT;
    let spaces = Array(9).fill(null);
    let scoreX = 0;
    let scoreO = 0;
    let gameActive = true;

    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    function initGame() {
        boxes.forEach(box => box.addEventListener('click', handleBoxClick));
        restartBtn.addEventListener('click', restartGame);
        updateTurnUI();
    }

    function handleBoxClick(e) {
        const id = e.target.id;

        if (!spaces[id] && gameActive) {
            spaces[id] = currentPlayer;
            e.target.innerText = currentPlayer;
            e.target.classList.add(currentPlayer === X_TEXT ? 'x-move' : 'o-move');

            if (checkWin()) {
                handleWin();
                return;
            }

            if (checkDraw()) {
                handleDraw();
                return;
            }

            currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
            updateTurnUI();
        }
    }

    function updateTurnUI() {
        statusText.innerText = `${currentPlayer}'s Turn`;
        if (currentPlayer === X_TEXT) {
            cardX.classList.add('active-x');
            cardO.classList.remove('active-o');
        } else {
            cardO.classList.add('active-o');
            cardX.classList.remove('active-x');
        }
    }

    function checkWin() {
        for (const combo of winningCombos) {
            let [a, b, c] = combo;
            if (spaces[a] && (spaces[a] === spaces[b] && spaces[a] === spaces[c])) {
                highlightWinner([a, b, c]);
                return true;
            }
        }
        return false;
    }

    function highlightWinner(indices) {
        indices.forEach(i => boxes[i].classList.add('win'));
    }

    function checkDraw() {
        return spaces.every(space => space !== null);
    }

    function handleWin() {
        gameActive = false;
        statusText.innerText = `${currentPlayer} Victorious!`;
        if (currentPlayer === X_TEXT) {
            scoreX++;
            scoreXDisplay.innerText = scoreX;
        } else {
            scoreO++;
            scoreODisplay.innerText = scoreO;
        }
    }

    function handleDraw() {
        gameActive = false;
        statusText.innerText = "Draw!";
        cardX.classList.remove('active-x');
        cardO.classList.remove('active-o');
    }

    function restartGame() {
        spaces.fill(null);
        gameActive = true;
        currentPlayer = X_TEXT;
        
        boxes.forEach(box => {
            box.innerText = '';
            box.classList.remove('x-move', 'o-move', 'win');
        });

        updateTurnUI();
    }

    initGame();