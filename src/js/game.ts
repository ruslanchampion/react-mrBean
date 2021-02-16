import Grid from './grid.ts';
import '../assets/music/coffin.mp3';
import '../assets/music/main.mp3';

interface GameInterface {
  size: { r: number, c: number },
  fillDensity: number,
  lifeSpan: number,
  winPos: { r: number, c: number },
  onChange: () => void,
  fps?: number
}

class Game {
  size: { r: number, c: number }
  area: number
  grid: Grid
  fps: number
  pathGrid: Array<Array<boolean>>
  emptyCells: Array<number>
  filledCells: Array<number>
  fillDensity: number
  lifeSpan: number
  heroPos: { r: number, c: number }
  winPos: { r: number, c: number }
  heroClass: string
  heroClasses: Set<string>
  isActive: boolean
  sound: HTMLAudioElement
  onPause: boolean
  onDeadSound: HTMLAudioElement
  stepsCounter: number
  updateInterval: number
  schedule: { [step: number]: () => void }
  onChange: () => void

  constructor({
    size,
    fillDensity,
    lifeSpan,
    winPos,
    onChange,
    fps = 24
  }: GameInterface) {
    this.fps = fps;
    this.size = size;
    this.area = size.r * size.c;
    this.lifeSpan = lifeSpan;
    this.fillDensity = fillDensity;
    this.onPause = false;
    this.isActive = true;
    this.winPos = winPos;
    this.heroPos = { r: this.size.r - 1, c: 0 };
    this.onChange = onChange;
    this.newGame();
    this.onDeadSound = new Audio('../assets/music/coffin.mp3');
    this.onDeadSound.volume = 0.3;
    console.log(this.onDeadSound);
    this.heroClasses = new Set(['game__hero', 'game__hero--active']);
    this.heroClass = 'game__hero game__hero--active';
    console.log(this.grid);
    this.upDate = this.upDate.bind(this);
    this.updateInterval = window.setInterval(this.upDate, 1000 / this.fps);
  }

  newGame() {
    if(this.sound) {
      this.sound.pause();
    }
    this.sound = new Audio('../assets/music/main.mp3');
    this.sound.volume = 0.3;
    this.sound.play();
    this.schedule = {};
    this.isActive = true;
    this.stepsCounter = 0;
    this.generateGrid();
    this.fillGrid();
    this.heroPos = { r: this.size.r - 1, c: 0 };
    this.generatePathGrid();
    this.heroClasses = new Set(['game__hero', 'game__hero--active']);
    if (this.isActive) {
      this.heroClass = 'game__hero game__hero--active';
    } else {
      this.heroClass = 'game__hero';
    }
    this.onChange();
  }

  pause() {
    if(this.sound) {
      this.sound.pause();
    }
    this.onPause = true;
    this.heroClasses.add('game__hero--paused');
    if (this.isActive) {
    clearInterval(this.updateInterval);
    }
    this.onChange();
  }

  play() {
    if(this.sound) {
      this.sound.play();
    }
    this.onPause = false;
    this.heroClasses.delete('game__hero--paused');
    console.log(this.heroClasses);
    if (this.isActive) {
      this.updateInterval = window.setInterval(this.upDate, 1000 / this.fps);
    }
    this.onChange();
  }

  getHeroClass() {
    return Array.from(this.heroClasses).reduce((acc, itm) => {
      acc.push(itm);
      return acc;
    }, []).join(' ');
  }

  upDate() {
    this.stepsCounter += 1;
    for (let r in this.grid) {
      const row = this.grid[r];
      for (let c in row) {
        let val = row[c];
        if ((val > 0) && (val <= 1)) {
          val -= (1 / (this.lifeSpan * this.fps));
          if (val <= 0) {
            this.onCellDie({ r: Number(r), c: Number(c) });
            val = 0;
          }
          this.grid[r][c] = val;
        }
      }
    }
    const action = this.schedule[this.stepsCounter];
    if (action) {
      action();
      delete this.schedule[this.stepsCounter];
    }
    this.onChange();
  }

  onCellDie(pos: { r: number, c: number }) {
    if (this.isActive) {
      const key = this.posToKey(pos);
      this.emptyCells.push(key);
      this.filledCells.splice(this.filledCells.indexOf(key), 1);
      this.grid[pos.r][pos.c] = 0;
      this.checkIfDead();
      this.generatePathGrid();
    }
  }

  getClosestAccessibleCell(pos: { r: number, c: number }) {
    let accessabitityTable = this.grid.getAccessibilityTable(pos);
    return accessabitityTable.reduce((acc, row, r) => {
      acc = row.reduce((acc, val, c) => {
        if (val) {
          if (this.grid.dist({ r, c }, this.winPos) < this.grid.dist(acc, this.winPos)) {
            acc = { r, c }
          }
        }
        return acc;
      }, acc)
      return acc;
    }, pos);
  }

  generatePathGrid() {
    let path = this.getPath();
    this.pathGrid = Array.from(Array(this.size.r))
      .map((itm) => Array.from(Array(this.size.c))
        .map((itm) => false));
    path.forEach((itm) => {
      this.pathGrid[itm.r][itm.c] = true;
    })
  }

  getPath() {
    let target = this.getClosestAccessibleCell(this.heroPos);
    let pos = {
      r: this.heroPos.r,
      c: this.heroPos.c
    }
    let path = [pos];
    let distanceTable = this.grid.getDistanceTable(target);
    while ((pos.r !== target.r) ||
      (pos.c !== target.c)) {
      pos = this.grid.getNeighbors(pos).reduce((acc, neighbor) => {
        if (distanceTable[neighbor.r][neighbor.c] < distanceTable[acc.r][acc.c]) {
          acc = neighbor;
        }
        return acc
      }, pos);
      path.push(pos);
    }
    return path;
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
      this.generatePathGrid()
    }
  }

  checkIfDead() {
    if (this.grid[this.heroPos.r][this.heroPos.c] === 0) {
      if(this.sound) {
        this.sound.pause();
      }
      this.sound = this.onDeadSound;
      this.sound.play();
      this.isActive = false;
      this.heroClasses.delete('game__hero--paused');
      this.heroClasses.add('game__hero--dead');
      this.onDeadSound.play();
      this.onChange();
      clearInterval(this.updateInterval);
    }
  }

  checkIfWin() {
    if ((this.heroPos.r === this.winPos.r) && (this.heroPos.c === this.winPos.c)) {
      this.isActive = false;
      const className = 'game__hero game__hero--win';
      this.heroClass = className;
      this.onChange();
      clearInterval(this.updateInterval);
    }
  }

  keyToCoord(key: number) {
    return [(Math.floor(key / this.size.c)), (key - (Math.floor(key / this.size.c) * this.size.c))]
  }

  coordToKey(coord: Array<number>) {
    return (coord[1] + (coord[0] * this.size.c))
  }

  posToKey(pos: { r: number, c: number }) {
    return (pos.c + (pos.r * this.size.c))
  }

  generateGrid() {
    const grid = Array.from(Array(this.size.r))
      .map((itm) => Array.from(Array(this.size.c))
        .map((itm) => 0))
    console.log(typeof grid);
    this.grid = new Grid(grid)
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
      this.generatePathGrid();
      //const timeToRespawn = ((size * this.lifeSpan) + (Math.random() * this.lifeSpan * 0.5) * ((Math.random() < 0.5) ? -1 : 1)) * 1000;
      //setTimeout(() => this.spawnSpot(1), (size * this.lifeSpan) * 1000);
      const stepsToRespawn = Math.floor(this.stepsCounter + (size * this.lifeSpan) * this.fps);
      this.schedule[stepsToRespawn] = () => this.spawnSpot(1);
      this.onChange();
    }
  }
}

export default Game;