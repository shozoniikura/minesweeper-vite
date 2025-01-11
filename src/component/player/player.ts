import { FLAG, PLAY } from "../../lib/mskai/constants";
import { getStatus, getValueAt, tileElements } from "./common";

// Player は具体的なオペレーションを実行する
export class Player {
  constructor() { }

  public markFlags(indecies: number[]) {
    if (indecies.length === 0) return

    setTimeout(() => {
      const elements = tileElements();
      const idx: number = indecies.shift() || 0;
      const element = elements[idx];
      if (getValueAt(element) !== FLAG)
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
      this.markFlags(indecies);
    }, 100);
  }

  public openOpenableTiles(indecies: number[]): void {
    const elements = tileElements();
    if (indecies.length === 0) return

    setTimeout(() => {
      const idx: number = indecies.shift() || 0;
      const status = getStatus();
      if (status === PLAY) {
        elements[idx].click();
        setTimeout(getStatus, 10);
      } else
        console.log(`status is ${status}`);
      this.openOpenableTiles(indecies);
    }, 100);
  }

}
