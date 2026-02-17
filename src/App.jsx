import { useState, useRef, useEffect } from 'react';
import Board from './components/Board';
import GameControls from './components/GameControls';
import GameInfo from './components/GameInfo';
import Roulette from './components/Roulette';
import Ranking from './components/Ranking';
import Tutorial from './components/Tutorial';
import SettingsModal from './components/SettingsModal';
import StatsDashboard from './components/StatsDashboard';
import { useGameLogic } from './hooks/useGameLogic';
import { useTutorial } from './hooks/useTutorial';

function App() {
    // 設定値の永続化 (localStorage)
    const [difficulty, setDifficulty] = useState(() => localStorage.getItem('jatsuna_difficulty') || 'medium');
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('jatsuna_sound') !== 'false');
    const [barrierFreeMode, setBarrierFreeMode] = useState(() => localStorage.getItem('jatsuna_barrier_free') === 'true');
    const [animationSpeed, setAnimationSpeed] = useState(() => localStorage.getItem('jatsuna_anim_speed') || 'normal');

    const [showRoulette, setShowRoulette] = useState(false);
    const [playerTurnPosition, setPlayerTurnPosition] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    // モーダル管理
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    // 初期値を新形式 (all キー) に固定
    const [stats, setStats] = useState({ all: { totalGames: 0, ranks: { 1: 0, 2: 0, 3: 0 }, bestScore: 0 } });

    // 設定変更時の保存
    useEffect(() => {
        localStorage.setItem('jatsuna_difficulty', difficulty);
        localStorage.setItem('jatsuna_sound', soundEnabled);
        localStorage.setItem('jatsuna_barrier_free', barrierFreeMode);
        localStorage.setItem('jatsuna_anim_speed', animationSpeed);
    }, [difficulty, soundEnabled, barrierFreeMode, animationSpeed]);

    // 戦績データの読み込み・正規化・マイグレーション (v7.1.5)
    useEffect(() => {
        if (!isStatsOpen && !gameStarted) return; // 必要ない時は走らせない

        const defaultStats = { all: { totalGames: 0, ranks: { 1: 0, 2: 0, 3: 0 }, bestScore: 0 } };
        try {
            const saved = localStorage.getItem('jatsuna_stats');
            if (!saved) {
                setStats(defaultStats);
            } else {
                const parsed = JSON.parse(saved);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    setStats(defaultStats);
                } else if (parsed.totalGames !== undefined && parsed.all === undefined) {
                    setStats({
                        all: {
                            totalGames: parsed.totalGames || 0,
                            ranks: parsed.ranks || { 1: 0, 2: 0, 3: 0 },
                            bestScore: parsed.bestScore || 0
                        },
                        ...parsed
                    });
                } else {
                    if (!parsed.all) parsed.all = defaultStats.all;
                    setStats(parsed);
                }
            }
        } catch (e) {
            console.error('Stats fetch error:', e);
            setStats(defaultStats);
        }
    }, [isStatsOpen, gameStarted]);

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
        setShowRoulette(true);
    };

    const handleRouletteComplete = (result) => {
        setPlayerTurnPosition(result);
        setShowRoulette(false);
        resetGame();
    };

    const replay = () => {
        initAudioContext();
        setShowRoulette(true);
    };

    const backToMenu = () => {
        setGameStarted(false);
    };

    const resetStats = () => {
        if (window.confirm('これまでの戦績をリセットしてもよろしいですか？')) {
            localStorage.removeItem('jatsuna_stats');
            setStats({ all: { totalGames: 0, ranks: { 1: 0, 2: 0, 3: 0 }, bestScore: 0 } });
        }
    };

    return (
        <div className="h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-4xl w-full max-h-full overflow-y-auto custom-scrollbar animate-fade-in-up">
                <div className="text-center mb-6">
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                        蛇突奈 <span className="text-2xl md:text-3xl text-slate-500 font-inter font-light tracking-normal">JATSUNA</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="h-px w-8 bg-slate-700"></span>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] font-inter">Premium Strategy Board Game</p>
                        <span className="h-px w-8 bg-slate-700"></span>
                    </div>
                </div>

                {showRoulette && <Roulette onComplete={handleRouletteComplete} playOrchestraSound={playOrchestraSound} />}

                {!gameStarted ? (
                    <div className="space-y-4">
                        <GameControls
                            difficulty={difficulty}
                            setDifficulty={setDifficulty}
                            onStartGame={startGame}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            onOpenStats={() => setIsStatsOpen(true)}
                            onOpenTutorial={startTutorial}
                            initAudioContext={initAudioContext}
                        />

                        <div className="text-center">
                            <p className="text-slate-600 text-[9px]">
                                © 2025-2026 OHYAMA, Yoshihisa (o3x) | v7.1.5
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <GameInfo
                            difficulty={difficulty}
                            turnCount={turnCount}
                            scores={scores}
                            currentPlayer={currentPlayer}
                            playerTurnPosition={playerTurnPosition}
                            aiThinking={aiThinking}
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
                            animationSpeed={animationSpeed}
                            isPlayerTurn={currentPlayer === playerTurnPosition && !aiThinking && gameStarted && !gameOver}
                        />

                        {gameOver && finalRanking && (
                            <div ref={rankingRef} className="mt-8">
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

                {/* モーダル群 */}
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    settings={{ soundEnabled, barrierFreeMode, animationSpeed }}
                    updateSettings={(key, val) => {
                        if (key === 'soundEnabled') setSoundEnabled(val);
                        if (key === 'barrierFreeMode') setBarrierFreeMode(val);
                        if (key === 'animationSpeed') setAnimationSpeed(val);
                    }}
                    onResetStats={resetStats}
                    initAudioContext={initAudioContext}
                />

                <StatsDashboard
                    isOpen={isStatsOpen}
                    onClose={() => setIsStatsOpen(false)}
                    stats={stats}
                />

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
