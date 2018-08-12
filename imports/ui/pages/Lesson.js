import React from 'react'
import { withTracker } from 'meteor/react-meteor-data';
import { Lessons } from '../../api/lessons'
import HorizontalList from '../components/HorizontalList'
import { Grid, Button, Container, Dimmer, Loader, Checkbox } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import VideoContainer from '../components/VideoContainer'
import SimsList from '../components/SimsList'
import AddSim from '../components/AddSim'
import { Link } from 'react-router-dom'

class Lesson extends React.Component {



    constructor(props) {
        super(props)

        this.state = {
            curSlide:0
        }
    }


    addNewSlide() {

        let {curSlide} = this.state
        slides = this.props.lesson.slides
        console.log(slides)
        this.pushSlide(slides)
        curSlide = slides.length-1
        this.setState({
            curSlide
        })
    }

    pushSlide(slides) {

        /* To create a new slide, first the structure of slide is defined and
           then pushed to the slides array.
        */

        const newSlide = {
            url:null,
            iframes:[]
        }

        slides.push(newSlide)
        this.save(this.props.lesson._id, slides)
    }

    save(_id, slides) {

        if(!Meteor.userId())
            return

        Meteor.call('lessons.update', _id, slides)
    }


    saveChanges(slides, curSlide) {        

        if(slides == undefined) {

            this.setState({
                curSlide
            })
        }
        else if(curSlide == undefined) {
            this.setState({
                slides
            },()=>{
                this.save(this.props.lesson._id, slides)
            })
        }
        else {

            this.setState({
                slides,
                curSlide
            },()=>{
                this.save(this.props.lesson._id, slides)
            })
        }
    }
    deleteSlide(index) {

        /* This function decides what to do when the X button is pressed in the
           slide element. If there is only one element. it is not deleted,
           it is just reset. Otherwise, the slide is deleted and the current slide is set.
        */

        if(this.props.lesson.userId != Meteor.userId())
            return

        const confirmation = confirm('Are you sure you want to delete the slide?')
        if(!confirmation)
            return

        const slides = this.props.lesson.slides

        if(slides.length!=1) {

            slides.splice(index, 1)

            let { curSlide } = this.state

            if(index == 0) {
                curSlide = 0
            }
            if(curSlide == slides.length)
                curSlide = slides.length-1
            this.saveChanges(slides, curSlide)
        }
        else{

          this.reset()
        }
    }

    reset() {
        
        const slides = []
        slides.push({
            url:null,
            iframes:[]
        })
        this.save(this.props.lesson._id, slides)
    }

    addVideo(url) {

        if(this.props.lesson.userId != Meteor.userId())
            return

        slides = this.props.lesson.slides
        slides[this.state.curSlide].url = url
        this.save(this.props.lesson._id, slides)
    }

    pushSim(title, src, w, h, linkToCode) {

        if(this.props.lesson.userId != Meteor.userId())
            return

        const { curSlide }  = this.state
        const slides = this.props.lesson.slides

        const objectToPush = {
            userId:Meteor.userId(),
            src,
            w,
            h,
            x:0,
            y:0,
            title,
            linkToCode
        }

        slides[curSlide].iframes.push(objectToPush)
        this.save(this.props.lesson._id, slides)
    }

    deleteSim(index) {

        if(this.props.lesson.userId != Meteor.userId())
            return

        const { curSlide }  = this.state
        const slides = this.props.lesson.slides
        const iframes = slides[curSlide].iframes        
        iframes.splice(index,1)
        slides[this.state.curSlide].iframes = iframes
        this.save(this.props.lesson._id, slides)       
    }


    render() {


        return (
            <div>
            <Dimmer active = {!this.props.lessonExists}>
                <Loader />
            </Dimmer>

            <Grid divided='vertically' style = {{height:'100vh', boxSizing: 'border-box'}}>
                <Grid.Row style = {{height:'80vh'}}>
                    <Grid.Column style = {{padding:'1.6rem', width:'50vw'}}>
                        
                            <Link to = '/dashboard/lessons'><Button style = {{marginBottom:'0.8rem'}} >Back to dashboard</Button></Link>
                            {this.props.lesson.userId == Meteor.userId()?<Checkbox
                                checked = {this.props.lesson.shared}
                                ref = {e=>this.checkbox = e}
                                onChange = {()=>{
                                    Meteor.call('lessons.shareLesson', this.props.lesson._id, !this.checkbox.state.checked)
                                }} 
                                style = {{paddingLeft:'1.6rem'}} 
                                label = 'share the lesson'
                            />:null}
                            <VideoContainer userId = {this.props.lesson.userId} addVideo = {this.addVideo.bind(this)} url = {this.props.lesson.slides[this.state.curSlide]?this.props.lesson.slides[this.state.curSlide].url:null}/>
                        
                    </Grid.Column>
                    <Grid.Column  style = {{padding:'1.6rem', overflowY:'auto', width:'50vw'}}>
                        <Container >
                            {this.props.lesson.userId == Meteor.userId()?<Button style = {{marginBottom:'0.8rem'}} onClick = {()=>{this.addSim.addSim()}}>Add Sim</Button>:null}
                            <AddSim saveChanges = {this.saveChanges.bind(this)} slides = {this.props.lesson.slides} curSlide = {this.state.curSlide} isPreview = {true} ref = { e => this.addSim = e }/>
                            <SimsList userId = {this.props.lesson.userId} isRndRequired = {false} delete = {this.deleteSim.bind(this)} {...this.props.lesson} curSlide = {this.state.curSlide}/>
                        </Container>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style = {{height:'20vh', padding:'1.6rem'}} >
                    <h1 style = {{padding:'1.6rem', border:'auto auto'}}>{this.state.curSlide+1}</h1>
                    <HorizontalList userId = {this.props.lesson.userId} deleteSlide = {this.deleteSlide.bind(this)} saveChanges = {this.saveChanges.bind(this)} slides = {this.props.lesson.slides}/>
                    {this.props.lesson.userId == Meteor.userId()?<Button 
                        onClick = {this.addNewSlide.bind(this)}
                        style = {{

                            margin:'auto 0.8rem', 

                        }}>
                        +
                    </Button>:null}
                </Grid.Row>
            </Grid>  
            </div>   

        )
    }
}

export default CreateLessonContainer = withTracker(({match})=>{

    Meteor.subscribe('lessons.public')
    const lessonsHandle = Meteor.subscribe('lessons')
    const loading = !lessonsHandle.ready()
    const lesson = Lessons.findOne(match.params._id)
    const lessonExists = !loading && !!lesson

    return {

        lesson: lessonExists? lesson : {slides:[]},
        lessonExists 
    }
})(Lesson)

