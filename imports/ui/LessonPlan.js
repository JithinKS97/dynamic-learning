import React from 'react'
import { Link } from 'react-router-dom'

const LessonPlan = (props)=>{

    return (
        <div>
            <Link to={{ pathname: '/createlessonplan', state: { lessonplan_id: props._id}}}>
                <button>
                    {props.name}
                </button>
            </Link>

            <button onClick = {() => {
                Meteor.call('lessonplans.remove', props._id)
            }}>X</button>

        </div>
    )
}

export default LessonPlan