import { useRef, useCallback } from 'react';

export const useAudio = (enabled) => {
    const audioContextRef = useRef(null);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("AudioContext not supported", e);
                return;
            }
        }

        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const playOrchestraSound = useCallback((type, captureCount = 0) => {
        if (!enabled) return;
        initAudioContext();
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;

        if (type === 'place' && captureCount === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        // Add other sound types here if needed (e.g., capture sounds)
    }, [enabled, initAudioContext]);

    return { initAudioContext, playOrchestraSound };
};
