import React, { Component } from 'react';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      opened:0
    }
  }
  toggle() {
    if(this.state.opened) {
      this.props.onHide();
    } else {
      this.props.onShow();
    }
    this.setState({
      opened: !this.state.opened
    })
    console.log(this.state);
  }
  render() {
    return <div className={(this.state.opened) ? 'menu-container' : 'menu-container menu-container--hidden'}>
      <div className='menu'>
        <div>menu</div>
        <div className='menu__toggle' onClick={this.toggle}>close</div>
      </div>
    </div>
  }
}

export default Menu;