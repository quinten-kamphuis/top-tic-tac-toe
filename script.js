const to2DIndex = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return [row, col];
};

const gameBoard = (() => {
    const board =   [[null,null,null],
                    [null,null,null],
                    [null,null,null]];
    
    const setMove = (move, token) => {
        const movesArr = to2DIndex(move);
        board[movesArr[0]][movesArr[1]] = token;
        console.table(getBoard());
    };
    const clearBoard = () => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                board[i][j] = null;
            }
        }
    };
    const getBoard = () => board;

    const checkWinner = (position, player) => {
        let board = [];
        if (position.length === 9){
            board =  [[position[0], position[1], position[2]],
                    [position[3], position[4], position[5]],
                    [position[6], position[7], position[8]]];
        } else if (position.length === 3){
            board = position;
        }
    
        const size = board.length;
        let winner = null;
    
        for (let i = 0; i < size; i++) {
            if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
                winner = board[i][0];
            }
        }
    
        for (let j = 0; j < size; j++) {
            let columnWin = true;
            for (let i = 0; i < size; i++) {
                if (board[i][j] !== board[0][j]) {
                columnWin = false;
                break;
                }
            }
            if (columnWin && board[0][j]) {
                winner = board[0][j];
            }
        }
    
        if (board[0][0] && board.every((row, index) => row[index] === board[0][0])) {
            winner = board[0][0];
        }
    
        if (board[0][size - 1] && board.every((row, index) => row[size - 1 - index] === board[0][size - 1])) {
            winner = board[0][size - 1];
        }
    
        if (winner === player) {
            return true;
        } else {
            return false;
        }
    }
    
    return {
        setMove,
        clearBoard,
        getBoard,
        checkWinner   
    }
})();

const player = (() => {
    const playerList = [];
    const createPlayer = (name, computerDifficulty) => {
        if (playerList.length < 2) {
            return playerList.push({
                id: playerList.length + 1,
                name: name,
                token: playerList.length === 0 ? 'X' : 'O',
                computer: computerDifficulty,
                wins: 0,
                ties: 0
            })
        } else {
            console.error('Tried to create new player, while player list is full.')
        }
    }
    const getPlayerList = () => playerList;
    const clearPlayerList = () => {playerList.splice(0, playerList.length)};
    const getPlayer = playerId => playerList.find(({ id }) => id === playerId);
    const addWin = playerToken => playerList.find(({ token }) => token === playerToken).wins++;
    const addTie = () => playerList.forEach(player => player.ties++);
    const getScores = () => {
        if (playerList.length < 2){
            return console.warn('Player list is empty. Start a game to enter in player.')
        }
        const wins1 = playerList[0].wins;
        const wins2 = playerList[1].wins;
        const ties1 = playerList[0].ties;
        const ties2 = playerList[1].ties;
        if (ties1 !== ties2){
            return console.error('Player ties are not the same?');
        }
        return {
            player1: wins1,
            player2: wins2,
            ties: ties1
        };
    };
    return {
        createPlayer,
        getPlayerList,
        clearPlayerList,
        getPlayer,
        addWin,
        addTie,
        getScores
    }
})();

const computer = (() => {
    const easyMove = () => {
        const randomNumber = Math.floor(Math.random() * 9);
        const board = gameBoard.getBoard().flat();
        if (board[randomNumber] === null) {
            return randomNumber;
        }
        return easyMove();
    }
    const mediumMove = () => {
        const randomNumber = Math.floor(Math.random() * 3);
        if (randomNumber === 1){
            return easyMove();
        }
        return bestMove();
    }
    const bestMove = () => {
        const HUMAN_PLAYER = player.getPlayer(1).token;
        const AI_PLAYER = player.getPlayer(2).token;
        const minimax = (position, depth, isMaximizing) => {
            if (gameBoard.checkWinner(position, HUMAN_PLAYER)) return depth - 10;
            if (gameBoard.checkWinner(position, AI_PLAYER)) return 10 - depth;
            if (!position.includes(null)) return 0;
            
            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < position.length; i++) {
                    if (position[i] === null) {
                        position[i] = AI_PLAYER;
                        let score = minimax(position, depth + 1, false);
                        position[i] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < position.length; i++) {
                    if (position[i] === null) {
                        position[i] = HUMAN_PLAYER;
                        let score = minimax(position, depth + 1, true);
                        position[i] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }
        const findBestMove = (position) => {
            let bestScore = -Infinity;
            let move = -1;
            for (let i = 0; i < position.length; i++) {
                if (position[i] === null) {
                    position[i] = AI_PLAYER;
                    let score = minimax(position, 0, false);
                    position[i] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
            return move;
        }
        return findBestMove(gameBoard.getBoard().flat());
    }
    const getMove = difficulty => {
        let move;
        switch (difficulty) {
                case 0:
                    console.error('Tried to get computer move while playing manual.')
                    return false;
                case 1:
                    move = easyMove();
                    break;
                case 2:
                    move = mediumMove();
                    break;
                case 3:
                    move = bestMove();
                    break;
                default:
                    console.error('Default switch statement was called. Difficulty: ' + difficulty)
                    return false;
        }
        return move;
    }
    return {
        getMove
    }
})();


const game = (() => {
    let gameRunning = false;
    let playerToMove = 1;
    const getComputerDifficulty = () => {
        const promptDifficulty = () => {
            const difficulty = prompt(`Please enter the opponents difficulty.`, 'Manual, Easy, Medium or Hard').toLowerCase();
            if (difficulty === 'manual'){
                console.log('You are now playing against another person.')
                return 0;
            }
            if (difficulty === 'easy'){
                console.log('Computer difficulty: Easy')
                return 1;
            }
            if (difficulty === 'medium'){
                console.log('Computer difficulty: Medium')
                return 2;
            }
            if (difficulty === 'hard'){
                console.log('Computer difficulty: Hard')
                return 3;
            } else {
                console.warn('Invalid difficulty entry.')
                return false;
            }
        }
        let computer;
        do {
            computer = promptDifficulty();
        } while (typeof computer !== 'number');
        return computer;        
    }
    const getPlayers = () => {
        if (player.getPlayerList().length === 2) return;
        const getPlayerName = () => {
            const promptName = () => {
                const name = prompt(`Player ${player.getPlayerList().length + 1}, please enter your name`);
                if (name) {
                    if (name.length < 9) {
                        return name;
                    }                         
                    console.warn('Player name too long, must be 8 characters or less, try again.')
                    return false;
                }
                console.warn('Player name invalid, try again.')
                return false;
            }
            let name;
            do {
                name = promptName();
            } while (typeof name !== 'string');
            return name;           
        }
        do {
            const playerName = getPlayerName();
            const difficulty = player.getPlayerList().length < 1 ? 0 : getComputerDifficulty();
            player.createPlayer(playerName, difficulty);        
        } while (player.getPlayerList().length < 2)
    };
    const validateMove = (move) => {
        if (typeof move !== 'number') {
            console.warn('Invalid move, because not number');
            return false;
        }
        if (move < 0 || move > 8) {
            console.warn('Invalid move, because not in range');
            return false;
        }    
        if (gameBoard.getBoard().flat()[move] === null){
            return move;
        }
    }
    const getMove = () => {
        const difficulty = player.getPlayer(playerToMove).computer;
        if (difficulty === 0){
            return parseInt(prompt(player.getPlayer(playerToMove).name + ", please enter your move", '0-8'));
        } else {
            return computer.getMove(difficulty);
        }
    };
    const checkForWin = () => {
        const board = gameBoard.getBoard();
        const token1 = player.getPlayer(1).token;
        const token2 = player.getPlayer(2).token;
        const p1Win = gameBoard.checkWinner(board, token1);
        const p2Win = gameBoard.checkWinner(board, token2);

        if (p1Win || p2Win) {
            const winner = p1Win ? token1 : token2
            stopGame();
            player.addWin(winner);
            console.log(`There is a winner: ${player.getPlayerList().find(({ token }) => token === winner).name}`);
            printScoreBoard();
            return true;
        }

        if (board.flat().includes(null)) {
            playerToMove === 1 ? playerToMove = 2 : playerToMove = 1;
            playGame();
            return false;
        } else {
            stopGame();
            player.addTie();
            console.log("It's a draw.")
            printScoreBoard();
            return true;
        }
    }
    const printScoreBoard = () => {
        const scores = player.getScores();
        const p1name = player.getPlayer(1).name;
        const p2name = player.getPlayer(2).name;
        console.log(`
            ${p1name} has won ${scores.player1} times.
            ${p2name} has won ${scores.player2} times.
            They had ${scores.ties} games that ended in a tie.
        `);
    };
    const playGame = () => {
        const token = player.getPlayer(playerToMove).token;
        if (gameRunning) {
            let move;
            do {
                move = validateMove(getMove());
            } while (typeof move !== 'number');
    
            gameBoard.setMove(move, token);
            checkForWin();
        } else {
            console.warn('Game is not running.')
        }
    };
    const stopGame = () => {
        if (gameRunning){
            gameRunning = false;
            gameBoard.clearBoard();
        } else {
            return console.log('Game is not running. Want to start? Call: game.startGame()');
        }
    };
    const startGame = () => {
        if (gameRunning){
            return console.log('Game is already running. Want to stop? Call: game.stopGame()');
        }
        getPlayers()
        gameRunning = true;
        playerToMove = 1;
        playGame();
    }
    const getGameRunning = () => gameRunning;
    return {
        stopGame,
        startGame,
        getGameRunning
    }
})();

const toggleScoreBoard = () => {
    document.querySelector('.pane-container.slim').classList.toggle('hidden');
};

