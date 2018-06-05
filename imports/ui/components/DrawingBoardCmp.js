import React from 'react'
import './DrawingBoard/drawingboard.js'
import './DrawingBoard/drawingboard.scss'

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

          window.onresize = this.resize;
          
    }


    render() {
        return(<div style = {
            {
                background:'black',
                height:window.innerHeight
            }
        } id="container"></div>)
    }
}
