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

  generateSpot(size) {
    if (size > 0) {
      if (size > 1) {
        return <div className='game__spot'
          style={{
            width: `${this.props.cellSize}px`,
            height: `${this.props.cellSize}px`,
          }}>
        </div>
      } else {
        return <div className='game__spot'
          style={{
            width: `${size * this.props.cellSize}px`,
            height: `${size * this.props.cellSize}px`,
          }}>
        </div>
      }
    }
    else {
      return null;
    }
  }

  generateField() {
    return this.props.game.grid.map((row, idxY) =>
      row.map((cell, idxX) =>
        <div className='game__cell' key={`${idxX},${idxY}`}
          style = {this.props.game.pathGrid[idxY][idxX] ?
             {
              width: `${this.props.cellSize}px`,
              height: `${this.props.cellSize}px`,
              top: `${(idxY * this.props.cellSize)}px`,
              left: `${(idxX * this.props.cellSize)}px`,
              border: '1px solid red'
            } :
            {
              width: `${this.props.cellSize}px`,
              height: `${this.props.cellSize}px`,
              top: `${(idxY * this.props.cellSize)}px`,
              left: `${(idxX * this.props.cellSize)}px`,
            }
          }>
          {this.generateSpot(cell)}
          {((idxX === this.props.game.heroPos.c) && (idxY === this.props.game.heroPos.r)) ?
            <div className={this.props.game.getHeroClass()}
              style={{

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