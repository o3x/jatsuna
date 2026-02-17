// React import removed associated with unused variable lint warning
import { PLAYER_SHAPES } from '../utils/constants';

const Cell = ({ row, col, value, isValidMove, isLastMove, isAnimating, showIcons, onClick, barrierFreeMode }) => {
    const getStoneStyle = (color) => {
        // 通常(宝石風)の設定
        const normalStyles = {
            'O': {
                // Ruby (Red) - 蛇
                background: 'radial-gradient(circle at 30% 30%, #ff5577 0%, #ff0044 35%, #cc0033 70%, #880022 100%)',
                boxShadow: '0 4px 12px rgba(255, 0, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
                filter: 'drop-shadow(0 0 2px rgba(255, 100, 150, 0.5))',
                shapeClass: 'stone-circle'
            },
            'C': {
                // Sapphire (Blue) - 蛞蝓
                background: 'radial-gradient(circle at 30% 30%, #55aaff 0%, #0077ff 35%, #0055cc 70%, #002266 100%)',
                boxShadow: '0 4px 12px rgba(0, 119, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
                filter: 'drop-shadow(0 0 2px rgba(100, 200, 255, 0.5))',
                shapeClass: 'stone-diamond'
            },
            'P': {
                // Emerald (Green) - 蛙
                background: 'radial-gradient(circle at 30% 30%, #66ff99 0%, #00cc66 35%, #009944 70%, #004422 100%)',
                boxShadow: '0 4px 12px rgba(0, 204, 102, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
                filter: 'drop-shadow(0 0 2px rgba(150, 255, 200, 0.5))',
                shapeClass: 'stone-star'
            }
        };

        // バリアフリー(色覚多様性対応)の設定
        const barrierFreeStyles = {
            'O': {
                background: 'radial-gradient(circle at 30% 30%, #ffb88c 0%, #ff9f6b 30%, #e67e22 70%, #c56615 100%)', // オレンジ
                boxShadow: '0 4px 8px rgba(230, 126, 34, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                shapeClass: 'stone-circle'
            },
            'C': {
                background: 'radial-gradient(circle at 30% 30%, #8fc9ff 0%, #6bb6ff 30%, #22a7e6 70%, #1a85b8 100%)', // 空色
                boxShadow: '0 4px 8px rgba(34, 167, 230, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                shapeClass: 'stone-diamond'
            },
            'P': {
                background: 'radial-gradient(circle at 30% 30%, #e88cff 0%, #d46bff 30%, #9b22e6 70%, #7a1bb8 100%)', // 紫
                boxShadow: '0 4px 8px rgba(155, 34, 230, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                shapeClass: 'stone-star'
            }
        };

        return barrierFreeMode ? barrierFreeStyles[color] : normalStyles[color];
    };

    const style = value && value !== 'X' ? getStoneStyle(value) : {};

    return (
        <div
            onClick={() => onClick(row, col)}
            className={`
        aspect-square rounded-lg relative cursor-pointer transition-all duration-200
        ${value === 'X' ? 'fixed-cell shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-slate-800/80 border-2 border-slate-600/50 backdrop-blur-sm shadow-inner'}
        ${isValidMove ? 'hover:bg-slate-700/80 hover:border-yellow-400 box-content' : ''}
        ${isLastMove ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : ''}
      `}
        >
            {isValidMove && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <div className="w-5 h-5 rounded-full bg-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                </div>
            )}

            {value && value !== 'X' && (
                <div
                    className={`
            absolute inset-1 transition-all duration-500
            ${style.shapeClass}
            ${isAnimating ? 'flip-animation' : ''}
          `}
                    style={{
                        background: style.background,
                        boxShadow: style.boxShadow,
                        filter: style.filter || 'none'
                    }}
                >
                    {showIcons && (
                        <div className="stone-icon text-lg">
                            {PLAYER_SHAPES[value]}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cell;
