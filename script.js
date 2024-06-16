
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
    return {
        setMove,
        clearBoard,
        getBoard,
        printBoard
    }
})();

const player = (() => {
    const playerList = [];
    const createPlayer = (name, isComputer) => {
        if (playerList.length < 2) {
            return playerList.push({
                id: playerList.length + 1,
                name: name,
                token: playerList.length === 0 ? 'X' : 'O',
                computer: isComputer,
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
    const getPlayerNames = () => {
        if (player.getPlayerList().length < 2) {
            player.createPlayer(validatePlayerName(prompt(`Player ${player.getPlayerList().length + 1}, please enter your name`)), false)
            getPlayerNames();
        }  
    };
    const validateMove = (moves) => {
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
    const getMove = () => {
        return validateMove(prompt(player.getPlayer(playerToMove).name + ", please enter your move", '0-2, 0-2'));
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
            console.log(`There is a winner: ${winner}`)
            return printScoreBoard();
        }

        if (board.flat().includes(null)) {
            playerToMove === 1 ? playerToMove = 2 : playerToMove = 1;
            playGame();
        } else {
            stopGame();
            player.addTie();
            console.log("It's a draw.")
            return printScoreBoard();
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

