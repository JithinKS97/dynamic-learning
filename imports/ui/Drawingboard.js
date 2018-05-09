import React from 'react'
import './drawing-board/drawingboard';
import './drawing-board/drawingboard.scss';
import { Tracker } from 'meteor/tracker';
import SimsList from './SimsList';
import {Notes} from '../api/notes';
import {Lessonplans} from '../api/lessonplans';


export default class Drawingboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currSlide:-1,
            notes: [],
            LessonPlans: [],
            lesson_id:''
        }
        this.showNotes.bind(this);
    }

    componentDidMount() {

        this.myBoard = new DrawingBoard.Board('board', {  //Initialization of drawing board
            background: "#000000",           //For more details go to drawingboard.js documentation
            color: "#ffffff",
            size: 5,
            controls: ['Color',
              { DrawingMode: { filler: false } },
              { Size: { type: 'dropdown' } },
              'Navigation',
            ],
            webStorage: false
          });

          this.myBoard.ev.bind('board:reset',this.changeArray.bind(this));
          this.myBoard.ev.bind('board:stopDrawing', this.changeArray.bind(this));
        
        this.boardTracker =Tracker.autorun(()=>{   
            LessonPlansArray = Lessonplans.find().fetch();
            this.setState({
                LessonPlans: LessonPlansArray
            });
        });
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

    componentWillUnmount() {
        this.boardTracker.stop();
    }

    showNotes(lesson_id) {        


        const result = this.state.LessonPlans.map((lessonplan)=>{
            if(lessonplan._id == lesson_id)
            {   
                return lessonplan.notes;
            }
        }).filter((x)=>{
            return x
        });       

        let notes = result[0];

        if(notes){
            this.setState({
                notes,
                currSlide:0,
                lesson_id
            },()=>{
                this.myBoard.setImg(this.state.notes[0]);
            });
        } 
        else {
            this.myBoard.reset({ webStorage: false, history: false, background: true });
            this.setState({
                notes:[],
                currSlide:-1,
                lesson_id
            });
        }
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
                <button onClick={()=>{

                    console.log(this.state.lesson_id);
                    const notes = this.state.notes;
                    Lessonplans.update(this.state.lesson_id,{$set:{notes}});

                }}>Save</button>
                <button onClick = {()=>{

                    this.myBoard.reset({ webStorage: false, history: false, background: true });
                    this.setState({
                        notes:[],
                        currSlide:-1
                    });

                }}>Reset</button>
                {/* <h1>{Lessonplans.find(this.props.lesson_id).fetch()[0]?Lessonplans.find(this.props.lesson_id).fetch()[0].name:''}</h1> */}
            </div>           
        );
    }
}