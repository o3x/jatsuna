import { createInitialBoard, getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { getAIMoveLogic } from '../src/utils/aiLogic.js';
import { PLAYERS } from '../src/utils/constants.js';

const SIMULATION_COUNT = 1000;
const DIFFICULTY = 'superhard'; // 全員SuperHardで戦わせてバランスを見る

const runGame = () => {
    let board = createInitialBoard();
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
            // 全員AIとして動作させる。playerTurnPositionは便宜上0とする（結託モードではないため影響なし）
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

console.log(`Starting simulation of ${SIMULATION_COUNT} games...`);
console.log(`AI Difficulty: ${DIFFICULTY}`);

const stats = {
    O: 0,
    C: 0,
    P: 0,
    draw: 0
};

const scoresLog = {
    O: 0,
    C: 0,
    P: 0
};

const startTime = Date.now();

for (let i = 0; i < SIMULATION_COUNT; i++) {
    const scores = runGame();
    scoresLog.O += scores.O;
    scoresLog.C += scores.C;
    scoresLog.P += scores.P;

    if (scores.O > scores.C && scores.O > scores.P) stats.O++;
    else if (scores.C > scores.O && scores.C > scores.P) stats.C++;
    else if (scores.P > scores.O && scores.P > scores.C) stats.P++;
    else stats.draw++;

    if ((i + 1) % 100 === 0) {
        process.stdout.write('.');
    }
}

const endTime = Date.now();
console.log('\nSimulation complete!');
console.log(`Time taken: ${(endTime - startTime) / 1000}s`);

console.log('\n--- Results ---');
console.log(`1st Player (O - Orb) Wins: ${stats.O} (${(stats.O / SIMULATION_COUNT * 100).toFixed(1)}%)`);
console.log(`2nd Player (C - Gem) Wins: ${stats.C} (${(stats.C / SIMULATION_COUNT * 100).toFixed(1)}%)`);
console.log(`3rd Player (P - Stella) Wins: ${stats.P} (${(stats.P / SIMULATION_COUNT * 100).toFixed(1)}%)`);
console.log(`Draws: ${stats.draw} (${(stats.draw / SIMULATION_COUNT * 100).toFixed(1)}%)`);

console.log('\n--- Average Scores ---');
console.log(`O: ${(scoresLog.O / SIMULATION_COUNT).toFixed(1)}`);
console.log(`C: ${(scoresLog.C / SIMULATION_COUNT).toFixed(1)}`);
console.log(`P: ${(scoresLog.P / SIMULATION_COUNT).toFixed(1)}`);
