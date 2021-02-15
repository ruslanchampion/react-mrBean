import React, { Component, Fragment } from 'react';

class MenuMainView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Fragment>
      <div onClick = {() => {this.props.game.newGame()}}>New game</div>
      <div>Settings</div>
      <div>Credits</div>
    </Fragment>
  }
}

export default MenuMainView;