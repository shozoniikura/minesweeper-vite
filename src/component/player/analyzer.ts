import { COVERED, FLAG, FLAGGED, NOT_OPEN } from "../../lib/mskai/constants";
import { sortedUniqArray } from "./common";
import { Tile } from "./tile";

interface gameInfo {
  cols: number;
  rows: number;
  count: number;
}

export const analyzeBtnClicked = (props: gameInfo) => {
  const {cols, rows} = props;
  const count = props.count || 0;
  const analyzer = new Analyzer(cols, rows);
  console.log("ANLYZING2...", analyzer, count);
  const bombs = analyzer.searchBombs();
  const countBombs = bombs.length;
  console.log("bobms are ", bombs);
  analyzer.markFlags(bombs);
  const openableTiles = analyzer.openableTiles();
  const countOpenable = openableTiles.length;
  console.log("openables are", openableTiles);
  if (countBombs + countOpenable > 0) {
    analyzer.openOpenableTiles(openableTiles);
    const newProps = {...props, count: count+1}
    setTimeout(()=>analyzeBtnClicked(newProps), 1000);
  } else {
    const covered = analyzer.coveredTiles();
    const target = [covered[Math.floor(Math.random() * covered.length)]];
    if (count === 0) analyzer.openOpenableTiles(target);
  }
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
    if (indecies.length === 0) return

    setTimeout(() => {
      const elements = this.tileElements();
      const idx: number = indecies.shift() || 0;
      const element = elements[idx];
      if (this.getValueAt(element) !== FLAG)
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
      this.markFlags(indecies);
    }, 100);
  }

  public openOpenableTiles(indecies: number[]): void {
    const elements = this.tileElements();
    if (indecies.length === 0) return

    setTimeout(() => {
      const idx: number = indecies.shift() || 0;
      elements[idx].click();
      this.openOpenableTiles(indecies);
    }, 100);
  }

  // 一つも開いていない場合は true
  private isAllCovered(): boolean {
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

  private tileElements(): NodeListOf<HTMLImageElement> {
    return document.querySelectorAll('div[data-id="board"] img');
  }

  public read() {
    const imgs = this.tileElements();
    this.tiles = Array.from(imgs).map((node) => parseInt(node.getAttribute("data-tile") || '0'));
  }

  public getValueAt(node: HTMLImageElement) {
    return parseInt(node.getAttribute("data-tile") || '0');
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
}