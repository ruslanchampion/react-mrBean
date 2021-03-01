import React, { Component, Fragment } from 'react';

class MenuMainView extends Component {
  constructor(props) {
    super(props);
    this.newGame = this.newGame.bind(this);
  }
  newGame() {
    this.props.game.newGame();
    this.props.close();
  }
  render() {
    return <Fragment>
      <div className = 'menu__btn' onClick = {this.newGame}>New game</div>
      <div className = 'menu__btn' onClick = {() => {this.props.route('settings')}}>Settings</div>
      <div className = 'menu__btn' >Credits</div>
    </Fragment>
  }
}

export default MenuMainView;