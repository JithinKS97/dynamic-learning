/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Requests } from "../../api/requests";
import { List, Dimmer, Loader, Card } from "semantic-ui-react";
import moment from 'moment';

const RequestsList = props => {

    const [requestId, changeRequestId] = useState('');
    const [usernames, changeUsernames] = useState([]);

    useEffect(() => {

        Meteor.call('getUsernames', props.requests.map(request => request.userId), (err, usernames) => {

            changeUsernames(usernames);
        })
    })

    const findTime = (time) => moment(time);

    const displayTime = (index) => {

        if (props.requests.length > 0) {

            return findTime(props.requests[index].updatedAt).fromNow();
        }
    }

    const displayUsername = (index) => {

        if(usernames.length>0) {

            if(usernames[index].username)
                return usernames[index].username
        }
    }

    const renderRequests = () => {
        return props.requests.map((request, index) => {
            if (request.requestTitle) {
                return (
                    <Card onClick={() => {
                        changeRequestId(request._id)
                    }} style={{ width: '100%', margin: 0 }} key={index}>
                        <Card.Content>
                            <Card.Header>{request.requestTitle}</Card.Header>
                            <Card.Description style={{marginLeft:'0.4rem'}}>{request.description}</Card.Description>
                            <Card.Meta style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'row', marginLeft:'0.4rem' }}>
                                <div>
                                    {displayUsername(index)}
                                </div>
                                <div>
                                    last activity {displayTime(index)}
                                </div>
                            </Card.Meta>
                        </Card.Content>
                    </Card>
                );
            }
        });
    };

    if (requestId) {

        return <Redirect to={`/request/${requestId}`} />
    }

    return (
        <div>
            <Dimmer inverted active={props.loading}>
                <Loader />
            </Dimmer>
            <List
                selection
                style={{ height: window.innerHeight - 150, marginTop: "2.4rem" }}
                selection
                verticalAlign="middle"
            >
                {renderRequests()}
            </List>
        </div>
    );
};

export default (RequestsListContainer = withTracker(props => {
    const requestsHandle = Meteor.subscribe("requests");
    const loading = !requestsHandle.ready();

    return {
        requests: Requests.find().fetch(),
        loading
    };
})(RequestsList));
