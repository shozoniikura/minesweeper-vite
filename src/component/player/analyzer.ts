import { AUTO_PILOT, COVERED, FLAG, NEW_FEATURE, PLAY, PROBABILITY } from "../../lib/mskai/constants";
import { getStatus, sortedUniqArray, tileElements } from "./common";
import { Game } from "./game";
import { Tile } from "./tile";
import { EdgesType } from "./tile";

interface gameInfo {
  cols: number;
  rows: number;
  status: number;
  handlerType: number;
}

export const analyzeBtnClicked = (props: gameInfo) => {
  const {cols, rows, handlerType} = props;
  const game = new Game(cols, rows);
  switch (handlerType) {
    case AUTO_PILOT:
      game.start();
      break;
    case NEW_FEATURE:
      console.log('NEW_FEATURE');
      game.newFeature();
      break;
    case PROBABILITY:
      console.log('PROBABILITY');
      game.processUncertainty(0);
      break;
    default:
      game.start();
      break;
  }
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

  // 次のような配置を見つけたらフラグを立てる
  // ___    ___
  // _21 -> _21
  // CCC    FCC
  public searchTheoreticalMines(tiles: Tile[]): number[] {
    const tilesWithTwo = tiles.filter(tile => tile.value === 2);
    // console.log(tilesWithTwo);
    const mines: number[] = [];
    tilesWithTwo.forEach(tile => {
      const edges: { [key: string]: Tile[] } = {};
      const edgeIndices: EdgesType = tile.edges(this.cols, this.rows);
      Object.keys(edgeIndices).forEach(key => {
        edges[key] = edgeIndices[key].map((idx: number) => tiles[idx]);
      });
      if (tiles[tile.left(this.cols, this.rows)]?.value === 1
      && tiles[tile.right(this.cols, this.rows)].isNotCovered()) {
        if (this.isOpenedEdge(edges['top']) && this.isCoveredEdge(edges['bottom'])) {
          mines.push(tile.rightDown(this.cols, this.rows));
        }
        if (this.isOpenedEdge(edges['bottom']) && this.isCoveredEdge(edges['top'])) {
          mines.push(tile.rightUp(this.cols, this.rows));
        }
      }
      if (tiles[tile.right(this.cols, this.rows)]?.value === 1
      && tiles[tile.left(this.cols, this.rows)].isNotCovered()) {
        if (this.isOpenedEdge(edges['top']) && this.isCoveredEdge(edges['bottom'])) {
          mines.push(tile.leftDown(this.cols, this.rows));
        }
        if (this.isOpenedEdge(edges['bottom']) && this.isCoveredEdge(edges['top'])) {
          mines.push(tile.leftUp(this.cols, this.rows));
        }
      }
      if (tiles[tile.up(this.cols, this.rows)]?.value === 1
      && tiles[tile.down(this.cols, this.rows)].isNotCovered()) {
        if (this.isOpenedEdge(edges['left']) && this.isCoveredEdge(edges['right'])) {
          mines.push(tile.rightDown(this.cols, this.rows));
        }
        if (this.isOpenedEdge(edges['right']) && this.isCoveredEdge(edges['left'])) {
          mines.push(tile.leftDown(this.cols, this.rows));
        }
      }
      if (tiles[tile.down(this.cols, this.rows)]?.value === 1
      && tiles[tile.up(this.cols, this.rows)].isNotCovered()) {
        if (this.isOpenedEdge(edges['left']) && this.isCoveredEdge(edges['right'])) {
          mines.push(tile.rightUp(this.cols, this.rows));
        }
        if (this.isOpenedEdge(edges['right']) && this.isCoveredEdge(edges['left'])) {
          mines.push(tile.leftUp(this.cols, this.rows));
        }
      }
    });
    return mines;
  }

  // 次のような配置を見つけたらタイルを開けられる
  // ___?    ___?
  // _11? -> _11?
  // _CCC    _CCX
  public searchTheoreticalOpenableTiles(tiles: Tile[]): number[] {
    const covered: number[] = this.coveredTiles();
    const tilesWithOne: Tile[] = tiles.filter(tile => tile.value === 1);
    const ret: number[] = [];
    tilesWithOne.forEach(tile => {
      const edges: EdgesType = tile.edges(this.cols, this.rows);
      const idxUp = tile.up(this.cols, this.rows);
      const idxRight = tile.right(this.cols, this.rows);
      const idxDown = tile.down(this.cols, this.rows);
      const idxLeft = tile.left(this.cols, this.rows);
      const idxRightDown = tile.rightDown(this.cols, this.rows);
      const idxRightRightDown = tiles[idxRightDown]?.right(this.cols, this.rows);
      const idxDownRightDown = tiles[idxRightDown]?.down(this.cols, this.rows);
      const idxLeftDown = tile.leftDown(this.cols, this.rows);
      const idxLeftLeftDown = tiles[idxLeftDown]?.left(this.cols, this.rows);
      const idxDownLeftDown = tiles[idxLeftDown]?.down(this.cols, this.rows);
      const idxRightUp = tile.rightUp(this.cols, this.rows);
      const idxRightRightUp = tiles[idxRightUp]?.right(this.cols, this.rows);
      const idxUpRightUp = tiles[idxRightUp]?.up(this.cols, this.rows);
      const idxLeftUp = tile.leftUp(this.cols, this.rows);
      const idxUpLeftUp = tiles[idxLeftUp]?.up(this.cols, this.rows);
      const idxLeftLeftUp = tiles[idxLeftUp]?.left(this.cols, this.rows);
      if (covered.includes(idxDown)) {
        if (covered.includes(idxRightDown) && covered.includes(idxRightRightDown)) {
          if (tiles[idxRight].value === 1) {
            if (this.isOpenedEdge(edges.left.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.top.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxRightRightDown);
            }
          }
        } else if (covered.includes(idxLeftDown) && covered.includes(idxLeftLeftDown)) {
          if (tiles[idxLeft].value === 1) {
            if (this.isOpenedEdge(edges.right.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.top.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxLeftLeftDown);
            }
          }
        }
      }
      if (covered.includes(idxUp)) {
        if (covered.includes(idxRightUp) && covered.includes(idxRightRightUp)) {
          if (tiles[idxRight].value === 1) {
            // debugger
            if (this.isOpenedEdge(edges.left.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.bottom.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxRightRightUp);
            }
          }
        } else if (covered.includes(idxLeftUp) && covered.includes(idxLeftLeftUp)) {
          if (tiles[idxLeft].value === 1) {
            if (this.isOpenedEdge(edges.right.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.bottom.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxLeftLeftUp);
            }
          }
        }
      }
      if (covered.includes(idxLeft)) {
        if (covered.includes(idxLeftUp) && covered.includes(idxUpLeftUp)) {
          if (tiles[idxUp].value === 1) {
            if (this.isOpenedEdge(edges.right.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.bottom.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxUpLeftUp);
            }
          }
        } else if (covered.includes(idxLeftDown) && covered.includes(idxDownLeftDown)) {
          if (tiles[idxDown].value === 1) {
            if (this.isOpenedEdge(edges.right.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.top.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxDownLeftDown);
            }
          }
        }
      }
      if (covered.includes(idxRight)) {
        if (covered.includes(idxRightUp) && covered.includes(idxUpRightUp)) {
          if (tiles[idxUp].value === 1) {
            if (this.isOpenedEdge(edges.left.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.bottom.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxUpRightUp);
            }
          }
        } else if (covered.includes(idxRightDown) && covered.includes(idxDownRightDown)) {
          if (tiles[idxDown].value === 1) {
            if (this.isOpenedEdge(edges.left.map((idx: number) => tiles[idx])) &&
                this.isOpenedEdge(edges.top.map((idx: number) => tiles[idx]))
            ) {
              ret.push(idxDownRightDown);
            }
          }
        }
      }
    });
    // ret.forEach(idx => console.log(tiles[idx].ele));
    return ret;
  }

  public isCoveredEdge(edge: Tile[]): boolean {
    return edge.map(tile => tile.value)
      .reduce((prev, value) => prev && value === COVERED, true);
  }

  public isOpenedEdge(edge: Tile[]): boolean {
    return edge.map(tile => tile.value)
      .reduce((prev, value) => prev && value < COVERED, true);
  }

  // 一つも開いていない場合は true
  public isAllCovered(): boolean {
    return this.tiles.reduce((prev, current) => prev && (current == COVERED || current == FLAG), true);
  }

  // 開いていないタイルのIndexを全て返す
  public coveredTiles(): number[] {
    return this.tiles.map((tile, idx) => {
      if (tile === COVERED) {
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

  // private isProccessedTiles(): number[] {
  //   return this.tiles.map((tile, idx) => {
  //     if (tile < COVERED) {
  //       return idx;
  //     }
  //   }).filter(idx => idx !== undefined);
  // }

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

  public cloneTiles(): Tile[] {
    this.read();
    return this.tiles.map((value, idx) => new Tile(idx, value));
  }

  /**
   * 地雷が存在する可能性のあるタイルを探索する
   * 開いているタイルの周囲8マスを調べ、以下の条件を満たすタイルを地雷候補とする：
   * - 周囲に未開封タイルが存在する（countCovered > 0）
   * - 周囲の旗の数が、タイルの数字より少ない（countFlag < tile.value）
   * @returns 地雷候補のタイルインデックスを昇順ソートした配列
   */
  public searchPotentialMines(): number[] {
    // ゲーム盤面の状態を読み込む
    this.read();
    const potentialMines: number[] = [];
    // 未開封タイルと開いているタイルのインデックスを取得
    const coveredTiles = this.coveredTiles();
    const isOpenedTiles = this.isOpenedTiles();

    // 開いているタイルそれぞれについて周囲8マスをチェック
    isOpenedTiles.forEach(tileIdx => {
      const tile = new Tile(tileIdx, this.tiles[tileIdx]);
      const aroundTiles = tile.around(this.cols, this.rows);
      let countCovered = 0;  // 周囲の未開封タイル数
      let countFlag = 0;     // 周囲の旗の数

      // 周囲8マスの状態をカウント
      aroundTiles.forEach(position => {
        if (this.tiles[position] >= COVERED) {
          countCovered++;
        }
        if (this.tiles[position] === FLAG) {
          countFlag++;
        }
      });

      // 未開封タイルがあり、かつ旗の数が数字より少ない場合
      if (countCovered > 0 && countFlag < tile.value) {
        // 周囲の未開封タイルを地雷候補として追加（重複は除外）
        aroundTiles.forEach(idx => {
          if (coveredTiles.includes(idx) && !potentialMines.includes(idx)) {
            potentialMines.push(idx);
          }
        });
      }
    });

    // 地雷候補のインデックスを昇順にソートして返す
    const ret = potentialMines.sort((first: number, second: number) => first - second);
    console.log(ret);
    return ret;
  }

  /**
   * 確実に地雷ではないタイルを探索する
   * @param tiles 簡略化されたボード状態
   * @returns 地雷ではないと確定できるタイルのインデックスを昇順ソートした配列
   */
  public searchSafeTiles(tiles: Tile[]): number[] {
    const safeTiles: number[] = [];
    const openedTiles = tiles.filter(tile => tile.value > 0 && tile.value < COVERED);

    // 数字「1」のタイルを処理
    openedTiles.forEach(tile => {
        if (tile.value !== 1) return;

        // このタイルに隣接する未開封タイルを取得
        const aroundTiles = tile.around(this.cols, this.rows);
        const coveredTiles = aroundTiles.filter(idx => 
            tiles[idx].value === COVERED || tiles[idx].value === FLAG
        );

        // 隣接する未開封タイルが2つある場合、そのいずれかが地雷
        if (coveredTiles.length === 2) {
            // この2つの未開封タイルに隣接する他の「1」のタイルを探す
            coveredTiles.forEach(coveredIdx => {
                const adjacentTiles = new Tile(coveredIdx, COVERED).around(this.cols, this.rows);
                adjacentTiles.forEach(adjIdx => {
                    const adjTile = tiles[adjIdx];
                    if (adjTile.value === 1 && adjTile.position !== tile.position) {
                        // 隣接する「1」のタイルの周囲の未開封タイルを取得
                        const adjAroundTiles = adjTile.around(this.cols, this.rows);
                        const adjCoveredTiles = adjAroundTiles.filter(idx => 
                            tiles[idx].value === COVERED || tiles[idx].value === FLAG
                        );

                        // この「1」のタイルが元の2つの未開封タイルを含んでいる場合
                        const sharedTiles = coveredTiles.filter(idx => 
                            adjCoveredTiles.includes(idx)
                        );
                        if (sharedTiles.length === 2) {
                            // それ以外の未開封タイルは安全
                            adjCoveredTiles.forEach(idx => {
                                if (!sharedTiles.includes(idx) && !safeTiles.includes(idx)) {
                                    safeTiles.push(idx);
                                }
                            });
                        }
                    }
                });
            });
        }
    });

    return safeTiles.sort((a, b) => a - b);
  }
}
