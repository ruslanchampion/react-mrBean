import React, { Component } from 'react';
import MenuMainView from './menuMainView.jsx';
import MenuSettingsView from './menuSettingView.jsx';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.route = this.route.bind(this);
    this.close = this.close.bind(this);
    this.selectors = 
      {
        main: MenuMainView,
        settings: MenuSettingsView,
      };
    this.state = {
      opened: true,
      component: MenuMainView
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

  close(){
    this.setState({
      opened: false,
    })
  }

  route(selector) {
    if(selector in this.selectors) {
      this.setState({
        component: this.selectors[selector]
      })
      
    }
  }
  render() {
    return <div className={(this.state.opened) ? 'menu-container' : 'menu-container menu-container--hidden'}>
      <div className='menu'>
        <this.state.component game = {this.props.game} route = {this.route} config = {this.props.config} setConfig = {this.props.setConfig} close = {this.close}/>
        <div className='menu__toggle' onClick={this.toggle}>close</div>
      </div>
    </div>
  }
}

export default Menu;