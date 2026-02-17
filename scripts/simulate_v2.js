// ゲームバランス検証 拡張シミュレーター v2
// Created: Mon Feb 17 19:16:00 JST 2026
// Author: Antigravity AI (Claude) + OHYAMA Yoshihisa (o3x)
//
// 使い方:
//   node --experimental-vm-modules scripts/simulate_v2.js
//
// 検証データは docs/balance/ に自動保存されます。

import { getValidMoves, makeMoveSimulation, calculateScores } from '../src/utils/gameRules.js';
import { getAIMoveLogic } from '../src/utils/aiLogic.js';
import { PLAYERS, BOARD_SIZE } from '../src/utils/constants.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// === 設定 ===
const SIMULATION_COUNT = 1000;
const DIFFICULTY = 'superhard';

// テスト条件を定義
const TEST_CONDITIONS = [
    {
        id: 'baseline_no_wall',
        name: '現行ルール（壁なし・Wide Triangle）',
        description: 'v6.1.0以降の現行ルール。壁なし、自由配置あり。',
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[2][3] = 'O';
            board[4][5] = 'C';
            board[5][2] = 'P';
            return board;
        }
    },
    {
        id: 'center_wall',
        name: '中央壁あり（Wide Triangle + 壁）',
        description: 'v4.1方式。中央(3,3)に壁(X)を追加。手番均等化（45÷3=15手）。',
        setupFn: () => {
            const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            board[2][3] = 'O';
            board[4][5] = 'C';
            board[5][2] = 'P';
            board[3][3] = 'X';
            return board;
        }
    }
];

// === シミュレーション実行 ===
const runGame = (initialBoard) => {
    let board = initialBoard.map(row => [...row]);
    let currentPlayerIndex = 0;
    let consecutivePasses = 0;
    let turnCount = 0;

    // 手番別の手数を記録
    const moveCounts = { O: 0, C: 0, P: 0 };
    const passCounts = { O: 0, C: 0, P: 0 };

    while (consecutivePasses < 3 && turnCount < 200) {
        const color = PLAYERS[currentPlayerIndex];
        const moves = getValidMoves(board, color);

        if (moves.length === 0) {
            consecutivePasses++;
            passCounts[color]++;
        } else {
            consecutivePasses = 0;
            const move = getAIMoveLogic(board, color, DIFFICULTY, 0);
            if (move) {
                board = makeMoveSimulation(board, move.row, move.col, color, move.captures);
                moveCounts[color]++;
            }
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % 3;
        turnCount++;
    }

    const scores = calculateScores(board);
    return { scores, moveCounts, passCounts, totalTurns: turnCount };
};

const runSimulation = (condition) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`検証: ${condition.name}`);
    console.log(`条件: ${condition.description}`);
    console.log(`AI難易度: ${DIFFICULTY} | シミュレーション数: ${SIMULATION_COUNT}`);
    console.log('='.repeat(60));

    // 統計データ
    const stats = {
        wins: { O: 0, C: 0, P: 0 },
        draws: 0,
        totalScores: { O: 0, C: 0, P: 0 },
        totalMoves: { O: 0, C: 0, P: 0 },
        totalPasses: { O: 0, C: 0, P: 0 },
        // 手番順（1番手/2番手/3番手）別の勝率
        winsByTurnOrder: { first: 0, second: 0, third: 0 },
        scoresByTurnOrder: { first: 0, second: 0, third: 0 },
    };

    const startTime = Date.now();

    for (let i = 0; i < SIMULATION_COUNT; i++) {
        const board = condition.setupFn();
        const result = runGame(board);

        // 勝者判定
        const { scores, moveCounts, passCounts } = result;
        const maxScore = Math.max(scores.O, scores.C, scores.P);
        const winners = PLAYERS.filter(p => scores[p] === maxScore);

        if (winners.length === 1) {
            stats.wins[winners[0]]++;
            const winnerIndex = PLAYERS.indexOf(winners[0]);
            if (winnerIndex === 0) stats.winsByTurnOrder.first++;
            else if (winnerIndex === 1) stats.winsByTurnOrder.second++;
            else stats.winsByTurnOrder.third++;
        } else {
            stats.draws++;
        }

        // 累積
        for (const p of PLAYERS) {
            stats.totalScores[p] += scores[p];
            stats.totalMoves[p] += moveCounts[p];
            stats.totalPasses[p] += passCounts[p];
        }

        // 手番順別スコア
        stats.scoresByTurnOrder.first += scores[PLAYERS[0]];
        stats.scoresByTurnOrder.second += scores[PLAYERS[1]];
        stats.scoresByTurnOrder.third += scores[PLAYERS[2]];

        if ((i + 1) % 100 === 0) process.stdout.write('.');
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n完了 (${elapsed}秒)`);

    // 結果集計
    const results = {
        // メタデータ
        meta: {
            conditionId: condition.id,
            conditionName: condition.name,
            description: condition.description,
            timestamp: new Date().toISOString(),
            localTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
            executor: 'Antigravity AI (Claude) + OHYAMA Yoshihisa',
            difficulty: DIFFICULTY,
            simulationCount: SIMULATION_COUNT,
            boardSize: BOARD_SIZE,
            elapsedSeconds: parseFloat(elapsed)
        },
        // 勝率
        winRates: {
            O_orb: (stats.wins.O / SIMULATION_COUNT * 100).toFixed(1) + '%',
            C_gem: (stats.wins.C / SIMULATION_COUNT * 100).toFixed(1) + '%',
            P_stella: (stats.wins.P / SIMULATION_COUNT * 100).toFixed(1) + '%',
            draws: (stats.draws / SIMULATION_COUNT * 100).toFixed(1) + '%',
        },
        // 手番順別勝率
        winRatesByTurnOrder: {
            first_player: (stats.winsByTurnOrder.first / SIMULATION_COUNT * 100).toFixed(1) + '%',
            second_player: (stats.winsByTurnOrder.second / SIMULATION_COUNT * 100).toFixed(1) + '%',
            third_player: (stats.winsByTurnOrder.third / SIMULATION_COUNT * 100).toFixed(1) + '%',
        },
        // 平均スコア
        avgScores: {
            O_orb: (stats.totalScores.O / SIMULATION_COUNT).toFixed(1),
            C_gem: (stats.totalScores.C / SIMULATION_COUNT).toFixed(1),
            P_stella: (stats.totalScores.P / SIMULATION_COUNT).toFixed(1),
        },
        // 手番順別平均スコア
        avgScoresByTurnOrder: {
            first_player: (stats.scoresByTurnOrder.first / SIMULATION_COUNT).toFixed(1),
            second_player: (stats.scoresByTurnOrder.second / SIMULATION_COUNT).toFixed(1),
            third_player: (stats.scoresByTurnOrder.third / SIMULATION_COUNT).toFixed(1),
        },
        // 平均手数
        avgMoves: {
            O_orb: (stats.totalMoves.O / SIMULATION_COUNT).toFixed(1),
            C_gem: (stats.totalMoves.C / SIMULATION_COUNT).toFixed(1),
            P_stella: (stats.totalMoves.P / SIMULATION_COUNT).toFixed(1),
        },
        // バランス指標
        balanceMetrics: {
            winRateSpread: (Math.max(
                stats.wins.O, stats.wins.C, stats.wins.P
            ) - Math.min(
                stats.wins.O, stats.wins.C, stats.wins.P
            )) / SIMULATION_COUNT * 100,
            scoreStdDev: (() => {
                const avg = (stats.totalScores.O + stats.totalScores.C + stats.totalScores.P) / (3 * SIMULATION_COUNT);
                const avgO = stats.totalScores.O / SIMULATION_COUNT;
                const avgC = stats.totalScores.C / SIMULATION_COUNT;
                const avgP = stats.totalScores.P / SIMULATION_COUNT;
                return Math.sqrt(((avgO - avg) ** 2 + (avgC - avg) ** 2 + (avgP - avg) ** 2) / 3).toFixed(2);
            })(),
            moveCountSpread: (() => {
                const moves = [stats.totalMoves.O, stats.totalMoves.C, stats.totalMoves.P].map(m => m / SIMULATION_COUNT);
                return (Math.max(...moves) - Math.min(...moves)).toFixed(1);
            })(),
        },
        // 生データ
        rawStats: stats
    };

    // コンソール出力
    console.log('\n--- 勝率 ---');
    console.log(`  O (オーブ):  ${results.winRates.O_orb}`);
    console.log(`  C (ジェム):  ${results.winRates.C_gem}`);
    console.log(`  P (ステラ): ${results.winRates.P_stella}`);
    console.log(`  引き分け:    ${results.winRates.draws}`);

    console.log('\n--- 手番順別勝率 ---');
    console.log(`  1番手: ${results.winRatesByTurnOrder.first_player}`);
    console.log(`  2番手: ${results.winRatesByTurnOrder.second_player}`);
    console.log(`  3番手: ${results.winRatesByTurnOrder.third_player}`);

    console.log('\n--- 平均スコア ---');
    console.log(`  O: ${results.avgScores.O_orb}  C: ${results.avgScores.C_gem}  P: ${results.avgScores.P_stella}`);

    console.log('\n--- 平均手数 ---');
    console.log(`  O: ${results.avgMoves.O_orb}  C: ${results.avgMoves.C_gem}  P: ${results.avgMoves.P_stella}`);

    console.log('\n--- バランス指標 ---');
    console.log(`  勝率スプレッド: ${results.balanceMetrics.winRateSpread.toFixed(1)}% (低いほど均衡)`);
    console.log(`  スコア標準偏差: ${results.balanceMetrics.scoreStdDev} (低いほど均衡)`);
    console.log(`  手数差: ${results.balanceMetrics.moveCountSpread}`);

    return results;
};

// === メイン実行 ===
console.log('🔬 蛇突奈 ゲームバランス検証 v2');
console.log(`日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`);

// docs/balance ディレクトリ作成
const balanceDir = new URL('../docs/balance', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
if (!existsSync(balanceDir)) {
    mkdirSync(balanceDir, { recursive: true });
    console.log(`\n📁 ${balanceDir} を作成しました`);
}

const allResults = [];

for (const condition of TEST_CONDITIONS) {
    const results = runSimulation(condition);
    allResults.push(results);
}

// JSON保存
const dateStr = new Date().toISOString().slice(0, 10);
const jsonPath = `${balanceDir}/${dateStr}_balance_report.json`;
writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
console.log(`\n💾 検証データ保存: ${jsonPath}`);

// 比較サマリー
console.log('\n' + '='.repeat(60));
console.log('📊 比較サマリー');
console.log('='.repeat(60));
console.log(`| 条件 | 1番手勝率 | 2番手勝率 | 3番手勝率 | 勝率差 | 手数差 |`);
console.log(`|------|----------|----------|----------|--------|--------|`);
for (const r of allResults) {
    console.log(`| ${r.meta.conditionName.slice(0, 20).padEnd(20)} | ${r.winRatesByTurnOrder.first_player.padStart(8)} | ${r.winRatesByTurnOrder.second_player.padStart(8)} | ${r.winRatesByTurnOrder.third_player.padStart(8)} | ${r.balanceMetrics.winRateSpread.toFixed(1).padStart(5)}% | ${r.balanceMetrics.moveCountSpread.padStart(5)} |`);
}
