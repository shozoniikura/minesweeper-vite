export class Tile {
  public position: number;
  public value: number;

  constructor(position: number, value: number = 9) {
    this.position = position;
    this.value = value;
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
}