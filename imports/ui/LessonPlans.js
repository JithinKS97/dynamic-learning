import React from 'react'
import LessonPlansList from './LessonPlansList'
import TitleBar from './TitleBar'
import AddLessonPlan from './AddLessonPlan'
import { Accounts } from 'meteor/accounts-base'

  
export default class LessonPlans extends React.Component{

    render(){

        /* This Component renders the main LessonPlans dashboard of the teachers */

        return (
            <div>                
                <h1>Lessonplans</h1>
                <button onClick = {()=>{Accounts.logout()}}>Sign out</button>
                <TitleBar/>
                <LessonPlansList/>
                <AddLessonPlan/>
            </div>
        )
    }
}
