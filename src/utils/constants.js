export const BOARD_SIZE = 7;

export const PLAYERS = ['O', 'C', 'P'];

export const PLAYER_NAMES = {
    'O': 'オーブ',
    'C': 'ジェム',
    'P': 'ステラ'
};

export const PLAYER_SHAPES = {
    'O': '●',
    'C': '◆',
    'P': '★'
};

export const COLOR_TRANSFORM = {
    'O': { 'C': 'P', 'P': 'O' },
    'C': { 'P': 'O', 'O': 'C' },
    'P': { 'O': 'C', 'C': 'P' }
};

export const DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
