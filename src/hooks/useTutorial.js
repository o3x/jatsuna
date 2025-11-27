import { useState, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'jatsuna_tutorial_completed';

export const useTutorial = () => {
    const [isActive, setIsActive] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
        setHasCompleted(completed);
        if (!completed) {
            setIsActive(true);
        }
    }, []);

    const startTutorial = () => {
        setIsActive(true);
    };

    const completeTutorial = () => {
        setIsActive(false);
        setHasCompleted(true);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    };

    const skipTutorial = () => {
        setIsActive(false);
        setHasCompleted(true);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    };

    return {
        isActive,
        hasCompleted,
        startTutorial,
        completeTutorial,
        skipTutorial
    };
};
