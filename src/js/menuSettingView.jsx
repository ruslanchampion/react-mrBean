import React, { Component, Fragment } from 'react';

class MenuSettingsView extends Component {
  constructor(props) {
    super(props);
    this.setDensity = this.setDensity.bind(this);
    this.setMusicVolume = this.setMusicVolume.bind(this);
    this.setSoundsVolume = this.setSoundsVolume.bind(this);
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
      return { config: config }
    })
    console.log(this.state)
  }
  setMusicVolume(e) {
    console.log(e.target.value);
    console.log(e.nativeEvent.target.attributes.value.value);
    const key = e.target.name;
    const val = e.target.value / 100;
    console.log(key);
    this.props.game.setMusicVolume(val);
    this.setState((state) => {
      const config = state.config;
      config[key] = e.target.value / 100;
      return { config: config }
    })
    console.log(this.state)
  }
  setSoundsVolume(e) {
    console.log(e.target.value);
    console.log(e.nativeEvent.target.attributes.value.value);
    const key = e.target.name;
    const val = e.target.value / 100;
    console.log(key);
    this.props.game.setSoundsVolume(val);
    this.setState((state) => {
      const config = state.config;
      config[key] = val;
      return { config: config }
    })
    console.log(this.state)
  }
  setConfig(config) {
    this.props.setConfig(config);
    this.props.close();
  }
  render() {
    return <Fragment>
      <span className='h1'>Volume</span>
      <div className='block'>
        <span>Music</span>
        <input type="range" min="1" max="100" name='musicVolume' defaultValue={this.state.config.musicVolume * 100} onChange={this.setMusicVolume}></input>
      </div>
      <div className='block'>
        <span>Sounds</span>
        <input type="range" min="1" max="100" name='soundsVolume' defaultValue={this.state.config.soundsVolume * 100} onChange={this.setSoundsVolume}></input>
      </div>
      <div className='h1'>Settings</div>
      <div className='block'>
        <span>width</span><input className='input-field' defaultValue={this.state.config.size.c} type='number' step='1'></input>
      </div>
      <div className='block'>
        <span>height</span><input className='input-field' defaultValue={this.state.config.size.r} type='number' step='1'></input>
      </div>
      <div className='block'>
        <span>number of spots</span>
        <input type="range" min="1" max="100" defaultValue={this.state.config.fillDensity * 100} onChange={this.setDensity}></input>
      </div>
      <div className='block'>
        <div className='menu__btn' onClick={() => { this.setConfig(this.state.config) }}>Apply</div>
        <div className='menu__btn' onClick={() => { this.props.route('main') }}>Back</div>
      </div>
    </Fragment>
  }
}

export default MenuSettingsView;