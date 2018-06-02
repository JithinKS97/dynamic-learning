import React from 'react'
import { Link } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import RequestsList from '../components/RequestsList'

const Requests = () => {

    return(
        <div>
            <h1>Requests</h1>
            <Link to ='dashboard'>
                Dashboard
            </Link>
            <RequestsList/>
        </div>
    )
}

export default Requests

