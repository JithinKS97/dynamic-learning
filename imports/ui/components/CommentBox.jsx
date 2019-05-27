/*
  eslint-disable
  react/prop-types,
  react/no-unused-state,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/anchor-is-valid,
  jsx-a11y/no-static-element-interactions
*/
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import { Comment, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FaAngleDown from 'react-icons/lib/fa/angle-down';
import CommentReplies from './CommentReplies';
import CommentForm from './CommentForm';


export default class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      replyVis: false,
    };
    Tracker.autorun(() => {
      const { comment: { userId: id } } = this.props;
      Meteor.call('getUsername', id, (err, username) => {
        this.setState({ username });
      });
    });
  }

  componentDidMount() {
    this.setState({ retplyVis: false });
  }

  showReplies() {
    const { replies } = this.props;
    if (replies) {
      return replies.map((reply, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <CommentReplies key={index} {...this.props} subIndex={index} reply={reply} />
      ));
    }

    return 'HAL 9000'; // this is a hack
  }

  findTime() {
    const { comment: { time: currentTime } } = this.props;
    return moment(currentTime);
  }

  showDownArrow() {
    const { visible } = this.state;
    if (visible === false) {
      if (!Meteor.userId()) {
        const { replies } = this.props;
        if (replies.length === 0) {
          return null;
        }

        return (
          <FaAngleDown
            className="arrow"
            size={17}
            onClick={() => {
              this.setState(prev => ({ replyVis: !prev.replyVis }));
            }}
          >
            Show
          </FaAngleDown>
        );
      }

      return (
        <a
          className="arrow"
          size={17}
          onClick={() => {
            this.setState(prev => ({ replyVis: !prev.replyVis }));
          }}
        >
          Reply
        </a>
      );
    }

    return 'HAL 9000'; // this is a hack
  }

  render() {
    const {
      comment: {
        userId,
        comment,
      },
      index,
      deleteComment,
    } = this.props;
    const {
      username,
      replyVis,
    } = this.state;
    return (
      <div>
        <Comment style={
          {
            padding: '0.8rem',
            marginBottom: '0.9rem',
            marginTop: '0.9rem',
            backgroundColor: '#eeeeee',
          }
        }
        >
          <Comment.Content style={{ width: '100%' }}>
            {userId === Meteor.userId()
              ? (
                <Button
                  style={{ float: 'right', padding: '0.5rem' }}
                  onClick={() => {
                    // eslint-disable-next-line no-alert, no-restricted-globals
                    const confirmation = confirm('Are you sure you want to delete your comment?');
                    if (confirmation === true) {
                      deleteComment(index);
                    }
                  }
                }
                >
                  &times;
                </Button>
              ) : null }
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Comment.Author>{username}</Comment.Author>
              <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                <div>{this.findTime().fromNow()}</div>
              </Comment.Metadata>
            </div>

            <Comment.Text style={{ padding: '0.4rem 0', width: '95%' }}>{comment}</Comment.Text>

            {this.showDownArrow()}

            {replyVis
              ? (
                <a
                  className="arrow"
                  size={17}
                  onClick={() => {
                    this.setState(prev => ({ replyVis: !prev.replyVis }));
                  }}
                >
                  Hide
                </a>
              ) : null}
          </Comment.Content>
        </Comment>
        {replyVis
          ? (
            <div>
              <div>{this.showReplies()}</div>
              {Meteor.userId()
                ? (
                  <div>
                    <CommentForm option={index} {...this.props} />
                  </div>
                ) : null}
            </div>
          ) : null}
      </div>
    );
  }
}
