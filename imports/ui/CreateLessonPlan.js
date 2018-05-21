import React from 'react'
import DrawingBoardCmp from './DrawingBoardCmp'
import { Requests } from '../api/requests'
import { LessonPlans } from '../api/lessonplans'
import SimsList from './SimsList'
import List from './List'
import AddSim from './AddSim'
import { Link } from 'react-router-dom'
 

export default class CreateLessonPlan extends React.Component {
    
    constructor(props) {

        /* This Component is intended for the creation of a lessonplan. 
           The teachers can create slides. On each slides, there will be
           note and array of simulations. The changes need to be saved explicitly
           by clicking the save button for updating the database.

           currSlide is for keeping track of the current slide, Each element in slides
           will consist the note and the array of iframe srcs. _id will carry the id of 
           the current lessonplan.
        */

        super(props)
        
        this.state = {
            currSlide:0,
            slides: [],
            _id: '',
        }

        /* In pushSlide and saveChanges, this keyword is used. For binding the this
           to the Component.
        */

        this.pushSlide.bind(this)
        this.saveChanges.bind(this)

        this.escFunction.bind(this)
    }

    escFunction(event){

        if(event.keyCode ===  37) {
          this.previous()
        }
        if(event.keyCode ===  39) {
          this.next()
        }
    }


    getDB(db) {

        /*This function is intended for getting the reference to the drawing board
          object in the DrawingBoardCmp. This function is passed as the prop to the
          DrawingBoardCmp. It is executed in the componentDidMount where
          drawingboard is initialized, which is passed as db. The reference is
          retrieved here and used in this component.           
        */

        this.db = db
    }


    componentDidMount() {

        /* board:reset and board:stopDrawing are events associated with the drawing
           board. They are triggered whenever the we press the reset button or stop
           the drawing. Whenever these events are triggered, the changed method is 
           called. See the definition below.

           Tracker autorun is used because we are retrieving the Requests data 
           here.
        */

       Meteor.subscribe('lessonplans')

        this.db.ev.bind('board:reset', this.changed.bind(this));
        this.db.ev.bind('board:stopDrawing', this.changed.bind(this));

        document.addEventListener("keydown", this.escFunction.bind(this), false);

        this.simTracker = Tracker.autorun(()=>{
            

            /*The obtained lessonplan is spreaded and set to the state.

              If the lessonplan in brand new, slides[0] will be empty string, we need to
              initialize the first slide before doing any actions. So reset is called.

              If notes are already there, the first slide is set to the drawing board.
            */
           const { _id } = this.props.match.params

           const lessonplan = LessonPlans.findOne(_id)

            if(lessonplan) {

                this.setState({                                                
                    ...lessonplan   
                },() => {
                    if(this.state.slides[0].note === '') {
                        this.db.reset({ webStorage: false, history: true, background: true })
                    }
                    else {
                        this.db.setImg(this.state.slides[this.state.currSlide].note)
                    }
                })   
            }
        })
    }

    componentWillUnmount() {
        this.simTracker.stop()
        document.removeEventListener("keydown", this.escFunction, false);
    }

    shouldComponentUpdate(nextState) {

        /*To avoid unnuecessary re-renderings*/

        if(this.state.slides === nextState.slides)
            return false
        else
            return true

        if(this.state.currSlide === this.state.currSlide)
            return false
        else
            return true
    }

    changed() {
        /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */
        const {currSlide, slides} = this.state
        
        const note = this.db.getImg()
        slides[currSlide].note = note
        this.setState({slides})
        
    }


    next() {

        /*
            The undo stack is cleared. The current slide no. and slides are retrieved.

            If the current slide is the last slide, we cannot move forward.

            If the current slide is not the last slide, current slide no. is incremented and 
            and the notes of that particular slide is set to the board.
        */

        this.db.initHistory()

        let {currSlide, slides} = this.state
  
        if(currSlide === slides.length-1) {
            return
        }
        else {
            currSlide++
            this.saveChanges(slides, currSlide)
        }
    }

    addNewSlide(e) {        
        
        let {currSlide, slides} = this.state

        this.pushSlide(slides)
            currSlide = slides.length-1
            this.setState({
                currSlide
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

       let {currSlide, slides} = this.state

        if(currSlide!=0) {
            this.db.initHistory()
            currSlide--
            this.saveChanges(slides,currSlide)
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
            currSlide:0,
            slides:[]
        },()=>{
            const { slides } = this.state
            this.pushSlide(slides)
            this.db.reset({ webStorage: false, history: true, background: true })
        })
        this.db.initHistory()
    }

    save() {

        const {_id, slides} = this.state

        LessonPlans.update(_id, {$set:{slides}},()=>{
            alert('Saved succesfully')
        })
    }

    saveChanges(slides, currSlide) {

        /* This function is used in multiple places to save the changes. Depending upon
           the change made, the changes are saved looking upon arguments given when the
           function was called.
        */

        if(slides == undefined) {
            this.setState({
                currSlide
            },()=>{
                this.db.setImg(this.state.slides[this.state.currSlide].note)
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
                this.db.setImg(this.state.slides[this.state.currSlide].note)
            })
        }
    }

    deleteSlide(slides, index) {

        /* This function decides what to do when the X button is pressed in the
           slide element. If there is only one element. it is not deleted,
           it is just reset. Otherwise, the slide is deleted and the current slide
           is set to the preceeding slide.
        */

        if(slides.length!=1) {
            slides.splice(index, 1)    
            let { currSlide } = this.state   
            if(index == 0) {
                currSlide = 0
            }    
            if(currSlide == slides.length)
                currSlide = slides.length-1
            this.saveChanges(slides, currSlide)
        }
        else
            this.reset()                            
    }

    deleteSim(slides, iframeArray, index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array of the
           current slide and the changes are saved.
        */
        
        iframeArray.splice(index,1)
        slides[this.state.currSlide].iframes = iframeArray
        this.saveChanges(slides)
    }

    render() {

        return(
        <div>    
            <div className = 'page-content'>

                <div className = 'page-content__sidebar__left'>
                    <h1>{this.state.currSlide}</h1>
                    <List showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                    <button onClick = {this.addNewSlide.bind(this)}>+</button>
                </div>

                <div className = 'page-content__main'>
                    {<DrawingBoardCmp getDB = {this.getDB.bind(this)} ref = 'd'/>}                                              </div>

                <div className = 'page-content__sidebar__right'>
                    <AddSim {...this.state} saveChanges = {this.saveChanges.bind(this)}/>   
                    <button onClick = {this.reset.bind(this)}>Reset</button>
                    <br/>             
                    <button onClick = {this.save.bind(this)}>Save</button>
                    <br/>                   
                    <Link to = '/lessonplans'><button>Back</button></Link> 
                    <br/> 
                    <Link to={{ pathname: `/request/${this.state._id}`}}>
                     <button>
                        Request new simulations
                    </button>
                    </Link>
      
                </div>
                
            </div>
            <SimsList saveChanges = {this.saveChanges.bind(this)} delete = {this.deleteSim.bind(this)} {...this.state}/>
        </div>
        )
    }
}