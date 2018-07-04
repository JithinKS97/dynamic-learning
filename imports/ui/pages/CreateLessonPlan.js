import React from 'react'
import DrawingBoardCmp from '../components/DrawingBoardCmp'
import { LessonPlans } from '../../api/lessonplans'
import SimsList from '../components/SimsList'
import List from '../components/List'
import AddSim from '../components/AddSim'
import { Link, Redirect } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { withTracker } from 'meteor/react-meteor-data';
import { Checkbox, Menu, Button, Dimmer, Loader, Segment, Modal, Form} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';


/* This Component is intended for the creation of a lessonplan by the teachers. Each lessonplan
    is composed of an array of slides. Each slide will contain a note and array of simulations.
    The changes need to be saved explicitly by clicking the save button for updating the database.

    curSlide is for keeping track of the current slide. _id is the id of the lessonplan
    document.
*/


class CreateLessonPlan extends React.Component {

    constructor(props) {

        super(props)

        /*When isInteractEnabled is true, the pointer events of the canvas are de activated
          so that we can interact with the simulations.
        */
        this.undoArray= []
        this.curPosition= []
        this.lessonplanExists = false

        this.state = {
            title:true,
            curSlide:0,
            slides: [],
            _id: '',
            initialized:false,
            createAccount:false,
            redirectToLogin:false,
            checked: false
        }

        this.pushSlide.bind(this)
        this.save.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    handleKeyDown(event){


        if(event.key == 'z' || event.key == 'Z' ) {

          this.previous()
        }
        if(event.key == 'x' || event.key == 'X') {

          this.next()
        }
        if((event.key == 's' || event.key == 'S') && !!this.state.title ) {

            this.save()
        }

        if(((event.key == 'a' || event.key == 'A') && !!this.state.title) && !this.curPosition[this.state.curSlide] == 0) {

            this.undo()
        }

        if(event.key == 'd' || event.key == 'D') {
           
            this.interact()
            
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

        window.addEventListener("keydown", this.handleKeyDown, false);

    }

    componentDidUpdate() {


        if(!this.state.initialized && this.props.lessonplanExists) {

            const lessonplan = this.props.lessonplan
            
            if (this.undoArray.length == 0 && lessonplan.slides.length!=0){

                this.undoArray = lessonplan.slides.map((slide) => {

                    this.curPosition.push(0);
                    return [slide.note];
                });
            }     

            this.setState({
                ...lessonplan,
                initialized:true
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
    }

    componentWillUnmount() {

        window.removeEventListener("keydown", this.handleKeyDown, false)
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

        if(this.addSim.state.isOpen)
            return

        if(!Meteor.userId()) { 

            this.setState({createAccount:true})
        }
        else {

            const {_id, slides} = this.state

            Meteor.call('lessonplans.update', _id, slides,(err)=>{
                alert('Saved successfully')
            })
        }  
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

    interact() {

      if(this.addSim.state.isOpen)
        return

      if(!this.state.checked) {
        $('.drawing-board-canvas-wrapper')[0].style['pointer-events'] = 'none'
      }
      else {
        $('.drawing-board-canvas-wrapper')[0].style['pointer-events'] = 'unset'
      }

      this.setState((state) => {
            return {
                checked: !state.checked
            }
      })
    }

    undo(e) {

      if(this.addSim.state.isOpen)
        return

      this.curPosition[this.state.curSlide]--
      const slides = this.state.slides
      slides[this.state.curSlide].note = this.undoArray[this.state.curSlide][this.curPosition[this.state.curSlide]]
      this.db.setImg(this.undoArray[this.state.curSlide][this.curPosition[this.state.curSlide]])
      this.undoArray[this.state.curSlide].pop()
      this.setState({
        slides
      })
    }

    headToRequestPage() {

        if(!Meteor.userId()){

            this.setState({createAccount:true})
        }            
        else {

            this.setState({redirectToRequest:true})
        }
    }

    render() {

        if(this.state.redirectToLogin) {

            return <Redirect to = {`/`}/>
        }

        return (
        <Segment style = {{padding:0, margin:0}}>

            <Dimmer active = {!this.state.initialized}>
                <Loader />
            </Dimmer>


            <Modal size= 'tiny' open = {this.state.createAccount}>
                <Modal.Header>
                    You need to login to save changes
                    <Button style = {{float:'right'}} onClick = {()=>{
                        this.setState({createAccount:false})
                    }}>X</Button>
                </Modal.Header>
                <Modal.Content>
                    <Modal.Description style = {{textAlign:'center'}}>
                 
                                <Button onClick = {()=>{
                                    
                                    Session.set('stateToSave', this.state)

                                    this.setState({redirectToLogin:true})

                                }} style = {{marginTop:'1.6rem'}}>Login</Button>
                   
          
                    </Modal.Description>
                </Modal.Content>
            </Modal>
            

            <div className = 'createLessonPlan'>            

                <div style = {{margin:'0 0.8rem'}} className = 'slides'>
                    <Button onClick = {this.addNewSlide.bind(this)}>Create Slide</Button>
                    <h1>{this.state.curSlide}</h1>
                    <List showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                </div>

                <div className = 'board'>
                    <SimsList
                        navVisibility = {true}
                        isRndRequired = {true}
                        saveChanges = {this.saveChanges.bind(this)}
                        delete = {this.deleteSim.bind(this)}
                        {...this.state}
                        
                        next = {this.next.bind(this)}
                        previous = {this.previous.bind(this)}
                        save = {this.save.bind(this)}
                        interact = {this.interact.bind(this)}
                        undo = {this.undo.bind(this)}
                    />                   
                    <DrawingBoardCmp toolbarVisible = {true} ref = {e => this.drawingBoard = e}/>                   
                </div>
                
                <div style = {{marginLeft:'0.8rem'}} className = 'menu'>
                
                    <AddSim isPreview = {true} ref = { e => this.addSim = e } {...this.state} saveChanges = {this.saveChanges.bind(this)}/>
                    
                    <Menu icon vertical>                

                    <Menu.Item link>                    
                            <Checkbox checked = {this.state.checked} ref = {e => this.checkbox = e} label='Interact' onChange = {this.interact.bind(this)} type = 'checkbox'/>
                        </Menu.Item>        

                        {Meteor.userId()?
                            <Link to = '/dashboard/lessonplans'><Menu.Item link>Dashboard</Menu.Item></Link>
                        :null}

                        {!!Meteor.userId()?
                            <Link to = {`/request/${this.state._id}`}><Menu.Item link>Request</Menu.Item></Link>
                        :null}
                        

                        <Menu.Item onClick = {()=>{
                            const confirmation = confirm('Are you sure you want to reset all?')
                            if(confirmation == true)
                            this.reset()
                        }}>
                            Reset
                        </Menu.Item>
                        
                        <Menu.Item onClick = {()=>{this.addSim.addSim()}}>
                            Add simulation
                        </Menu.Item>

                        <Menu.Item onClick = {()=>{this.undo()}}>
                            Undo
                        </Menu.Item>

                        <Menu.Item onClick = {()=>{this.save()}}>
                            Save
                        </Menu.Item>

                        {!!!Meteor.userId()?<Menu.Item onClick = {()=>{

                                Session.set('stateToSave', this.state)

                                this.setState({redirectToLogin:true}
                            )}}>
                            Login
                        </Menu.Item>:null}


                    </Menu>
                            
                </div>
            
            </div>
            <Modal size = 'tiny' open = {!!!this.state.title}>
                <Modal.Header>
                    Enter the title for the lessonplan
                </Modal.Header>
                    
                <Modal.Content>
                    <Modal.Description>
                        <Form onSubmit = {()=>{
                            
                            if(!this.title.value)
                                return
                            
                            this.setState({

                                title:this.title.value
                            })

                        }}>
                            <Form.Field>
                                <label>Title</label>
                                <input ref = { e => this.title = e}/>
                            </Form.Field>
                            <Form.Field>
                                <Button type = 'submit'>Submit</Button>
                            </Form.Field>                            
                        </Form>
                    </Modal.Description>
                </Modal.Content>
            </Modal>

        </Segment>

        )
    }
}

export default CreatelessonPlanContainer = withTracker(({ match }) => {
    
    const lessonplansHandle = Meteor.subscribe('lessonplans')
    const loading = !lessonplansHandle.ready()
    let lessonplan, lessonplanExists

    if(match.params._id === undefined)
    {
        lessonplanExists = true
        const slides = []
        lessonplan = {slides, title:null}
    }
    else {
        lessonplan = LessonPlans.findOne(match.params._id)
        lessonplanExists = !loading && !!lessonplan
    }


    return {

        lessonplanExists,
        lessonplan: lessonplanExists? lessonplan : []
    }

})(CreateLessonPlan)


