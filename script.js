
const Cell = () => {
    let value = null;
  
    const addToken = (token) => {
      value = token;
    };

    const removeToken = () => {
        value = null;
    }
  
    const getValue = () => value;
  
    return {
      addToken,
      removeToken,
      getValue
    };
}

const gameBoard = (() => {
    const board =   [[Cell(),Cell(),Cell()],
                    [Cell(),Cell(),Cell()],
                    [Cell(),Cell(),Cell()]];
    const printBoard = () => {
        let printBoardArr = [];
        for (let i = 0; i < board.length; i++) {
            printBoardArr.push([]);
            for (let j = 0; j < board[0].length; j++) {
                printBoardArr[i].push(board[i][j].getValue());
            }
        }
        return printBoardArr;
    };
    const setMove = (movesArr, token) => {
        if (movesArr){
            board[movesArr[0]][movesArr[1]].addToken(token);
            console.table(printBoard());
        } else {
            console.error('Invalid move');
        }
    };
    const clearBoard = () => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                board[i][j].removeToken();
            }
        }
    };
    const getBoard = () => board;

    const checkWinner = (position, player) => {
        const board =  [[position[0], position[1], position[2]],
                        [position[3], position[4], position[5]],
                        [position[6], position[7], position[8]]];
    
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
    
    
    const getBestMove = () => {
        const HUMAN_PLAYER = player.getPlayer(1).token;
        const AI_PLAYER = player.getPlayer(2).token;
        const minimax = (position, depth, isMaximizing) => {
            if (checkWinner(position, HUMAN_PLAYER)) return depth - 10;
            if (checkWinner(position, AI_PLAYER)) return 10 - depth;
            if (position.filter(val => val === null).length === 0) return 0;
            
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
        const bestMoveIndex = findBestMove(printBoard().flat());
        const indexArray = ['0, 0', '0, 1', '0, 2', '1, 0', '1, 1', '1, 2', '2, 0', '2, 1', '2, 2']
        return indexArray[bestMoveIndex];
    }
    
    return {
        printBoard,
        setMove,
        clearBoard,
        getBoard,
        checkWinner,
        getBestMove
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

const game = (() => {
    let gameRunning = false;
    let playerToMove = 1;
    const validatePlayerName = (name) => {
        if (name) {
            if (name.length < 9) {
                return name;
            } else {
                console.warn('Player name too long, must be 8 characters or less, try again.')
            }
        } else {
            console.warn('Player name invalid, try again.')
        }
        getPlayerNames();
    };
    const getComputerDifficulty = () => {
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
        }
    }
    const getPlayerNames = () => {
        const playerListLength = player.getPlayerList().length;
        if (playerListLength < 2) {
            player.createPlayer(validatePlayerName(prompt(`Player ${playerListLength + 1}, please enter your name`)), playerListLength < 1 ? 0 : getComputerDifficulty())
            getPlayerNames();
        }  
    };
    const validateMove = (moves) => {
        if (!moves){
            return null;
        }
        const movesArr = moves.split(', ');
        if (movesArr.length === 2 && movesArr[0] >= 0 && movesArr[0] <= 2 && movesArr[1] >= 0 && movesArr[1] <= 2) {
            if (gameBoard.printBoard()[movesArr[0]][movesArr[1]]){
                return null;
            }
            return movesArr;
        } else {
            return null;
        }
    }
    const getComputerMove = difficulty => {
        switch (difficulty) {
            case 0:
                console.error('Tried to get computer move while playing manual.')
                break;
            case 1:
                return validateMove(gameBoard.getBestMove());
            case 2:
                return validateMove(gameBoard.getBestMove());
            case 3:
                return validateMove(gameBoard.getBestMove());
            default:
                console.error('Default switch statement was called.')
                break;
          }
    }
    const getMove = () => {
        const computer = player.getPlayer(playerToMove).computer;
        if (computer === 0){
            return validateMove(prompt(player.getPlayer(playerToMove).name + ", please enter your move", '0-2, 0-2'));
        } else {
            return getComputerMove(computer);
        }
    };
    const checkForWin = () => {
        const board = gameBoard.printBoard();
        const size = board.length
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

        if (winner) {
            stopGame();
            player.addWin(winner);
            console.log(`There is a winner: ${winner}`);
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
        if (gameRunning){
             const move = getMove();
             if (move) {
                 gameBoard.setMove(move, token);
             } else {
                console.warn('Invalid move.')
                playGame();
             }
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
        getPlayerNames()
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

