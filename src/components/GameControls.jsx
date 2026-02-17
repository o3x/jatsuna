// 蛇突奈 (Jatsuna) - ゲーム設定コンポーネント
// Last Updated: Mon Feb 17 18:45:00 JST 2026
// Version: 6.5.0

const GameControls = ({
    difficulty, setDifficulty,
    onStartGame, initAudioContext
}) => {
    return (
        <div className="bg-slate-700 rounded-lg p-4 mb-4 shadow-2xl">
            <div className="mb-3">
                <label className="block text-gray-400 font-bold mb-2 text-xs">AI難易度</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {[
                        { id: 'easy', label: 'Easy', colorClass: 'bg-blue-500 hover:bg-blue-400' },
                        { id: 'medium', label: 'Medium', colorClass: 'bg-emerald-500 hover:bg-emerald-400' },
                        { id: 'hard', label: 'Hard', colorClass: 'bg-red-500 hover:bg-red-400' },
                        { id: 'superhard', label: 'Super', colorClass: 'bg-fuchsia-600 hover:bg-fuchsia-500' },
                        { id: 'collusion', label: 'Ultimate', colorClass: 'bg-gradient-to-br from-black to-red-700 border border-red-500' }
                    ].map(({ id, label, colorClass }) => (
                        <button
                            key={id}
                            onClick={() => { initAudioContext(); setDifficulty(id); }}
                            className={`py-1.5 px-2 rounded-md font-bold text-xs transition-all ${difficulty === id ?
                                `${colorClass} text-white shadow-md scale-105` :
                                'bg-slate-600 text-gray-300 hover:bg-slate-500'
                                }`}
                        >
                            {label}
                            {id === 'collusion' && <div className="text-[10px] text-red-200">結託モード</div>}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={onStartGame}
                className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-base font-bold rounded-lg hover:from-green-500 hover:to-green-600 shadow-lg transform active:scale-95 transition-all"
            >
                🎮 ゲーム開始
            </button>
        </div>
    );
};

export default GameControls;
