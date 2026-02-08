// 蛇突奈 (Jatsuna) React Version
// Last Updated: 2026-02-08

import { useState, useRef, useEffect } from 'react';
import Board from './components/Board';
// Cell import removed associated with unused variable lint warning
import GameControls from './components/GameControls';
import GameInfo from './components/GameInfo';
import Roulette from './components/Roulette';
import Ranking from './components/Ranking';
import Tutorial from './components/Tutorial';
import { useGameLogic } from './hooks/useGameLogic';
import { useTutorial } from './hooks/useTutorial';

function App() {
    const [difficulty, setDifficulty] = useState('medium');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showIcons, setShowIcons] = useState(false);
    const [turnOrderMode, setTurnOrderMode] = useState('random');
    const [showRoulette, setShowRoulette] = useState(false);
    const [playerTurnPosition, setPlayerTurnPosition] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const {
        board, scores, gameOver, currentPlayer, validMoves, lastMove, animatingCells,
        aiThinking, turnCount, finalRanking, handleCellClick, resetGame, initAudioContext, playOrchestraSound
    } = useGameLogic(difficulty, soundEnabled, playerTurnPosition, gameStarted, setGameStarted);

    const { isActive: tutorialActive, completeTutorial, skipTutorial, startTutorial } = useTutorial();

    const rankingRef = useRef(null);

    useEffect(() => {
        if (gameOver && finalRanking && rankingRef.current) {
            setTimeout(() => {
                rankingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [gameOver, finalRanking]);

    const startGame = () => {
        initAudioContext();

        if (turnOrderMode === 'random') {
            setShowRoulette(true);
        } else {
            const pos = turnOrderMode === 'first' ? 0 : turnOrderMode === 'second' ? 1 : 2;
            setPlayerTurnPosition(pos);
            resetGame();
        }
    };

    const handleRouletteComplete = (result) => {
        setPlayerTurnPosition(result);
        setShowRoulette(false);
        resetGame();
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-4xl w-full max-h-full overflow-y-auto custom-scrollbar">
                <div className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        蛇突奈 <span className="text-2xl md:text-3xl text-gray-400">(Jatsuna)</span>
                    </h1>
                    <p className="text-gray-400 text-xs">Version 6.3.4</p>
                    <p className="text-gray-500 text-xs mt-1">
                        © 2025 OHYAMA, Yoshihisa (o3x) | Developed with Claude.ai, Gemini & Antigravity

                    </p>
                </div>

                {showRoulette && <Roulette onComplete={handleRouletteComplete} playOrchestraSound={playOrchestraSound} />}

                {!gameStarted ? (
                    <GameControls
                        difficulty={difficulty}
                        setDifficulty={setDifficulty}
                        soundEnabled={soundEnabled}
                        setSoundEnabled={setSoundEnabled}
                        showIcons={showIcons}
                        setShowIcons={setShowIcons}
                        turnOrderMode={turnOrderMode}
                        setTurnOrderMode={setTurnOrderMode}
                        onStartGame={startGame}
                        initAudioContext={initAudioContext}
                        onShowTutorial={startTutorial}
                    />
                ) : (
                    <>
                        <GameInfo
                            difficulty={difficulty}
                            turnCount={turnCount}
                            scores={scores}
                            currentPlayer={currentPlayer}
                            playerTurnPosition={playerTurnPosition}
                            onReset={() => setGameStarted(false)}
                            playOrchestraSound={playOrchestraSound}
                        />

                        <Board
                            board={board}
                            validMoves={validMoves}
                            lastMove={lastMove}
                            animatingCells={animatingCells}
                            onCellClick={handleCellClick}
                            gameOver={gameOver}
                            showIcons={showIcons}
                            isPlayerTurn={currentPlayer === playerTurnPosition && !aiThinking && gameStarted && !gameOver}
                        />

                        {gameOver && finalRanking && (
                            <div ref={rankingRef}>
                                <Ranking
                                    ranking={finalRanking}
                                    playerTurnPosition={playerTurnPosition}
                                    onReset={() => setGameStarted(false)}
                                />
                            </div>
                        )}
                    </>
                )}

                <Tutorial
                    isActive={tutorialActive}
                    onComplete={completeTutorial}
                    onSkip={skipTutorial}
                />
            </div>
        </div>
    );
}

export default App;
