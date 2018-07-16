import React from 'react'
import { withTracker } from 'meteor/react-meteor-data';
import { Lessons } from '../../api/lessons'
import List from '../components/List'
import { Grid, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

class CreateLesson extends React.Component {


    addNewSlide(e) {

        let {curSlide, slides} = this.state
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
            videoTag:null,
            iframes:[]
        }

        slides.push(newSlide)
        this.save(this.props.lesson._id, slides)
    }

    save(_id, slides) {

        if(!Meteor.userId())
            return

        Meteor.call('lessons.update', _id, slides,(err)=>{
            alert('Saved successfully')
        })
    }

    deleteSlide(index) {

    }

    saveChanges(slides, curSlide) {

    }


    render() {
        return (

            <Grid divided='vertically' style = {{height:'100vh', boxSizing: 'border-box'}}>
                <Grid.Row style = {{height:'80vh'}} columns = {2}>
                    <Grid.Column style = {{padding:'1.6rem'}}>
                        Helloo
                    </Grid.Column>
                    <Grid.Column style = {{padding:'1.6rem'}}>
                        Helloo
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style = {{height:'20vh', padding:'1.6rem'}} >
                    Hellooo
                </Grid.Row>
            </Grid>      

        )
    }
}

export default CreateLessonContainer = withTracker(({match})=>{

    const lessonsHandle = Meteor.subscribe('lessons')
    const loading = !lessonsHandle.ready()
    const lesson = Lessons.findOne(match.params._id)
    const lessonExists = !loading && !!lesson

    return {

        lesson: lessonExists? lesson : {slides:[]}
    }
})(CreateLesson)

