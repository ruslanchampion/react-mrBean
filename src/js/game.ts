class Game {
  size: { x: number, y: number }
  area: number
  grid: Array<Array<number>>
  emptyCells: Array<number>
  filledCells: Array<number>
  fillDensity: number
  lifeSpan: number
  heroPos: { x: number, y: number }
  winPos: { x: number, y: number }
  heroClass: string
  isActive: boolean
  onChange: () => void

  constructor(size: { x: number, y: number },
    fillDensity: number,
    lifeSpan: number,
    winPos: { x: number, y: number },
    onChange: () => void) {
    this.size = size;
    this.area = size.x * size.y;
    this.lifeSpan = lifeSpan;
    this.fillDensity = fillDensity;
    this.isActive = true;
    this.winPos = winPos;
    this.onChange = onChange;
    this.generateGrid();
    console.log(this.emptyCells);
    this.fillGrid();
    this.heroPos = { x: 0, y: this.size.y - 1 };
    this.heroClass = 'game__hero';
  }

  move(vec: { x: number, y: number }) {
    if (this.isActive) {
      const newPos = {
        x: vec.x + this.heroPos.x,
        y: vec.y + this.heroPos.y
      }
      if (((newPos.x < this.size.x) && (newPos.x >= 0)) &&
        ((newPos.y < this.size.y) && (newPos.y >= 0))) {
        this.heroPos.x = newPos.x;
        this.heroPos.y = newPos.y;
      }
      this.checkIfDead();
      this.checkIfWin();
      console.log(newPos);
    }
  }

  checkIfDead() {
    if (this.grid[this.heroPos.x][this.heroPos.y] === 0) {
      this.isActive = false;
      const className = `${this.heroClass} ${this.heroClass}--dead`;
      this.heroClass = className;
      this.onChange();
    }
  }

  checkIfWin() {
    if ((this.heroPos.x === this.winPos.x) && (this.heroPos.y === this.winPos.y)) {
      this.isActive = false;
      const className = `${this.heroClass} ${this.heroClass}--win`;
      this.heroClass = className;
      this.onChange();
    }
  }

  keyToCoord(key: number) {
    return [(key - (Math.floor(key / this.size.x) * this.size.x)), (Math.floor(key / this.size.x))]
  }

  coordToKey(coord: Array<number>) {
    return (coord[0] + (coord[1] * this.size.x))
  }

  generateGrid() {
    this.grid = Array.from(Array(this.size.x))
      .map((itm) => Array.from(Array(this.size.y))
        .map((itm) => 0))
    this.emptyCells = this.grid.reduce((acc, itm, idxX) => {
      acc = acc.concat(itm.reduce((acc, itm, idxY) => {
        if (itm === 0) {
          acc.push(idxX + (idxY * this.size.x))
        }
        return acc
      }, []))
      return acc
    }, [])
    this.filledCells = this.grid.reduce((acc, itm, idxX) => {
      acc = acc.concat(itm.reduce((acc, itm, idxY) => {
        if (itm === 1) {
          acc.push(idxX + (idxY * this.size.x))
        }
        return acc
      }, []))
      return acc
    }, [])
  }

  fillGrid() {
    this.spawnPermanentSpot(this.winPos);
    this.spawnSpot(1, this.coordToKey([0, this.size.y - 1]));
    console.log(this.grid);
    while (this.filledCells.length < this.fillDensity * this.area) {
      this.spawnSpot(1 - (Math.random() * 0.8));
    }
  }

  spawnPermanentSpot(pos: { x: number, y: number }) {
    this.grid[pos.x][pos.y] = 2;
    const key = this.coordToKey([pos.x, pos.y]);
    let idx = this.filledCells.indexOf(key);
    if (idx >= 0) {
      this.filledCells.splice(idx, 1);
    }
    idx = this.emptyCells.indexOf(key);
    if (idx >= 0) {
      this.emptyCells.splice(idx, 1);
    }
  }

  spawnSpot(size: number, key: number = null) {
    if (this.isActive) {
      if (this.emptyCells.length === 0) {
        return
      }
      if (!key) {
        let i = Math.floor(Math.random() * this.emptyCells.length);
        key = this.emptyCells.splice(i, 1)[0];
      } else {
        this.emptyCells.splice(this.emptyCells.indexOf(key), 1);
      }
      let coord: Array<number> = this.keyToCoord(key);
      this.filledCells.push(this.coordToKey(coord));
      this.grid[coord[0]][coord[1]] = size;
      setTimeout(() => {
        if (this.isActive) {
          this.emptyCells.push(key);
          this.filledCells.splice(this.filledCells.indexOf(key), 1);
          this.grid[coord[0]][coord[1]] = 0;
          this.checkIfDead();
        }
      }, (size * this.lifeSpan) * 1000)
      const timeToRespawn = ((size * this.lifeSpan) + (Math.random() * this.lifeSpan * 0.5) * ((Math.random() < 0.5) ? -1 : 1)) * 1000;
      setTimeout(() => this.spawnSpot(1), (size * this.lifeSpan) * 1000);
      this.onChange();

    }
  }


}

export default Game;