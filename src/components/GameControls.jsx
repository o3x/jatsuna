// 蛇突奈 (Jatsuna) - ゲーム設定コンポーネント
// Last Updated: Tue Feb 18 20:05:00 JST 2026
// Version: 6.7.0

const GameControls = ({
    difficulty, setDifficulty,
    barrierFreeMode, setBarrierFreeMode,
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

            <div className="mb-4 grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between bg-slate-600/50 p-2 rounded-md border border-slate-500/30">
                    <span className="text-gray-300 text-xs font-bold">バリアフリー設定</span>
                    <button
                        onClick={() => setBarrierFreeMode(!barrierFreeMode)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${barrierFreeMode
                            ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                            : 'bg-slate-700 text-gray-400 border-slate-500'
                            } border`}
                    >
                        {barrierFreeMode ? 'ON (高判別)' : 'OFF (標準)'}
                    </button>
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
