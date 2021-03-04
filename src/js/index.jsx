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
    this.setConfig = this.setConfig.bind(this);
    this.state = {
      config: {
        musicVolume: 0.3,
        soundsVolume: 0.5,
        size: { r: 8, c: 12 },
        fillDensity: 0.75,
        lifeSpan: 15,
        winPos: { r: null, c: null },
        onChange: this.reset.bind(this)
      }
    }
    this.game = new Game(this.state.config);
    //this.game.pause();
    this.game.autoPlayStart();
    this.width = document.querySelector('#main').clientWidth;
    this.height = document.querySelector('#main').clientHeight - 60;
    this.cellSize = Math.min(this.width / this.state.config.size.c, this.height / this.state.config.size.r);
    console.log(this.cellSize);
    console.log(this.game);
    this.state.game = this.game;
    document.addEventListener('keydown', (e) => {
      console.log(e.key);
      if (e.key in keysMovement) {
        this.state.game.move(keysMovement[e.key]);
        this.reset();
      }
    })
  }

  setConfig(newConfig) {
    this.setState({
      config: newConfig,
    });
    console.log(newConfig);
    this.game.setConfig(newConfig);
    this.game.newGame();
    this.setState({
      game: this.game
    })
    this.width = document.querySelector('#main').clientWidth;
    this.height = document.querySelector('#main').clientHeight - 60;
    this.cellSize = Math.min(this.width / this.state.config.size.c, this.height / this.state.config.size.r);
    console.log(this.cellSize);
    console.log(this.game);
    this.state.game = this.game;
  }

  reset() {
    this.setState({
      game: this.game
    })
  }

  render() {
    return <Fragment>
      <div className='header'>
        <div className="score">
         {this.state.game.score} 
        </div>        
        </div>
      <FieldComponent cellSize={this.cellSize} game={this.state.game} />
      <Menu
        game={this.game}
        onShow={() => this.game.pause()}
        onHide={() => this.game.play()}
        config={this.state.config}
        setConfig={this.setConfig} />
    </Fragment>
  }
}


ReactDom.render(<GameComponent />, document.querySelector('#main'));