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
      if (mineIndices.length > 0) {
        this.player.markFlags(mineIndices);
        setTimeout(()=>this.start(count+1), 500);
      } else {
        const openableIndices = this.analyzer.searchTheoreticalOpenableTiles(tiles);
        if (openableIndices.length > 0) {
          this.player.openOpenableTiles(openableIndices);
          setTimeout(()=>this.start(count+1), 500);
        } else {
          // // 不確実な場合
          // this.processUncertainty(count);
          // setTimeout(()=>this.start(count+1), 500);
        }
      }
    }
  }

  public newFeature() {
    // 地雷の場所を検索してフラグを立てる
    const bombs = this.analyzer.searchBombs();
    this.player.markFlags(bombs);

    // 開けられるタイルを検索する
    const openableTiles = this.analyzer.openableTiles();

    const countBombs = bombs.length;
    const countOpenable = openableTiles.length;
    if (countBombs + countOpenable > 0) {
      // 確実性のある処理（マークしたり、タイルを開けた）の場合は再度呼び出す
      this.player.openOpenableTiles(openableTiles);
    }

    const tiles: Tile[] = this.simplifyBoard();
    // 理論的な地雷の位置を検索
    const mineIndices = this.analyzer.searchTheoreticalMines(tiles);
    console.log(mineIndices);
    this.player.markFlags(mineIndices);

    const tiles2: Tile[] = this.simplifyBoard();
    // 潜在的な地雷の位置も検索
    const mineIndices2 = this.analyzer.searchPotentialMines();

    // 両方の結果をマージして重複を除去
    // const allMineIndices = [...new Set([...mineIndices, ...mineIndices2])];
    const allMineIndices = [...new Set([...mineIndices2])];

    // 地雷の可能性のあるタイルをハイライト
    allMineIndices.forEach(idx => {
      this.player.highlightTile(idx);
    });

    // 既存の開けられるタイルの処理
    const openableIndices = this.analyzer.searchTheoreticalOpenableTiles(tiles);
    if (openableIndices.length > 0) {
      // openableIndices.forEach(idx => tiles[idx].ele.setAttribute('src', ''));
      this.player.openOpenableTiles(openableIndices);
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
    return tiles;
  }

  // 地雷も開けられるタイルも判らない場合は、確率だけで検索する
  public processUncertainty(count: number) {
    if (this.analyzer.isAllCovered()) {
      const covered = this.analyzer.coveredTiles();
      const choice = [covered[Math.floor(Math.random() * covered.length)]];
      this.player.openOpenableTiles(choice);
      // setTimeout(()=>this.start(count+1), 500);
    } else {
      const target = [this.analyzer.mostOpenableTile()];
      this.player.highlightTile(target[0]);
      setTimeout(() => {
        if (true) {
          this.player.openOpenableTiles(target);
        }
      }, 500);
    }
  }
}
