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

// 三すくみ(Snake-Slug-Frog)の変転ルール
// 自分の色 (Key1) が相手の色 (Key2) を挟んだ時の変化
// 蛇(O)は蛙(P)を喰らい(O)、蛞蝓(C)を蛙(P)へ追いつめる
// 蛞蝓(C)は蛇(O)を溶かし(C)、蛙(P)を蛇(O)へ追いつめる
// 蛙(P)は蛞蝓(C)を呑み(P)、蛇(O)を蛞蝓(C)へ追いつめる
export const COLOR_TRANSFORM = {
    'O': { 'P': 'O', 'C': 'P' }, // 蛇(O): 蛙(P)を喰らう, 蛞蝓(C)を追いつめる
    'C': { 'O': 'C', 'P': 'O' }, // 蛞蝓(C): 蛇(O)を溶かす, 蛙(P)を追いつめる
    'P': { 'C': 'P', 'O': 'C' }  // 蛙(P): 蛞蝓(C)を呑む, 蛇(O)を追いつめる
};

export const DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export const JATSUNA_CONFIG = {
    boardSize: BOARD_SIZE,
    players: PLAYERS,
    colorTransform: COLOR_TRANSFORM,
    directions: DIRECTIONS
};

// 石のスタイル定義 (通常とバリアフリー)
export const PLAYER_STONE_STYLES = {
    normal: {
        'O': {
            // Ruby (Red) - 蛇
            background: 'radial-gradient(circle at 30% 30%, #ff5577 0%, #ff0044 35%, #cc0033 70%, #880022 100%)',
            boxShadow: '0 4px 12px rgba(255, 0, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
            filter: 'drop-shadow(0 0 2px rgba(255, 100, 150, 0.5))',
            shapeClass: 'stone-circle'
        },
        'C': {
            // Sapphire (Blue) - 蛞蝓
            background: 'radial-gradient(circle at 30% 30%, #55aaff 0%, #0077ff 35%, #0055cc 70%, #002266 100%)',
            boxShadow: '0 4px 12px rgba(0, 119, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
            filter: 'drop-shadow(0 0 2px rgba(100, 200, 255, 0.5))',
            shapeClass: 'stone-diamond'
        },
        'P': {
            // Emerald (Green) - 蛙
            background: 'radial-gradient(circle at 30% 30%, #66ff99 0%, #00cc66 35%, #009944 70%, #004422 100%)',
            boxShadow: '0 4px 12px rgba(0, 204, 102, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.4)',
            filter: 'drop-shadow(0 0 2px rgba(150, 255, 200, 0.5))',
            shapeClass: 'stone-star'
        }
    },
    barrierFree: {
        'O': {
            background: 'radial-gradient(circle at 30% 30%, #ffb88c 0%, #ff9f6b 30%, #e67e22 70%, #c56615 100%)', // オレンジ
            boxShadow: '0 4px 8px rgba(230, 126, 34, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
            shapeClass: 'stone-circle'
        },
        'C': {
            background: 'radial-gradient(circle at 30% 30%, #8fc9ff 0%, #6bb6ff 30%, #22a7e6 70%, #1a85b8 100%)', // 空色
            boxShadow: '0 4px 8px rgba(34, 167, 230, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
            shapeClass: 'stone-diamond'
        },
        'P': {
            background: 'radial-gradient(circle at 30% 30%, #e88cff 0%, #d46bff 30%, #9b22e6 70%, #7a1bb8 100%)', // 紫
            boxShadow: '0 4px 8px rgba(155, 34, 230, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
            shapeClass: 'stone-star'
        }
    }
};
