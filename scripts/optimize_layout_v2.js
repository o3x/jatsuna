import { getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { getAIMoveLogic } from '../src/utils/aiLogic.js';
import { PLAYERS, BOARD_SIZE } from '../src/utils/constants.js';

const DIFFICULTY = 'superhard';

// 盤面生成ユーティリティ
const createBoard = (setup) => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    setup.forEach(({ r, c, type }) => {
        board[r][c] = type;
    });
    return board;
};

// テストするレイアウト候補
const layouts = [
    {
        name: "Current (Baseline)",
        setup: [
            { r: 2, c: 1, type: 'O' },
            { r: 2, c: 5, type: 'C' },
            { r: 4, c: 3, type: 'P' },
            { r: 3, c: 3, type: 'X' }
        ]
    },
    {
        name: "Wide Triangle (Base)",
        setup: [
            { r: 2, c: 3, type: 'O' },
            { r: 4, c: 5, type: 'C' },
            { r: 5, c: 2, type: 'P' }
        ]
    },
    {
        name: "Wide Triangle (Center Wall)",
        setup: [
            { r: 2, c: 3, type: 'O' },
            { r: 4, c: 5, type: 'C' },
            { r: 5, c: 2, type: 'P' },
            { r: 3, c: 3, type: 'X' }
        ]
    },
    {
        name: "Wide Triangle (Shifted 1)",
        setup: [
            { r: 2, c: 3, type: 'O' },
            { r: 4, c: 5, type: 'C' },
            { r: 5, c: 3, type: 'P' } // Pを右に1つずらす
        ]
    },
    {
        name: "Wide Triangle (Shifted 2)",
        setup: [
            { r: 2, c: 4, type: 'O' }, // Oを右に1つずらす
            { r: 4, c: 5, type: 'C' },
            { r: 5, c: 2, type: 'P' }
        ]
    },
    {
        name: "Hexagon Small",
        setup: [
            { r: 2, c: 3, type: 'O' },
            { r: 3, c: 5, type: 'C' },
            { r: 5, c: 4, type: 'P' }
        ]
    },
    {
        name: "Edges",
        setup: [
            { r: 0, c: 3, type: 'O' },
            { r: 7, c: 0, type: 'C' },
            { r: 7, c: 7, type: 'P' }
        ]
    }
];

const runGame = (initialBoard) => {
    let board = initialBoard.map(row => [...row]);
    let currentPlayerIndex = 0;
    let consecutivePasses = 0;
    let turnCount = 0;

    while (consecutivePasses < 3 && turnCount < 200) {
        const color = PLAYERS[currentPlayerIndex];
        const moves = getValidMoves(board, color);

        if (moves.length === 0) {
            consecutivePasses++;
        } else {
            consecutivePasses = 0;
            const move = getAIMoveLogic(board, color, DIFFICULTY, 0);
            if (move) {
                board = makeMoveSimulation(board, move.row, move.col, color, move.captures);
            }
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % 3;
        turnCount++;
    }

    return calculateScores(board);
};

console.log(`Starting deterministic layout optimization...`);

for (const layout of layouts) {
    console.log(`\nTesting Layout: ${layout.name}`);
    const initialBoard = createBoard(layout.setup);
    const scores = runGame(initialBoard);

    console.log(`Scores - O: ${scores.O}, C: ${scores.C}, P: ${scores.P}`);

    const maxScore = Math.max(scores.O, scores.C, scores.P);
    let winner = 'Draw';
    if (scores.O === maxScore && scores.C < maxScore && scores.P < maxScore) winner = 'O';
    else if (scores.C === maxScore && scores.O < maxScore && scores.P < maxScore) winner = 'C';
    else if (scores.P === maxScore && scores.O < maxScore && scores.C < maxScore) winner = 'P';

    console.log(`Winner: ${winner}`);

    // バランススコア（標準偏差のようなもの）
    const mean = (scores.O + scores.C + scores.P) / 3;
    const variance = ((scores.O - mean) ** 2 + (scores.C - mean) ** 2 + (scores.P - mean) ** 2) / 3;
    console.log(`Balance Metric (Lower is better): ${variance.toFixed(2)}`);
}
