import { COVERED, FLAG, FLAGGED, NOT_OPEN } from "../../lib/mskai/constants";
import { sortedUniqArray } from "./common";
import { Tile } from "./tile";

interface gameInfo {
  cols: number;
  rows: number;
}

export const analyzeBtnClicked = (props: gameInfo) => {
  const {cols, rows} = props;
  const analyzer = new Analyzer(cols, rows);
  console.log("ANLYZING2...", analyzer);
  const bombs = analyzer.searchBombs();
  console.log(bombs);
  analyzer.markFlags(bombs);
  const openableTiles = analyzer.openableTiles();
  console.log(openableTiles);
  analyzer.openOpenableTiles(openableTiles);
};


class Analyzer {
  private tiles: number[];
  private cols: number;
  private rows: number;

  constructor (
    cols: number,
    rows: number,
  ) {
    this.cols = cols;
    this.rows = rows;
    this.tiles = [];
    this.read();
  }

  public searchBombs(): number[] {
    this.read();
    if (this.isAllCovered()) return [];

    const coveredTiles = this.coveredTiles();
    // return coveredTiles.map(idx => {
    //   if (this.tiles[idx] === COVERED && Math.random() * 10 > 5) return idx
    // }).filter(idx => idx !== undefined);
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

  public markFlags(indecies: number[]) {
    const elements = this.tileElements();
    indecies.forEach(idx => {
      elements[idx].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    });
  }

  // 一つも開いていない場合は true
  private isAllCovered(): boolean {
    return this.tiles.reduce((prev, current) => prev && (current == COVERED || current == FLAG), true);
  }

  // 開いていないタイルのIndexを全て返す
  private coveredTiles(): number[] {
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

  private tileElements(): NodeListOf<HTMLImageElement> {
    return document.querySelectorAll('div[data-id="board"] img');
  }

  public read() {
    const imgs = this.tileElements();
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
    const coveredTiles = this.coveredTiles();
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

  public openOpenableTiles(indecies: number[]): void {
    const elements = this.tileElements();
    indecies.forEach(idx => {
      elements[idx].click();
    });
  }
}