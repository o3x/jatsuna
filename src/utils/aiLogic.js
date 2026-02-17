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

// 通常モードの探索（Minimax 深度指定版）
const getMinimaxMove = (board, depth, color, config) => {
    const { players } = config;

    // 相手プレイヤーの特定（3プレイヤー制なので簡易的に「次の人」と「その次の人」を考慮）
    const getNextPlayer = (p) => players[(players.indexOf(p) + 1) % 3];

    const minimax = (currentBoard, d, currentPlayer, alpha, beta) => {
        if (d === 0) return evaluateBoard(currentBoard, color, config);

        const moves = getValidMoves(currentBoard, currentPlayer, config);
        if (moves.length === 0) {
            // パスの場合、次のプレイヤーへ
            return minimax(currentBoard, d - 1, getNextPlayer(currentPlayer), alpha, beta);
        }

        if (currentPlayer === color) {
            let maxEval = -Infinity;
            for (const move of moves.slice(0, 8)) { // 探索幅制限
                const newBoard = makeMoveSimulation(currentBoard, move.row, move.col, currentPlayer, move.captures, config);
                const evaluation = minimax(newBoard, d - 1, getNextPlayer(currentPlayer), alpha, beta);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves.slice(0, 8)) {
                const newBoard = makeMoveSimulation(currentBoard, move.row, move.col, currentPlayer, move.captures, config);
                const evaluation = minimax(newBoard, d - 1, getNextPlayer(currentPlayer), alpha, beta);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    };

    const moves = getValidMoves(board, color, config);
    if (moves.length === 0) return null;

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
        const newBoard = makeMoveSimulation(board, move.row, move.col, color, move.captures, config);
        const score = minimax(newBoard, depth - 1, getNextPlayer(color), -Infinity, Infinity);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};

export const getAIMoveLogic = (currentBoard, color, difficulty, playerTurnPosition, config) => {
    const { players } = config;
    const moves = getValidMoves(currentBoard, color, config);
    if (moves.length === 0) return null;

    // Easy: 接待モード（わざと弱い手を選ぶ）
    if (difficulty === 'easy') {
        // 獲得数が最小で、かつ角を避ける手を探す
        const sortedMoves = moves.sort((a, b) => {
            const isACorner = (a.row === 0 || a.row === 6) && (a.col === 0 || a.col === 6);
            const isBCorner = (b.row === 0 || b.row === 6) && (b.col === 0 || b.col === 6);
            if (isACorner && !isBCorner) return 1;
            if (!isACorner && isBCorner) return -1;
            return a.captures.length - b.captures.length;
        });
        // 80%の確率で最弱の手、20%でランダム（人間味）
        return Math.random() < 0.8 ? sortedMoves[0] : moves[Math.floor(Math.random() * moves.length)];
    }

    // Medium: 獲得数重視（現行のスタンダード）
    if (difficulty === 'medium') {
        let bestMove = moves[0], bestScore = -1;
        for (const move of moves) {
            let score = move.captures.length;
            const isCorner = (move.row === 0 || move.row === 6) && (move.col === 0 || move.col === 6);
            if (isCorner) score += 10;
            score += Math.random() * 0.5;
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    // Hard: 1手読み Minimax + 位置評価
    if (difficulty === 'hard') {
        return getMinimaxMove(currentBoard, 2, color, config);
    }

    // SuperHard: 深度のある Minimax 探索
    if (difficulty === 'superhard') {
        return getMinimaxMove(currentBoard, 3, color, config);
    }

    // Collusion: 最凶結託モード（深度4）
    if (difficulty === 'collusion') {
        const playerColor = players[playerTurnPosition];
        const depth = 4;
        const { move } = minimaxCollusion(currentBoard, depth, color, color, playerColor, -Infinity, Infinity, config);
        return move;
    }

    return moves[Math.floor(Math.random() * moves.length)];
};
