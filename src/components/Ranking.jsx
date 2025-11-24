import React, { useEffect, useRef } from 'react';

const Ranking = ({ ranking, onReset, playOrchestraSound }) => {
    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    const userRank = ranking.find(r => r.isPlayer).rank;
    const isWinner = userRank === 1;
    const hasPlayedSound = useRef(false);

    // ランキング表示時に順位に応じた音楽を再生（初回のみ）
    useEffect(() => {
        if (!playOrchestraSound || hasPlayedSound.current) return;

        hasPlayedSound.current = true;

        // 同率1位の判定
        const firstPlaceCount = ranking.filter(r => r.rank === 1).length;

        if (firstPlaceCount > 1) {
            // 引き分け
            playOrchestraSound('draw');
        } else if (userRank === 1) {
            // 1位
            playOrchestraSound('first_place');
        } else if (userRank === 2) {
            // 2位
            playOrchestraSound('second_place');
        } else {
            // 3位
            playOrchestraSound('third_place');
        }
    }, [userRank, ranking, playOrchestraSound]);


    return (
        <div className="mt-6 bg-slate-700 rounded-lg p-6 shadow-2xl animate-fade-in">
            <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                    {isWinner ?
                        <div className="trophy-bounce inline-block">🏆</div> :
                        userRank === 2 ? '🥈' : '🥉'
                    }
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-yellow-400 winner-glow' : 'text-white'}`}>
                    {isWinner ? "おめでとうございます!" :
                        userRank === 2 ? "惜しい! 2位でした" : "ドンマイ! 次は勝てます"}
                </h2>
                <p className="text-gray-300">
                    {isWinner ? "あなたの勝利です! 🎉" :
                        userRank === 2 ? "あと少しでしたね! 👍" : "強敵でしたね... 💪"}
                </p>
            </div>

            <div className="space-y-3 mb-6">
                {ranking.map((r, idx) => (
                    <div
                        key={idx}
                        className={`
              flex items-center p-4 rounded-lg transition-all transform hover:scale-102
              ${r.rank === 1 ? 'rank-1' : r.rank === 2 ? 'rank-2' : 'rank-3'}
              ${r.isPlayer ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-700 z-10' : ''}
            `}
                    >
                        <div className="text-3xl mr-4 w-12 text-center">{getRankMedal(r.rank)}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-slate-900">{r.name}</span>
                                {r.isPlayer && <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">YOU</span>}
                            </div>
                            <div className="text-slate-800 text-sm font-medium">
                                {r.score}個の石を獲得
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-800 opacity-80">
                            {r.shape}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onReset}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                もう一度プレイ 🔄
            </button>
        </div>
    );
};

export default Ranking;
