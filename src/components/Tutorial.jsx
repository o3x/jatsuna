import { useState } from 'react';

const Tutorial = ({ isActive, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: '蛇突奈へようこそ！',
            content: 'これは3人対戦の陣取りゲームです。最も多くの石を獲得したプレイヤーが勝利します。',
        },
        {
            title: '石の配置',
            content: '黄色く光っている場所に石を置くことができます。クリックして石を配置しましょう。',
        },
        {
            title: 'コアルール：三すくみ変転',
            content: '石を挟むと色が変化しますが、単純に自分の色になるだけではありません。蛇は蛙を喰らい(自色)、蛞蝓を蛙へ変えます(他色)！この「三すくみ」の変転こそがこのゲームの醍醐味です。',
        },
        {
            title: '手番とAI',
            content: '3人が順番に手を打ちます。あなた以外の2人はAIが自動的に手を打ちます。',
        },
        {
            title: 'ゲーム終了',
            content: '全員が石を置けなくなったらゲーム終了です。最も多くの石を持っているプレイヤーが勝利します！',
        },
        {
            title: '設定',
            content: 'ゲーム開始前に、AI難易度やサウンドのON/OFFを設定できます。準備ができたら「ゲーム開始」をクリック！',
        }
    ];

    const currentStepData = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-4">
                <div className="bg-white rounded-xl shadow-2xl p-6">
                    <div className="flex gap-2 mb-4">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 flex-1 rounded-full transition-all ${index === currentStep ? 'bg-blue-600' : index < currentStep ? 'bg-blue-300' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {currentStepData.title}
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        {currentStepData.content}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onSkip}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            スキップ
                        </button>
                        <div className="flex-1" />
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                戻る
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                        >
                            {currentStep < steps.length - 1 ? '次へ' : '完了'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
