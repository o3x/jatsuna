import { useMemo, useState, useEffect } from 'react';

const StatsDashboard = ({ isOpen, onClose, stats }) => {
    const [activeTab, setActiveTab] = useState('all');

    if (!isOpen) return null;

    // ヘルパー: 表示する値を確実に文字列にする(Reactクラッシュ防止)
    const safeStr = (v) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'object' || typeof v === 'function') return '-';
        return String(v);
    };

    // 現在のタブの生データを抽出
    const rawData = stats && stats[activeTab] ? stats[activeTab] : (stats?.totalGames !== undefined && activeTab === 'all' ? stats : null);

    // 統計計算
    const total = Number(rawData?.totalGames || 0);
    const ranks = rawData?.ranks || {};
    const first = Number(ranks[1] || 0);
    const second = Number(ranks[2] || 0);
    const third = Number(ranks[3] || 0);
    const best = Number(rawData?.bestScore || 0);

    const avgRank = total > 0 ? ((first * 1 + second * 2 + third * 3) / total).toFixed(2) : '-';
    const topRate = total > 0 ? ((first / total) * 100).toFixed(1) : '0.0';

    const tabs = [
        { id: 'all', label: '全体' },
        { id: 'easy', label: 'Easy' },
        { id: 'medium', label: 'Medium' },
        { id: 'hard', label: 'Hard' },
        { id: 'superhard', label: 'Super' },
        { id: 'collusion', label: '最凶' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="premium-card w-full max-w-md p-6 relative flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh]">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>📊</span> プレイヤー戦績
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl px-2">✕</button>
                </div>

                {/* タブ */}
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-2 rounded-md text-[10px] font-bold whitespace-nowrap flex-1
                                ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            {safeStr(tab.label)}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {total > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-800 p-4 rounded-xl text-center">
                                    <div className="text-gray-500 text-[10px] mb-1">平均順位</div>
                                    <div className="text-2xl font-black text-blue-400">{safeStr(avgRank)}</div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl text-center">
                                    <div className="text-gray-500 text-[10px] mb-1">1位率</div>
                                    <div className="text-2xl font-black text-emerald-400">{safeStr(topRate)}%</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                {[1, 2, 3].map((r) => {
                                    const count = r === 1 ? first : r === 2 ? second : third;
                                    const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={r}>
                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                <span>{r}位</span>
                                                <span>{safeStr(count)}回 ({safeStr(pct)}%)</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-800 text-center">
                                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Mode Best: {safeStr(best)} Stones</span>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            <div className="text-4xl mb-4 opacity-20">📊</div>
                            <p className="text-sm font-bold">まだデータがありません</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
