import React from 'react'
import { withTracker } from 'meteor/react-meteor-data';
import { Lessons } from '../../api/lessons'
import HorizontalList from '../components/HorizontalList'
import { Grid, Button, Container, Dimmer, Loader } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import VideoContainer from '../components/VideoContainer'
import SimsList from '../components/SimsList'
import AddSim from '../components/AddSim'
import { Link } from 'react-router-dom'

class CreateLesson extends React.Component {

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

        slides = this.props.lesson.slides
        slides[this.state.curSlide].url = url
        this.save(this.props.lesson._id, slides)
    }

    pushSim(title, src, w, h, linkToCode) {

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
                    <Grid.Column style = {{padding:'1.6rem', width:'55vw'}}>
                        
                            <Link to = '/dashboard/lessons'><Button style = {{marginBottom:'0.8rem'}} >Back to dashboard</Button></Link>
                            <VideoContainer addVideo = {this.addVideo.bind(this)} url = {this.props.lesson.slides[this.state.curSlide]?this.props.lesson.slides[this.state.curSlide].url:null}/>
                        
                    </Grid.Column>
                    <Grid.Column  style = {{padding:'1.6rem', overflowY:'auto', width:'45vw'}}>
                        <Container >
                            <Button style = {{marginBottom:'0.8rem'}} onClick = {()=>{this.addSim.addSim()}}>Add Sim</Button>
                            <AddSim saveChanges = {this.saveChanges.bind(this)} slides = {this.props.lesson.slides} curSlide = {this.state.curSlide} isPreview = {true} ref = { e => this.addSim = e }/>
                            <SimsList isRndRequired = {false} delete = {this.deleteSim.bind(this)} {...this.props.lesson} curSlide = {this.state.curSlide}/>
                        </Container>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style = {{height:'20vh', padding:'1.6rem'}} >
                    <h1 style = {{padding:'1.6rem', border:'auto auto'}}>{this.state.curSlide+1}</h1>
                    <HorizontalList deleteSlide = {this.deleteSlide.bind(this)} saveChanges = {this.saveChanges.bind(this)} slides = {this.props.lesson.slides}/>
                    <Button 
                        onClick = {this.addNewSlide.bind(this)}
                        style = {{

                            margin:'auto 0.8rem', 

                        }}>
                        +
                    </Button>
                </Grid.Row>
            </Grid>  
            </div>   

        )
    }
}

export default CreateLessonContainer = withTracker(({match})=>{

    const lessonsHandle = Meteor.subscribe('lessons')
    const loading = !lessonsHandle.ready()
    const lesson = Lessons.findOne(match.params._id)
    const lessonExists = !loading && !!lesson

    return {

        lesson: lessonExists? lesson : {slides:[]},
        lessonExists 
    }
})(CreateLesson)

