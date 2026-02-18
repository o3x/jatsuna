// 蛇突奈 (Jatsuna) - ゲーム情報コンポーネント
// Last Updated: Wed Feb 18 10:42:00 JST 2026
// Version: 6.5.1
import { PLAYERS, PLAYER_NAMES, PLAYER_SHAPES, PLAYER_STONE_STYLES } from '../utils/constants';

const GameInfo = ({
    difficulty, turnCount, scores, currentPlayer, playerTurnPosition,
    aiThinking, thinkingDots, gameOver, onReset, barrierFreeMode
}) => {
    const getStoneStyle = (color) => {
        return barrierFreeMode ? PLAYER_STONE_STYLES.barrierFree[color] : PLAYER_STONE_STYLES.normal[color];
    };

    return (
        <div className="bg-slate-700 rounded-lg p-3 mb-3 shadow-xl">
            <div className="flex justify-between items-center mb-2">
                <div className="text-white">
                    <div className="text-xs text-gray-400">難易度</div>
                    <div className="font-bold text-sm text-yellow-400">
                        {difficulty === 'superhard' ? 'Super' :
                            difficulty === 'hard' ? 'Hard' :
                                difficulty === 'medium' ? 'Medium' : 'Easy'}
                    </div>
                </div>
                <div className="text-white text-center">
                    <div className="text-xs text-gray-400">ターン</div>
                    <div className="font-bold text-xl">{turnCount}</div>
                </div>
                {!gameOver && (
                    <button
                        onClick={() => {
                            if (window.confirm('リセット?')) {
                                onReset();
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm font-bold"
                    >
                        🔄
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                {PLAYERS.map((player, idx) => {
                    const isCurrentPlayer = idx === currentPlayer;
                    const isPlayer = idx === playerTurnPosition;
                    const style = getStoneStyle(player);
                    const isCollusionAI = difficulty === 'collusion' && !isPlayer && isCurrentPlayer;

                    return (
                        <div
                            key={player}
                            className={`p-2 rounded-lg transition-all ${isCollusionAI ? 'ring-2 ring-red-600 bg-red-900 collusion-pulse' :
                                isCurrentPlayer ? 'ring-2 ring-yellow-400 bg-slate-600' : 'bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 ${style.shapeClass} flex-shrink-0`}
                                    style={{ background: style.background }}
                                >
                                    <div className="stone-icon text-lg">
                                        {PLAYER_SHAPES[player]}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold text-xs flex items-center gap-1">
                                        {PLAYER_NAMES[player]}
                                        {isPlayer && <span className="text-yellow-400 text-[10px]">YOU</span>}
                                        {isCollusionAI && aiThinking && (
                                            <span className="text-red-400 text-[10px] evil-thinking">悪巧み中{thinkingDots}</span>
                                        )}
                                    </div>
                                    <div className="text-white text-2xl font-bold leading-none">
                                        {scores[player]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GameInfo;
