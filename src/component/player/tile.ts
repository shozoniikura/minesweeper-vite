import { COVERED, FLAG } from "../../lib/mskai/constants";
import { tileElements } from "./common";

interface EdgesType {
  [key: string]: (number[] | false);
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
      left: (x > 0) && this.edge([-cols-1, -1, cols-1]),
      right: (x < cols-1) && this.edge([-cols+1, 1, cols+1]),
      top: (y > 0) && this.edge([-cols-1, -cols, -cols+1]),
      bottom: (y < rows-1) && this.edge([cols-1, cols, cols+1]),
    };
    return edges;
  }

  public edge(deltaIndices: number[]): number[] {
    return deltaIndices.map(delta => this.position + delta);
  }

  public up(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    const delta = -cols;
    return (y > 0) && this.position + delta
  }

  public down(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    const delta = cols;
    return (y < rows-1) && this.position + delta
  }

  public left(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x > 0) && this.position -1;
  }

  public right(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x < cols-1) && this.position + 1;
  }

  public rightUp(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x < cols-1) && (y > 0) && this.position - cols + 1;
  }

  public rightDown(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x < cols-1) && (y < rows-1) && this.position + cols + 1;
  }

  public leftUp(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x > 0) && (y > 0) && this.position - cols - 1;
  }

  public leftDown(cols: number, rows: number): number|false {
    const [x, y] = this.at(this.position, cols, rows);

    return (x > 0) && (y < rows-1) && this.position + cols - 1;
  }

}