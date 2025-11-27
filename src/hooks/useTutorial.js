import { useState } from 'react';

const TUTORIAL_STORAGE_KEY = 'jatsuna_tutorial_completed';

export const useTutorial = () => {
    const [isActive, setIsActive] = useState(false);

    const startTutorial = () => {
        setIsActive(true);
    };

    const completeTutorial = () => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    };

    const skipTutorial = () => {
        setIsActive(false);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    };

    return {
        isActive,
        startTutorial,
        completeTutorial,
        skipTutorial
    };
};
