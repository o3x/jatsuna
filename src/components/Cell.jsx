import { PLAYER_SHAPES, PLAYER_STONE_STYLES } from '../utils/constants';

const Cell = ({ row, col, value, isValidMove, isLastMove, isAnimating, showIcons, onClick, barrierFreeMode, animationSpeed }) => {
    const getStoneStyle = (color) => {
        return barrierFreeMode ? PLAYER_STONE_STYLES.barrierFree[color] : PLAYER_STONE_STYLES.normal[color];
    };

    const style = value && value !== 'X' ? getStoneStyle(value) : {};
    const transitionDuration = animationSpeed === 'fast' ? 'duration-200' : 'duration-500';

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
            absolute inset-1 transition-all ${transitionDuration}
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
