import React from 'react';
import { PLAYER_SHAPES, PLAYER_NAMES } from '../utils/constants';

const Cell = ({ row, col, value, isValidMove, isLastMove, isAnimating, showIcons, onClick }) => {
    const getStoneStyle = (color) => {
        const styles = {
            'O': { background: 'linear-gradient(135deg, #ff9f6b 0%, #e67e22 100%)', shapeClass: 'stone-circle' },
            'C': { background: 'linear-gradient(135deg, #6bb6ff 0%, #22a7e6 100%)', shapeClass: 'stone-diamond' },
            'P': { background: 'linear-gradient(135deg, #d46bff 0%, #9b22e6 100%)', shapeClass: 'stone-star' }
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
            absolute inset-1 shadow-lg transition-all duration-500
            ${style.shapeClass}
            ${isAnimating ? 'flip-animation' : ''}
          `}
                    style={{ background: style.background }}
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
