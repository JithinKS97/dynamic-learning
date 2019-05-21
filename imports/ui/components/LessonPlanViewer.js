import React from 'react'
import DrawingBoardCmp from '../components/DrawingBoardCmp'
import { LessonPlans } from '../../api/lessonplans'
import SimsList from '../components/SimsList'
import ListWithoutDelete from '../components/ListWithoutDelete'
import { Redirect } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data';
import { Dimmer, Loader, Segment, Grid } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import TextBoxes from './TextBoxes'



/* This Component is intended for the creation of a lessonplan by the teachers. Each lessonplan
    is composed of an array of slides. Each slide will contain a note and array of simulations.
    The changes need to be saved explicitly by clicking the save button for updating the database.

    curSlide is for keeping track of the current slide. _id is the id of the lessonplan
    document.
*/


class LessonPlanViewer extends React.Component {

    constructor(props) {

        super(props)

        /*When isInteractEnabled is true, the pointer events of the canvas are de activated
          so that we can interact with the simulations.
        */
        this.isInteractEnabled=true
        this.undoArray= []
        this.curPosition= []
        this.lessonplanExists = false
        this.pageCount=0;

        this.state = {
            title:null,
            curSlide:0,
            slides: [],
            _id: '',
            initialized:false,
            createAccount:false,
            redirectToLogin:false,
            scaleX:1
        }
    }


    componentDidMount() {

        window.onresize = this.handleWindowResize

        this.db = this.drawingBoard
        this.undoArray= [];
        this.curPosition= [];

        /* board:reset and board:stopDrawing are events associated with the drawing
           board. They are triggered whenever the we press the reset button or stop
           the drawing. Whenever these events are triggered, the changed method is
           called. See the definition below.
        */

        $('.canvas-container')[0].style['pointer-events'] = 'none'
        this.handleWindowResize()

    }


    handleWindowResize = () => {
        
        // console.log(document.getElementsByClassName('fourteen wide column')[0])

        // return

        this.setState({

            scaleX: (document.getElementsByClassName('fourteen wide column')[0].offsetWidth/1366)
        })
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
                    this.setSizeOfPage(0)
                    this.db.reset();
                    this.db.setImg(this.state.slides[this.state.curSlide].note)
                }
                else {
                    this.pageCount=this.state.slides[this.state.curSlide].pageCount || 0;
                    this.setSizeOfPage(this.pageCount)
                    this.db.reset();
                    this.db.setImg(this.state.slides[this.state.curSlide].note)
                }
            })
        }
    }

    setSizeOfPage(pageCount) {


        /*
            This function sets the size of the canvas. By default the size of the page is
            900px. The user can add extra poges. With each addition the size of the page
            increases by 300px.
            First the size of the container is incremented, then the canvas's size is
            incremented
        */
       

        $('.canvas-container')[0].style.height = (900 + pageCount * 300) + 'px';
        $('.upper-canvas')[0].style.height = $('.canvas-container')[0].style.height;
        $('.lower-canvas')[0].style.height = $('.canvas-container')[0].style.height;
        $('.upper-canvas')[0].height = 900 + pageCount * 300;
        $('.lower-canvas')[0].height = 900 + pageCount * 300;
        
    }

    componentWillUnmount() {

        window.removeEventListener("keydown", this.handleKeyDown, false)
    }

    handleKeyDown = (e) => {

        /*
            This function handles the shortcut key functionalities.
         */

        if(e.keyCode>=37 && e.keyCode<=40){

            e.preventDefault()
        }
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


    previous() {

        /*
            If the current slide is not the beggining slide,
            the current slide no. is decremented and the notes of that particular
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
           then pushed to the slides array. This is to avoid the undefined error
           when somewhere else we access slide.note, slide.iframes.
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


    saveChanges(slides, curSlide) {

        /* This function is used in multiple places to save the changes (not in the databse, but
            in the react state).

           Depending upon the change made, the changes are saved looking upon arguments given when the
           function was called.
        */        

        if(slides == undefined) {

            this.setState({
                curSlide
            },()=>{
                this.pageCount=this.state.slides[this.state.curSlide].pageCount || 0;
                
                this.setSizeOfPage(this.pageCount)
                
                this.simsList.loadDataToSketches()
            })
        }
        else if(curSlide == undefined) {
            this.setState({
                slides
            },()=>{

                this.simsList.loadDataToSketches()
            })
        }
        else {

            this.setState({
                slides,
                curSlide
            },()=>{
              
              this.setSizeOfPage(this.pageCount)  

              this.simsList.loadDataToSketches()
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

    calcHeightOfCanvasContainer = () => {

        if(this.state.slides.length>0) {

            return 900 + this.state.slides[this.state.curSlide].pageCount*300
        }
        else {
            return 900
        }
    }

    render() {

        if(this.state.redirectToLogin) {

            return <Redirect to = {`/`}/>
        }

        return (
            
        <Segment style = {{padding:'0 0.8rem', margin:0}}>

            <Dimmer active = {!this.state.initialized}>
                <Loader />
            </Dimmer>        

             <Grid columns={3} divided>
                <Grid.Row>         

                    <Grid.Column style = {{textAlign:'center'}} width = {2}>
                        <h1 style = {{marginTop:'1.6rem'}}>{this.state.curSlide+1}</h1>
                        <ListWithoutDelete showTitle = {false} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                    </Grid.Column>

                    <Grid.Column style = {{height:'100vh', padding:0, overflowY:'auto', overflowX:'auto', margin:0}} width = {14}>
                            <div style = {{backgroundColor:'black', paddingLeft:'4.8rem', margin:'0px'}}>
                                <TextBoxes 
                                    isPreview = {true}
                                    deleteTextBox = {()=>{}}
                                    slides = {this.state.slides}
                                    curSlide = {this.state.curSlide}
                                    saveChanges = {this.saveChanges.bind(this)}
                                />

                                <SimsList
                                    navVisibility = {false}
                                    isRndRequired = {true}
                                    isPreview = {true}
                                    saveChanges = {this.saveChanges.bind(this)}
                                    delete = {this.deleteSim.bind(this)}
                                    {...this.state}
                                    ref = {e => this.simsList = e}
                                />         
                                    
                                <DrawingBoardCmp toolbarVisible = {false} ref = {e => this.drawingBoard = e}/>   
                            </div>                 
                    </Grid.Column>
                </Grid.Row> 
            </Grid>

        </Segment>

        )
    }
}

export default LessonPlanViewerContainer = withTracker((props)=>{

    const lessonplansHandle = Meteor.subscribe('lessonplans')
    const loading = !lessonplansHandle.ready()
    const lessonplan = LessonPlans.findOne(props._id)
    const lessonplanExists = !loading && !!lessonplan

    return {

        lessonplanExists,
        lessonplan: lessonplanExists? lessonplan : []
    }

})(LessonPlanViewer)







