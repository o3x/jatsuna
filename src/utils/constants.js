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
