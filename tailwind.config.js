/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                flip: {
                    '0%': { transform: 'rotateY(0deg)' },
                    '50%': { transform: 'rotateY(90deg)' },
                    '100%': { transform: 'rotateY(0deg)' },
                },
                thinking: {
                    '0%, 100%': { opacity: '0.3' },
                    '50%': { opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 5px currentColor' },
                    '50%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
                },
                'evil-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 15px #ff0000, 0 0 25px #ff0000, 0 0 35px #8b0000',
                        borderColor: '#ff0000',
                        filter: 'brightness(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 40px #ff0000, 0 0 60px #ff0000, 0 0 80px #8b0000',
                        borderColor: '#ff5555',
                        filter: 'brightness(1.3)'
                    },
                },
                'roulette-bounce': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                },
                'winner-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 10px gold',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px gold, 0 0 40px gold',
                        transform: 'scale(1.05)'
                    },
                },
                'trophy-bounce': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '25%': { transform: 'translateY(-10px) rotate(-5deg)' },
                    '75%': { transform: 'translateY(-5px) rotate(5deg)' },
                },
                'collusion-pulse': {
                    '0%, 100%': {
                        transform: 'scale(1)',
                        filter: 'brightness(1) saturate(1)',
                        boxShadow: '0 0 10px #ff0000'
                    },
                    '50%': {
                        transform: 'scale(1.03)',
                        filter: 'brightness(1.4) saturate(1.5)',
                        boxShadow: '0 0 25px #ff0000, 0 0 40px #ff0000, 0 0 55px #8b0000'
                    },
                },
                'evil-thinking': {
                    '0%, 100%': {
                        opacity: '0.4',
                        transform: 'scale(0.98)'
                    },
                    '50%': {
                        opacity: '1',
                        transform: 'scale(1.02)'
                    },
                },
            },
            animation: {
                'flip': 'flip 0.6s ease-in-out',
                'thinking': 'thinking 1.5s ease-in-out infinite',
                'super-hard-glow': 'glow 2s ease-in-out infinite',
                'evil-glow': 'evil-glow 1.5s ease-in-out infinite',
                'collusion-pulse': 'collusion-pulse 2s ease-in-out infinite',
                'evil-thinking': 'evil-thinking 1.2s ease-in-out infinite',
                'roulette-bounce': 'roulette-bounce 0.5s ease-in-out 3',
                'winner-glow': 'winner-glow 2s ease-in-out infinite',
                'trophy-bounce': 'trophy-bounce 1s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
