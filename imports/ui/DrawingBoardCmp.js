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

          this.props.getDB(this.b) //This function passs the reference to drawing board
                                   //object to the CreateLessonPlan component
    }
    render() {
        return(<div id="container"></div>)
    }
}
