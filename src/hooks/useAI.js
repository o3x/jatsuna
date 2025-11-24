import { useCallback } from 'react';
import { getAIMoveLogic } from '../utils/aiLogic';

export const useAI = (difficulty, playerTurnPosition) => {
    const getAIMove = useCallback((currentBoard, color) => {
        return getAIMoveLogic(currentBoard, color, difficulty, playerTurnPosition);
    }, [difficulty, playerTurnPosition]);

    return { getAIMove };
};
