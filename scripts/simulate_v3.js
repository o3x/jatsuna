// ゲームバランス検証 拡張シミュレーター v3（ランダムノイズ対応）
// Created: Mon Feb 17 19:22:00 JST 2026
// Author: Antigravity AI (Claude) + OHYAMA Yoshihisa (o3x)
//
// v2からの改善:
//   - AI評価にランダムノイズを追加し、決定論的な結果を回避
//   - 手番ローテーション検証（色の影響と手番順の影響を分離）
//
// 使い方:
//   node --experimental-vm-modules scripts/simulate_v3.js

import { getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { PLAYERS, BOARD_SIZE } from '../src/utils/constants.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// === 設定 ===
const SIMULATION_COUNT = 1000;

// ランダムノイズ付き評価関数（ゲーム用のevaluateBoardをベースに）
const evaluateBoardWithNoise = (board, myColor, noiseLevel = 0.15) => {
    let score = 0;
    const BS = board.length;
    const scores = calculateScores(board);
    score += scores[myColor] * 2;

    const weights = [
        [120, -20, 20, 5, 20, -20, 120],
        [-20, -40, -5, -5, -5, -40, -20],
        [20, -5, 15, 3, 15, -5, 20],
        [5, -5, 3, 0, 3, -5, 5],
        [20, -5, 15, 3, 15, -5, 20],
        [-20, -40, -5, -5, -5, -40, -20],
        [120, -20, 20, 5, 20, -20, 120],
    ];

    for (let r = 0; r < BS; r++) {
        for (let c = 0; c < BS; c++) {
            if (board[r][c] === myColor) {
                score += weights[r][c];
            } else if (board[r][c] !== null && board[r][c] !== 'X') {
                score -= weights[r][c] * 0.5;
            }
        }
    }

    const myMoves = getValidMoves(board, myColor);
    score += myMoves.length * 5;

    // ランダムノイズを追加（評価値の±noiseLevel分）
    const noise = score * noiseLevel * (Math.random() * 2 - 1);
    return score + noise;
};

// ノイズ付きAI（SuperHard相当 + ランダム性）
const getAIMoveWithNoise = (board, color, noiseLevel) => {
    const moves = getValidMoves(board, color);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
        const simBoard = makeMoveSimulation(board, move.row, move.col, color, move.captures);

        // 次のプレイヤーの最善手も予測（1手読み）
        const nextPlayer = PLAYERS[(PLAYERS.indexOf(color) + 1) % 3];
        const nextMoves = getValidMoves(simBoard, nextPlayer);

        let maxEnemyScore = -Infinity;
        if (nextMoves.length > 0) {
            for (const enemyMove of nextMoves) {
                const enemySimBoard = makeMoveSimulation(simBoard, enemyMove.row, enemyMove.col, nextPlayer, enemyMove.captures);
                const enemyScore = evaluateBoardWithNoise(enemySimBoard, nextPlayer, noiseLevel);
                if (enemyScore > maxEnemyScore) maxEnemyScore = enemyScore;
            }
        } else {
            maxEnemyScore = 0;
        }

        const currentScore = evaluateBoardWithNoise(simBoard, color, noiseLevel) - (maxEnemyScore * 0.5);
        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = move;
        }
    }
    return bestMove;
};

// === テスト条件 ===
const createWideTriangleBoard = (hasWall) => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    board[2][3] = 'O';
    board[4][5] = 'C';
    board[5][2] = 'P';
    if (hasWall) board[3][3] = 'X';
    return board;
};

const TEST_CONDITIONS = [
    {
        id: 'baseline_noise',
        name: '現行ルール（壁なし）+ ノイズ15%',
        description: 'v6.1.0現行。SuperHard+ノイズ15%で1000ゲーム。',
        noiseLevel: 0.15,
        hasWall: false,
    },
    {
        id: 'wall_noise',
        name: '中央壁あり + ノイズ15%',
        description: 'v4.1方式。中央壁(X)追加。SuperHard+ノイズ15%。',
        noiseLevel: 0.15,
        hasWall: true,
    },
];

// === シミュレーション ===
const runGame = (initialBoard, turnOrder, noiseLevel) => {
    let board = initialBoard.map(row => [...row]);
    let currentIndex = 0;
    let consecutivePasses = 0;
    let turnCount = 0;

    const moveCounts = {};
    const passCounts = {};
    for (const p of turnOrder) {
        moveCounts[p] = 0;
        passCounts[p] = 0;
    }

    while (consecutivePasses < 3 && turnCount < 200) {
        const color = turnOrder[currentIndex];
        const moves = getValidMoves(board, color);

        if (moves.length === 0) {
            consecutivePasses++;
            passCounts[color]++;
        } else {
            consecutivePasses = 0;
            const move = getAIMoveWithNoise(board, color, noiseLevel);
            if (move) {
                board = makeMoveSimulation(board, move.row, move.col, color, move.captures);
                moveCounts[color]++;
            }
        }

        currentIndex = (currentIndex + 1) % 3;
        turnCount++;
    }

    const scores = calculateScores(board);
    return { scores, moveCounts, passCounts, totalTurns: turnCount };
};

const runSimulation = (condition) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`検証: ${condition.name}`);
    console.log(`条件: ${condition.description}`);
    console.log('='.repeat(60));

    // 3つの手番ローテーション
    const turnOrders = [
        ['O', 'C', 'P'],  // O先攻
        ['C', 'P', 'O'],  // C先攻
        ['P', 'O', 'C'],  // P先攻
    ];

    const gamesPerOrder = Math.floor(SIMULATION_COUNT / turnOrders.length);
    const remainder = SIMULATION_COUNT - gamesPerOrder * turnOrders.length;

    const stats = {
        // 色別勝率
        colorWins: { O: 0, C: 0, P: 0, draw: 0 },
        colorScores: { O: 0, C: 0, P: 0 },
        colorMoves: { O: 0, C: 0, P: 0 },
        // 手番順別勝率（1番手/2番手/3番手）
        turnOrderWins: { first: 0, second: 0, third: 0 },
        turnOrderScores: { first: 0, second: 0, third: 0 },
        turnOrderMoves: { first: 0, second: 0, third: 0 },
    };

    let totalGames = 0;
    const startTime = Date.now();

    for (let orderIdx = 0; orderIdx < turnOrders.length; orderIdx++) {
        const order = turnOrders[orderIdx];
        const count = gamesPerOrder + (orderIdx < remainder ? 1 : 0);

        for (let i = 0; i < count; i++) {
            const board = createWideTriangleBoard(condition.hasWall);
            const result = runGame(board, order, condition.noiseLevel);
            const { scores, moveCounts } = result;

            // 勝者判定
            const maxScore = Math.max(scores.O, scores.C, scores.P);
            const winners = PLAYERS.filter(p => scores[p] === maxScore);

            if (winners.length === 1) {
                stats.colorWins[winners[0]]++;
                const winnerTurnIndex = order.indexOf(winners[0]);
                if (winnerTurnIndex === 0) stats.turnOrderWins.first++;
                else if (winnerTurnIndex === 1) stats.turnOrderWins.second++;
                else stats.turnOrderWins.third++;
            } else {
                stats.colorWins.draw++;
            }

            // 色別累計
            for (const p of PLAYERS) {
                stats.colorScores[p] += scores[p];
                stats.colorMoves[p] += moveCounts[p];
            }

            // 手番順別累計
            stats.turnOrderScores.first += scores[order[0]];
            stats.turnOrderScores.second += scores[order[1]];
            stats.turnOrderScores.third += scores[order[2]];
            stats.turnOrderMoves.first += moveCounts[order[0]];
            stats.turnOrderMoves.second += moveCounts[order[1]];
            stats.turnOrderMoves.third += moveCounts[order[2]];

            totalGames++;
            if (totalGames % 100 === 0) process.stdout.write('.');
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n完了 (${elapsed}秒, ${totalGames}ゲーム)`);

    const N = totalGames;

    const results = {
        meta: {
            conditionId: condition.id,
            conditionName: condition.name,
            description: condition.description,
            timestamp: new Date().toISOString(),
            localTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
            executor: 'Antigravity AI (Claude) + OHYAMA Yoshihisa',
            noiseLevel: condition.noiseLevel,
            simulationCount: N,
            boardSize: BOARD_SIZE,
            turnOrderRotation: true,
            elapsedSeconds: parseFloat(elapsed)
        },
        colorWinRates: {
            O_orb: `${(stats.colorWins.O / N * 100).toFixed(1)}%`,
            C_gem: `${(stats.colorWins.C / N * 100).toFixed(1)}%`,
            P_stella: `${(stats.colorWins.P / N * 100).toFixed(1)}%`,
            draws: `${(stats.colorWins.draw / N * 100).toFixed(1)}%`,
        },
        turnOrderWinRates: {
            first_player: `${(stats.turnOrderWins.first / N * 100).toFixed(1)}%`,
            second_player: `${(stats.turnOrderWins.second / N * 100).toFixed(1)}%`,
            third_player: `${(stats.turnOrderWins.third / N * 100).toFixed(1)}%`,
        },
        avgScoresByColor: {
            O_orb: (stats.colorScores.O / N).toFixed(1),
            C_gem: (stats.colorScores.C / N).toFixed(1),
            P_stella: (stats.colorScores.P / N).toFixed(1),
        },
        avgScoresByTurnOrder: {
            first_player: (stats.turnOrderScores.first / N).toFixed(1),
            second_player: (stats.turnOrderScores.second / N).toFixed(1),
            third_player: (stats.turnOrderScores.third / N).toFixed(1),
        },
        avgMovesByColor: {
            O_orb: (stats.colorMoves.O / N).toFixed(1),
            C_gem: (stats.colorMoves.C / N).toFixed(1),
            P_stella: (stats.colorMoves.P / N).toFixed(1),
        },
        avgMovesByTurnOrder: {
            first_player: (stats.turnOrderMoves.first / N).toFixed(1),
            second_player: (stats.turnOrderMoves.second / N).toFixed(1),
            third_player: (stats.turnOrderMoves.third / N).toFixed(1),
        },
        balanceMetrics: {
            colorWinRateSpread: ((Math.max(stats.colorWins.O, stats.colorWins.C, stats.colorWins.P) -
                Math.min(stats.colorWins.O, stats.colorWins.C, stats.colorWins.P)) / N * 100).toFixed(1) + '%',
            turnOrderWinRateSpread: ((Math.max(stats.turnOrderWins.first, stats.turnOrderWins.second, stats.turnOrderWins.third) -
                Math.min(stats.turnOrderWins.first, stats.turnOrderWins.second, stats.turnOrderWins.third)) / N * 100).toFixed(1) + '%',
        },
        rawStats: stats
    };

    // コンソール出力
    console.log('\n--- 色別勝率 ---');
    console.log(`  O (オーブ):  ${results.colorWinRates.O_orb}`);
    console.log(`  C (ジェム):  ${results.colorWinRates.C_gem}`);
    console.log(`  P (ステラ): ${results.colorWinRates.P_stella}`);
    console.log(`  引き分け:    ${results.colorWinRates.draws}`);

    console.log('\n--- 手番順別勝率（ローテーション考慮）---');
    console.log(`  1番手: ${results.turnOrderWinRates.first_player}`);
    console.log(`  2番手: ${results.turnOrderWinRates.second_player}`);
    console.log(`  3番手: ${results.turnOrderWinRates.third_player}`);

    console.log('\n--- 手番順別 平均スコア ---');
    console.log(`  1番手: ${results.avgScoresByTurnOrder.first_player}`);
    console.log(`  2番手: ${results.avgScoresByTurnOrder.second_player}`);
    console.log(`  3番手: ${results.avgScoresByTurnOrder.third_player}`);

    console.log('\n--- 手番順別 平均手数 ---');
    console.log(`  1番手: ${results.avgMovesByTurnOrder.first_player}`);
    console.log(`  2番手: ${results.avgMovesByTurnOrder.second_player}`);
    console.log(`  3番手: ${results.avgMovesByTurnOrder.third_player}`);

    console.log('\n--- バランス指標 ---');
    console.log(`  色別勝率スプレッド:     ${results.balanceMetrics.colorWinRateSpread} (低いほど均衡)`);
    console.log(`  手番順勝率スプレッド: ${results.balanceMetrics.turnOrderWinRateSpread} (低いほど均衡)`);

    return results;
};

// === メイン ===
console.log('🔬 蛇突奈 ゲームバランス検証 v3（ランダムノイズ+ローテーション）');
console.log(`日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);

const balanceDir = new URL('../docs/balance', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
if (!existsSync(balanceDir)) mkdirSync(balanceDir, { recursive: true });

const allResults = [];
for (const condition of TEST_CONDITIONS) {
    allResults.push(runSimulation(condition));
}

// JSON保存
const dateStr = new Date().toISOString().slice(0, 10);
const jsonPath = `${balanceDir}/${dateStr}_balance_report_v3.json`;
writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
console.log(`\n💾 検証データ保存: ${jsonPath}`);

// 比較
console.log('\n' + '='.repeat(70));
console.log('📊 最終比較');
console.log('='.repeat(70));
console.log(`| 条件 | 1番手勝率 | 2番手勝率 | 3番手勝率 | 勝率差 |`);
console.log(`|------|----------|----------|----------|--------|`);
for (const r of allResults) {
    console.log(`| ${r.meta.conditionName.slice(0, 24).padEnd(24)} | ${r.turnOrderWinRates.first_player.padStart(8)} | ${r.turnOrderWinRates.second_player.padStart(8)} | ${r.turnOrderWinRates.third_player.padStart(8)} | ${r.balanceMetrics.turnOrderWinRateSpread.padStart(6)} |`);
}
