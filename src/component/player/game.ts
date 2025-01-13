import { COVERED, FLAG, FLAGGED, PLAY } from "../../lib/mskai/constants";
import { Analyzer } from "./analyzer";
import { getStatus, tileElements } from "./common";
import { Player } from "./player";
import { Tile } from "./tile";

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
      // setTimeout(() => this.restartGame(count), 5000);
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
      // 経験上・理論上、地雷があると予想される場所を探す
      const tiles = this.simplifyBoard();
      const mineIndices = this.analyzer.searchTheoreticalMines(tiles);
      console.log("aaa ", mineIndices.map(idx=>tiles[idx].ele));
      if (mineIndices.length > 0) {
        this.player.markFlags(mineIndices);
        setTimeout(()=>this.start(count+1), 500);
      }

      // // 不確実な場合
      // this.processUncertainty(count);
    }
  }

  // Smileボタンをクリックする
  public restartGame(count: number) {
    const smile = document.querySelector('img[data-name="smile"]');
    // 普通のクリックでは無く、 MouseUp イベントを発火させる
    smile?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
    this.start(count+1);
  }

  public simplifyBoard(): Tile[] {
    const tiles = this.analyzer.cloneTiles();
    tiles.forEach(tile => {
      if (tile.value === FLAG) {
        tile.around(this.cols, this.rows).forEach(aIdx => tiles[aIdx].decrement());
        tile.value = 0;
      }
    });
    // console.log(tiles);
    return tiles;
    // .filter(tile => tile.value > 0);
  }


  // 地雷も開けられるタイルも判らない場合は、確率だけで検索する
  public processUncertainty(count: number) {
    if (this.analyzer.isAllCovered()) {
      const covered = this.analyzer.coveredTiles();
      const choice = [covered[Math.floor(Math.random() * covered.length)]];
      this.player.openOpenableTiles(choice);
      setTimeout(()=>this.start(count+1), 500);
    } else {
      // const indices = this.analyzer.searchTheoreticalMines(tiles);
      // console.log(indices);
      // const target = [this.analyzer.mostOpenableTile()];
      // const element = tileElements()[target[0]];
      // const src = element.getAttribute('src') || '';
      // element.setAttribute('src', '');
      // setTimeout(() => {
      //   // if (confirm(`target is ${target}`)) {
      //   if (true) {
      //     this.player.openOpenableTiles(target);
      //     setTimeout(()=>this.start(0), 500);
      //   } else {
      //     element.setAttribute('src', src);
      //   }
      // }, 500);
    }
  }
}
