import React from 'react';

const GameControls = ({
    difficulty, setDifficulty,
    soundEnabled, setSoundEnabled,
    showIcons, setShowIcons,
    turnOrderMode, setTurnOrderMode,
    onStartGame, initAudioContext
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
                        { id: 'easy', label: 'Easy', color: 'green' },
                        { id: 'medium', label: 'Medium', color: 'yellow' },
                        { id: 'hard', label: 'Hard', color: 'red' },
                        { id: 'superhard', label: 'Super', color: 'purple' },
                        { id: 'collusion', label: 'Ultimate最凶', color: 'red' }
                    ].map(({ id, label, color }) => (
                        <button
                            key={id}
                            onClick={() => { initAudioContext(); setDifficulty(id); }}
                            className={`p-3 rounded-lg font-bold transition-all ${difficulty === id ?
                                    id === 'collusion' ? 'bg-gradient-to-br from-red-900 to-red-600 text-white evil-glow' :
                                        `bg-${color}-600 text-white` :
                                    'bg-slate-600 text-gray-300'
                                }`}
                        >
                            {label}
                            {id === 'collusion' && <div className="text-xs">結託モード</div>}
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
                onClick={onStartGame}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-lg"
            >
                🎮 ゲーム開始
            </button>
        </div>
    );
};

export default GameControls;
