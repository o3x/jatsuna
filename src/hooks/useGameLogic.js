import { useState, useEffect, useCallback } from 'react';
import { PLAYERS, JATSUNA_CONFIG } from '../utils/constants';
import { createInitialBoard, getValidMoves, makeMoveSimulation, calculateScores } from '../utils/gameRules';
import { useAI } from './useAI';
import { useAudio } from './useAudio';

export const useGameLogic = (difficulty, soundEnabled, playerTurnPosition, gameStarted, setGameStarted) => {
    const [board, setBoard] = useState(() => createInitialBoard(JATSUNA_CONFIG));
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [scores, setScores] = useState({ O: 1, C: 1, P: 1 });
    const [gameOver, setGameOver] = useState(false);
    const [consecutivePasses, setConsecutivePasses] = useState(0);
    const [validMoves, setValidMoves] = useState([]);
    const [lastMove, setLastMove] = useState(null);
    const [animatingCells, setAnimatingCells] = useState(new Set());
    const [aiThinking, setAiThinking] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const [finalRanking, setFinalRanking] = useState(null);

    const { initAudioContext, playOrchestraSound } = useAudio(soundEnabled);
    const { getAIMove } = useAI(difficulty, playerTurnPosition);

    const makeMove = useCallback((board, row, col, color, captures) => {
        const newBoard = makeMoveSimulation(board, row, col, color, captures, JATSUNA_CONFIG);
        const cellsToAnimate = new Set([`${row}-${col}`]);
        for (const [r, c] of captures) {
            cellsToAnimate.add(`${r}-${c}`);
        }
        setAnimatingCells(cellsToAnimate);
        setTimeout(() => setAnimatingCells(new Set()), 600);
        return newBoard;
    }, []);

    const calculateRanking = useCallback(() => {
        const finalScores = calculateScores(board);
        const playerColor = PLAYERS[playerTurnPosition];
        const ranking = [
            { color: 'O', name: 'オーブ', shape: '●', score: finalScores.O, isPlayer: playerColor === 'O' },
            { color: 'C', name: 'ジェム', shape: '◆', score: finalScores.C, isPlayer: playerColor === 'C' },
            { color: 'P', name: 'ステラ', shape: '★', score: finalScores.P, isPlayer: playerColor === 'P' }
        ].sort((a, b) => b.score - a.score);

        ranking[0].rank = 1;
        for (let i = 1; i < ranking.length; i++) {
            ranking[i].rank = ranking[i].score < ranking[i - 1].score ? i + 1 : ranking[i - 1].rank;
        }
        return ranking;
    }, [board, playerTurnPosition]);

    const handleCellClick = useCallback((row, col) => {
        if (gameOver || !gameStarted || aiThinking || currentPlayer !== playerTurnPosition) return;

        initAudioContext();

        const color = PLAYERS[currentPlayer];
        const move = validMoves.find(m => m.row === row && m.col === col);
        if (!move) return;

        const newBoard = makeMove(board, row, col, color, move.captures);
        setBoard(newBoard);
        setLastMove({ row, col });
        setConsecutivePasses(0);
        setTurnCount(prev => prev + 1);

        playOrchestraSound('place', move.captures.length);

        setCurrentPlayer((currentPlayer + 1) % 3);
    }, [gameOver, gameStarted, aiThinking, currentPlayer, playerTurnPosition, validMoves, board, makeMove, initAudioContext, playOrchestraSound]);

    // AIの手番エフェクト
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const color = PLAYERS[currentPlayer];
        const moves = getValidMoves(board, color, JATSUNA_CONFIG);
        setValidMoves(moves);
        setScores(calculateScores(board));

        if (moves.length === 0) {
            const newPasses = consecutivePasses + 1;
            setConsecutivePasses(newPasses);
            if (newPasses >= 3) {
                setGameOver(true);
                const ranking = calculateRanking();
                setFinalRanking(ranking);

                // 戦績記録 (難易度別 + 全体)
                const playerResult = ranking.find(r => r.isPlayer);
                if (playerResult) {
                    const statsKey = 'jatsuna_stats';
                    const saved = localStorage.getItem(statsKey);
                    let currentStats = {};

                    try {
                        const parsed = JSON.parse(saved) || {};
                        // 古い形式（難易度別の階層がない）を検知して移行
                        if (parsed.totalGames !== undefined && parsed.all === undefined) {
                            currentStats = { all: parsed };
                        } else {
                            currentStats = parsed;
                        }
                    } catch (e) {
                        currentStats = {};
                    }

                    const updateModeStats = (mode) => {
                        if (!currentStats[mode]) {
                            currentStats[mode] = { totalGames: 0, ranks: { 1: 0, 2: 0, 3: 0 }, bestScore: 0 };
                        }
                        const s = currentStats[mode];
                        s.totalGames += 1;
                        s.ranks[playerResult.rank] = (s.ranks[playerResult.rank] || 0) + 1;
                        s.bestScore = Math.max(s.bestScore || 0, playerResult.score);
                    };

                    // 特定難易度と全体の2か所を更新
                    updateModeStats(difficulty);
                    updateModeStats('all');

                    localStorage.setItem(statsKey, JSON.stringify(currentStats));
                }
                return;
            }
            setTimeout(() => setCurrentPlayer((currentPlayer + 1) % 3), 500);
            return;
        } else {
            setConsecutivePasses(0);
        }

        if (currentPlayer !== playerTurnPosition) {
            setAiThinking(true);
            const thinkingTime = difficulty === 'collusion' ? 1500 : 800 + Math.random() * 400;

            setTimeout(() => {
                const aiMove = getAIMove(board, color);
                if (aiMove) {
                    const newBoard = makeMove(board, aiMove.row, aiMove.col, color, aiMove.captures);
                    setBoard(newBoard);
                    setLastMove({ row: aiMove.row, col: aiMove.col });
                    setTurnCount(prev => prev + 1);

                    playOrchestraSound('place', aiMove.captures.length);

                    setAiThinking(false);
                    setCurrentPlayer((currentPlayer + 1) % 3);
                }
            }, thinkingTime);
        }
    }, [currentPlayer, gameStarted, gameOver, board, consecutivePasses, difficulty, playerTurnPosition, getAIMove, makeMove, playOrchestraSound, calculateRanking]);

    const resetGame = useCallback(() => {
        setGameOver(false);
        setGameStarted(false);
        setAiThinking(false);
        setConsecutivePasses(0);
        setTurnCount(0);
        setFinalRanking(null);
        setLastMove(null);
        setBoard(createInitialBoard(JATSUNA_CONFIG));
        setCurrentPlayer(0);
        setScores({ O: 1, C: 1, P: 1 });
        setValidMoves([]);
        setTimeout(() => setGameStarted(true), 100);
    }, [setGameStarted]);

    return {
        board,
        scores,
        gameOver,
        currentPlayer,
        validMoves,
        lastMove,
        animatingCells,
        aiThinking,
        turnCount,
        finalRanking,
        handleCellClick,
        resetGame,
        initAudioContext,
        playOrchestraSound
    };
};
