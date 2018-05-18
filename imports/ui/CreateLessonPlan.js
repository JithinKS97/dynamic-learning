import React from 'react'
import DrawingBoardCmp from './DrawingBoardCmp'
import { Requests } from '../api/requests'
import { LessonPlans } from '../api/lessonplans'
import SimsList from './SimsList'
import List from './List'
import AddSim from './AddSim'
import { Link, Redirect } from 'react-router-dom'
 

export default class CreateLessonPlan extends React.Component {
    
    constructor(props) {

        /* This Component is intended for the creation of a lessonplan. 
           The teachers can create slides. On each slides, there will be
           note and array of simulations. The changes need to be saved explicitly
           by clicking the save button for updating the database.

           currSlide is for keeping track of the current slide, Each element in slides
           will consist the note and the array of iframe srcs. _id will carry the id of 
           the current lessonplan, requests will contain a Request object.
        */

        super(props)
        
        this.state = {
            currSlide:0,
            slides: [],
            _id:'',
            requests:''
        }

        /* In pushSlide and saveChanges, this keyword is used. For binding the this
           to the Component.
        */

        this.pushSlide.bind(this)
        this.saveChanges.bind(this)
    }

    getDB(db) {

        /*This function is intended for getting the reference to the drawing board
          object in the DrawingBoardCmp. This function is passed as the prop to the
          DrawingBoardCmp. The function is executed in the componentDidMount where
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

        this.db.ev.bind('board:reset', this.changed.bind(this));
        this.db.ev.bind('board:stopDrawing', this.changed.bind(this));

        this.simTracker = Tracker.autorun(()=>{

            /* The lessonplan is obtained as the prop passed from the LessonPlan
               component. Since the Requests collection associated with this
               lessonplan has the same id. The id is obtained and the requests for
               this lessonplan are retrieved from the database.
            */

            const requests = Requests.findOne(this.props.location.state._id)

            /*The obtained lessonplan is spreaded and set to the state along with the
              with the requests.

              If the lessonplan in brand new, slides[0] will be empty string, we need to
              initialize the first slide before doing any actions. So reset is called.

              If notes are already there, the first slide is set to the drawing board.
            */

            this.setState({                                                                    
                ...this.props.location.state,
                requests

            },() => {
                if(this.state.slides[0].note === '') {
                    this.db.reset({ webStorage: false, history: true, background: true })
                }
                else {
                    this.db.setImg(this.state.slides[this.state.currSlide].note)
                }
            })

        })
    }

    componentWillUnmount() {
        this.simTracker.stop()
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
        const currSlide = this.state.currSlide
        const slides = [...this.state.slides]
        const note = this.db.getImg()
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

        this.db.initHistory()

        const slides = [...this.state.slides]
        let currSlide = this.state.currSlide
  
        if(currSlide === slides.length-1) {
            this.pushSlide(slides)
            currSlide++
            this.setState({
                currSlide
            },()=>{
                this.db.reset({ webStorage: false, history: true, background: true })
            })
        }
        else {
            currSlide++
            this.setState({
                currSlide
            },()=>{
                this.db.setImg(this.state.slides[this.state.currSlide].note)
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
            this.db.initHistory()
            currSlide--
            this.setState({
                currSlide
            },()=>{
                this.db.setImg(this.state.slides[this.state.currSlide].note)
            })
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
            const slides = this.state.slides
            this.pushSlide(slides)
            this.db.reset({ webStorage: false, history: true, background: true })
        })
        this.db.initHistory()
    }

    save() {

        _id = this.state._id
        slides = this.state.slides

        LessonPlans.update(_id, {$set:{slides}},()=>{
            alert('Saved successfully')
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
            let currSlide = index-1    
            if(index == 0) {
                currSlide = 0
            }    
            this.saveChanges(slides, currSlide)
        }
        else
            this.reset()                            
    }

    deleteSim(slides, iframeArray, index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
        
        iframeArray.splice(index,1)
        slides[this.state.currSlide].iframes = iframeArray
        this.saveChanges(slides)
    }

    render() {

        return(
            <div>
                <DrawingBoardCmp getDB = {this.getDB.bind(this)} ref = 'd'/> 
                               
                <h1>{this.state.currSlide}</h1>

                <div>
                    <button onClick = {this.next.bind(this)}>Next</button>
                    <button onClick = {this.previous.bind(this)}>Previous</button>
                    <button onClick = {this.save.bind(this)}>Save</button>
                    <button onClick = {this.reset.bind(this)}>Reset</button>
                    <Link to = '/lessonplans'><button>Back</button></Link>
                </div>

                <List showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                <AddSim {...this.state} saveChanges = {this.saveChanges.bind(this)}/>
                <SimsList delete = {this.deleteSim.bind(this)} {...this.state}/>

                <Link to={{ pathname: '/request', state: { lessonplan_id: this.state._id, requests:this.state.requests}}}>
                    <button>
                        Request new simulations
                    </button>
                </Link> 
                
            </div>
        )
    }
}