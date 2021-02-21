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
      <div onClick = {this.newGame}>New game</div>
      <div onClick = {() => {this.props.route('settings')}}>Settings</div>
      <div>Credits</div>
    </Fragment>
  }
}

export default MenuMainView;