/* eslint-disable react/prop-types */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import { Comment, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';


export default class CommentReplies extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '' };
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
    } = this.props;
    const { username } = this.state;
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
            {userId === Meteor.userId()
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
                  &times;
                </Button>
              ) : null}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Comment.Author>{username}</Comment.Author>
              <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                <div>{this.findTime().fromNow()}</div>
              </Comment.Metadata>
            </div>

            <Comment.Text style={{
              paddingTop: '0.8rem',
              width: '95%',
            }}
            >
              {comment}
            </Comment.Text>
          </Comment.Content>
        </Comment>
      </div>
    );
  }
}
