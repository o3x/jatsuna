import { useCallback } from 'react';
import { JATSUNA_CONFIG } from '../utils/constants';
import { getAIMoveLogic } from '../utils/aiLogic';

export const useAI = (difficulty, playerTurnPosition) => {
    const getAIMove = useCallback((currentBoard, color) => {
        return getAIMoveLogic(currentBoard, color, difficulty, playerTurnPosition, JATSUNA_CONFIG);
    }, [difficulty, playerTurnPosition]);

    return { getAIMove };
};
