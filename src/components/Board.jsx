import React from 'react';
import Cell from './Cell';
import { BOARD_SIZE } from '../utils/constants';

const Board = ({ board, validMoves, lastMove, animatingCells, showIcons, onCellClick, isPlayerTurn }) => {
    return (
        <div className={`bg-slate-700 rounded-lg p-4 shadow-2xl transition-opacity duration-300 ${!isPlayerTurn ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                aspectRatio: '1/1'
            }}>
                {board.map((row, r) => (
                    row.map((cell, c) => {
                        const isValidMove = validMoves.some(m => m.row === r && m.col === c);
                        const isLastMove = lastMove?.row === r && lastMove?.col === c;
                        const isAnimating = animatingCells.has(`${r}-${c}`);

                        return (
                            <Cell
                                key={`${r}-${c}`}
                                row={r}
                                col={c}
                                value={cell}
                                isValidMove={isValidMove}
                                isLastMove={isLastMove}
                                isAnimating={isAnimating}
                                showIcons={showIcons}
                                onClick={onCellClick}
                            />
                        );
                    })
                ))}
            </div>
        </div>
    );
};

export default Board;
