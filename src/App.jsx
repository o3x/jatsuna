import React, { useState, useRef, useEffect } from 'react';
import Board from './components/Board';
import Cell from './components/Cell';
import GameControls from './components/GameControls';
import GameInfo from './components/GameInfo';
import Roulette from './components/Roulette';
import Ranking from './components/Ranking';
import { useGameLogic } from './hooks/useGameLogic';

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
        aiThinking, turnCount, finalRanking, handleCellClick, resetGame, initAudioContext
    } = useGameLogic(difficulty, soundEnabled, playerTurnPosition, gameStarted, setGameStarted);

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
                    <p className="text-gray-400 text-xs">Version 6.0 React Refactor</p>
                </div>

                {showRoulette && <Roulette onComplete={handleRouletteComplete} />}

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
                    />
                ) : (
                    <>
                        <GameInfo
                            difficulty={difficulty}
                            turnCount={turnCount}
                            scores={scores}
                            currentPlayer={currentPlayer}
                            playerTurnPosition={playerTurnPosition}
                            aiThinking={aiThinking}
                            thinkingDots={aiThinking ? "..." : ""}
                            showIcons={showIcons}
                            onReset={() => setGameStarted(false)}
                        />

                        <div className={`text-center py-2 rounded-lg mb-3 bg-slate-700 transition-opacity duration-200 ${aiThinking ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="text-lg font-bold text-yellow-400 thinking-animation">
                                {aiThinking ? "🤔 思考中..." : "\u00A0"}
                            </div>
                        </div>

                        <Board
                            board={board}
                            validMoves={validMoves}
                            lastMove={lastMove}
                            animatingCells={animatingCells}
                            showIcons={showIcons}
                            onCellClick={handleCellClick}
                        />

                        {gameOver && finalRanking && (
                            <div ref={rankingRef}>
                                <Ranking
                                    ranking={finalRanking}
                                    onReset={() => setGameStarted(false)}
                                    playOrchestraSound={playOrchestraSound}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
