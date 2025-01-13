import { COVERED, FLAG, IN_WALL } from "../../lib/mskai/constants";
import { tileElements } from "./common";

interface EdgesType {
  [key: string]: number[];
}

interface AroundTilesType {
  tLeft: number,
  tRight: number,
  tUp: number,
  tDown: number,
  tLeftUp: number,
  tLeftDown: number,
  tRightUp: number,
  tRightDown: number,
}

export class Tile {
  public position: number;
  public value: number;
  public probability: number;

  constructor(position: number, value: number = 9) {
    this.position = position;
    this.value = value;
    this.probability = 0;
    this.ele = this.element();
  }

  public around(cols: number, rows: number): number[] {
    const [x, y] = this.at(this.position, cols, rows);

    // [dx, dy]
    return [-cols-1, -cols, -cols+1, -1, 1, cols-1, cols, cols+1].map(delta => {
      const newPosition = this.position + delta;
      const [newX, newY] = this.at(newPosition, cols, rows);
      if (
        Math.abs(newX - x) <= 1 &&
        Math.abs(newY - y) <= 1 &&
        newX >= 0 && newY >= 0 &&
        newX < cols && newY < rows
      ) {
          return newPosition;
      }
    }).filter(position => position !== undefined);
  }

  public aroundWithLabel(cols: number, rows: number): AroundTilesType {
    return {};
  }

  public isOpened(): boolean {
    return (this.value > 0 && this.value < COVERED);
  }

  public isCovered(): boolean {
    return this.value === COVERED;
  }

  public isNotCovered(): boolean {
    return !this.isCovered();
  }

  public at(position: number, cols: number, rows: number): [number, number] {
    const x = position % cols;
    const y = (position - x) / cols;
    return [x, y];
  }

  public decrement() {
    if (0 < this.value && this.value < COVERED) {
      this.value -= 1;
    }
  }

  public element(): HTMLImageElement {
    return tileElements()[this.position];
  }

  public edges(cols: number, rows: number): EdgesType {
    const [x, y] = this.at(this.position, cols, rows);

    const edges = {
      // left: (x > 0) ? this.edge([-cols-1, -1, cols-1]) : IN_WALL,
      // right: (x < cols-1) ? this.edge([-cols+1, 1, cols+1]) : IN_WALL,
      // top: (y > 0) ? this.edge([-cols-1, -cols, -cols+1]) : IN_WALL,
      // bottom: (y < rows-1) ? this.edge([cols-1, cols, cols+1]) : IN_WALL,
      left: [this.leftUp, this.left, this.leftDown].map(fn => fn.call(this, cols, rows)).filter(idx => idx>=0),
      right: [this.rightUp, this.right, this.rightDown].map(fn => fn.call(this, cols, rows)).filter(idx => idx>=0),
      top: [this.leftUp, this.up, this.rightUp].map(fn => fn.call(this, cols, rows)).filter(idx => idx>=0),
      bottom: [this.leftDown, this.down, this.rightDown].map(fn => fn.call(this, cols, rows)).filter(idx => idx>=0),
    };
    return edges;
  }

  public edge(deltaIndices: number[]): number[] {
    return deltaIndices.map(delta => this.position + delta);
  }

  public up(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    const delta = -cols;
    return (y > 0) ? this.position + delta : IN_WALL;
  }

  public down(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    const delta = cols;
    return (y < rows-1) ? this.position + delta : IN_WALL;
  }

  public left(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return (x > 0) ? this.position -1 : IN_WALL;
  }

  public right(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return (x < cols-1) ? this.position + 1 : IN_WALL;
  }

  public rightUp(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return ((x < cols-1) && (y > 0)) ? this.position - cols + 1 : IN_WALL;
  }

  public rightDown(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return ((x < cols-1) && (y < rows-1)) ? this.position + cols + 1 : IN_WALL;
  }

  public leftUp(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return ((x > 0) && (y > 0)) ? this.position - cols - 1 : IN_WALL;
  }

  public leftDown(cols: number, rows: number): number {
    const [x, y] = this.at(this.position, cols, rows);

    return ((x > 0) && (y < rows-1)) ? this.position + cols - 1 : IN_WALL;
  }

}