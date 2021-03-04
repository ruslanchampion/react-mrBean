import { cell, cellInterface } from './gameCell.ts';
class Grid extends Array<Array<cellInterface>>{
  static dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: 1 },
    { r: 0, c: -1 }
  ]
  constructor(arr: Array<Array<cellInterface>>) {
    super();
    for (let i in arr){
      super.push(arr[i].slice());
    }
    Object.setPrototypeOf(this, Object.create(Grid.prototype));
  }

  dist(pos1: { r: number, c: number }, 
    pos2: { r: number, c: number }) {
      return Math.abs(pos1.r - pos2.r) + Math.abs(pos1.c - pos2.c);
    }

  getNeighbors(cell: { r: number, c: number }) {
    let neighbors: Array<{ r: number, c: number }> = [];
    Grid.dirs.forEach((dir) => {
      const neighbor = {
        r: cell.r + dir.r,
        c: cell.c + dir.c
      }
      if ((neighbor.r >= 0) &&
        (neighbor.r < this.length) &&
        (neighbor.c >= 0) &&
        (neighbor.c < this[0].length)) {
        neighbors.push(neighbor);
      }
    })
    return neighbors;
  }

  getDistanceTable(start: { r: number, c: number }) {
    let distanceTable = this.map((row) => {
      return row.map((val) => Infinity)
    });
    let visitedTable = this.map((row) => {
      return row.map((val) => false)
    });
    let queue = [start];
    distanceTable[start.r][start.c] = 0;
    let cDist: number;
    while (queue.length > 0) {
      let cCell = queue.pop(); 
      visitedTable[cCell.r][cCell.c] = true;
      cDist = distanceTable[cCell.r][cCell.c] + 1
      this.getNeighbors(cCell).forEach((neighbor) => {
        if(!visitedTable[neighbor.r][neighbor.c]
          && this[neighbor.r][neighbor.c].size > 0.1){
          queue.push(neighbor);
        }
        if((distanceTable[neighbor.r][neighbor.c] > cDist) && 
          this[neighbor.r][neighbor.c].size > 0.1){
          distanceTable[neighbor.r][neighbor.c] = cDist;
        }               
      })
    }
    return distanceTable;
  }

  getAccessibilityTable(start: {r: number, c: number}) {
    let queue = [start]
    let accessibilityTable = this.map((row) => 
      row.map((val) => false)
    )
    while(queue.length) {
      let cCell = queue.pop();
      this.getNeighbors(cCell).forEach((neighbor) => {
        if(this[neighbor.r][neighbor.c].size > 0.1){
          if(!accessibilityTable[neighbor.r][neighbor.c]){
            accessibilityTable[neighbor.r][neighbor.c] = true;
            queue.push(neighbor);
          }
        }
      })    
    }
    return accessibilityTable;
  }
}

export default Grid;