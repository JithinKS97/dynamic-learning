import React from 'react'
import './drawing-board/drawingboard';
import './drawing-board/drawingboard.scss';
import { Tracker } from 'meteor/tracker';


export default class Drawingboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currSlide:-1,
            notes: []
        }
    }

    changeArray() {        
        let currSlide = this.state.currSlide;
        if(currSlide == -1)
            currSlide++;
        const notes = [...this.state.notes];
        notes[currSlide] = this.myBoard.getImg();
        this.setState({notes,currSlide});
    }

    next() {
        let currSlide = this.state.currSlide;
        currSlide++;
        const notes = [...this.state.notes];
        
        if(currSlide === notes.length) {
            this.myBoard.reset({ webStorage: false, history: false, background: true });
            notes.push(this.myBoard.getImg());
            this.setState({
                notes,
                currSlide
            });
        }
        else if(currSlide<notes.length) {
            this.setState({
                currSlide
            });
            this.myBoard.setImg(this.state.notes[this.state.currSlide+1 ]);
        }
        
    }

    previous() {
        let currSlide = this.state.currSlide;
        const notes = [...this.state.notes];
        if(currSlide>0) {
            currSlide--;
        }
        this.setState({
            currSlide
        });
        this.myBoard.setImg(this.state.notes[this.state.currSlide-1]);
    }

    componentDidMount() {

        this.boardTracker =Tracker.autorun(()=>{            

            this.myBoard = new DrawingBoard.Board('board', {  //Initialization of drawing board
                background: "#000000",           //For more details go to drawingboard.js documentation
                color: "#ffffff",
                size: 5,
                controls: ['Color',
                  { DrawingMode: { filler: false } },
                  { Size: { type: "range" } },
                  'Navigation',
                ],
                webStorage: false
              });

              this.myBoard.ev.bind('board:reset',this.changeArray.bind(this));
              this.myBoard.ev.bind('board:stopDrawing', this.changeArray.bind(this));
        });
    }

    componentWillUnmount() {
        this.boardTracker.stop();
    }


    render() {

        const boardStyle = {
            width:400,
            height:400
        }

        return(
            <div>
                <div id='board' style={boardStyle}></div>

                <button onClick={this.next.bind(this)}>Next</button>
                <button onClick={this.previous.bind(this)}>Previous</button>
                
                <h1>{this.state.currSlide}</h1>                
            </div>
            
        );
    }
}