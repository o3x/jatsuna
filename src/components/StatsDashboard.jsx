import { useMemo } from 'react';

const StatsDashboard = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    // 統計計算
    const calculatedStats = useMemo(() => {
        const total = stats.totalGames || 0;
        if (total === 0) return { avgRank: '-', topRate: 0, winDistribution: [0, 0, 0] };

        const first = stats.ranks[1] || 0;
        const second = stats.ranks[2] || 0;
        const third = stats.ranks[3] || 0;

        const avgRank = ((first * 1 + second * 2 + third * 3) / total).toFixed(2);
        const topRate = ((first / total) * 100).toFixed(1);

        return {
            avgRank,
            topRate,
            winDistribution: [first, second, third],
            total
        };
    }, [stats]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="premium-card w-full max-w-md p-6 relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl font-inter" />

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="text-3xl">📊</span> プレイヤー戦績
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {calculatedStats.total > 0 ? (
                    <div className="space-y-8">
                        {/* メイン KPI */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">平均順位</div>
                                <div className="text-3xl font-black font-inter text-blue-400">{calculatedStats.avgRank}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                                <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">トップ(1位)率</div>
                                <div className="text-3xl font-black font-inter text-emerald-400">{calculatedStats.topRate}%</div>
                            </div>
                        </div>

                        {/* 順位分布グラフ (簡易) */}
                        <div>
                            <div className="text-gray-400 text-xs font-bold mb-4 flex justify-between">
                                <span>順位分布</span>
                                <span>Total: {calculatedStats.total} Games</span>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((rank, i) => {
                                    const count = calculatedStats.winDistribution[i];
                                    const percentage = ((count / calculatedStats.total) * 100).toFixed(0);
                                    const colors = [
                                        'from-yellow-400 to-yellow-600',
                                        'from-slate-300 to-slate-500',
                                        'from-orange-500 to-orange-700'
                                    ];

                                    return (
                                        <div key={rank} className="relative">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1 px-1">
                                                <span>{rank === 1 ? '🥇 1位 (Win)' : rank === 2 ? '🥈 2位' : '🥉 3位'}</span>
                                                <span className="font-inter">{count}回 ({percentage}%)</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colors[i]} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 自己ベスト等 */}
                        <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-gray-500">
                            <div>最高獲得石数: <span className="text-white font-bold">{stats.bestScore || 0}</span></div>
                            <div className="font-inter">Current Version: v6.8.0</div>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="text-5xl mb-4 grayscale opacity-30">🕸️</div>
                        <p className="text-gray-400 text-sm">まだ戦績データがありません。<br />ゲームをプレイして記録を刻みましょう！</p>
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-900 font-black rounded-xl hover:bg-white transition-all shadow-xl"
                    >
                        ダッシュボードを閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
