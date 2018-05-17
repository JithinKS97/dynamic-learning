import React from 'react'
import { LessonPlans } from '../api/lessonplans'
import {Tracker} from 'meteor/tracker'
import LessonPlan from './LessonPlan'
import { Meteor } from 'meteor/meteor'

export default class LessonPlansList extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            lessonplans:[],
        }
        this.renderLessonPlans.bind(this)
    }

    componentDidMount() {
        this.lessonsTracker = Tracker.autorun(()=>{

            Meteor.subscribe('lessonplans')

            const lessonplans = LessonPlans.find().fetch()
            this.setState({
                lessonplans
            })
        })
    }

    componentWillUnmount() {
        this.lessonsTracker.stop()
    }

    renderLessonPlans() {

        if(this.state.lessonplans.length == 0) {
            return (
                <div>
                    <p>Add your first lessonplan</p>
                </div>  
            )
        }
        else {
            return this.state.lessonplans.map((lessonplan)=>{
                return(<LessonPlan key = {lessonplan._id} {...lessonplan}/>)
            })
        }       
    }
       
    render() {
        return (
            <div>
                {this.renderLessonPlans()}
            </div>
        )
    }
}