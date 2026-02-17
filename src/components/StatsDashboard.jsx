import { useMemo, useState, useEffect } from 'react';

const StatsDashboard = ({ isOpen, onClose, stats }) => {
    const [activeTab, setActiveTab] = useState('all');

    if (!isOpen) return null;

    // 現在のタブに応じた統計を抽出
    const currentStats = useMemo(() => {
        // stats が空、または古い形式でネストされていない場合への対処
        if (!stats) return null;

        // 階層化されていない古いデータが渡された場合、それ自体を all 扱いにする
        if (stats.totalGames !== undefined && stats.all === undefined) {
            return activeTab === 'all' ? stats : null;
        }

        return stats[activeTab] || null;
    }, [stats, activeTab]);

    // 統計計算
    const calculatedStats = useMemo(() => {
        if (!currentStats || currentStats.totalGames === 0) {
            return { avgRank: '-', topRate: 0, winDistribution: [0, 0, 0], total: 0 };
        }

        const total = currentStats.totalGames;
        const first = currentStats.ranks[1] || 0;
        const second = currentStats.ranks[2] || 0;
        const third = currentStats.ranks[3] || 0;

        const avgRank = ((first * 1 + second * 2 + third * 3) / total).toFixed(2);
        const topRate = ((first / total) * 100).toFixed(1);

        return {
            avgRank,
            topRate,
            winDistribution: [first, second, third],
            total
        };
    }, [currentStats]);

    const tabs = [
        { id: 'all', label: '全体' },
        { id: 'easy', label: 'Easy' },
        { id: 'medium', label: 'Medium' },
        { id: 'hard', label: 'Hard' },
        { id: 'superhard', label: 'Super' },
        { id: 'collusion', label: '最凶' }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="premium-card w-full max-w-md p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl font-inter" />

                <div className="flex items-center justify-between mb-4">
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

                {/* タブセレクター */}
                <div className="flex gap-1 bg-slate-800/80 p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar border border-slate-700/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap flex-shrink-0
                                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    {calculatedStats.total > 0 ? (
                        <div className="space-y-8 animate-fade-in-up">
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

                            {/* 順位分布グラフ */}
                            <div>
                                <div className="text-gray-400 text-xs font-bold mb-4 flex justify-between">
                                    <span>順位分布</span>
                                    <span>{calculatedStats.total} Games</span>
                                </div>
                                <div className="space-y-4">
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
                                                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colors[i]} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 自己ベスト */}
                            <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-gray-500">
                                <div>モード別最高: <span className="text-white font-bold">{currentStats.bestScore || 0}</span></div>
                                <div className="font-inter uppercase">Mode: {activeTab}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
                            <div className="text-5xl mb-4 grayscale opacity-20">📊</div>
                            <p className="text-gray-400 text-sm font-bold">
                                {activeTab === 'all' ? 'まだデータがありません' : `${activeTab.toUpperCase()} モードの記録はありません`}
                            </p>
                            <p className="text-gray-600 text-[10px] mt-2">ゲームをプレイして記録を刻みましょう！</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                    >
                        ダッシュボードを閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
