// gameRules.js - Jatsuna Core Logic (Decoupled version)
// Last Updated: Tue Feb 17 20:30:00 JST 2026
// Version: 6.7.0


export const createInitialBoard = (config) => {
    const { boardSize = 7 } = config;
    const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    // ワイドトライアングル配置 + 中央壁
    board[2][3] = 'O';
    board[4][5] = 'C';
    board[5][2] = 'P';
    board[3][3] = 'X';
    return board;
};

export const isValidPosition = (r, c, boardSize) => r >= 0 && r < boardSize && c >= 0 && c < boardSize;

export const getCapturesInDirection = (board, row, col, color, dr, dc, boardSize) => {
    const captures = [];
    let r = row + dr, c = col + dc;
    while (isValidPosition(r, c, boardSize) && board[r][c] !== null && board[r][c] !== color && board[r][c] !== 'X') {
        captures.push([r, c, board[r][c]]);
        r += dr;
        c += dc;
    }
    if (isValidPosition(r, c, boardSize) && board[r][c] === color && captures.length > 0) return captures;
    return [];
};

export const getAllCaptures = (board, row, col, color, config) => {
    const { directions, boardSize } = config;
    if (board[row][col] !== null) return [];
    let allCaptures = [];
    for (const [dr, dc] of directions) {
        allCaptures = allCaptures.concat(getCapturesInDirection(board, row, col, color, dr, dc, boardSize));
    }
    return allCaptures;
};

export const getValidMoves = (board, color, config) => {
    const { boardSize } = config;
    const movesWithCaptures = [], movesWithoutCaptures = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === null) {
                const captures = getAllCaptures(board, row, col, color, config);
                if (captures.length > 0) movesWithCaptures.push({ row, col, captures });
                else movesWithoutCaptures.push({ row, col, captures: [] });
            }
        }
    }
    return movesWithCaptures.length > 0 ? movesWithCaptures : movesWithoutCaptures;
};

export const makeMoveSimulation = (board, row, col, color, captures, config) => {
    const { colorTransform } = config;
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = color;
    for (const [r, c, capturedColor] of captures) {
        newBoard[r][c] = colorTransform[color][capturedColor];
    }
    return newBoard;
};

export const calculateScores = (board) => {
    const boardSize = board.length;
    const newScores = { O: 0, C: 0, P: 0 };
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] && board[row][col] !== 'X') newScores[board[row][col]]++;
        }
    }
    return newScores;
};
