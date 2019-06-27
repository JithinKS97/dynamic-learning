import React, { Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import {
  Comment,
  Button,
  TextArea,
  Form,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import PropTypes from 'prop-types';

export default class CommentReply extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isEditable: false, tempComment: '' };
  }

  findTime() {
    const { reply: { createdAt } } = this.props;
    return moment(createdAt);
  }

  findLastEditedTime() {
    const { reply: { lastEditedTime } } = this.props;
    return moment(lastEditedTime);
  }

  render() {
    const {
      reply: { userId, comment, lastEditedTime },
      deleteReplyComment,
      index,
      subIndex,
      editReplyComment,
      isMember,
      username,
    } = this.props;

    const { isEditable, tempComment } = this.state;

    const isOwner = userId === Meteor.userId() && isMember;
    return (
      <div>
        <Comment style={{
          padding: '0.8rem',
          marginLeft: '1.6rem',
          marginBottom: '0.9rem',
          backgroundColor: '#eeeeee',
        }}
        >
          <Comment.Content style={{ width: '100%', margin: '1' }}>
            {isOwner
              ? (
                <Button
                  style={{ float: 'right', padding: '0.5rem' }}
                  onClick={() => {
                    // eslint-disable-next-line no-alert, no-restricted-globals
                    const confirmation = confirm('Are you sure you want to delete your comment?');
                    if (confirmation === true) {
                      deleteReplyComment(index, subIndex);
                    }
                  }}
                >
                  X
                </Button>
              ) : null}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Comment.Author>{username}</Comment.Author>
              <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                <div>{this.findTime().fromNow()}</div>
              </Comment.Metadata>
              {lastEditedTime ? (
                <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                  <div>
                    (edited)
                    {' '}
                    {this.findLastEditedTime().fromNow()}
                  </div>
                </Comment.Metadata>
              ) : null}
            </div>

            {isEditable ? null : (
              <Comment.Text style={{
                paddingTop: '0.8rem',
                width: '95%',
                marginBottom: '0.8rem',
              }}
              >
                {comment}
              </Comment.Text>
            )}
            {isEditable
              ? (
                <Form style={{ margin: '1.2rem 0' }}>
                  <TextArea
                    onChange={(e, d) => {
                      this.setState({
                        tempComment: d.value,
                      });
                    }}
                    value={tempComment}
                  />
                </Form>
              )
              : null
            }

            <Fragment>

              {isOwner ? (
                <a
                  onClick={() => {
                    if (isEditable === false) {
                      this.setState({ isEditable: true, tempComment: comment });
                    } else {
                      this.setState({ isEditable: false });
                      editReplyComment(index, subIndex, tempComment);
                    }
                  }}
                  size={17}
                  className="arrow"
                >
                  {isEditable ? 'Save' : 'Edit'}
                </a>
              ) : null}

              {isEditable ? <a style={{ marginLeft: '1.2rem' }} size={17} onClick={() => { this.setState({ isEditable: false }); }} className="arrow">Cancel</a> : null}

            </Fragment>

          </Comment.Content>
        </Comment>
      </div>
    );
  }
}

CommentReply.propTypes = {
  reply: PropTypes.shape({
    comment: PropTypes.string,
    userId: PropTypes.string,
    createdAt: PropTypes.number,
    lastEditedTime: PropTypes.number,
  }).isRequired,
  deleteReplyComment: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  subIndex: PropTypes.number.isRequired,
  editReplyComment: PropTypes.func.isRequired,
  isMember: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
};
