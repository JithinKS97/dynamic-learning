import React from 'react'
import DrawingBoardCmp from './DrawingBoardCmp'
import { LessonPlans } from '../api/lessonplans'

export default class CreateLessonPlan extends React.Component {

    componentDidMount() {

        Tracker.autorun(()=>{

            if(this.refs.d) {
                this.refs.d.b.ev.bind('board:reset',this.changeArray.bind(this));
                this.refs.d.b.ev.bind('board:stopDrawing', this.changeArray.bind(this));
            }

            if(LessonPlans.find(this.state.lessonplan_id).fetch()[0])
            {
                const slides = LessonPlans.find(this.state.lessonplan_id).fetch()[0].slides
                this.setState({slides}, ()=>{
                    if(this.state.currSlide == 0)
                        this.refs.d.b.setImg(this.state.slides[0])
                })
            }
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            currSlide:0,
            slides: [],
            lessonplan_id: this.props.location.state.lessonplan_id
        }
    }

    changeArray() {
        const currSlide = this.state.currSlide;
        const slides = [...this.state.slides];
        slides[currSlide] = this.refs.d.b.getImg();
        this.setState({slides,currSlide});
    }

    next() {
        this.refs.d.b.initHistory();

        let currSlide = this.state.currSlide;
        currSlide++;

        const slides = [...this.state.slides];

        if(currSlide === slides.length || slides.length === 0) {            
            this.refs.d.b.reset({ webStorage: false, history: true, background: true }); 
            slides.push(this.refs.d.b.getImg());
            this.setState({
                slides,
                currSlide
            });
        }
        else if(currSlide<slides.length) {
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.slides[this.state.currSlide]);
            });            
        }        
    }

    previous() {
        let currSlide = this.state.currSlide;
        if(currSlide!=0)
        {
            this.refs.d.b.initHistory()
        }
        const slides = [...this.state.slides];
        if(currSlide>0) {
            currSlide--;
        }
        this.setState({
            currSlide
        },()=>{
            this.refs.d.b.setImg(this.state.slides[this.state.currSlide])
        });
    }

    save() {
        LessonPlans.update(this.state.lessonplan_id, {$set:{slides:this.state.slides}})
    }
    reset() {
        this.refs.d.b.reset({ webStorage: false, history: true, background: true }); 
        this.setState({
            slides:[],
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