import { COVERED, FLAG, PLAY } from "../../lib/mskai/constants";
import { getStatus, sortedUniqArray, tileElements } from "./common";
import { Game } from "./game";
import { Tile } from "./tile";

interface gameInfo {
  cols: number;
  rows: number;
}

export const analyzeBtnClicked = (props: gameInfo) => {
  const {cols, rows} = props;
  const game = new Game(cols, rows);
  game.start();
};


export class Analyzer {
  private tiles: number[];
  private cols: number;
  private rows: number;
  public status: number;

  constructor (
    cols: number,
    rows: number,
  ) {
    this.cols = cols;
    this.rows = rows;
    this.status = PLAY;
    this.tiles = [];
    this.read();
  }

  public searchBombs(): number[] {
    this.read();
    if (this.isAllCovered()) return [];

    const coveredTiles = this.coveredTiles();
    const isOpenedTiles = this.isOpenedTiles();
    return Array.from(new Set(isOpenedTiles.map((tileIdx) => {
      const tile = new Tile(tileIdx, this.tiles[tileIdx]);
      return tile;
    }).map(tile => {
      const aroundTiles = tile.around(this.cols, this.rows);
      let count = 0;
      aroundTiles.forEach(position => {
        if (this.tiles[position] >= COVERED) {
          count++;
        }
      });
      if (count === tile.value && count > 0) {
        const ret: number[] = [];
        aroundTiles.forEach(idx => {
          if (coveredTiles.includes(idx)) {
            ret.push(idx);
          }
        });
        // console.log(ret);
        return ret;
      }
    }).filter(ary => ary !== undefined)
    .flat().sort((first: number, second: number) => first - second)));
  }

  // 一つも開いていない場合は true
  public isAllCovered(): boolean {
    return this.tiles.reduce((prev, current) => prev && (current == COVERED || current == FLAG), true);
  }

  // 開いていないタイルのIndexを全て返す
  public coveredTiles(): number[] {
    return this.tiles.map((tile, idx) => {
      if (tile == COVERED) {
        return idx;
      }
    }).filter(idx => idx !== undefined);
  }

  private isOpenedTiles(): number[] {
    return this.tiles.map((tile, idx) => {
      if (tile < COVERED) {
        return idx;
      }
    }).filter(idx => idx !== undefined);
  }

  public read() {
    this.status = getStatus();
    const imgs = tileElements();
    this.tiles = Array.from(imgs).map((node) => parseInt(node.getAttribute("data-tile") || '0'));
  }

  public at(x: number, y: number): number {
    if (x < 0 || y < 0 || this.cols <= x || this.rows <= y) {
      return NaN;
    }
    return x + this.cols * y;
  }

  public tileAt(x: number, y: number): number {
    return this.tiles[this.at(x, y)];
  }

  public openableTiles(): number[] {
    const isOpenedTiles = this.isOpenedTiles();
    const ret: number[] = [];
    isOpenedTiles.forEach(idx => {
      const tile = new Tile(idx, this.tiles[idx]);
      let count = 0;
      const aroundTiles = tile.around(this.cols, this.rows);
      aroundTiles.forEach(aIdx => {
        if (this.tiles[aIdx] === FLAG) {
          count++;
        }
      });
      if (count >= tile.value) {
        aroundTiles
          .filter(aIdx => this.tiles[aIdx] === COVERED)
          .forEach(aIdx => ret.push(aIdx));
      }
    });
    return sortedUniqArray(ret);
  }

  public mostOpenableTile(): number {
    const elements = tileElements();
    const coveredTilesIndicies = this.coveredTiles();
    const tiles = coveredTilesIndicies.map(idx => {
      const tile = new Tile(idx, COVERED);
      const aroundTilesIndicies = tile.around(this.cols, this.rows);
      const indicies = aroundTilesIndicies.map(aIdx => {
        const aTile = new Tile(aIdx, this.tiles[aIdx]);
        if (aTile.value >= COVERED) return;

        const around2TilesIndicies = aTile.around(this.cols, this.rows);
        const countFlag = around2TilesIndicies.map(aaIdx => {
          if (this.tiles[aaIdx] === FLAG) return true;
        }).filter(b => b).length;
        const countCovered = around2TilesIndicies.map(aaIdx => {
          if (this.tiles[aaIdx] === COVERED) return true;
        }).filter(b => b).length;
        aTile.value -= countFlag
        const delta = aTile.value / countCovered;
        around2TilesIndicies.map(aaIdx => {
          if (aaIdx === tile.position) {
            tile.probability += delta;
          }
        });
        return aIdx;
      });
      if (indicies.filter(i => i !== undefined).length > 0)
        return tile;
    }).filter(i => i !== undefined);
    let targets = coveredTilesIndicies;
    if (tiles.length > 0) {
      const sorted = tiles.sort((first, second) => first.probability - second.probability);
      const minimum = sorted[0].probability;
      targets = sorted.filter(tile=>tile.probability===minimum).map(tile=>tile.position);
    }
    const choice = targets[Math.floor(Math.random() * targets.length)];
    return choice;
  }
}