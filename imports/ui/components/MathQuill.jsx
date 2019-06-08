/* eslint-disable */
import React from 'react'
import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill'
import Rnd from 'react-rnd'
import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaClose from 'react-icons/lib/fa/close'
import MdNetworkCell from 'react-icons/lib/md/network-cell'
import FaCopy from "react-icons/lib/fa/copy";

// inserts the required css to the <head> block.
// You can skip this, if you want to do that by your self.

export default class App extends React.Component {
  constructor() {
    super();
    addMathquillStyles()
    this.state = {
      latex: '\\frac{1}{\\sqrt{2}}\\cdot 2',
    }
  }

  render() {
    // bounds = '.drawing-board-canvas'
    // enableResizing = {this.props.isPreview?false:true}
    return (
      <Rnd
        // style = {{backgroundColor:'red'}}
        className='textbox-floating'
        enableResizing={true}
        bounds='.drawing-board-canvas'
        dragHandleClassName='.textbox-handle'

        position={{
          x: 100,
          y: 100
        }}

        enableResizing={{

          bottom: false,
          bottomLeft: false,
          bottomRight: true,
          left: false,
          right: false,
          top: false,
          topLeft: false,
          topRight: false
        }}
      >
        <MathQuill
          latex={this.state.latex} // Initial latex value for the input field
          onChange={latex => {
            // Called everytime the input changes
            this.setState({ latex })
          }}
        />
        <div className='sim-nav' style={{ display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', marginLeft: '0.5rem' }}>

            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.1rem' }}>
              <FaClose className='sim-delete' size='20' onClick={() => {

                const confirmation = confirm('Are you sure you want to delete the textbox?')

                if (!confirmation)
                  return

                // this.props.deleteTextBox(this.props.index)

              }}>X</FaClose>

              <TiArrowMove size='22' className='textbox-handle' />

            </div>

            <div style={{ marginLeft: '0.6rem', float: 'right' }}><MdNetworkCell /></div>

          </div>
        </div>
      </Rnd>
    )
  }
}
