// ground値の定数
import { EMPTY, COVERED, FLAG, BOMB, RED_BOMB, NG_BOMB, QUESTION } from "./constants";
// tile値の定数
import { NOT_OPEN, FLAGGED, OPEN } from "./constants";
// smile状態値の定数
import { SMILE, SMILE_PRESSED, SMILE_LOSE, SMILE_WIN } from "./constants";
// game状態値の定数
import { PLAY, LOSE, WIN } from "./constants";
// levelの型
import type { LevelInterface, LevelKeyType } from "./level";

// tilesが取りうる値の一覧を型にする
export type TileType = typeof NOT_OPEN | typeof FLAGGED | typeof OPEN;

// groundが取りうる値の一覧を型にする
export type GroundType = typeof EMPTY | typeof COVERED | typeof FLAG
    | typeof RED_BOMB | typeof NG_BOMB | typeof BOMB | typeof QUESTION
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// smile状態が取りうる値の一覧を型にする
export type SmileType = typeof SMILE | typeof SMILE_PRESSED | typeof SMILE_LOSE | typeof SMILE_WIN;

// game状態が取りうる値の一覧を型にする
export type GameType = typeof PLAY | typeof WIN | typeof LOSE;

// Gameの型
export interface Game {
    tiles: TileType[],     // groundの上のタイル。2次元配列にすると{...tiles}でdeep copyされないので1次元に。
    ground: GroundType[],  // ground（地雷版）。同上で1次元
    smileState: SmileType, // 😊の状態
    gameState: GameType,   // ゲームの状態
    isGroundSet: boolean,  // ground設置がされているか
    level: LevelKeyType,   // level値
    rows: number,          // 行数
    cols: number,          // 列数
    bombs: number,         //　地雷数
    remains: number,       // 残り地雷数。旗を立てると（間違えていても）減る
}

/**
 * 与えれらたlevelに応じたGameオブジェクトを返す関数
 * @param level レベルオブジェクト
 * @returns 
 */
export function NewGame(level: LevelInterface): Game {
    const tiles: TileType[] = [];
    const ground: GroundType[] = [];
    for (let i = 0; i < level.cols * level.rows; i++) {
        tiles.push(NOT_OPEN);
        ground.push(EMPTY);
    }
    return {
        tiles: tiles,
        ground: ground,
        smileState: SMILE,
        gameState: PLAY,
        remains: level.bombs,
        isGroundSet: false,
        ...level
    };
}

/**
 * Gameとクリックしたtileのインデックスを受け取り、
 * クリックしたtileの下のground値に対応したspriteのインデックスを返す
 * @param game Gameオブジェクト
 * @param i クリックしたtileのインデックス
 * @returns ground値に対応するspriteのインデックス
 */
export function getGroundSpriteIndex(game: Game, i: number) {
    const tile = game.tiles[i];
    const ground = game.ground[i];
    if (tile === NOT_OPEN) {
        return COVERED;
    }
    if (tile === FLAGGED) {
        return FLAG;
    }
    return ground;
}

/**
 * 受け取ったGameのsmileStateに応じたspriteのインデックスを返す
 * @param game Gameオブジェクト
 * @returns gameのsmileStateに対応したspriteのインデックス
 */
export function getSmileSpriteIndex(game: Game) {
    return game.smileState;
}

/**
 * 受け取ったGameのremainsに応じたspriteのインデックスを返す
 * @param game Game オブジェクト
 * @returns 
 */
export function getRemainsSpriteIndices(game: Game) {
    return numberSpriteIndices(game.remains);
}

/**
 * 受け取った経過秒数に対応したspriteのindexを返す
 * @param timer 経過秒数
 * @returns [100位,10位,1位]
 */
export function getTimerSpriteIndices(timer: number) {
    return numberSpriteIndices(timer);
}

/**
 * 受け取った経過秒数に対応したspriteのindexを返す。  
 * 3桁で返す。マイナスの場合、0,0,0を返す。1000を超える場合、9,9,9を返す。
 * @param val 経過秒数
 * @returns [100位,10位,1位]
 */
function numberSpriteIndices(val: number) {
    if (val >= 1000) val = 999;
    if (val < 0) val = 0;
    const hundreds = Math.floor(val / 100);
    const tens = Math.floor(val % 100 / 10);
    const ones = val % 10;
    return [hundreds, tens, ones];
}