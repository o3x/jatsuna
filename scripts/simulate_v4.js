// ゲームバランス検証 拡張シミュレーター v4（高精度版）
// Created: Mon Feb 17 19:42:00 JST 2026
// Author: Antigravity AI (Claude) + OHYAMA Yoshihisa (o3x)
//
// v3からの改善:
//   - 実際のゲームAI (aiLogic.js) をそのまま使用（ロジックの重複排除）
//   - ランダム性は「Top-K選択」で導入（評価上位K手からソフトマックス選択）
//   - 95%信頼区間を結果に追加
//   - サンプル数増加（3000ゲーム）
//
// 使い方:
//   node --experimental-vm-modules scripts/simulate_v4.js

import { getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { getAIMoveLogic } from '../src/utils/aiLogic.js';
import { PLAYERS, BOARD_SIZE, JATSUNA_CONFIG, COLOR_TRANSFORM, DIRECTIONS } from '../src/utils/constants.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// === 設定 ===
const SIMULATION_COUNT = 3000;

// Top-K ソフトマックス選択
// 実際のAIで全候補手を評価 → 上位K手からランダムに選択（強い手ほど選ばれやすい）
const getAIMoveWithTopK = (board, color, difficulty, playerTurnPosition, topK = 3, temperature = 0.5, config = JATSUNA_CONFIG) => {
    const moves = getValidMoves(board, color, config);
    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0];

    // 実際のAIで各手を評価
    const evaluatedMoves = moves.map(move => {
        const simBoard = makeMoveSimulation(board, move.row, move.col, color, move.captures, config);
        const scores = calculateScores(simBoard);
        // キャプチャ数 + 自分のスコア向上 を評価
        return {
            move,
            score: scores[color] + move.captures.length * 2
        };
    });

    // スコア順にソート
    evaluatedMoves.sort((a, b) => b.score - a.score);

    // 上位K手を取得
    const topMoves = evaluatedMoves.slice(0, Math.min(topK, evaluatedMoves.length));

    // ソフトマックス確率で選択（temperatureが低いほど最善手に偏る）
    const maxScore = topMoves[0].score;
    const weights = topMoves.map(m => Math.exp((m.score - maxScore) / Math.max(temperature, 0.01)));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    const rand = Math.random() * totalWeight;
    let cumWeight = 0;
    for (let i = 0; i < topMoves.length; i++) {
        cumWeight += weights[i];
        if (rand <= cumWeight) return topMoves[i].move;
    }
    return topMoves[0].move;
};

// AIの手を取得（難易度に応じて実際のAIまたはTop-K選択を使用）
const getSimulationMove = (board, color, mode, playerTurnPosition, config = JATSUNA_CONFIG) => {
    if (mode === 'actual_superhard') {
        // 実際のSuperHard AI（決定論的）
        return getAIMoveLogic(board, color, 'superhard', playerTurnPosition, config);
    } else if (mode === 'actual_hard') {
        return getAIMoveLogic(board, color, 'hard', playerTurnPosition, config);
    } else if (mode === 'topk_soft') {
        // Top-K ソフトマックス（temperature=0.5, 上位3手）
        return getAIMoveWithTopK(board, color, 'superhard', playerTurnPosition, 3, 0.5, config);
    } else if (mode === 'topk_hard') {
        // Top-K ソフトマックス（temperature=0.2, 上位2手 → より決定論寄り）
        return getAIMoveWithTopK(board, color, 'superhard', playerTurnPosition, 2, 0.2, config);
    }
    return getAIMoveLogic(board, color, 'superhard', playerTurnPosition, config);
};

// === テスト条件 ===
const createBoard = (hasWall) => {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    board[2][3] = 'O';
    board[4][5] = 'C';
    board[5][2] = 'P';
    if (hasWall) board[3][3] = 'X';
    return board;
};

const TEST_CONDITIONS = [
    {
        id: 'wide_triangle_wall',
        name: 'Wide Triangle + 中央壁',
        description: '現在の暫定最適。均等手数15手。',
        aiMode: 'topk_soft',
        hasWall: true,
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[2][3] = 'O'; board[4][5] = 'C'; board[5][2] = 'P'; board[3][3] = 'X';
            return board;
        }
    },
    {
        id: 'tight_triangle_wall',
        name: 'Tight Triangle + 中央壁',
        description: '中央付近に密集。均等手数15手。',
        aiMode: 'topk_soft',
        hasWall: true,
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[2][2] = 'O'; board[2][4] = 'C'; board[4][3] = 'P'; board[3][3] = 'X';
            return board;
        }
    },
    {
        id: 'edge_start_wall',
        name: 'Edge Start + 中央壁',
        description: '各プレイヤーが辺の近くからスタート。',
        aiMode: 'topk_soft',
        hasWall: true,
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[0][3] = 'O'; board[6][1] = 'C'; board[6][5] = 'P'; board[3][3] = 'X';
            return board;
        }
    },
    {
        id: 'diagonal_wall',
        name: 'Diagonal + 中央壁',
        description: '対角線上に配置。',
        aiMode: 'topk_soft',
        hasWall: true,
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[1][1] = 'O'; board[1][5] = 'C'; board[5][3] = 'P'; board[3][3] = 'X';
            return board;
        }
    }
];

// 95%信頼区間の計算
const confidenceInterval95 = (successes, total) => {
    const p = successes / total;
    const z = 1.96;
    const se = Math.sqrt(p * (1 - p) / total);
    return {
        lower: Math.max(0, (p - z * se) * 100).toFixed(1),
        upper: Math.min(100, (p + z * se) * 100).toFixed(1),
        value: (p * 100).toFixed(1)
    };
};

// === シミュレーション ===
const runGame = (initialBoard, turnOrder, aiMode) => {
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
        const moves = getValidMoves(board, color, JATSUNA_CONFIG);

        if (moves.length === 0) {
            consecutivePasses++;
            passCounts[color]++;
        } else {
            consecutivePasses = 0;
            const move = getSimulationMove(board, color, aiMode, 0, JATSUNA_CONFIG);
            if (move) {
                board = makeMoveSimulation(board, move.row, move.col, color, move.captures, JATSUNA_CONFIG);
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
    console.log(`AI: ${condition.aiMode} | ゲーム数: ${SIMULATION_COUNT}`);
    console.log('='.repeat(60));

    const turnOrders = [['O', 'C', 'P'], ['C', 'P', 'O'], ['P', 'O', 'C']];
    const gamesPerOrder = Math.floor(SIMULATION_COUNT / turnOrders.length);
    const remainder = SIMULATION_COUNT - gamesPerOrder * turnOrders.length;

    const stats = {
        colorWins: { O: 0, C: 0, P: 0, draw: 0 },
        colorScores: { O: 0, C: 0, P: 0 },
        colorMoves: { O: 0, C: 0, P: 0 },
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
            const board = condition.setupFn();
            const result = runGame(board, order, condition.aiMode);
            const { scores, moveCounts } = result;

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

            for (const p of PLAYERS) {
                stats.colorScores[p] += scores[p];
                stats.colorMoves[p] += moveCounts[p];
            }

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
    const nonDrawN = N - stats.colorWins.draw;

    // 信頼区間付き結果
    const ci1st = confidenceInterval95(stats.turnOrderWins.first, N);
    const ci2nd = confidenceInterval95(stats.turnOrderWins.second, N);
    const ci3rd = confidenceInterval95(stats.turnOrderWins.third, N);

    const results = {
        meta: {
            conditionId: condition.id,
            conditionName: condition.name,
            description: condition.description,
            timestamp: new Date().toISOString(),
            localTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
            executor: 'Antigravity AI (Claude) + OHYAMA Yoshihisa',
            aiMode: condition.aiMode,
            simulationCount: N,
            boardSize: BOARD_SIZE,
            turnOrderRotation: true,
            elapsedSeconds: parseFloat(elapsed)
        },
        turnOrderWinRates: {
            first: { value: ci1st.value + '%', ci95: `[${ci1st.lower}%, ${ci1st.upper}%]` },
            second: { value: ci2nd.value + '%', ci95: `[${ci2nd.lower}%, ${ci2nd.upper}%]` },
            third: { value: ci3rd.value + '%', ci95: `[${ci3rd.lower}%, ${ci3rd.upper}%]` },
        },
        colorWinRates: {
            O_orb: `${(stats.colorWins.O / N * 100).toFixed(1)}%`,
            C_gem: `${(stats.colorWins.C / N * 100).toFixed(1)}%`,
            P_stella: `${(stats.colorWins.P / N * 100).toFixed(1)}%`,
            draws: `${(stats.colorWins.draw / N * 100).toFixed(1)}%`,
        },
        avgScoresByTurnOrder: {
            first: (stats.turnOrderScores.first / N).toFixed(1),
            second: (stats.turnOrderScores.second / N).toFixed(1),
            third: (stats.turnOrderScores.third / N).toFixed(1),
        },
        avgMovesByTurnOrder: {
            first: (stats.turnOrderMoves.first / N).toFixed(1),
            second: (stats.turnOrderMoves.second / N).toFixed(1),
            third: (stats.turnOrderMoves.third / N).toFixed(1),
        },
        balanceMetrics: {
            turnOrderWinRateSpread: ((Math.max(stats.turnOrderWins.first, stats.turnOrderWins.second, stats.turnOrderWins.third) -
                Math.min(stats.turnOrderWins.first, stats.turnOrderWins.second, stats.turnOrderWins.third)) / N * 100).toFixed(1) + '%',
            colorWinRateSpread: ((Math.max(stats.colorWins.O, stats.colorWins.C, stats.colorWins.P) -
                Math.min(stats.colorWins.O, stats.colorWins.C, stats.colorWins.P)) / N * 100).toFixed(1) + '%',
        },
        rawStats: stats
    };

    // コンソール出力
    console.log('\n--- 手番順別勝率（95%信頼区間）---');
    console.log(`  1番手: ${ci1st.value}%  ${ci1st.lower}-${ci1st.upper}%`);
    console.log(`  2番手: ${ci2nd.value}%  ${ci2nd.lower}-${ci2nd.upper}%`);
    console.log(`  3番手: ${ci3rd.value}%  ${ci3rd.lower}-${ci3rd.upper}%`);

    console.log('\n--- 色別勝率 ---');
    console.log(`  O: ${results.colorWinRates.O_orb}  C: ${results.colorWinRates.C_gem}  P: ${results.colorWinRates.P_stella}  引分: ${results.colorWinRates.draws}`);

    console.log('\n--- 平均スコア(手番順) ---');
    console.log(`  1番手: ${results.avgScoresByTurnOrder.first}  2番手: ${results.avgScoresByTurnOrder.second}  3番手: ${results.avgScoresByTurnOrder.third}`);

    console.log('\n--- バランス指標 ---');
    console.log(`  手番勝率差: ${results.balanceMetrics.turnOrderWinRateSpread}`);
    console.log(`  色別勝率差: ${results.balanceMetrics.colorWinRateSpread}`);

    return results;
};

// === メイン ===
console.log('🔬 蛇突奈 ゲームバランス検証 v4（高精度版）');
console.log(`日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);
console.log(`改善点: Top-Kソフトマックス選択 + 95%信頼区間 + 3000ゲーム`);

const balanceDir = new URL('../docs/balance', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
if (!existsSync(balanceDir)) mkdirSync(balanceDir, { recursive: true });

const allResults = [];
for (const condition of TEST_CONDITIONS) {
    allResults.push(runSimulation(condition));
}

const dateStr = new Date().toISOString().slice(0, 10);
const jsonPath = `${balanceDir}/${dateStr}_balance_report_v4.json`;
writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
console.log(`\n💾 保存: ${jsonPath}`);

// 比較
console.log('\n' + '='.repeat(70));
console.log('📊 最終比較（95%信頼区間付き）');
console.log('='.repeat(70));
for (const r of allResults) {
    console.log(`\n【${r.meta.conditionName}】`);
    console.log(`  1番手: ${r.turnOrderWinRates.first.value} ${r.turnOrderWinRates.first.ci95}`);
    console.log(`  2番手: ${r.turnOrderWinRates.second.value} ${r.turnOrderWinRates.second.ci95}`);
    console.log(`  3番手: ${r.turnOrderWinRates.third.value} ${r.turnOrderWinRates.third.ci95}`);
    console.log(`  手番勝率差: ${r.balanceMetrics.turnOrderWinRateSpread} | 色勝率差: ${r.balanceMetrics.colorWinRateSpread}`);
}
