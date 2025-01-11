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
    this.status = getStatus();
  }

  public start(count: number = 0) {
    this.player = new Player();
    this.analyzer = new Analyzer(this.cols, this.rows);

    if (this.analyzer.status !== PLAY) {
      setTimeout(() => {
        const smile = document.querySelector('img[data-name="smile"]');
        smile?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
        setTimeout(()=>this.start(count+1), 1000);
      }, 5000);
      return;
    }
  
    console.log("ANLYZING2...", this.analyzer, count);
    const bombs = this.analyzer.searchBombs();
    const countBombs = bombs.length;
    console.log("bobms are ", bombs);
    this.player.markFlags(bombs);
    const openableTiles = this.analyzer.openableTiles();
    const countOpenable = openableTiles.length;
    console.log("openables are", openableTiles);
    if (countBombs + countOpenable > 0) {
      this.player.openOpenableTiles(openableTiles);
      setTimeout(()=>this.start(count+1), 500);
    } else {
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
          if (true || confirm(`target is ${target}`)) {
            this.player.openOpenableTiles(target);
            setTimeout(()=>this.start(0), 500);
          } else {
            element.setAttribute('src', src);
          }
        }, 500);
      }
    }
  }
}
