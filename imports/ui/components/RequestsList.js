import React from 'react'
import { Link } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import { Requests } from '../../api/requests'
const RequestsList = (props) => {

    const renderRequests = () => {       

        return props.requests.map((request, index) => {

            if(request.requestTitle) {
                return (
                    <div key = {index}>
                        <Link to={{ pathname: `/request/${request._id}`}} >
                            {request.requestTitle}
                        </Link>
                    </div>
                )
            }
            
        })
    }

    return(
        <div>
            {renderRequests()}
        </div>
    )


}

export default RequestsListContainer = withTracker((props)=>{

    Meteor.subscribe('requests')

    return({
        requests:Requests.find().fetch()
    })

})(RequestsList)