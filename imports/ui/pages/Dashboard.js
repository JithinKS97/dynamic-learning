import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
    return(
        <div>
            <Link to = 'lessonplans'>
                Create lessons
            </Link>
            <br/>
            <Link to = 'requests'>
                Help make simulations
            </Link>
        </div>
    )
}

export default Dashboard