import { MouseEvent } from "react";

export const analyzeBtnClicked = (event: MouseEvent<HTMLButtonElement>) => {
  console.log(event);
  const cols = parseInt(event.currentTarget&.getAttribute("data-cols"));
  const rows = parseInt(event.currentTarget&.getAttribute("data-rows"));
  const analyzer = new Analyzer(cols, rows);
  console.log("ANLYZING2...", analyzer);
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

  public read() {
    const imgs = document.querySelectorAll('div[data-id="board"] img');
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