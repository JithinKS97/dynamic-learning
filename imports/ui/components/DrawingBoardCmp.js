import React from 'react'
import './DrawingBoard/drawingboard.js'
import './DrawingBoard/drawingboard.scss'

export default class DrawingBoardCmp extends React.Component {

    componentDidMount() {

        this.b = new DrawingBoard.Board('container', {
            background: true,
            color: "#ffffff",
            size: 5,
            controls: ['Color',
              { DrawingMode: { filler: false } },
              { Size: { type: 'dropdown' } },
              'Navigation',
            ],
            webStorage: false
          });;
          
    }
    render() {
        return(<div id="container"></div>)
    }
}
