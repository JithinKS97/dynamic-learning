import React from 'react'
import './DrawingBoard/drawingboard.js'

export default class DrawingBoardCmp extends React.Component {

    componentDidMount() {

        this.b = new DrawingBoard.Board('container', {
            background: true,
            color: "#ffffff",
            size: 3,
            fillTolerance: 100,
	        fillHack: false,
            controls: ['Color',
              { DrawingMode: { filler: false } },
              { Size: { type: 'dropdown' } },
              { Navigation: { back: false, forward: false } },
            ],
            webStorage: false
          });
          
    }


    render() {
        return(<div id="container"></div>)
    }
}
