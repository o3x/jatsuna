// aiLogic.js - Jatsuna AI Core (Decoupled version)
// Last Updated: Tue Feb 18 20:12:00 JST 2026
// Version: 6.7.0
import { getValidMoves, makeMoveSimulation, calculateScores } from './gameRules.js';

// 🔥 Ultimate最凶結託モードの評価関数
const evaluateBoardCollusion = (board, aiColor, playerColor, config) => {
    const { players } = config;
    const scores = calculateScores(board);
    const playerScore = scores[playerColor];
    const aiColors = players.filter(p => p !== playerColor);
    const aiTotalScore = aiColors.reduce((sum, c) => sum + scores[c], 0);
    const aiPartnerScore = scores[aiColors.find(c => c !== aiColor)];

    let evaluation = aiTotalScore - (playerScore * 4);
    const playerMoves = getValidMoves(board, playerColor, config);
    evaluation -= playerMoves.length * 8;
    evaluation += aiPartnerScore * 0.7;

    const boardSize = board.length;
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const isCorner = (r === 0 || r === boardSize - 1) && (c === 0 || c === boardSize - 1);
            const isEdge = r === 0 || r === boardSize - 1 || c === 0 || c === boardSize - 1;

            if (board[r][c] === playerColor) {
                if (isCorner) evaluation -= 100;
                else if (isEdge) evaluation -= 50;
                else evaluation -= 5;
            } else if (aiColors.includes(board[r][c])) {
                if (isCorner) evaluation += 80;
                else if (isEdge) evaluation += 40;
            }
        }
    }

    const aiMoves = getValidMoves(board, aiColor, config);
    for (const move of aiMoves) {
        const playerCaptures = move.captures.filter(([, , col]) => col === playerColor).length;
        evaluation += playerCaptures * 15;
    }

    return evaluation;
};

// 🔥 Ultimate最凶結託モードのミニマックス（深度4）
const minimaxCollusion = (board, depth, turnPlayer, aiColor, playerColor, alpha, beta, config) => {
    const { players } = config;
    if (depth === 0) {
        return { score: evaluateBoardCollusion(board, aiColor, playerColor, config) };
    }

    const moves = getValidMoves(board, turnPlayer, config);
    if (moves.length === 0) {
        return { score: evaluateBoardCollusion(board, aiColor, playerColor, config) };
    }

    let bestMove = moves[0];

    if (turnPlayer !== playerColor) {
        let maxEval = -Infinity;
        const sortedMoves = moves.sort((a, b) => {
            const aPlayerCaptures = a.captures.filter(([, , col]) => col === playerColor).length;
            const bPlayerCaptures = b.captures.filter(([, , col]) => col === playerColor).length;
            return bPlayerCaptures - aPlayerCaptures;
        });

        for (const move of sortedMoves.slice(0, 10)) {
            const newBoard = makeMoveSimulation(board, move.row, move.col, turnPlayer, move.captures, config);
            const nextPlayer = players[(players.indexOf(turnPlayer) + 1) % 3];
            const { score } = minimaxCollusion(newBoard, depth - 1, nextPlayer, aiColor, playerColor, alpha, beta, config);

            if (score > maxEval) {
                maxEval = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };

    } else {
        let minEval = Infinity;
        for (const move of moves.slice(0, 10)) {
            const newBoard = makeMoveSimulation(board, move.row, move.col, turnPlayer, move.captures, config);
            const nextPlayer = players[(players.indexOf(turnPlayer) + 1) % 3];
            const { score } = minimaxCollusion(newBoard, depth - 1, nextPlayer, aiColor, playerColor, alpha, beta, config);

            if (score < minEval) {
                minEval = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
};

// 通常モードの評価関数
const evaluateBoard = (board, myColor, config) => {
    let score = 0;
    const boardSize = board.length;
    const scores = calculateScores(board);
    score += scores[myColor] * 2; // 基本スコア

    // 位置の重み付け（7x7ボード用）
    const weights = [
        [120, -20, 20, 5, 20, -20, 120],
        [-20, -40, -5, -5, -5, -40, -20],
        [20, -5, 15, 3, 15, -5, 20],
        [5, -5, 3, 0, 3, -5, 5],
        [20, -5, 15, 3, 15, -5, 20],
        [-20, -40, -5, -5, -5, -40, -20],
        [120, -20, 20, 5, 20, -20, 120],
    ];

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === myColor) {
                score += weights[r][c];
            } else if (board[r][c] !== null && board[r][c] !== 'X') {
                score -= weights[r][c] * 0.5; // 相手に良い場所を取られているとマイナス
            }
        }
    }

    // 着手可能数（機動力）
    const myMoves = getValidMoves(board, myColor, config);
    score += myMoves.length * 5;

    return score;
};

// 通常モードの探索（1手読み + 評価関数）
const getBestMoveWithLookahead = (board, color, config) => {
    const { players } = config;
    const moves = getValidMoves(board, color, config);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
        // 自分の手をシミュレーション
        const simBoard = makeMoveSimulation(board, move.row, move.col, color, move.captures, config);

        // 次のプレイヤー（敵）の最善手を予測して減点する（MinMaxの簡易版）
        const nextPlayer = players[(players.indexOf(color) + 1) % 3];
        const nextMoves = getValidMoves(simBoard, nextPlayer, config);

        let maxEnemyScore = -Infinity;
        if (nextMoves.length > 0) {
            // 敵は自分の評価値を最大化する手を打つと仮定
            for (const enemyMove of nextMoves) {
                const enemySimBoard = makeMoveSimulation(simBoard, enemyMove.row, enemyMove.col, nextPlayer, enemyMove.captures, config);
                const enemyScore = evaluateBoard(enemySimBoard, nextPlayer, config);
                if (enemyScore > maxEnemyScore) {
                    maxEnemyScore = enemyScore;
                }
            }
        } else {
            maxEnemyScore = 0; // 敵が打てないならラッキー
        }

        // 自分の盤面評価 - 敵の最大獲得評価
        const currentScore = evaluateBoard(simBoard, color, config) - (maxEnemyScore * 0.5);

        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMove = move;
        }
    }
    return bestMove;
};

export const getAIMoveLogic = (currentBoard, color, difficulty, playerTurnPosition, config) => {
    const { players } = config;
    const moves = getValidMoves(currentBoard, color, config);
    if (moves.length === 0) return null;

    // Easy: 完全ランダム
    if (difficulty === 'easy') return moves[Math.floor(Math.random() * moves.length)];

    // Collusion: 最凶結託モード
    if (difficulty === 'collusion') {
        const playerColor = players[playerTurnPosition];
        const depth = 4;
        const { move } = minimaxCollusion(currentBoard, depth, color, color, playerColor, -Infinity, Infinity, config);
        return move;
    }

    // SuperHard: 1手読み + 高度な評価関数
    if (difficulty === 'superhard') {
        return getBestMoveWithLookahead(currentBoard, color, config);
    }

    // Hard: 位置評価重視
    if (difficulty === 'hard') {
        let bestScore = -Infinity;
        let bestMove = moves[0];
        for (const move of moves) {
            const simBoard = makeMoveSimulation(currentBoard, move.row, move.col, color, move.captures, config);
            const score = evaluateBoard(simBoard, color, config);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    // Medium: 獲得数重視（貪欲法）
    let bestMove = moves[0], bestScore = -1;
    const boardSize = currentBoard.length;
    for (const move of moves) {
        let score = move.captures.length;
        // 角だけは優先する
        const isCorner = (move.row === 0 || move.row === boardSize - 1) && (move.col === 0 || move.col === boardSize - 1);
        if (isCorner) score += 5;

        // ランダム性でゆらぎを加える
        score += Math.random() * 1.0;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};
