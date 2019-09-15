import React from 'react';
import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill';
import { Rnd } from 'react-rnd';
import { TiArrowMove } from 'react-icons/ti';
import { FaTimes } from 'react-icons/fa';
import { MdNetworkCell } from 'react-icons/md';
import PropTypes from 'prop-types';

// inserts the required css to the <head> block.
// You can skip this, if you want to do that by your self.

export default class App extends React.Component {
  constructor() {
    super();
    addMathquillStyles();
    this.state = {
      latex: '\\frac{1}{\\sqrt{2}}\\cdot 2',
    };
  }

  render() {
    // bounds = '.drawing-board-canvas'
    const { deleteTextBox, index } = this.props;
    const { latex } = this.state;

    return (
      <Rnd
        // style = {{backgroundColor:'red'}}
        className="textbox-floating"
        bounds=".drawing-board-canvas"
        dragHandleClassName=".textbox-handle"

        position={{
          x: 100,
          y: 100,
        }}

        enableResizing={{

          bottom: false,
          bottomLeft: false,
          bottomRight: true,
          left: false,
          right: false,
          top: false,
          topLeft: false,
          topRight: false,
        }}
      >
        <MathQuill
          // Initial latex value for the input field
          latex={latex}
          onChange={(l) => {
            // Called everytime the input changes
            this.setState({ latex: l });
          }}
        />
        <div className="sim-nav" style={{ display: 'flex', flexDirection: 'column' }}>

          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', marginLeft: '0.5rem',
          }}
          >

            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.1rem' }}>
              <FaTimes
                className="sim-delete"
                size="20"
                onClick={() => {
                  if (confirm('Are you sure you want to delete the textbox?')) {
                    deleteTextBox(index);
                  }
                }}
              >
                X
              </FaTimes>

              <TiArrowMove size="22" className="textbox-handle" />

            </div>

            <div style={{ marginLeft: '0.6rem', float: 'right' }}><MdNetworkCell /></div>

          </div>
        </div>
      </Rnd>
    );
  }
}

App.propTypes = {
  deleteTextBox: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};
