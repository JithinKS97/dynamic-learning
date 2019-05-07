import React from 'react'
import './DrawingBoard/drawingboard.js'

export default class DrawingBoardCmp extends React.Component {

    componentDidMount() {

        this.b = new DrawingBoard.Board('container', {
            background: true,
            color: "#ffffff",
            size: 2,
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
    }

    render() {

        if(!this.props.toolbarVisible) {

            if($('.drawing-board-controls').length>0) {
                $('.drawing-board-controls')[0].style.visibility = 'hidden'
            }
        }

        return(<div ref = {e => this.container = e} id="container"></div>)
    }
}

/**
 * db.getImg()
 * db.setImg()
 * db.reset()
 * 
 * These are the three functions which this component makes available to CreateLessonPlan
 * 
 * If we want to replace drawingboard.js someday, all it takes is to replace the above three functions
 */
