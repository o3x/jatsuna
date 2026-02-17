import { useState } from 'react';

const SettingsModal = ({
    isOpen,
    onClose,
    settings,
    updateSettings,
    onResetStats,
    initAudioContext
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="premium-card w-full max-w-sm p-6 relative overflow-hidden">
                {/* 背景デコレーション */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span className="text-2xl">⚙️</span> 詳細設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {/* サウンド設定 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm font-bold">サウンド効果</span>
                            <button
                                onClick={() => { initAudioContext(); updateSettings('soundEnabled', !settings.soundEnabled); }}
                                className={`px-4 py-1 rounded-full text-xs font-bold transition-all border ${settings.soundEnabled
                                    ? 'bg-blue-600 text-white border-blue-400'
                                    : 'bg-slate-700 text-gray-500 border-slate-600'
                                    }`}
                            >
                                {settings.soundEnabled ? '有効' : '無効'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">BGMとSEの再生を切り替えます。</p>
                    </div>

                    {/* アニメーション速度 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm font-bold">変転スピード</span>
                            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                {['normal', 'fast'].map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => { initAudioContext(); updateSettings('animationSpeed', speed); }}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${settings.animationSpeed === speed
                                            ? 'bg-slate-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-400'
                                            }`}
                                    >
                                        {speed === 'normal' ? '標準' : '高速'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500">石がひっくり返る速度を調整します。</p>
                    </div>

                    {/* バリアフリー設定 */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm font-bold">バリアフリー</span>
                            <button
                                onClick={() => { initAudioContext(); updateSettings('barrierFreeMode', !settings.barrierFreeMode); }}
                                className={`px-4 py-1 rounded-full text-xs font-bold transition-all border ${settings.barrierFreeMode
                                    ? 'bg-emerald-600 text-white border-emerald-400'
                                    : 'bg-slate-700 text-gray-500 border-slate-600'
                                    }`}
                            >
                                {settings.barrierFreeMode ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">石の種類をアイコンで識別しやすくします。</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <button
                            onClick={() => {
                                initAudioContext();
                                if (window.confirm('これまでの戦績データを全てリセットします。よろしいですか？')) {
                                    onResetStats();
                                }
                            }}
                            className="w-full py-2 bg-red-900/30 text-red-400 text-[10px] font-bold rounded-lg border border-red-900/50 hover:bg-red-900/50 transition-all"
                        >
                            📊 戦績データをリセット
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white text-slate-900 font-black rounded-lg hover:bg-gray-200 transition-all shadow-xl"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
