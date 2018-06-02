import React from 'react'
import { Link } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'

const Dashboard = () => {
    return(
        <div>
            <h1>Dashboard</h1>
            <button onClick = {()=>{Accounts.logout()}}>Sign out</button>
            <br/>
            <Link to = 'lessonplans'>
                Create lessons
            </Link>
            <br/>
            <Link to = 'requests'>
                Help make simulations
            </Link>
            <br/>
            <Link to = 'uploadsim'>
                Upload simulations
            </Link>
        </div>
    )
}

export default Dashboard