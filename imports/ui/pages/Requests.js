import React from 'react'
import { Link } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import RequestsList from '../components/RequestsList'

const Requests = () => {

    return(
        <div>
            <Link to ='dashboard'>
                Dashboard
            </Link>
            <RequestsList/>
        </div>
    )
}

export default Requests

