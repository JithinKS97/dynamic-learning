/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import {
  List,
} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { FaCode } from 'react-icons/fa';
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
        <div
          className="sharedResources__listItem"
          onClick={() => {
            changeRequestId(request._id);
          }}
          style={{ width: '100%', margin: 0 }}
          key={request.createdAt}
        >
          <div>
            <div className="sharedResources__listItem-title">{request.requestTitle}</div>
            <div className="sharedResources__listItem-description">{request.description}</div>
            <div
              className="sharedResources__listItem-detail"
            >
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  {_idToNameMappings[request.userId]}
                </div>
                <div style={{ marginLeft: '4rem' }}>
                  active
                  {' '}
                  {displayTime(index)}
                </div>
              </div>
              <div>
                {displayCreatedTime(index)}
              </div>
            </div>
          </div>
        </div>
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
    <div style={{ padding: '4rem', paddingTop: '0' }}>
      <div style={{ width: '2rem', margin: 'auto', marginTop: '2rem' }}>
        <FaCode style={{ marginRight: '2rem' }} size="3rem" />
      </div>
      <List
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
  requests: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RequestsListContainer;
