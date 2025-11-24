import React from 'react';
import { PLAYER_SHAPES, PLAYER_NAMES } from '../utils/constants';

const Cell = ({ row, col, value, isValidMove, isLastMove, isAnimating, showIcons, onClick }) => {
    const getStoneStyle = (color) => {
        const styles = {
            'O': {
                background: 'radial-gradient(circle at 30% 30%, #ffb88c 0%, #ff9f6b 30%, #e67e22 70%, #c56615 100%)',
                boxShadow: '0 4px 8px rgba(230, 126, 34, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                shapeClass: 'stone-circle'
            },
            'C': {
                background: 'radial-gradient(circle at 30% 30%, #8fc9ff 0%, #6bb6ff 30%, #22a7e6 70%, #1a85b8 100%)',
                boxShadow: '0 4px 8px rgba(34, 167, 230, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                shapeClass: 'stone-diamond'
            },
            'P': {
                background: 'radial-gradient(circle at 30% 30%, #e88cff 0%, #d46bff 30%, #9b22e6 70%, #7a1bb8 100%)',
                boxShadow: '0 4px 8px rgba(155, 34, 230, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)',
                shapeClass: 'stone-star'
            }
        };
        return styles[color] || {};
    };

    const style = value && value !== 'X' ? getStoneStyle(value) : {};

    return (
        <div
            onClick={() => onClick(row, col)}
            className={`
        aspect-square rounded-lg relative cursor-pointer transition-all duration-200
        ${value === 'X' ? 'fixed-cell' : 'bg-slate-800 border-2 border-slate-600'}
        ${isValidMove ? 'hover:bg-slate-700 hover:border-yellow-500' : ''}
        ${isLastMove ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : ''}
      `}
        >
            {isValidMove && (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-yellow-400/60 shadow-[0_0_10px_rgba(250,204,21,0.6)]"></div>
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
                        boxShadow: style.boxShadow
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
