import Grid from './grid.ts';
import { cell, cellInterface } from './gameCell.ts';
import '../assets/music/coffin.mp3';
import '../assets/music/main.mp3';
import '../assets/music/hop.wav';

interface GameInterface {
  autoplay: boolean,
  musicVolume: number,
  soundsVolume: number,
  size: { r: number, c: number },
  fillDensity: number,
  lifeSpan: number,
  winPos: { r: number, c: number },
  onChange: () => void,
  fps?: number
}

class Game {
  score: number
  autoplayTimeout: number
  autoplay: boolean
  musicVolume: number
  soundsVolume: number
  size: { r: number, c: number }
  area: number
  grid: Grid
  fps: number
  pathGrid: Array<Array<boolean>>
  emptyCells: Array<number>
  filledCells: Array<number>
  fillDensity: number
  lifeSpan: number
  scoreProbability: number
  heroPos: { r: number, c: number }
  winPos: { r: number, c: number }
  heroClass: string
  heroClasses: Set<string>
  isActive: boolean
  music: HTMLAudioElement
  onPause: boolean
  onDeadSound: HTMLAudioElement
  onMoveSound: HTMLAudioElement
  stepsCounter: number
  updateInterval: number
  schedule: { [step: number]: () => void }
  onChange: () => void

  constructor(config: GameInterface) {
    this.setConfig(config);
    this.onPause = false;
    this.isActive = true;
    this.heroPos = { r: this.size.r - 1, c: 0 };
    this.onDeadSound = new Audio('../assets/music/coffin.mp3');
    this.onMoveSound = new Audio('../assets/music/hop.wav');
    this.heroClasses = new Set(['game__hero', 'game__hero--active']);
    this.heroClass = 'game__hero game__hero--active';
    this.upDate = this.upDate.bind(this);
    this.newGame();
  }

  setConfig({
    musicVolume,
    soundsVolume,
    size,
    fillDensity,
    lifeSpan,
    winPos,
    onChange,
    fps = 24
  }: GameInterface) {
    if (this.isActive) {
      this.pause();
    }

    this.musicVolume = musicVolume;
    this.soundsVolume = soundsVolume;
    this.fps = fps;
    this.size = size;
    this.area = size.r * size.c;
    this.lifeSpan = lifeSpan;
    this.fillDensity = fillDensity;
    this.winPos = winPos;
    this.scoreProbability = 0.1;
    this.onChange = onChange;
  }

  newGame() {
    this.score = 0;
    this.autoplay = false;
    this.autoPlayStop();
    if (this.music) {
      this.music.pause();
    }
    this.onMoveSound.volume = this.soundsVolume;
    this.onDeadSound.volume = this.soundsVolume / 2;
    this.music = new Audio('../assets/music/main.mp3');
    this.music.autoplay = true;
    this.music.loop = true;
    this.music.volume = this.musicVolume;
    this.music.play();
    this.schedule = {};
    this.isActive = true;
    this.onPause = false;
    this.stepsCounter = 0;
    this.generateGrid();
    this.fillGrid();
    this.heroPos = { r: this.size.r - 1, c: 0 };
    this.generateMove();
    this.heroClasses = new Set(['game__hero', 'game__hero--active']);
    if (this.isActive) {
      this.heroClass = 'game__hero game__hero--active';
    } else {
      this.heroClass = 'game__hero';
    }
    this.onChange();
    clearInterval(this.updateInterval);
    this.updateInterval = window.setInterval(this.upDate, 1000 / this.fps);
  }

  setMusicVolume(volume: number) {
    this.music.volume = volume;
    this.musicVolume = volume;
  }

  setSoundsVolume(volume: number) {    
    this.soundsVolume = volume;
    this.onMoveSound.volume = this.soundsVolume;
    this.onDeadSound.volume = this.soundsVolume / 2;
  }

  autoPlayStart() {
    console.log('autoplay start');
    this.autoplay = true;
    this.autoplayTimeout = window.setTimeout(() => { this.makeMove() }, 1000)
  }

  autoPlayStop() {
    console.log('autoplay stop');
    window.clearTimeout(this.autoplayTimeout);
  }

  makeMove() {
    if (this.autoplay) {
      let target = this.generateMove();
      if (target) {
        let move = {
          r: target.r - this.heroPos.r,
          c: target.c - this.heroPos.c,
        }        
        console.log(move);
        this.move(move);
      }
      this.autoplayTimeout = window.setTimeout(() => { this.makeMove() }, 1000)
    }
  }

  pause() {
    if (this.music) {
      this.music.pause();
    }
    this.onPause = true;
    this.heroClasses.add('game__hero--paused');
    if (this.isActive) {
      clearInterval(this.updateInterval);
      if (this.autoplay) {
        this.autoPlayStop();
      }
    }
    
    this.onChange();
  }

  play() {
    if (this.onPause) {
      if (this.music) {
        this.music.play();
      }
      this.heroClasses.delete('game__hero--paused');
      if (this.isActive) {
        this.updateInterval = window.setInterval(this.upDate, 1000 / this.fps);
        if (this.autoplay) {
          this.autoPlayStart();
        }
      }
      this.onPause = false;
      this.onChange();
    }
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
        let val = row[c].size;
        if ((val > 0) && (val <= 1)) {
          val -= (1 / (this.lifeSpan * this.fps));
          if (val <= 0) {
            this.onCellDie({ r: Number(r), c: Number(c) });
            val = 0;
          }
          this.grid[r][c].size = val;
        }
      }
    }
    const action = this.schedule[this.stepsCounter];
    if (action) {
      action();
      delete this.schedule[this.stepsCounter];
    }
    if (this.autoplay) {

    }
    this.onChange();
  }

  onCellDie(pos: { r: number, c: number }) {
    if (this.isActive) {
      const key = this.posToKey(pos);
      this.emptyCells.push(key);
      this.filledCells.splice(this.filledCells.indexOf(key), 1);
      this.grid[pos.r][pos.c].size = 0;
      this.grid[pos.r][pos.c].content = 0;
      this.checkIfDead();
      this.generateMove();
    }
  }

  getClosestAccessibleCell(pos: { r: number, c: number }, target: { r: number, c: number }) {
    let accessabitityTable = this.grid.getAccessibilityTable(pos);
    return accessabitityTable.reduce((acc, row, r) => {
      acc = row.reduce((acc, val, c) => {
        if (val) {
          if (this.grid.dist({ r, c }, target) < this.grid.dist(acc, target)) {
            acc = { r, c }
          }
        }
        return acc;
      }, acc)
      return acc;
    }, pos);
  }

  getScoredCells() {
    return this.grid.reduce((acc: Array<{r: number, c: number}>, row: Array<cellInterface>, r: number) => {
      row.forEach((cell, c) => {
        if (cell.content > 0) {
          acc.push({ r, c })
        }
      })
      return acc;
    }, [])
  }

  generateMove() {
    let scoredCells = this.getScoredCells();
    if (scoredCells.length > 0) {
      let paths = scoredCells.map((cell: {r: number, c: number}) => this.getPath(cell));
      let successfullPaths = paths.filter((path: Array<{r: number, c: number}>, idx: number) => {
        let target = scoredCells[idx];
        let pathEnd = path[path.length - 1];
        return ((pathEnd.r === target.r) && (pathEnd.c === target.c))
      });
      successfullPaths.sort((a: Array<{r: number, c: number}>, b: Array<{r: number, c: number}>) => a.length - b.length);
      let path;
      if (successfullPaths.length > 0) {
        path = successfullPaths[0];
      } else {
        scoredCells.sort((a, b) => this.grid.dist(a, this.heroPos) - this.grid.dist(b, this.heroPos));
        path = this.getPath(scoredCells[0]);
      }
      this.pathGrid = Array.from(Array(this.size.r))
        .map((itm) => Array.from(Array(this.size.c))
          .map((itm) => false));
      path.forEach((itm) => {
        this.pathGrid[itm.r][itm.c] = true;
      })
      return path[1];
    } else {
      return null;
    }

  }

  getPath(target: { r: number, c: number }) {
    target = this.getClosestAccessibleCell(this.heroPos, target);
    let pos = {
      r: this.heroPos.r,
      c: this.heroPos.c
    }
    let path = [pos];
    let distanceTable = this.grid.getDistanceTable(target);
    while ((pos.r !== target.r) ||
      (pos.c !== target.c)) {
      pos = this.grid.getNeighbors(pos).reduce((acc: {r: number, c: number}, neighbor: {r: number, c: number}) => {
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
        this.onMoveSound.play();
      }
      this.checkIfDead();
      this.checkIfWin();
      this.checkIfGotScore();
      this.generateMove();
    }
  }

  checkIfDead() {
    if (this.grid[this.heroPos.r][this.heroPos.c].size === 0) {
      if (this.music) {
        this.music.pause();
      }
      this.music = this.onDeadSound;
      this.music.play();
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

  checkIfGotScore() {
    let cell = this.grid[this.heroPos.r][this.heroPos.c];
    if(cell.content === 1) {
      cell.content = 0;
      this.score += 500;
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
        .map((itm) => cell(0, 0)))
    this.grid = new Grid(grid);
    this.emptyCells = this.grid.reduce((acc: Array<number>, itm: Array<cellInterface>, r: number) => {
      acc = acc.concat(itm.reduce((acc, itm, c) => {
        if (itm.size === 0) {
          acc.push(c + (r * this.size.c))
        }
        return acc
      }, []))
      return acc
    }, [])
    this.filledCells = this.grid.reduce((acc: Array<number>, itm: Array<cellInterface>, r: number) => {
      acc = acc.concat(itm.reduce((acc, itm, c) => {
        if (itm.size === 1) {
          acc.push(c + (r * this.size.c))
        }
        return acc
      }, []))
      return acc
    }, [])
  }

  fillGrid() {
    if (this.winPos.r) {
      this.spawnPermanentSpot(this.winPos);
    }
    const temp = this.scoreProbability;
    this.scoreProbability = 0;
    this.spawnSpot(1, this.coordToKey([this.size.r - 1, 0]));
    this.scoreProbability = temp;
    while (this.filledCells.length < this.fillDensity * (this.emptyCells.length + this.filledCells.length)) {
      this.spawnSpot(1 - (Math.random() * 0.8));
    }
  }

  spawnPermanentSpot(pos: { r: number, c: number }) {
    this.grid[pos.r][pos.c].size = 2;
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
      let cell = this.grid[coord[0]][coord[1]];
      cell.size = size;
      if ((Math.random() < this.scoreProbability) && (cell.size > 0.2)) {
        cell.content = 1;
      }
      this.generateMove();
      //const timeToRespawn = ((size * this.lifeSpan) + (Math.random() * this.lifeSpan * 0.5) * ((Math.random() < 0.5) ? -1 : 1)) * 1000;
      //setTimeout(() => this.spawnSpot(1), (size * this.lifeSpan) * 1000);
      const stepsToRespawn = Math.floor(this.stepsCounter + (size * this.lifeSpan) * this.fps);
      this.schedule[stepsToRespawn] = () => this.spawnSpot(1);
      this.onChange();
    }
  }
}

export default Game;