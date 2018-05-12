import React from 'react'
import { Accounts } from 'meteor/accounts-base'
import LessonPlansList from './LessonPlansList'
import { LessonPlans } from '../api/lessonplans'

  
export default class LessonPlan extends React.Component{

    onLogout() {
        Accounts.logout()
    }

    createLessonPlan(e) {
        e.preventDefault()
        const name = this.refs.lessonplan.value.trim()
        if(name) {
            LessonPlans.insert({name,slides:[]})
        } 
        this.refs.lessonplan.value = ''
    }
    
    render(){

        return (
            <div>
                <h1>Lesson plans</h1>
                <button onClick = {this.onLogout.bind(this)}>Sign out</button>
                <p>Create Lessonplan</p>
                <form onSubmit = {this.createLessonPlan.bind(this)}>
                    <input type = 'text' name = 'lessonplan' ref = 'lessonplan' placeholder = 'Name'/>
                    <button>Submit</button>
                </form>
                <LessonPlansList/>
            </div>
        )
    }
}
