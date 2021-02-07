class Game {
  size: { r: number, c: number }
  area: number
  grid: Array<Array<number>>
  emptyCells: Array<number>
  filledCells: Array<number>
  fillDensity: number
  lifeSpan: number
  heroPos: { r: number, c: number }
  winPos: { r: number, c: number }
  heroClass: string
  isActive: boolean
  onChange: () => void

  constructor(size: { r: number, c: number },
    fillDensity: number,
    lifeSpan: number,
    winPos: { r: number, c: number },
    onChange: () => void) {
    this.size = size;
    this.area = size.r * size.c;
    this.lifeSpan = lifeSpan;
    this.fillDensity = fillDensity;
    this.isActive = true;
    this.winPos = winPos;
    this.onChange = onChange;
    this.generateGrid();
    console.log(this.emptyCells);
    this.fillGrid();
    this.heroPos = { r: this.size.r - 1, c: 0 };
    this.heroClass = 'game__hero';
  }

  move(vec: { r: number, c: number }) {
    if (this.isActive) {
      const newPos = {
        r: vec.r + this.heroPos.r,
        c: vec.c + this.heroPos.c
      }
      if (((newPos.r < this.size.r) && (newPos.r >= 0)) &&
        ((newPos.c < this.size.c) && (newPos.c >= 0))) {
        this.heroPos.r = newPos.r;
        this.heroPos.c = newPos.c;
      }
      this.checkIfDead();
      this.checkIfWin();
      console.log(newPos);
    }
  }

  checkIfDead() {
    if (this.grid[this.heroPos.r][this.heroPos.c] === 0) {
      this.isActive = false;
      const className = `${this.heroClass} ${this.heroClass}--dead`;
      this.heroClass = className;
      this.onChange();
    }
  }

  checkIfWin() {
    if ((this.heroPos.r === this.winPos.r) && (this.heroPos.c === this.winPos.c)) {
      this.isActive = false;
      const className = `${this.heroClass} ${this.heroClass}--win`;
      this.heroClass = className;
      this.onChange();
    }
  }

  keyToCoord(key: number) {
    return [(Math.floor(key / this.size.c)), (key - (Math.floor(key / this.size.c) * this.size.c))]
  }

  coordToKey(coord: Array<number>) {
    return (coord[1] + (coord[0] * this.size.c))
  }

  generateGrid() {
    this.grid = Array.from(Array(this.size.r))
      .map((itm) => Array.from(Array(this.size.c))
        .map((itm) => 0))
    this.emptyCells = this.grid.reduce((acc, itm, r) => {
      acc = acc.concat(itm.reduce((acc, itm, c) => {
        if (itm === 0) {
          acc.push(c + (r * this.size.c))
        }
        return acc
      }, []))
      return acc
    }, [])
    this.filledCells = this.grid.reduce((acc, itm, r) => {
      acc = acc.concat(itm.reduce((acc, itm, c) => {
        if (itm === 1) {
          acc.push(c + (r * this.size.c))
        }
        return acc
      }, []))
      return acc
    }, [])
  }

  fillGrid() {
    this.spawnPermanentSpot(this.winPos);
    this.spawnSpot(1, this.coordToKey([this.size.r - 1, 0]));
    console.log(this.grid);
    while (this.filledCells.length < this.fillDensity * this.area) {
      this.spawnSpot(1 - (Math.random() * 0.8));
    }
  }

  spawnPermanentSpot(pos: { r: number, c: number }) {
    this.grid[pos.r][pos.c] = 2;
    const key = this.coordToKey([pos.r, pos.c]);
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