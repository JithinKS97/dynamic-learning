import React from 'react'
import { LessonPlans } from '../api/lessonplans'
import {Tracker} from 'meteor/tracker'
import {Link} from 'react-router-dom'

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
        return this.state.lessonplans.map((lessonplan)=>{
            return (
                <p key={lessonplan._id}>                    
                    <button>
                        <Link to={{ pathname: '/createlessonplan', state: { lessonplan_id: lessonplan._id}}}>
                            {lessonplan.name}
                        </Link>
                    </button>
                    <button onClick = {() => {
                        LessonPlans.remove(lessonplan._id)
                    }}>X</button>                 
                </p>
            )
        })
    }
    
    render() {
        return (
            <div>
                {this.renderLessonPlans()}
            </div>
        )
    }
}