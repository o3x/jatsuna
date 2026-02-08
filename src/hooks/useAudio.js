import { useRef, useCallback } from 'react';

export const useAudio = (enabled) => {
    const audioContextRef = useRef(null);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                console.log('🔊 AudioContextを作成しました');
            } catch (e) {
                console.error("AudioContextはサポートされていません", e);
                return;
            }
        }

        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
            console.log('▶️ AudioContextを再開しました');
        }
    }, []);

    // リバーブ用のコンボルバー（簡易版）
    const createReverb = useCallback((ctx) => {
        const convolver = ctx.createConvolver();
        const reverbLength = ctx.sampleRate * 0.5;
        const impulse = ctx.createBuffer(2, reverbLength, ctx.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < reverbLength; i++) {
                impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2);
            }
        }

        convolver.buffer = impulse;
        return convolver;
    }, []);

    const playOrchestraSound = useCallback((type, captureCount = 0) => {
        if (!enabled) {
            console.log('🔇 サウンドは無効です');
            return;
        }

        initAudioContext();
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        console.log('🎵 サウンド再生:', type);

        if (type === 'place') {
            // 石を置く音
            if (captureCount === 0) {
                const bufferSize = ctx.sampleRate * 0.05;
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);

                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                const noise = ctx.createBufferSource();
                noise.buffer = noiseBuffer;

                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 2000;
                filter.Q.value = 5;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                noise.start(now);
                noise.stop(now + 0.05);

            } else if (captureCount <= 3) {
                // マリンバ風サウンド（1-3個キャプチャ時）
                const reverb = createReverb(ctx);
                const masterGain = ctx.createGain();
                masterGain.connect(reverb);
                reverb.connect(ctx.destination);

                const frequencies = [523, 659, 784];
                const baseFreq = frequencies[Math.min(captureCount - 1, 2)];

                for (let harmonic = 1; harmonic <= 3; harmonic++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();

                    osc.type = harmonic === 1 ? 'sine' : 'triangle';
                    osc.frequency.value = baseFreq * harmonic;

                    filter.type = 'lowpass';
                    filter.frequency.value = 4000;
                    filter.Q.value = 1;

                    const volume = (0.25 / harmonic) * (harmonic === 1 ? 1.5 : 0.5);
                    gain.gain.setValueAtTime(volume, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(masterGain);

                    osc.start(now);
                    osc.stop(now + 0.6);
                }

                // アタック音の追加
                const attackNoise = ctx.createBufferSource();
                const attackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate);
                const attackData = attackBuffer.getChannelData(0);
                for (let i = 0; i < attackData.length; i++) {
                    attackData[i] = (Math.random() * 2 - 1) * (1 - i / attackData.length);
                }
                attackNoise.buffer = attackBuffer;

                const attackFilter = ctx.createBiquadFilter();
                attackFilter.type = 'highpass';
                attackFilter.frequency.value = 1000;

                const attackGain = ctx.createGain();
                attackGain.gain.setValueAtTime(0.15, now);
                attackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.01);

                attackNoise.connect(attackFilter);
                attackFilter.connect(attackGain);
                attackGain.connect(masterGain);

                attackNoise.start(now);
                attackNoise.stop(now + 0.01);

            } else {
                // オーケストラヒット（4個以上キャプチャ時）
                const reverb = createReverb(ctx);
                const masterGain = ctx.createGain();
                masterGain.connect(reverb);
                reverb.connect(ctx.destination);

                const frequencies = [
                    [261, 329, 392, 523],
                    [293, 369, 440, 587],
                    [329, 415, 493, 659]
                ];

                frequencies.forEach((chord, chordIndex) => {
                    chord.forEach(freq => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const filter = ctx.createBiquadFilter();

                        osc.type = 'sawtooth';
                        osc.frequency.value = freq;

                        filter.type = 'lowpass';
                        filter.frequency.value = 2000;

                        const startTime = now + (chordIndex * 0.08);
                        gain.gain.setValueAtTime(0.15, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(masterGain);

                        osc.start(startTime);
                        osc.stop(startTime + 0.5);
                    });
                });
            }

        } else if (type === 'first_place') {
            // 1位：華やかな上昇和音（ファンファーレ）
            const reverb = createReverb(ctx);
            const masterGain = ctx.createGain();
            masterGain.connect(reverb);
            reverb.connect(ctx.destination);

            const progression = [
                { freq: 523, time: 0, duration: 0.2 },
                { freq: 523, time: 0.2, duration: 0.2 },
                { freq: 659, time: 0.4, duration: 0.2 },
                { freq: 784, time: 0.6, duration: 0.2 },
                { freq: 1047, time: 0.8, duration: 0.3 },
                { freq: 1319, time: 1.1, duration: 0.3 },
                { freq: 1568, time: 1.4, duration: 0.6 }
            ];

            progression.forEach(note => {
                for (let harmonic = 1; harmonic <= 4; harmonic++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();

                    osc.type = harmonic === 1 ? 'sawtooth' : 'sine';
                    osc.frequency.value = note.freq * harmonic;

                    filter.type = 'lowpass';
                    filter.frequency.value = 4000;

                    const volume = 0.3 / harmonic;
                    const startTime = now + note.time;
                    gain.gain.setValueAtTime(volume, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(masterGain);

                    osc.start(startTime);
                    osc.stop(startTime + note.duration);
                }

                // ハーモニーを追加（3度と5度）
                if (note.time >= 0.8) {
                    const harmony3rd = note.freq * 1.25;
                    const harmony5th = note.freq * 1.5;

                    [harmony3rd, harmony5th].forEach(harmFreq => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();

                        osc.type = 'sine';
                        osc.frequency.value = harmFreq;

                        const startTime = now + note.time;
                        gain.gain.setValueAtTime(0.15, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                        osc.connect(gain);
                        gain.connect(masterGain);

                        osc.start(startTime);
                        osc.stop(startTime + note.duration);
                    });
                }
            });

        } else if (type === 'second_place') {
            // 2位：穏やかな銀メダル音
            const reverb = createReverb(ctx);
            const masterGain = ctx.createGain();
            masterGain.connect(reverb);
            reverb.connect(ctx.destination);

            const chords = [
                { frequencies: [440, 523, 659], time: 0, duration: 0.4 },
                { frequencies: [523, 659, 784], time: 0.4, duration: 0.4 },
                { frequencies: [587, 698, 880], time: 0.8, duration: 0.4 },
                { frequencies: [659, 784, 987], time: 1.2, duration: 0.8 }
            ];

            chords.forEach(chord => {
                chord.frequencies.forEach(freq => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();

                    osc.type = 'triangle';
                    osc.frequency.value = freq;

                    filter.type = 'lowpass';
                    filter.frequency.value = 2500;

                    const startTime = now + chord.time;
                    gain.gain.setValueAtTime(0.2, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + chord.duration);

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(masterGain);

                    osc.start(startTime);
                    osc.stop(startTime + chord.duration);
                });

                // ベル音を追加（銀メダルの輝き）
                if (chord.time === 1.2) {
                    const bellFreq = 1047;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.value = bellFreq;

                    const startTime = now + chord.time;
                    gain.gain.setValueAtTime(0.15, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);

                    osc.connect(gain);
                    gain.connect(masterGain);

                    osc.start(startTime);
                    osc.stop(startTime + 1.0);
                }
            });

        } else if (type === 'draw') {
            // 引き分け：平板な中立音
            const masterGain = ctx.createGain();
            masterGain.connect(ctx.destination);

            const neutralChord = [523, 659, 784];

            neutralChord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = 1500;

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.setValueAtTime(0.1, now + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(masterGain);

                osc.start(now);
                osc.stop(now + 1.0);
            });

            const endTone = ctx.createOscillator();
            const endGain = ctx.createGain();

            endTone.type = 'triangle';
            endTone.frequency.value = 440;

            endGain.gain.setValueAtTime(0, now + 0.8);
            endGain.gain.linearRampToValueAtTime(0.1, now + 0.9);
            endGain.gain.linearRampToValueAtTime(0, now + 1.2);

            endTone.connect(endGain);
            endGain.connect(masterGain);

            endTone.start(now + 0.8);
            endTone.stop(now + 1.2);

        } else if (type === 'third_place') {
            // 3位：悲しい下降音
            const reverb = createReverb(ctx);
            const masterGain = ctx.createGain();
            masterGain.connect(reverb);
            reverb.connect(ctx.destination);

            const sadMelody = [
                { freq: 440, time: 0, duration: 0.3 },
                { freq: 392, time: 0.3, duration: 0.3 },
                { freq: 349, time: 0.6, duration: 0.3 },
                { freq: 329, time: 0.9, duration: 0.3 },
                { freq: 293, time: 1.2, duration: 0.3 },
                { freq: 261, time: 1.5, duration: 0.3 },
                { freq: 220, time: 1.8, duration: 0.6 },
            ];

            sadMelody.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.value = note.freq;

                filter.type = 'lowpass';
                filter.frequency.value = 800;

                const startTime = now + note.time;
                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(masterGain);

                osc.start(startTime);
                osc.stop(startTime + note.duration);

                // 低音の倍音を追加
                const bassOsc = ctx.createOscillator();
                const bassGain = ctx.createGain();

                bassOsc.type = 'sine';
                bassOsc.frequency.value = note.freq / 2;

                bassGain.gain.setValueAtTime(0.1, startTime);
                bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                bassOsc.connect(bassGain);
                bassGain.connect(masterGain);

                bassOsc.start(startTime);
                bassOsc.stop(startTime + note.duration);
            });

            // 最後に低いドローン音
            const drone = ctx.createOscillator();
            const droneGain = ctx.createGain();

            drone.type = 'sine';
            drone.frequency.value = 110;

            droneGain.gain.setValueAtTime(0, now + 1.8);
            droneGain.gain.linearRampToValueAtTime(0.1, now + 2.0);
            droneGain.gain.exponentialRampToValueAtTime(0.01, now + 3.0);

            drone.connect(droneGain);
            droneGain.connect(masterGain);

            drone.start(now + 1.8);
            drone.stop(now + 3.0);

        } else if (type === 'roulette') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = 800;

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        }
    }, [enabled, initAudioContext, createReverb]);

    return { initAudioContext, playOrchestraSound };
};
