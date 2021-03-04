import React, { Component, Fragment } from 'react';

class MenuMainView extends Component {
  constructor(props) {
    super(props);
    this.newGame = this.newGame.bind(this);
    this.newGameAutoPlay = this.newGameAutoPlay.bind(this);
  }
  newGame() {
    this.props.game.newGame();
    this.props.config.autoplay = 0;
    this.props.close();
  }
  newGameAutoPlay() {
    this.props.config.autoplay = 1;
    this.props.game.newGame();
    this.props.game.autoPlayStart();    
    this.props.close();
  }
  render() {
    return <Fragment>
      <div className = 'menu__btn' onClick = {this.newGame}>New game</div>
      <div className = 'menu__btn' onClick = {this.newGameAutoPlay}>Autoplay</div>
      <div className = 'menu__btn' onClick = {() => {this.props.route('settings')}}>Settings</div>      
    </Fragment>
  }
}

export default MenuMainView;