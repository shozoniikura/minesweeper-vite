import { COVERED, FLAG, FLAGGED, NOT_OPEN } from "../../lib/mskai/constants";

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
    if (this.allCovered()) return [];

    const coveredTiles = this.coveredTiles();
    return coveredTiles.map(idx => {
      if (this.tiles[idx] === COVERED && Math.random() * 10 > 5) return idx
    }).filter(idx => idx !== undefined);
  }

  public markFlags(indecies: number[]) {
    const elements = this.tileElements();
    indecies.forEach(idx => {
      elements[idx].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    });
  }

  // 一つも開いていない場合は true
  private allCovered(): boolean {
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
}