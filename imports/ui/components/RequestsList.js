import React from 'react'
import { Link } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import { Requests } from '../../api/requests'
import { List, Header } from 'semantic-ui-react'

const RequestsList = (props) => {

    const renderRequests = () => {       

        return props.requests.map((request, index) => {

            if(request.requestTitle) {
                return (
                    <List.Item key = {index} >
                        <Link to={{ pathname: `/request/${request._id}`}} >
                            
                                <List.Content style = {{color:'black', paddingLeft:'2.4rem'}}>                  
                                    {request.requestTitle}                             
                                </List.Content>
                            
                        </Link>
                    </List.Item>
                )
            }
            
        })
    }

    return(
        <div>
            <List style = {{height:'720px', marginTop:'2.4rem'}}  selection verticalAlign='middle'>
                {renderRequests()}
            </List>            
        </div>
    )


}

export default RequestsListContainer = withTracker((props)=>{

    Meteor.subscribe('requests')

    return({
        requests:Requests.find().fetch()
    })

})(RequestsList)