import React from 'react'
import { Link } from 'react-router-dom'
import { LessonPlans } from '../api/lessonplans'
import { Requests } from '../api/requests'

const LessonPlan = (props)=>{

    return (
        <div>
            <Link to={{ pathname: '/createlessonplan', state: {...props}}}>
                <button>
                    {props.name}
                </button>
            </Link>

            <button onClick = {() => {
                LessonPlans.remove(props._id)
                Requests.remove(props._id)
            }}>X</button>

        </div>
    )
}

export default LessonPlan