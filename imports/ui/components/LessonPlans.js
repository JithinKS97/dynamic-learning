import React from 'react'
import LessonPlansList from '../components/LessonPlansList'
import AddLessonPlan from '../components/AddLessonPlan'
import { Accounts } from 'meteor/accounts-base'
import { Link } from 'react-router-dom'

  
const LessonPlans = () => {

    /* This Component renders the main LessonPlans dashboard of the teachers */

    return (
        <div>              
            <AddLessonPlan/>
            <LessonPlansList/>
        </div>
    )
    
}

export default LessonPlans