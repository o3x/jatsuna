// 蛇突奈 (Jatsuna) React Version
// Last Updated: Mon Feb 17 19:33:00 JST 2026
// Version: 6.6.0

import { useState, useRef, useEffect } from 'react';
import Board from './components/Board';
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
    const [barrierFreeMode, setBarrierFreeMode] = useState(() => {
        return localStorage.getItem('jatsuna_barrier_free') === 'true';
    });
    const [showRoulette, setShowRoulette] = useState(false);
    const [playerTurnPosition, setPlayerTurnPosition] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        localStorage.setItem('jatsuna_barrier_free', barrierFreeMode);
    }, [barrierFreeMode]);

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
        // 常にランダム（ルーレット）で手番を決定
        setShowRoulette(true);
    };

    const handleRouletteComplete = (result) => {
        setPlayerTurnPosition(result);
        setShowRoulette(false);
        resetGame();
    };

    // 同じ設定で再プレイ（ルーレットから）
    const replay = () => {
        initAudioContext();
        setShowRoulette(true);
    };

    // メニュー画面に戻る
    const backToMenu = () => {
        setGameStarted(false);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-4xl w-full max-h-full overflow-y-auto custom-scrollbar">
                <div className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        蛇突奈 <span className="text-2xl md:text-3xl text-gray-400">(Jatsuna)</span>
                    </h1>
                    <p className="text-gray-400 text-xs">Version 6.6.0</p>
                    <p className="text-gray-500 text-xs mt-1">
                        © 2025-2026 OHYAMA, Yoshihisa (o3x) | Developed with Claude.ai, Gemini & Antigravity
                    </p>
                </div>

                {showRoulette && <Roulette onComplete={handleRouletteComplete} playOrchestraSound={playOrchestraSound} />}

                {!gameStarted ? (
                    <>
                        <GameControls
                            difficulty={difficulty}
                            setDifficulty={setDifficulty}
                            barrierFreeMode={barrierFreeMode}
                            setBarrierFreeMode={setBarrierFreeMode}
                            onStartGame={startGame}
                            initAudioContext={initAudioContext}
                        />

                        {/* 下部アイコンボタン */}
                        <div className="flex justify-center gap-4 mt-2">
                            <button
                                onClick={() => { initAudioContext(); setSoundEnabled(!soundEnabled); }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg ${soundEnabled
                                    ? 'bg-slate-600 text-white hover:bg-slate-500'
                                    : 'bg-slate-700 text-gray-500 hover:bg-slate-600'
                                    }`}
                                title={soundEnabled ? 'サウンド ON' : 'サウンド OFF'}
                            >
                                {soundEnabled ? '🔊' : '🔇'}
                            </button>
                            <button
                                onClick={startTutorial}
                                className="w-12 h-12 rounded-full bg-slate-600 text-white flex items-center justify-center text-xl hover:bg-slate-500 transition-all shadow-lg"
                                title="チュートリアル"
                            >
                                ❓
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <GameInfo
                            difficulty={difficulty}
                            turnCount={turnCount}
                            scores={scores}
                            currentPlayer={currentPlayer}
                            playerTurnPosition={playerTurnPosition}
                            gameOver={gameOver}
                            onReset={backToMenu}
                            playOrchestraSound={playOrchestraSound}
                        />

                        <Board
                            board={board}
                            validMoves={validMoves}
                            lastMove={lastMove}
                            animatingCells={animatingCells}
                            onCellClick={handleCellClick}
                            gameOver={gameOver}
                            showIcons={barrierFreeMode}
                            barrierFreeMode={barrierFreeMode}
                            isPlayerTurn={currentPlayer === playerTurnPosition && !aiThinking && gameStarted && !gameOver}
                        />

                        {gameOver && finalRanking && (
                            <div ref={rankingRef}>
                                <Ranking
                                    ranking={finalRanking}
                                    playOrchestraSound={playOrchestraSound}
                                    onReplay={replay}
                                    onBackToMenu={backToMenu}
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
