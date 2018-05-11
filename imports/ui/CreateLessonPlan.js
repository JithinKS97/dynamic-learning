import React from 'react'
import DrawingBoardCmp from './DrawingBoardCmp'
import { LessonPlans } from '../api/lessonplans'

export default class CreateLessonPlan extends React.Component {

    componentDidMount() {

        Tracker.autorun(()=>{
            this.refs.d.b.ev.bind('board:reset',this.changeArray.bind(this));
            this.refs.d.b.ev.bind('board:stopDrawing', this.changeArray.bind(this));
            if(LessonPlans.find(this.state.lessonplan_id).fetch()[0])
            {
                const notes = LessonPlans.find(this.state.lessonplan_id).fetch()[0].notes
                console.log(notes)
                this.setState({notes}, ()=>{
                    if(this.state.currSlide == 0)
                        this.refs.d.b.setImg(this.state.notes[0])
                })
            }
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            currSlide:0,
            notes: [],
            lessonplan_id: this.props.location.state.lessonplan_id
        }
    }

    changeArray() {
        const currSlide = this.state.currSlide;
        const notes = [...this.state.notes];
        notes[currSlide] = this.refs.d.b.getImg();
        this.setState({notes,currSlide});
    }

    next() {
        this.refs.d.b.initHistory();

        let currSlide = this.state.currSlide;
        currSlide++;

        const notes = [...this.state.notes];

        if(currSlide === notes.length || notes.length === 0) {            
            this.refs.d.b.reset({ webStorage: false, history: true, background: true }); 
            notes.push(this.refs.d.b.getImg());
            this.setState({
                notes,
                currSlide
            });
        }
        else if(currSlide<notes.length) {
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.notes[this.state.currSlide]);
            });            
        }        
    }

    previous() {
        let currSlide = this.state.currSlide;
        if(currSlide!=0)
        {
            this.refs.d.b.initHistory()
        }
        const notes = [...this.state.notes];
        if(currSlide>0) {
            currSlide--;
        }
        this.setState({
            currSlide
        },()=>{
            this.refs.d.b.setImg(this.state.notes[this.state.currSlide])
        });
    }

    save() {
        LessonPlans.update(this.state.lessonplan_id, {$set:{notes:this.state.notes}})
    }
    reset() {
        this.refs.d.b.reset({ webStorage: false, history: true, background: true }); 
        this.setState({
            notes:[],
            currSlide: 0
        })
    }

    render() {
        return (
            <div>
                <DrawingBoardCmp ref = 'd'/>
                <button onClick = {this.next.bind(this)}>Next</button>
                <button onClick = {this.previous.bind(this)}>Previous</button>
                <button onClick = {this.save.bind(this)}>save</button>
                <button onClick = {this.reset.bind(this)}>reset</button>
                <h1>{this.state.currSlide}</h1>
            </div>
        )
    }
}