import React from 'react'
import LessonPlansList from '../components/LessonPlansList'
import AddLessonPlan from '../components/AddLessonPlan'
  
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