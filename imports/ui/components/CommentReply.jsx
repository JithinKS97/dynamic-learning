/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import React, { Fragment } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import {
  Comment,
  Button,
  TextArea,
  Form,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export default class CommentReply extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '', isEditable: false, tempComment: '' };
    Tracker.autorun(() => {
      const { reply: { userId } } = this.props;
      Meteor.call('getUsername', userId, (err, username) => {
        this.setState({ username });
      });
    });
  }

  findTime() {
    const { reply: { time } } = this.props;
    return moment(time);
  }

  render() {
    const {
      reply: { userId, comment },
      deleteReplyComment,
      index,
      subIndex,
      editReplyComment,
    } = this.props;
    const { username } = this.state;

    const isOwner = userId === Meteor.userId() && this.props.isMember;
    return (
      <div>
        <Comment style={{
          padding: '0.8rem',
          marginLeft: '1.6rem',
          marginBottom: '1.2rem',
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
            </div>

            {this.state.isEditable ? null : (
              <Comment.Text style={{
                paddingTop: '0.8rem',
                width: '95%',
                marginBottom: '0.8rem',
              }}
              >
                {comment}
              </Comment.Text>
            )}
            {this.state.isEditable
              ? (
                <Form style={{ margin: '1.2rem 0' }}>
                  <TextArea
                    onChange={(e, d) => {
                      this.setState({
                        tempComment: d.value,
                      });
                    }}
                    value={this.state.tempComment}
                  />
                </Form>
              )
              : null
            }

            <Fragment>

              {isOwner ? (
                <a
                  onClick={() => {
                    if (this.state.isEditable === false) {
                      this.setState({ isEditable: true, tempComment: comment });
                    } else {
                      this.setState({ isEditable: false });
                      editReplyComment(index, subIndex, this.state.tempComment);
                    }
                  }}
                  size={17}
                  className="arrow"
                >
                  {this.state.isEditable ? 'Save' : 'Edit'}
                </a>
              ) : null}

              {this.state.isEditable ? <a style={{ marginLeft: '1.2rem' }} size={17} onClick={() => { this.setState({ isEditable: false }); }} className="arrow">Cancel</a> : null}

            </Fragment>

          </Comment.Content>
        </Comment>
      </div>
    );
  }
}
