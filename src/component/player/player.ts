import { FLAG, PLAY } from "../../lib/mskai/constants";
import { getStatus, getValueAt, tileElements } from "./common";

// Player は具体的なオペレーションを実行する
export class Player {
  private waitAfterFlag: number;
  private waitAfterOpen: number;
  private waitRead: number;

  constructor() {
    this.waitAfterFlag = 100;
    this.waitAfterOpen = 100;
    this.waitRead = 10;
  }

  // 右クリックしながらフラグを立てる
  public markFlags(indices: number[]) {
    if (indices.length === 0) return

    setTimeout(() => {
      const elements = tileElements();
      const idx: number = indices.shift() || 0;
      const element = elements[idx];
      if (getValueAt(element) !== FLAG) {
        const rightClick = new MouseEvent('contextmenu',
          { bubbles: true, cancelable: true });
        element.dispatchEvent(rightClick);
      }
      this.markFlags(indices);
    }, this.waitAfterFlag);
  }

  // 左クリックしながらタイルを開ける
  public openOpenableTiles(indices: number[]): void {
    const elements = tileElements();
    if (indices.length === 0) return

    setTimeout(() => {
      const idx: number = indices.shift() || 0;
      const status = getStatus();
      if (status === PLAY) {
        // タイルが開いているかどうかは不明だが、そのままクリック
        elements[idx].click();
        setTimeout(getStatus, this.waitRead);
      } else
        console.log(`status is ${status}`);
      this.openOpenableTiles(indices);
    }, this.waitAfterOpen);
  }
}
