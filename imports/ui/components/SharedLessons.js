import React from 'react'
import {Tracker} from 'meteor/tracker'
import { List, Input, Dimmer, Loader } from 'semantic-ui-react' 
import {Redirect} from 'react-router-dom'
import { LessonsIndex } from '../../api/lessons'

export default class SharedLessons extends React.Component {

    constructor(props) {
        
        super(props)
        this.state = {

            lessons:[],
            redirectToLesson: false,
            selectedLesson: null,
            loading:true
        }
        
    }

    componentDidMount() {

        this.lessonsTracker = Tracker.autorun(()=>{

            this.lessonsHandle = Meteor.subscribe('lessons.public')
            const loading = !this.lessonsHandle.ready()
            const lessons = LessonsIndex.search('').fetch()
            
            if(!lessons)
                return
            this.setState({
                lessons,
                loading
            })

        })

    }

    componentWillUnmount() {

        this.lessonsTracker.stop()
    }

    renderLessons() {

        return this.state.lessons.map((lesson, index)=>{
            

            return (
                <List.Item onClick = {()=>{

                    this.setState({
                        selectedLesson:lesson
                    },()=>{
                        this.setState({
                            redirectToLesson: true
                        })
                    })
                }} style = {{paddingLeft:'2.4rem'}} key = {index}>
                    {lesson.title}
                </List.Item>
            )

        })
    }

    getId() {

        if(!this.state.selectedLesson)
            return

        if(this.state.selectedLesson.__originalId == undefined)
            return this.state.selectedLesson._id
        else
            return this.state.selectedLesson.__originalId
    }

    search(event, data) {

        Tracker.autorun(()=>{
            this.setState({
                lessons:LessonsIndex.search(data.value).fetch()
            })
        })        
    }

    render() {

        if(this.state.redirectToLesson) {

            return <Redirect to = {`/lesson/${this.getId()}`}/>
        }

        return(
            <div>
                <Dimmer inverted active = {this.state.loading}>
                    <Loader />
                </Dimmer>
                <Input ref = {e => this.searchTag = e} onChange = {this.search.bind(this)} label = 'search'/>
                <List

                    selection 
                    verticalAlign = 'middle'
                    style = {{height:window.innerHeight - 150}}
                >
                    {this.renderLessons()}
                </List>
            </div>
        )
    }
}