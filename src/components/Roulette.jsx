import React, { useEffect, useState } from 'react';

const Roulette = ({ onComplete, playOrchestraSound }) => {
    const [rouletteResult, setRouletteResult] = useState(null);

    useEffect(() => {
        let count = 0;
        let timeoutId;

        const spin = () => {
            setRouletteResult(prev => (prev === null ? 0 : (prev + 1) % 3));
            count++;

            // ルーレット音を鳴らす
            if (playOrchestraSound) {
                playOrchestraSound('roulette');
            }

            if (count >= 10) {
                const finalResult = Math.floor(Math.random() * 3);
                setRouletteResult(finalResult);
                setTimeout(() => {
                    onComplete(finalResult);
                }, 800);
            } else {
                // 線形で遅くする (約3秒で停止)
                const delay = 50 + count * 30;
                timeoutId = setTimeout(spin, delay);
            }
        };

        timeoutId = setTimeout(spin, 100);

        return () => clearTimeout(timeoutId);
    }, [onComplete, playOrchestraSound]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-slate-700 p-8 rounded-xl text-center">
                <h2 className="text-3xl font-bold text-white mb-6">🎲 手番ルーレット</h2>
                <div className="flex gap-4 mb-6">
                    {[0, 1, 2].map((pos) => (
                        <div
                            key={pos}
                            className={`w-24 h-24 rounded-lg flex items-center justify-center text-4xl transition-all ${rouletteResult === pos ? 'bg-yellow-500 scale-110 roulette-bounce' : 'bg-slate-600'
                                }`}
                        >
                            {pos === 0 ? '1番手' : pos === 1 ? '2番手' : '3番手'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Roulette;


