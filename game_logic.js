const statusText = document.getElementById('status');
        const restartBtn = document.getElementById('restartBtn');
        const boxes = Array.from(document.querySelectorAll('.box'));
        const scoreXDisplay = document.getElementById('score-x');
        const scoreODisplay = document.getElementById('score-o');
        const cardX = document.getElementById('card-X');
        const cardO = document.getElementById('card-O');
        const blobX = document.getElementById('blobX');
        const blobO = document.getElementById('blobO');
        const pvpBtn = document.getElementById('pvpBtn');
        const pveBtn = document.getElementById('pveBtn');
        const mainHeading = document.getElementById('mainHeading');
        const gameWrapper = document.getElementById('gameWrapper');

        const X_TEXT = "X";
        const O_TEXT = "O";
        let currentPlayer = X_TEXT;
        let spaces = Array(9).fill(null);
        let scoreX = 0;
        let scoreO = 0;
        let gameActive = true;
        let isVsAI = false;

        const winningCombos = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];

        function triggerHaptic(type = 'light') {
            if (window.navigator && window.navigator.vibrate) {
                if (type === 'heavy') window.navigator.vibrate([20, 10, 20]);
                else window.navigator.vibrate(10);
            }
        }

        mainHeading.addEventListener('mouseenter', () => {
            blobX.style.transform = 'scale(2) translate(20%, 20%)';
            blobO.style.transform = 'scale(2) translate(-20%, -20%)';
            blobX.style.opacity = '0.6';
            blobO.style.opacity = '0.6';
        });

        mainHeading.addEventListener('mouseleave', () => {
            updateBackground();
        });

        mainHeading.addEventListener('click', () => {
            triggerHaptic('heavy');
            document.body.classList.add('glitch-active');
            gameWrapper.style.transform = 'scale(1.1) rotate(2deg)';
            
            setTimeout(() => {
                document.body.classList.remove('glitch-active');
                gameWrapper.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        });

        function updateBackground() {
            if (!gameActive) {
                blobX.style.opacity = '0.2';
                blobO.style.opacity = '0.2';
                blobX.style.transform = 'scale(1) translate(0,0)';
                blobO.style.transform = 'scale(1) translate(0,0)';
                return;
            }
            if (currentPlayer === X_TEXT) {
                blobX.style.opacity = '0.4';
                blobO.style.opacity = '0.1';
                blobX.style.transform = 'scale(1.4) translate(10%, 10%)';
                blobO.style.transform = 'scale(0.8)';
            } else {
                blobO.style.opacity = '0.4';
                blobX.style.opacity = '0.1';
                blobO.style.transform = 'scale(1.4) translate(-10%, -10%)';
                blobX.style.transform = 'scale(0.8)';
            }
        }

        function handleBoxClick(e) {
            const id = e.target.getAttribute('data-index');
            if (spaces[id] || !gameActive) return;

            makeMove(id, currentPlayer);

            if (!gameActive) return;

            if (isVsAI) {
                gameActive = false;
                setTimeout(() => {
                    const aiMove = getBestMove();
                    makeMove(aiMove, O_TEXT);
                    if (gameActive !== false) gameActive = true;
                }, 600);
            } else {
                currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
                updateTurnUI();
            }
        }

        function makeMove(id, player) {
            triggerHaptic();
            spaces[id] = player;
            const box = boxes[id];
            box.innerText = player;
            box.classList.add(player === X_TEXT ? 'x-move' : 'o-move');
            
            if (checkWin(spaces, player)) {
                handleWin(player);
                return;
            }

            if (checkDraw(spaces)) {
                handleDraw();
                return;
            }

            if (!isVsAI || player === O_TEXT) {
                gameActive = true;
            }
        }

        function updateTurnUI() {
            statusText.innerText = `${currentPlayer} Linked`;
            if (currentPlayer === X_TEXT) {
                cardX.classList.add('active-x');
                cardO.classList.remove('active-o');
            } else {
                cardO.classList.add('active-o');
                cardX.classList.remove('active-x');
            }
            updateBackground();
        }

        function checkWin(board, player) {
            return winningCombos.some(combo => {
                return combo.every(index => board[index] === player);
            });
        }

        function checkDraw(board) {
            return board.every(space => space !== null);
        }

        function handleWin(winner) {
            gameActive = false;
            triggerHaptic('heavy');
            statusText.innerText = `${winner} Core Dominant`;
            const combo = winningCombos.find(c => c.every(i => spaces[i] === winner));
            combo.forEach(i => boxes[i].classList.add('win'));
            
            if (winner === X_TEXT) {
                scoreX++;
                scoreXDisplay.innerText = scoreX;
                cardX.classList.add('active-x');
                cardO.classList.remove('active-o');
            } else {
                scoreO++;
                scoreODisplay.innerText = scoreO;
                cardO.classList.add('active-o');
                cardX.classList.remove('active-x');
            }
            updateBackground();
        }

        function handleDraw() {
            gameActive = false;
            statusText.innerText = "System Parity";
            cardX.classList.remove('active-x');
            cardO.classList.remove('active-o');
            updateBackground();
        }

        function getBestMove() {
            let bestScore = -Infinity;
            let move;
            for (let i = 0; i < 9; i++) {
                if (spaces[i] === null) {
                    spaces[i] = O_TEXT;
                    let score = minimax(spaces, 0, false);
                    spaces[i] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
            return move;
        }

        const scores = { X: -10, O: 10, tie: 0 };

        function minimax(board, depth, isMaximizing) {
            if (checkWin(board, O_TEXT)) return scores.O;
            if (checkWin(board, X_TEXT)) return scores.X;
            if (checkDraw(board)) return scores.tie;

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === null) {
                        board[i] = O_TEXT;
                        let score = minimax(board, depth + 1, false);
                        board[i] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < 9; i++) {
                    if (board[i] === null) {
                        board[i] = X_TEXT;
                        let score = minimax(board, depth + 1, true);
                        board[i] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }

        function restartGame() {
            triggerHaptic();
            spaces.fill(null);
            gameActive = true;
            currentPlayer = X_TEXT;
            boxes.forEach(box => {
                box.innerText = '';
                box.classList.remove('x-move', 'o-move', 'win');
            });
            updateTurnUI();
        }

        pvpBtn.addEventListener('click', () => {
            isVsAI = false;
            pvpBtn.classList.add('active');
            pveBtn.classList.remove('active');
            restartGame();
        });

        pveBtn.addEventListener('click', () => {
            isVsAI = true;
            pveBtn.classList.add('active');
            pvpBtn.classList.remove('active');
            restartGame();
        });

        boxes.forEach(box => box.addEventListener('click', handleBoxClick));
        restartBtn.addEventListener('click', restartGame);

        window.onload = () => {
            updateTurnUI();
        };