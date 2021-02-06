import React, { Component, Fragment } from 'react';

class FieldComponent extends Component {
  constructor(props) {
    super(props);
    let styleSheet = document.styleSheets[0];
    let keyframes =
    `@-webkit-keyframes dissapear {
      0% {

    }
    99% {
      width: ${this.props.cellSize / 5}px;
      height: ${this.props.cellSize / 5}px;
    }
    100% {
      width: 0;
      height: 0;
    }
  }`
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
  generateField() {
    return this.props.game.grid.map((col, idxX) =>
      col.map((cell, idxY) =>
        <div className='game__cell' key={`${idxX},${idxY}`}
        style={{
          width: `${this.props.cellSize}px`,
          height: `${this.props.cellSize}px`,
          top: `${(idxY * this.props.cellSize)}px`,
          left: `${(idxX * this.props.cellSize)}px`
        }}>
          {(cell > 0) ?
            <div className='game__spot'
              style={{
                width: `${cell * this.props.cellSize}px`,
                height: `${cell * this.props.cellSize}px`,
                animationDuration: `${(cell * this.props.game.lifeSpan)}s`,
              }}>
            </div> :
            null}
            {((idxX === this.props.game.heroPos.x) && (idxY === this.props.game.heroPos.y)) ?
            <div className='game__hero'
            style={{
              width: `${this.props.cellSize / 5}px`,
              height: `${this.props.cellSize / 2}px`
            }}
            ></div> :
            null
            }
        </div>)
    )
  }
  render() {
    return <div className='game__field'>
      {this.generateField()}
    </div>
  }
}

export default FieldComponent;