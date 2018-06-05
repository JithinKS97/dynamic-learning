import React from 'react'
import LessonPlansList from '../components/LessonPlansList'
import TitleBar from '../components/TitleBar'
import AddLessonPlan from '../components/AddLessonPlan'
import { Accounts } from 'meteor/accounts-base'
import { Link } from 'react-router-dom'

  
const LessonPlans = () => {

    /* This Component renders the main LessonPlans dashboard of the teachers */

    return (
        <div>
            <TitleBar/>                
            <h1>Lessonplans</h1>
            <Link to = 'dashboard'>Dashboard</Link>
            <AddLessonPlan/>
            <LessonPlansList/>
        </div>
    )
    
}

export default LessonPlans