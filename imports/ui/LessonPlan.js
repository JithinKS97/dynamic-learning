import React from 'react'
import { Link } from 'react-router-dom'
import { LessonPlans } from '../api/lessonplans'

const LessonPlan = (props)=>{

    return (
        <div>

            <Link to={{ pathname: '/createlessonplan', state: { lessonplan_id: props.lessonplan_id}}}>
                <button>
                    {props.name}
                </button>
            </Link>

            <button onClick = {() => {
                LessonPlans.remove(props.lessonplan_id)
            }}>X</button>
        </div>
    )
}

export default LessonPlan