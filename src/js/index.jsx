import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import Game from './game.ts';
import FieldComponent from './field.jsx';
import Menu from './menu.jsx';
import '../sass/style.scss';



const keysMovement = {
  'ArrowUp': { r: -1, c: 0 },
  'ArrowDown': { r: 1, c: 0 },
  'ArrowRight': { r: 0, c: 1 },
  'ArrowLeft': { r: 0, c: -1 }
}

class GameComponent extends Component {
  constructor() {
    super();
    this.size = { r: 8, c: 12 }
    this.game = new Game(this.size, 0.7, 15, { r: 0, c: this.size.c - 1 }, this.reset.bind(this));
    this.width = document.querySelector('#main').clientWidth;
    this.cellSize = this.width / this.size.c;
    console.log(this.cellSize);
    console.log(this.game);
    this.state = {
      game: this.game
    }
    document.addEventListener('keydown', (e) => {
      console.log(e.key);
      if (e.key in keysMovement) {
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
    return <Fragment>
      <div className='header'></div>
      <FieldComponent cellSize={this.cellSize} game={this.state.game} />
      <Menu game = {this.game} onShow = {() => this.game.pause()} onHide = {() => this.game.play()}/>
    </Fragment>
  }
}


ReactDom.render(<GameComponent />, document.querySelector('#main'));