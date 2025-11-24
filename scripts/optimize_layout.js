import { getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { getAIMoveLogic } from '../src/utils/aiLogic.js';
import { PLAYERS, BOARD_SIZE } from '../src/utils/constants.js';

const GAMES_PER_LAYOUT = 100; // 各レイアウトごとの対戦数（多すぎると時間がかかるので一旦100）
const DIFFICULTY = 'superhard';

// 盤面生成ユーティリティ
const createBoard = (setup) => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    setup.forEach(({ r, c, type }) => {
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

    console.log(`Starting layout optimization (${GAMES_PER_LAYOUT} games per layout)...`);

    for (const layout of layouts) {
        console.log(`\nTesting Layout: ${layout.name}`);
        const stats = { O: 0, C: 0, P: 0, draw: 0 };
        const scoresLog = { O: 0, C: 0, P: 0 };

        for (let i = 0; i < GAMES_PER_LAYOUT; i++) {
            const initialBoard = createBoard(layout.setup);
            const scores = runGame(initialBoard);

            scoresLog.O += scores.O;
            scoresLog.C += scores.C;
            scoresLog.P += scores.P;

            if (scores.O > scores.C && scores.O > scores.P) stats.O++;
            else if (scores.C > scores.O && scores.C > scores.P) stats.C++;
            else if (scores.P > scores.O && scores.P > scores.C) stats.P++;
            else stats.draw++;

            if ((i + 1) % 20 === 0) process.stdout.write('.');
        }
        console.log('');
        console.log(`Win Rates - O: ${stats.O}%, C: ${stats.C}%, P: ${stats.P}%`);
        console.log(`Avg Scores - O: ${(scoresLog.O / GAMES_PER_LAYOUT).toFixed(1)}, C: ${(scoresLog.C / GAMES_PER_LAYOUT).toFixed(1)}, P: ${(scoresLog.P / GAMES_PER_LAYOUT).toFixed(1)}`);
    }
