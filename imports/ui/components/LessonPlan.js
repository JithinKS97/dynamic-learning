import React from 'react'
import { Link } from 'react-router-dom'
import { LessonPlans } from '../../api/lessonplans'
import { Requests } from '../../api/requests'

const LessonPlan = (props)=>{

    /* This component renders the individual lessonplan buttons
       The lessonplan object is passed as the props of the Link
       to the CreateLessonPlanComponent.

       Since the Request object is associated with a Lessonplan.
       If the Lessonplan is delted, the corrsponding Requests
       are also removed.
    */

    return (
        <div>
            <Link to={{ pathname: `/createlessonplan/${props._id}`}}>
                    {props.name}
            </Link>

            <button onClick = {() => {
                
                const confirmation = confirm(`Are you sure want to delete the lessonplan ${props.name}?`);

                if(confirmation == true) {
                    Meteor.call('lessonplans.remove', props._id)                }
                

            }}>X</button>

        </div>
    )
}

export default LessonPlan