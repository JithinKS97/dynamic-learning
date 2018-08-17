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
import { Checkbox, Menu, Button, Dimmer, Loader, Segment, Modal, Form, Grid } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { expect } from 'chai';


/* This Component is intended for the development of a lessonplan by the teachers. Each lessonplan
    is composed of a sequence of slides. Each slide contains a note (the drawing on the canvas which is
    is of type string) and array of simulations. The changes need to be saved explicitly by clicking 
    the save button for updating the database.
*/


class CreateLessonPlan extends React.Component {

    constructor(props) {

        super(props)
        this.undoArray= []
        this.curPosition= []
        this.isInteractEnabled=false
        this.lessonplanExists = false

        this.state = {

            /*Title holds the title of the lessonplan. CurSlide holds the current slide on which we are in.
                _id holds the id of the current lessonplan. Initialzed is set to true once data is fetched from the
                database and is filled in the state. loginNotification becomes true when save button is pressed
                and the user is not logged in. Checked holds the interact checkbox value. RedirectToLogin is set to 
                true if we want to redirect the user to the login page. Checked holds the interact checkbox value.
                RedirectToDashboard set to true if we want to redirect the user to the dashboard
            */

            title:true,
            curSlide:0,
            slides: [],
            _id: '',
            initialized:false,
            loginNotification:false,
            redirectToLogin:false,
            checked: false,
            redirectToDashboard:false
        }

        /* PageCount holds the the value associated with the extra length of the canvas
            PushSlide is for creation of new slide, save to save the slides to the db,
            handleKeyDown for dealing with shortcuts (See the definitions below)
        */

        this.pageCount=0;
        this.pushSlide.bind(this)
        this.save.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    handleKeyDown(event){

        /*
            This function handles the shortcut key functionalities.
         */


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

        /* board:reset and board:stopDrawing are events associated with the drawing
           board. They are triggered whenever the we press the reset button or stop
           the drawing. Whenever these events are triggered, the onChange method is
           called. See the definition below.
        */

        this.db.ev.bind('board:reset', this.onChange.bind(this));
        this.db.ev.bind('board:stopDrawing', this.onChange.bind(this));

        this.canvasSize=$('canvas')[0].height;        

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
                    
                    $('#container')[0].style.height=900+'px';
                    $('canvas')[0].style.height=$('#container')[0].style.height;
                    $('canvas')[0].height=900;
                    this.db.reset('0');
                   
                }
                else {
                    this.pageCount=this.state.slides[this.state.curSlide].pageCount || 0;
                    $('#container')[0].style.height=(900+this.pageCount*300)+'px';
                    $('canvas')[0].style.height=$('#container')[0].style.height;
                    $('canvas')[0].height=900+this.pageCount*300;
                    this.db.reset('0');
                    this.db.setImg(this.state.slides[this.state.curSlide].note)
                }
            })
        }
    }

    componentWillUnmount() {

        window.removeEventListener("keydown", this.handleKeyDown, false)
    }
    

    onChange() {
        /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */
        if(arguments[0][0]=='0')
          return;
          
        const {curSlide, slides} = this.state

        const note = this.db.getImg()
        slides[curSlide].note = note
        slides[curSlide].pageCount=this.pageCount;

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
        this.pageCount=0
        this.pushSlide(slides)
            curSlide = slides.length-1
            this.setState({
                curSlide
            },()=>{
              this.pageCount=this.state.slides[this.state.curSlide].pageCount || 0;
              $('#container')[0].style.height=(900+this.pageCount*300)+'px';
              $('canvas')[0].style.height=$('#container')[0].style.height;
              $('canvas')[0].height=900+this.pageCount*300;
              this.db.reset('0');
              this.db.reset({ webStorage: false, history: true, background: true })
        })
    }

    previous() {

        /*
            If the current slide is not the beggining slide, The current slide no. is decremented
            and the notes of that particular slide is set to the board.
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
            iframes: [],
            pageCount:0
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
            $('#container')[0].style.height=900+'px';
            $('canvas')[0].style.height=$('#container')[0].style.height;
            $('canvas')[0].height=900;
        })
    }

    save() {

        /* This function is intended for saving the slides to the database.
            If not logged in, user is asked to login first.
        */

        if(this.addSim.state.isOpen)
            return

        if(!Meteor.userId()) {

            this.setState({loginNotification:true})
        }
        else {

            const {_id, slides} = this.state

            const lessonplan = LessonPlans.findOne({_id: this.state._id})

            /* If the slides in the state has the same values as that of the slides
                in the database, we need not save, expect to deep include by chai checks this equality.
                If they are not same, an error is thrown. When we catch the error, we can see that the
                data are different and we initiate the save.
            */

            try {
                expect({slides:lessonplan.slides}).to.deep.include({slides:this.state.slides})
            }
            catch(error) {

                if(error) {
                    Meteor.call('lessonplans.update', _id, slides,(err)=>{
                        alert('Saved successfully')
                    })
                }
                else
                    return
            }


        }
    }

    saveChanges(slides, curSlide) {

        /* This function is used in multiple places to save the changes (not in the databse, but
            in the react state).

           Depending upon the changes made, they are saved looking upon arguments given when the
           function was called.
        */

        if(slides == undefined) {

            this.setState({
                curSlide
            },()=>{
                this.pageCount=this.state.slides[this.state.curSlide].pageCount || 0;
                $('#container')[0].style.height=(900+this.pageCount*300)+'px';
                $('canvas')[0].style.height=$('#container')[0].style.height;
                $('canvas')[0].height=900+this.pageCount*300;
                this.db.reset('0');
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
              $('#container')[0].style.height=900+'px';
              $('canvas')[0].style.height=$('#container')[0].style.height;
              $('canvas')[0].height=900
              this.db.reset();
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

        /* This function decides what to do when cross button in the simulatin is pressed.
            The simulation is deleted from the iframes array of the
            current slide and the changes are saved.
        */

        const {slides, curSlide} = this.state
        const iframes = slides[curSlide].iframes
        iframes.splice(index,1)
        slides[this.state.curSlide].iframes = iframes
        this.saveChanges(slides)
    }

    interact() {

      /*
        To interact with the simulation, interact should be enabled which disables the pointer events in the canvas,
         so that when we interact with the simulation, no drawings are made. Unchecking the interact, unsets the
         pointer events.
       */

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

    checkCanvasSize(){

      var i=$('iframe').length, iframe;
      var maxHeight=-Infinity;
      while(i--){
        iframe=$('iframe').eq(i-1).parents().eq(3);
        if((iframe.position().top+iframe.height())>maxHeight)
          maxHeight=iframe.position().top+iframe.height();
      }
      if($('canvas')[0].height-300<maxHeight)
        return 1;
      return 0;
    }

    undo(e) {

      if(this.addSim.state.isOpen)
        return
      if(this.curPosition[this.state.curSlide]<=0)
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

        this.setState({redirectToRequest:true})
    }



    render() {

        if(this.state.redirectToLogin) {

            return <Redirect to = {`/login`}/>
        }

        if(this.state.redirectToDashboard) {

            return <Redirect to = {`/dashboard/lessonplans`}/>
        }

        return (

            <Segment onClick = {()=>{

            }} style = {{padding:0, margin:0}}>

                <Dimmer active = {!this.state.initialized}>
                    <Loader />
                </Dimmer>

                <Modal size= 'tiny' open = {this.state.loginNotification}>
                    <Modal.Header>
                        You need to login to save changes
                        <Button style = {{float:'right'}} onClick = {()=>{
                            this.setState({loginNotification:false})
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


                <Grid style = {{height:'100vh', padding:0, margin:0}}  columns={3} divided>
                    <Grid.Row>        
                        <Grid.Column style = {{textAlign:'center', overflow:'auto'}} width = {2}>
                            <Button style = {{marginTop:'0.8rem'}} onClick = {this.addNewSlide.bind(this)}>Create Slide</Button>
                            <h1>{this.state.curSlide+1}</h1>
                            <List from = {'createLessonplan'} showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                        </Grid.Column>

                        <Grid.Column style = {{overflow:'auto', margin:0, padding:0}} width = {12}>
                            
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
                        
                        </Grid.Column>

                        <Grid.Column width = {2}>

                            <AddSim isPreview = {true} ref = { e => this.addSim = e } {...this.state} saveChanges = {this.saveChanges.bind(this)}/>

                            <Menu color = {'blue'} icon vertical>

                                <Menu.Item link>
                                    <Checkbox checked = {this.state.checked} ref = {e => this.checkbox = e} label='Interact with sim' onChange = {this.interact.bind(this)} type = 'checkbox'/>
                                </Menu.Item>

                                <Menu.Item>
                                    <Button onClick = {()=>{this.addSim.addSim()}} color='black'>
                                        Add simulation
                                    </Button>
                                </Menu.Item>

                                {Meteor.userId()?
                                    <Menu.Item onClick = {()=>{

                                        const lessonplan = LessonPlans.findOne({_id: this.state._id})

                                        try {
                                            expect({slides:lessonplan.slides}).to.deep.include({slides:this.state.slides})
                                        }
                                        catch(error) {
                                            
                                            if(error) {

                                                const confirmation = confirm('Are you sure you want to leave. Any unsaved changes will be lost!')

                                                if(!confirmation)
                                                    return
                                            }
                                            else
                                                return
                                        }                               

                                        this.setState({

                                            redirectToDashboard:true
                                        })
                                    }}
                                    >Dashboard</Menu.Item>
                                :null}

                                {!!Meteor.userId()?
                                    <Link to = {`/request/${this.state._id}`}><Menu.Item link>Request for new sim</Menu.Item></Link>
                                :null}


                                <Menu.Item onClick = {()=>{
                                        const confirmation = confirm('Are you sure you want to reset all?')
                                        if(confirmation == true)
                                        this.reset()
                                    }}>
                                    Reset all
                                </Menu.Item>

                                <Menu.Item onClick = {()=>{this.undo()}}>
                                    Undo
                                </Menu.Item>

                                <Menu.Item onClick = {()=>{
                                        this.save()
                                    }}>
                                    Save
                                </Menu.Item>

                                <Menu.Item onClick = {()=>{
                                var temp=this.db.getImg();
                                this.pageCount+=1;
                                $('canvas')[0].style.height=($('canvas')[0].height+300).toString()+'px';
                                $('canvas')[0].height+=300;
                                $('#container')[0].style.height=$('canvas')[0].style.height;
                                this.db.reset('0');
                                this.db.setImg(temp);
                                var slides = this.state.slides;
                                slides[this.state.curSlide].pageCount=this.pageCount;
                                this.setState({slides});
                                }}>
                                    Increase Canvas size
                                </Menu.Item>

                                <Menu.Item onClick = {()=>{
                                if (this.pageCount==0 || this.checkCanvasSize()){
                                    alert("Canvas size cannot be decreased further!");
                                    return;
                                }
                                var temp=this.db.getImg();
                                this.pageCount-=1;
                                $('canvas')[0].style.height=($('canvas')[0].height-300).toString()+'px';
                                $('canvas')[0].height-=300;
                                $('#container')[0].style.height=$('canvas')[0].style.height;
                                this.db.reset('0');
                                this.db.setImg(temp);
                                var slides = this.state.slides;
                                slides[this.state.curSlide].pageCount=this.pageCount;
                                this.setState({slides});
                                }}>
                                    Decrease Canvas size
                                </Menu.Item>

                                {!!!Meteor.userId()?<Menu.Item onClick = {()=>{

                                        const confirmation = confirm('You will be redirected to login page. Changes will be saved for you.')
                                        if(!confirmation)
                                            return

                                        Session.set('stateToSave', this.state)

                                        this.setState({redirectToLogin:true}
                                )}}>
                                    Login
                                </Menu.Item>:null}
                                {!Meteor.userId()?<Link to = {`/explore`}><Menu.Item link>Back</Menu.Item></Link>:null}
                            </Menu>

                        </Grid.Column>
                    </Grid.Row>            
                </Grid>



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

    let lessonplansHandle
    if(Meteor.userId()) {
        lessonplansHandle = Meteor.subscribe('lessonplans')
    }
    else {
        lessonplansHandle = Meteor.subscribe('lessonplans.public')
    }
    const loading = !lessonplansHandle.ready()
    let lessonplan, lessonplanExists

    if(match.params._id === undefined) {

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
