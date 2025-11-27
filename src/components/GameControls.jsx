import React from 'react';

const GameControls = ({
    difficulty, setDifficulty,
    soundEnabled, setSoundEnabled,
    showIcons, setShowIcons,
    turnOrderMode, setTurnOrderMode,
    onStartGame, initAudioContext, onShowTutorial
}) => {
    return (
        <div className="bg-slate-700 rounded-lg p-6 mb-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 text-center">ゲーム設定</h2>

            <div className="mb-4">
                <label className="block text-white font-bold mb-2 text-sm">手番選択</label>
                <button
                    onClick={() => { initAudioContext(); setTurnOrderMode('random'); }}
                    className={`w-full p-3 rounded-lg font-bold transition-all mb-2 ${turnOrderMode === 'random' ? 'bg-yellow-600 text-white' : 'bg-slate-600 text-gray-300'
                        }`}
                >
                    🎲 ランダム
                </button>
                <div className="grid grid-cols-3 gap-2">
                    {['first', 'second', 'third'].map((mode, idx) => (
                        <button
                            key={mode}
                            onClick={() => { initAudioContext(); setTurnOrderMode(mode); }}
                            className={`p-2 rounded-lg font-bold text-sm transition-all ${turnOrderMode === mode ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-300'
                                }`}
                        >
                            {idx + 1}番手
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-white font-bold mb-2 text-sm">AI難易度</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'easy', label: 'Easy', colorClass: 'bg-blue-500 hover:bg-blue-400' },
                        { id: 'medium', label: 'Medium', colorClass: 'bg-emerald-500 hover:bg-emerald-400' },
                        { id: 'hard', label: 'Hard', colorClass: 'bg-red-500 hover:bg-red-400' },
                        { id: 'superhard', label: 'Super', colorClass: 'bg-fuchsia-600 hover:bg-fuchsia-500' },
                        { id: 'collusion', label: 'Ultimate最凶', colorClass: 'bg-gradient-to-br from-black to-red-700 border border-red-500' }
                    ].map(({ id, label, colorClass }) => (
                        <button
                            key={id}
                            onClick={() => { initAudioContext(); setDifficulty(id); }}
                            className={`p-3 rounded-lg font-bold transition-all ${difficulty === id ?
                                `${colorClass} text-white shadow-lg scale-105` :
                                'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                }`}
                        >
                            {label}
                            {id === 'collusion' && <div className="text-xs text-red-200">結託モード</div>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => { initAudioContext(); setSoundEnabled(!soundEnabled); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-400'
                        }`}
                >
                    {soundEnabled ? '🔊 ON' : '🔇 OFF'}
                </button>
                <button
                    onClick={() => setShowIcons(!showIcons)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm ${showIcons ? 'bg-blue-600 text-white' : 'bg-slate-600 text-gray-400'
                        }`}
                >
                    {showIcons ? '●◆★' : '形状'}
                </button>
            </div>

            <button
                onClick={onShowTutorial}
                className="w-full py-2 bg-slate-600 text-white text-sm font-bold rounded-lg mb-2 hover:bg-slate-500 transition-all"
            >
                📚 チュートリアル
            </button>

            <button
                onClick={onStartGame}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg hover:from-green-500 hover:to-green-600 shadow-lg transform active:scale-95 transition-all"
            >
                🎮 ゲーム開始
            </button>
        </div>
    );
};

export default GameControls;
