const GameControls = ({
    difficulty, setDifficulty,
    onStartGame, onOpenSettings, onOpenStats, onOpenTutorial,
    initAudioContext
}) => {
    return (
        <div className="premium-card p-6 mb-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-blue-500 rounded-full"></span> AI Difficulty
                    </label>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { id: 'easy', label: 'EASY', color: 'from-blue-500 to-blue-700' },
                        { id: 'medium', label: 'MED', color: 'from-emerald-500 to-emerald-700' },
                        { id: 'hard', label: 'HARD', color: 'from-amber-500 to-amber-700' },
                        { id: 'superhard', label: 'SPHR', color: 'from-rose-500 to-fuchsia-700' },
                        { id: 'collusion', label: 'ULTI', color: 'from-slate-900 to-red-900' }
                    ].map(({ id, label, color }) => (
                        <button
                            key={id}
                            onClick={() => { initAudioContext(); setDifficulty(id); }}
                            className={`py-2 rounded-lg font-black font-inter text-[10px] transition-all border ${difficulty === id ?
                                `bg-gradient-to-br ${color} text-white border-white/20 shadow-lg scale-105 active:scale-95` :
                                'bg-slate-800 text-gray-500 border-slate-700 hover:bg-slate-750 hover:text-gray-400'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                    onClick={() => { initAudioContext(); onOpenStats(); }}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📊</span>
                    <span className="text-[9px] font-bold text-gray-400">戦績統計</span>
                </button>
                <button
                    onClick={() => { initAudioContext(); onOpenSettings(); }}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-hover:rotate-45 transition-transform duration-500">⚙️</span>
                    <span className="text-[9px] font-bold text-gray-400">詳細設定</span>
                </button>
                <button
                    onClick={() => { initAudioContext(); onOpenTutorial(); }}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-all group"
                >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📖</span>
                    <span className="text-[9px] font-bold text-gray-400">遊び方</span>
                </button>
            </div>

            <button
                onClick={onStartGame}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-black rounded-2xl hover:from-emerald-400 hover:to-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transform active:scale-95 transition-all mb-4 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                🎮 GAME START
            </button>

            <div className="flex justify-center gap-6 pt-4 border-t border-slate-800/50">
                <a href="https://github.com/o3x/jatsuna/blob/main/docs/RULEBOOK.md" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">RULEBOOK</a>
                <a href="https://github.com/o3x/jatsuna/blob/main/docs/STRATEGY.md" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">STRATEGIES</a>
            </div>
        </div>
    );
};

export default GameControls;
