import React from 'react'
import DrawingBoardCmp from './DrawingBoardCmp'
import { LessonPlans } from '../api/lessonplans'
import SimsList from './SimsList'
import SlidesList from './SlidesList'


export default class CreateLessonPlan extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currSlide:0,
            slides: [],
            lessonplan_id: this.props.location.state.lessonplan_id
        }
        this.pushSlide.bind(this)
        this.saveChanges.bind(this)
    }

    componentDidMount() {

        this.refs.d.b.ev.bind('board:reset',this.changed.bind(this));
        this.refs.d.b.ev.bind('board:stopDrawing', this.changed.bind(this));

        Tracker.autorun(()=>{
            /*Fetching the lesson plan using the lesson id passed throgh the Link*/
            const lessonplan = LessonPlans.find(this.state.lessonplan_id).fetch()[0]
            /*
                If the fetched value is not null, the slide values are set to the state, if the 
                note in the first slide is empty string, the board is reset so that, the
                slide's note is assigned a valid data.
            */
            if(lessonplan) {
                this.setState({
                    slides:lessonplan.slides
                },() => {
                    if(this.state.slides[0].note === '') {
                        this.refs.d.b.reset({ webStorage: false, history: true, background: true })
                    }
                    else {
                        this.refs.d.b.setImg(this.state.slides[this.state.currSlide].note)
                    }
                })
            }
        })
    }

    changed() {
        /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */
        const currSlide = this.state.currSlide
        const slides = [...this.state.slides]
        const note = this.refs.d.b.getImg()
        slides[currSlide].note = note
        this.setState({slides})
        
    }

    next() {

        /*
            The undo stack is cleared. The current slide no. and slides are retrieved.

            If the current slide is the last slide, a new slide is pushed to the slides array.
            Current slide is incremented and stored to the state. The board is reset.

            If the current slide is not the last slide, current slide no. is incremented and 
            and the notes of that particular slide is set to the board.
        */

        this.refs.d.b.initHistory()

        const slides = [...this.state.slides]
        let currSlide = this.state.currSlide
  
        if(currSlide === slides.length-1) {
            this.pushSlide(slides)
            currSlide++
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.reset({ webStorage: false, history: true, background: true })
            })
        }
        else {
            currSlide++
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.slides[this.state.currSlide].note)
            })
        }
    }

    previous() {

        /*
            If the current slide is not the beggining slide, Undo stack is cleared.
            The current slide no. is decremented and the notes od that particular
            slide is set to the board.
        */

        const slides = [...this.state.slides]
        let currSlide = this.state.currSlide

        if(currSlide!=0) {
            this.refs.d.b.initHistory()
            currSlide--
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.slides[this.state.currSlide].note)
            })
        }
    }

    pushSlide(slides) {

        const newSlide = {
            note: '',
            iframes: []
        }

        slides.push(newSlide)

        this.setState({
            slides
        })
    }

    reset() {
        this.setState({
            currSlide:0,
            slides:[]
        },()=>{
            const slides = this.state.slides
            this.pushSlide(slides)
            this.refs.d.b.reset({ webStorage: false, history: true, background: true })
        })
        this.refs.d.b.initHistory()
    }

    addSim(e) {
        e.preventDefault()
        const tag = this.refs.tag.value
        const src = tag.match(`src\s*=\s*"\s*(.*)\s*">`)[1]
        src.trim()
        const slides = this.state.slides
        slides[this.state.currSlide].iframes.push(src)
        this.setState({
            slides
        })
        this.refs.tag.value = ''
    }

    save() {
        LessonPlans.update(this.state.lessonplan_id, {$set:{slides:this.state.slides}})
    }


    saveChanges(slides, currSlide) {

        if(slides == undefined) {
            this.setState({
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.slides[this.state.currSlide].note)
            })
        }        
        else if(currSlide == undefined) {
            this.setState({
                slides
            })
        }        
        else {
            this.setState({
                slides,
                currSlide
            },()=>{
                this.refs.d.b.setImg(this.state.slides[this.state.currSlide].note)
            })
        }
    }

    render() {
        return(
            <div>
                <DrawingBoardCmp ref = 'd'/> 
                               
                <h1>{this.state.currSlide}</h1>

                <div>
                    <button onClick = {this.next.bind(this)}>Next</button>
                    <button onClick = {this.previous.bind(this)}>Previous</button>
                    <button onClick = {this.save.bind(this)}>Save</button>
                    <button onClick = {this.reset.bind(this)}>Reset</button>
                </div>

                <form onSubmit = {this.addSim.bind(this)}>
                    <input ref='tag'/>
                    <button>Add</button>
                </form>

                <SimsList saveChanges= {this.saveChanges.bind(this)} currSlide={this.state.currSlide} slides={this.state.slides}/>
                <SlidesList reset = {this.reset.bind(this)} saveChanges= {this.saveChanges.bind(this)} slides={this.state.slides}/>
                
            </div>
        )
    }
}