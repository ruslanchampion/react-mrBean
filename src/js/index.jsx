import React, {Component} from 'react';
import ReactDom from 'react-dom';
import Game from './game.ts';
import FieldComponent from './field.jsx';
import '../sass/style.scss';


const keysMovement = {
  'ArrowUp': {x: 0, y: -1},
  'ArrowDown': {x: 0, y: 1},
  'ArrowRight': {x: 1, y: 0},
  'ArrowLeft': {x: -1, y: 0}
}

class GameComponent extends Component {
  constructor() {
    super();
    this.size = {x:12, y:8}
    this.game = new Game(this.size, 0.7, 15, this.reset.bind(this));
    this.width = document.querySelector('#main').clientWidth;
    this.cellSize = this.width / this.size.x;
    console.log(this.cellSize);
    console.log(this.game);
    this.state = {
      game: this.game
    }
    document.addEventListener('keydown', (e) => {
      console.log(e.key);
      if(e.key in keysMovement) {
        this.state.game.move(keysMovement[e.key]);
        this.reset();
      }
    })
  }

  reset() {
    this.setState({
      game: this.game
    })
  }

  render() {
    return <FieldComponent cellSize = {this.cellSize} game = {this.state.game}/>
  }
}


ReactDom.render(<GameComponent/>, document.querySelector('#main'));