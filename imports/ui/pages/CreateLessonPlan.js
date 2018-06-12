import React from 'react'
import DrawingBoardCmp from '../components/DrawingBoardCmp'
import { LessonPlans } from '../../api/lessonplans'
import SimsList from '../components/SimsList'
import List from '../components/List'
import AddSim from '../components/AddSim'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'


/* This Component is intended for the creation of a lessonplan by the teachers. Each lessonplan
    is composed of an array of slides. Each slide will contain a note and array of simulations.
    The changes need to be saved explicitly by clicking the save button for updating the database.

    curSlide is for keeping track of the current slide. _id is the id of the lessonplan
    document.
*/


export default class CreateLessonPlan extends React.Component {

    constructor(props) {

        super(props)

        /*When isInteractEnabled is true, the pointer events of the canvas are de activated
          so that we can interact with the simulations.
        */
        this.isInteractEnabled=false
        this.undoArray= []
        this.curPosition= []
        this.lessonplanExists = false

        this.state = {
            curSlide:0,
            slides: [],
            _id: '',
            initialized:false
        };

        this.pushSlide.bind(this)
        this.slideNav.bind(this)
        this.save.bind(this)
    }

    slideNav(event){

        if(event.keyCode ===  37) {
          this.previous()
        }
        if(event.keyCode ===  39) {
          this.next()
        }
    }

    componentDidMount() {

        this.db = this.drawingBoard.b
        this.isInteractEnabled=false;
        this.undoArray= [];
        this.curPosition= [];
        /* board:reset and board:stopDrawing are events associated with the drawing
           board. They are triggered whenever the we press the reset button or stop
           the drawing. Whenever these events are triggered, the changed method is
           called. See the definition below.
        */

        this.db.ev.bind('board:reset', this.changed.bind(this));
        this.db.ev.bind('board:stopDrawing', this.changed.bind(this));
        document.addEventListener("keydown", this.slideNav.bind(this), false);



        this.lessonplansTracker = Tracker.autorun(()=>{

            const lessonplansHandle = Meteor.subscribe('lessonplans')
            const loading = !lessonplansHandle.ready()
            const lessonplan = LessonPlans.findOne(this.props.match.params._id)
            this.lessonplanExists = !loading && !!lessonplan

            if(this.lessonplanExists) {
                if (this.undoArray.length == 0 && lessonplan.slides.length!=0){
                    this.undoArray = lessonplan.slides.map((slide) => {
                        this.curPosition.push(0);
                        return [slide.note];
                    });
                }
    
                this.setState({
                    ...lessonplan
                },() => {
    
                    if(this.state.slides.length == 0) {
    
                        this.pushSlide(this.state.slides)
                        this.db.reset({ webStorage: false, history: true, background: true })
                    }
                    else {
                        this.db.setImg(this.state.slides[this.state.curSlide].note)
                    }
                })
            }            
        })
    }

    componentWillUnmount() {

        this.lessonplansTracker.stop()
    }

    changed() {
        /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */
        const {curSlide, slides} = this.state

        const note = this.db.getImg()
        slides[curSlide].note = note

        if(this.undoArray[curSlide]){
          this.undoArray[curSlide].push(note);
          this.curPosition[curSlide]++;
        }
        else{
          this.undoArray.push([note]);
          this.curPosition.push(0);
        }

        this.saveChanges(slides)
    }

    next() {

        /*

            If the current slide is the last slide, we cannot move forward.

            If the current slide is not the last slide, current slide no. is incremented and
            and the notes of that particular slide is set to the board.
        */

        let {curSlide, slides} = this.state

        if(curSlide === slides.length-1) {
            return
        }
        else {
            curSlide++
            this.saveChanges(slides, curSlide)
        }
    }

    addNewSlide(e) {

        let {curSlide, slides} = this.state

        this.pushSlide(slides)
            curSlide = slides.length-1
            this.setState({
                curSlide
            },()=>{
                this.db.reset({ webStorage: false, history: true, background: true })
        })
    }

    previous() {

        /*
            If the current slide is not the beggining slide, Undo stack is cleared.
            The current slide no. is decremented and the notes of that particular
            slide is set to the board.
        */

       let {curSlide, slides} = this.state

        if(curSlide!=0) {
            curSlide--
            this.saveChanges(slides,curSlide)
        }
    }

    pushSlide(slides) {

        /* To create a new slide, first the structure of slide is defined and
           then pushed to the slides array.
        */

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

        /* The current slide is made 0 and slides set to empty array.
           The first slide is initialized here. And the old notes are
           cleared.
        */

        this.setState({
            curSlide:0,
            slides:[]
        },()=>{
            const { slides } = this.state
            this.pushSlide(slides)
            this.db.reset({ webStorage: false, history: true, background: true })
        })
    }

    save() {

        const {_id, slides} = this.state

        Meteor.call('lessonplans.update', _id, slides,(err)=>{
            alert('Saved successfully')
        })

    }

    saveChanges(slides, curSlide) {

        /* This function is used in multiple places to save the changes. Depending upon
           the change made, the changes are saved looking upon arguments given when the
           function was called.
        */

        if(slides == undefined) {
            this.setState({
                curSlide
            },()=>{
                this.db.setImg(this.state.slides[this.state.curSlide].note)
            })
        }
        else if(curSlide == undefined) {
            this.setState({
                slides
            })
        }
        else {

            this.setState({
                slides,
                curSlide
            },()=>{
                this.db.setImg(this.state.slides[this.state.curSlide].note)
            })
        }

    }

    deleteSlide(index) {

        /* This function decides what to do when the X button is pressed in the
           slide element. If there is only one element. it is not deleted,
           it is just reset. Otherwise, the slide is deleted and the current slide is set.
        */

        const {slides} = this.state

        if(slides.length!=1) {

            slides.splice(index, 1)
            let { curSlide } = this.state
            this.undoArray.splice(index,1);
            this.curPosition.splice(index,1);
            if(index == 0) {
                curSlide = 0
            }
            if(curSlide == slides.length)
                curSlide = slides.length-1
            this.saveChanges(slides, curSlide)
        }
        else{
          this.undoArray=[], this.curPosition=[];
          this.reset()
        }
    }

    deleteSim(index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array of the
           current slide and the changes are saved.
        */

        const {slides, curSlide} = this.state
        const iframes = slides[curSlide].iframes
        iframes.splice(index,1)
        slides[this.state.curSlide].iframes = iframes
        this.saveChanges(slides)
    }

    interact(){
      this.isInteractEnabled = !this.isInteractEnabled;
      if(this.isInteractEnabled) {
        document.getElementsByClassName('drawing-board-canvas-wrapper')[0].style['pointer-events'] = 'none'
      }
      else {
        document.getElementsByClassName('drawing-board-canvas-wrapper')[0].style['pointer-events'] = 'unset'
      }
    }

    undo(e){
      this.curPosition[this.state.curSlide]--
      const slides = this.state.slides
      slides[this.state.curSlide].note = this.undoArray[this.state.curSlide][this.curPosition[this.state.curSlide]]
      this.db.setImg(this.undoArray[this.state.curSlide][this.curPosition[this.state.curSlide]])
      this.undoArray[this.state.curSlide].pop()
      this.setState({
        slides
      })
    }

    render() {        

        return (

            <div className = 'createLessonPlan'>

                
                <div className = 'slides'>

                    <h1>{this.lessonplanExists?null:'Loading'}</h1>
                    <button className = 'button slides-list__header' onClick = {this.addNewSlide.bind(this)}>Create Slide</button>
                    <h1>{this.state.curSlide}</h1>
                    <List showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                </div>

                <div className = 'board'>
                    <div className = 'board__container'>
                        <SimsList
                            isRndRequired = {true}
                            saveChanges = {this.saveChanges.bind(this)}
                            delete = {this.deleteSim.bind(this)}
                            {...this.state}
                        />

                        <DrawingBoardCmp ref = {e => this.drawingBoard = e}/>
                    </div>
                </div>
                    
                <div className='menu'>
                    <div className='menu__container'>

                            <label className = 'checkbox'>
                                <input className = 'checkbox__box' onChange={this.interact.bind(this)} type = 'checkbox'/>
                                Interact
                            </label>

                            <Link className = 'button button--link' to = '/dashboard/lessonplans'>Back</Link>

                            <button className = 'button' onClick = {this.save.bind(this)}>Save</button>

                            <Link className = 'button button--link' to={{ pathname: `/request/${this.state._id}`}}>Request</Link>

                            {(this.curPosition[this.state.curSlide] == 0) ? <button className = 'button' disabled>Undo</button> : <button className = 'button' onClick={this.undo.bind(this)}>Undo</button>}

                            <button className = 'button' onClick = {()=>{

                                const confirmation = confirm('Are you sure you want to reset all?')

                                if(confirmation == true)
                                    this.reset()

                            }}>Reset</button>

                            <AddSim {...this.state} saveChanges = {this.saveChanges.bind(this)}/>

                            {/* {(this.curPosition[this.state.curSlide] == this.undoArray[this.state.curSlide].length-1) ? <button disabled>Redo</button> : <button>Redo</button>} */}
                    </div>
                 </div>
            </div>
        )
    }
}
