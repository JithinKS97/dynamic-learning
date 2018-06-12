import React from 'react'
import { LessonPlans } from '../../api/lessonplans'
import LessonPlan from './LessonPlan'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'

const LessonPlansList = (props) => {

    const renderLessonPlans= () => {

        /* This component renders the LessonPlans. The data in the lessonplan
           is passed as prop to the LessonPlan component.
        */

        return props.lessonplans.map((lessonplan)=>{
            return(<LessonPlan key = {lessonplan._id} name = {lessonplan.name} _id = {lessonplan._id}/>)
        })
     
    }
       

    return (
        <ul className = 'list__bordered-button list__bordered-button-grey' >
            {renderLessonPlans()}
        </ul>
    )

}

export default LessonPlansListContainer = withTracker(()=>{

    Meteor.subscribe('lessonplans')
    
    const lessonplans = LessonPlans.find().fetch()

    return {
        lessonplans
    }

})(LessonPlansList)