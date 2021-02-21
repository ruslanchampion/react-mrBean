import React, { Component, Fragment } from 'react';

class MenuSettingsView extends Component {
  constructor(props) {
    super(props);
    this.setDensity = this.setDensity.bind(this);
    this.setConfig = this.setConfig.bind(this);
    this.state = {
      config: this.props.config
    }
  }
  setDensity(e) {
    console.log(e.target.value);
    console.log(e.nativeEvent.target.attributes.value.value);
    this.setState((state) => {
      const config = state.config;
      config.fillDensity = e.target.value / 100;
      return {config: config}
    })
    console.log(this.state)
  }
  setConfig(config) {
    this.props.setConfig(config);
    this.props.close();
  }
  render() {
    console.log('render');
    return <Fragment>
      return <div>settings</div>
      <span>width</span><input type='text'></input>
      <span>height</span><input type='text'></input>
      <span>number of spots</span><input type="range" min="1" max="100" defaultValue={this.state.config.fillDensity * 100} onChange={this.setDensity}></input>
      <div onClick = {() => {this.setConfig(this.state.config)}}>Apply</div>
      <div onClick = {() => {this.props.route('main')}}>Back</div>
    </Fragment>
  }
}

export default MenuSettingsView;