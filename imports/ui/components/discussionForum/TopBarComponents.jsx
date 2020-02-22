import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import PropTypes from 'prop-types';
import history from '../../../routes/history';

export const TopBarIcon = () => (
  <div onClick={() => history.goBack()}>
    <img className="discussion-forum__topbar__icon" alt="dynamic-learning-logo" src="/symbol.png" />
  </div>
);

export const CloseForumBtn = (props) => {
  if (props.isOwner) {
    return (
      <div
        className="discussion-forum__topbar__item"
        onClick={() => {
          const confirmation = confirm(
            'Are you sure you want to close this forum?',
          );
          if (confirmation && props.isOwner) {
            Meteor.call('requests.reset', props._id);
            history.goBack();
          }
        }}
      >
        Close this forum
      </div>
    );
  }
  return null;
};

export const JoinBtn = (props) => {
  if (props.isAuthenticated && !props.isMember) {
    return (
      <div
        className="discussion-forum__topbar__item"
        onClick={() => {
          props.handleJoin();
        }}
      >
        Join
      </div>
    );
  }
  return null;
};

export const LeaveBtn = (props) => {
  if (props.isAuthenticated && props.isMember && !props.isOwner) {
    return (
      <div
        className="discussion-forum__topbar__item"
        onClick={() => {
          props.handleLeave();
        }}
      >
        Leave
      </div>
    );
  }
  return null;
};

export const PendingRequests = (props) => {
  if (props.isOwner && props.isMember) {
    return (
      <div
        className="discussion-forum__topbar__item"
        onClick={() => {
          props.handleShowMembershipRequests();
        }}
      >
        Membership requests
        {props.pendingMembers.length > 0 ? ` ${props.pendingMembers.length}` : null}
      </div>
    );
  }
  return null;
};

export const ShowMembers = props => (
  <div
    className="discussion-forum__topbar__item"
    onClick={() => {
      props.handleShowMembers();
    }}
  >
    Members
  </div>
);

export const CreatedTime = props => (
  <div
    className="discussion-forum__topbar__item"
  >
    {`Opened ${moment(props.createdAt || Date.now()).fromNow()}`}
  </div>
);


CloseForumBtn.propTypes = {
  isOwner: PropTypes.bool.isRequired,
  _id: PropTypes.String,
};

JoinBtn.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isMember: PropTypes.bool.isRequired,
  handleJoin: PropTypes.func.isRequired,
};

LeaveBtn.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isMember: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  handleLeave: PropTypes.func.isRequired,
};

PendingRequests.propTypes = {
  isMember: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  pendingMembers: PropTypes.array.isRequired,   // eslint-disable-line
  handleShowMembershipRequests: PropTypes.func.isRequired,
};

ShowMembers.propTypes = {
  handleShowMembers: PropTypes.func.isRequired,
};

CreatedTime.propTypes = {
  createdAt: PropTypes.number,
};
