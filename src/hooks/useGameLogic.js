import { useState, useEffect, useCallback } from 'react';
import { PLAYERS } from '../utils/constants';
import { createInitialBoard, getValidMoves, makeMoveSimulation, calculateScores } from '../utils/gameRules';
import { useAI } from './useAI';
import { useAudio } from './useAudio';

export const useGameLogic = (difficulty, soundEnabled, playerTurnPosition, gameStarted, setGameStarted) => {
    const [board, setBoard] = useState(createInitialBoard);
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
        const newBoard = makeMoveSimulation(board, row, col, color, captures);
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

    // AI Turn Effect
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const color = PLAYERS[currentPlayer];
        const moves = getValidMoves(board, color);
        setValidMoves(moves);
        setScores(calculateScores(board));

        if (moves.length === 0) {
            const newPasses = consecutivePasses + 1;
            setConsecutivePasses(newPasses);
            if (newPasses >= 3) {
                setGameOver(true);
                const ranking = calculateRanking();
                setFinalRanking(ranking);
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
        setBoard(createInitialBoard());
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
        initAudioContext
    };
};
