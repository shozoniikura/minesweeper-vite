export class Game {
  private cols: number;
  private rows: number;
  private status: number;

  constructor(cols: number, rows: number, status: number) {
    this.cols = cols;
    this.rows = rows;
    this.status = status;
  }
}