/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import {
  List, Dimmer, Loader, Card,
} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Requests } from '../../../api/requests';

const RequestsList = (props) => {
  const [requestId, changeRequestId] = useState('');
  const [_idToNameMappings, changeIdToNameMappings] = useState({});

  useEffect(() => {
    Meteor.call('getUsernames', props.requests.map(request => request.userId), (_err, users) => {
      const tempMappings = {};
      users.map((user) => {
        tempMappings[user.userId] = user.username;
      });
      changeIdToNameMappings(tempMappings);
    });
  }, [props.requests]);

  const findTime = time => moment(time);
  const { loading } = props;

  const displayTime = (index) => {
    const { requests } = props;

    if (requests.length > 0) {
      return findTime(requests[index].updatedAt).fromNow();
    }
  };

  const displayCreatedTime = (index) => {
    const { requests } = props;

    if (requests.length > 0) {
      return findTime(requests[index].createdAt).fromNow();
    }
  };

  const renderRequests = () => props.requests.map((request, index) => {
    if (request.requestTitle) {
      return (
        <Card
          onClick={() => {
            changeRequestId(request._id);
          }}
          style={{ width: '100%', margin: 0 }}
          key={request.createdAt}
        >
          <Card.Content>
            <Card.Header>{request.requestTitle}</Card.Header>
            <Card.Description style={{ marginLeft: '0.4rem' }}>{request.description}</Card.Description>
            <Card.Meta style={{
              marginTop: '0.4rem', display: 'flex', flexDirection: 'row', marginLeft: '0.4rem',
            }}
            >
              <div>
                {_idToNameMappings[request.userId]}
              </div>
              <div>
                |
              </div>
              <div>
                last activity
                {' '}
                {displayTime(index)}
              </div>
              <div>
                |
              </div>
              <div>
                created
                {' '}
                {displayCreatedTime(index)}
              </div>
            </Card.Meta>
          </Card.Content>
        </Card>
      );
    }
  });

  if (requestId) {
    return (
      <Redirect to={{
        pathname: `/request/${requestId}`,
        state: { from: 'dashboard' },
      }}
      />
    );
  }

  return (
    <div>
      <Dimmer inverted active={loading}>
        <Loader />
      </Dimmer>
      <List
        style={{ height: window.innerHeight - 150, marginTop: '2.4rem' }}
        selection
        verticalAlign="middle"
      >
        {renderRequests()}
      </List>
    </div>
  );
};

const RequestsListContainer = withTracker(() => {
  const requestsHandle = Meteor.subscribe('requests');
  const loading = !requestsHandle.ready();

  return {
    requests: Requests.find().fetch(),
    loading,
  };
})(RequestsList);

RequestsList.propTypes = {
  loading: PropTypes.bool.isRequired,
  requests: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RequestsListContainer;
