import React from 'react'
import './DrawingBoard/drawingboard.js'

export default class DrawingBoardCmp extends React.Component {

    componentDidMount() {

        this.b = new DrawingBoard.Board('container', {
            background: true,
            color: "#ffffff",
            size: 3,
            eraserColor:'transparent',
            fillTolerance: 100,
	        fillHack: false,
            controls: ['Color',
              { DrawingMode: { filler: false } },
              { Size: { type: 'dropdown' } },
              { Navigation: { back: false, forward: false } },
            ],
            webStorage: false
          });

          window.onresize = this.onresize.bind(this)          
    }

    componentWillUnmount() {
        window.onresize = null
    }

    onresize() {

        document.getElementsByClassName('drawing-board-canvas-wrapper')[0].style.height = document.getElementsByClassName('drawing-board')[0].getClientRects()[0].height + 'px'
        document.getElementsByClassName('drawing-board-canvas-wrapper')[0].style.width = document.getElementsByClassName('drawing-board')[0].getClientRects()[0].width + 'px'
        
    }


    render() {
        return(<div ref = {e => this.container = e} id="container"></div>)
    }
}
