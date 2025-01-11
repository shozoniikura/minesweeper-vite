import { PLAY } from "../../lib/mskai/constants";
import { Analyzer } from "./analyzer";
import { getStatus, tileElements } from "./common";
import { Player } from "./player";

export class Game {
  private cols: number;
  private rows: number;
  private status: number;
  private analyzer: Analyzer;
  private player: Player;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.player = new Player();
    this.analyzer = new Analyzer(this.cols, this.rows);
    this.status = getStatus();
  }

  public start(count: number = 0) {
    this.status = getStatus();

    if (this.status !== PLAY) {
      // WIN/LOSEの場合は再起動
      setTimeout(() => this.restartGame(count), 5000);
      return;
    }

    // 地雷の場所を検索してフラグを立てる
    const bombs = this.analyzer.searchBombs();
    this.player.markFlags(bombs);

    // 開けられるタイルを検索する
    const openableTiles = this.analyzer.openableTiles();

    // // デバッグ出力
    // console.log("ANLYZING2...", this.analyzer, count);
    // console.log("bobms are ", bombs);
    // console.log("openables are", openableTiles);

    const countBombs = bombs.length;
    const countOpenable = openableTiles.length;
    if (countBombs + countOpenable > 0) {
      // 確実性のある処理（マークしたり、タイルを開けた）の場合は再度呼び出す
      this.player.openOpenableTiles(openableTiles);
      setTimeout(()=>this.start(count+1), 500);
    } else {
      // 不確実な場合
      this.processUncertainty(count);
    }
  }

  public restartGame(count: number) {
    const smile = document.querySelector('img[data-name="smile"]');
    smile?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
    this.start(count+1);
  }

  public processUncertainty(count: number) {
    if (this.analyzer.isAllCovered()) {
      const covered = this.analyzer.coveredTiles();
      const choice = [covered[Math.floor(Math.random() * covered.length)]];
      this.player.openOpenableTiles(choice);
      setTimeout(()=>this.start(count+1), 500);
    } else {
      const target = [this.analyzer.mostOpenableTile()];
      const element = tileElements()[target[0]];
      const src = element.getAttribute('src') || '';
      element.setAttribute('src', '');
      setTimeout(() => {
        // if (confirm(`target is ${target}`)) {
        if (true) {
          this.player.openOpenableTiles(target);
          setTimeout(()=>this.start(0), 500);
        } else {
          element.setAttribute('src', src);
        }
      }, 500);
    }
  }
}
