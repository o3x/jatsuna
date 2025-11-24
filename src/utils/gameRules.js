import { BOARD_SIZE, COLOR_TRANSFORM, DIRECTIONS } from './constants.js';

export const createInitialBoard = () => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    // Wide Triangle Setup (Balanced)
    board[2][3] = 'O';
    board[4][5] = 'C';
    board[5][2] = 'P';
    return board;
};

export const isValidPosition = (r, c) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

export const getCapturesInDirection = (board, row, col, color, dr, dc) => {
    const captures = [];
    let r = row + dr, c = col + dc;
    while (isValidPosition(r, c) && board[r][c] !== null && board[r][c] !== color && board[r][c] !== 'X') {
        captures.push([r, c, board[r][c]]);
        r += dr;
        c += dc;
    }
    if (isValidPosition(r, c) && board[r][c] === color && captures.length > 0) return captures;
    return [];
};

export const getAllCaptures = (board, row, col, color) => {
    if (board[row][col] !== null) return [];
    let allCaptures = [];
    for (const [dr, dc] of DIRECTIONS) {
        allCaptures = allCaptures.concat(getCapturesInDirection(board, row, col, color, dr, dc));
    }
    return allCaptures;
};

export const getValidMoves = (board, color) => {
    const movesWithCaptures = [], movesWithoutCaptures = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === null) {
                const captures = getAllCaptures(board, row, col, color);
                if (captures.length > 0) movesWithCaptures.push({ row, col, captures });
                else movesWithoutCaptures.push({ row, col, captures: [] });
            }
        }
    }
    return movesWithCaptures.length > 0 ? movesWithCaptures : movesWithoutCaptures;
};

export const makeMoveSimulation = (board, row, col, color, captures) => {
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = color;
    for (const [r, c, capturedColor] of captures) {
        newBoard[r][c] = COLOR_TRANSFORM[color][capturedColor];
    }
    return newBoard;
};

export const calculateScores = (board) => {
    const newScores = { O: 0, C: 0, P: 0 };
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] && board[row][col] !== 'X') newScores[board[row][col]]++;
        }
    }
    return newScores;
};
