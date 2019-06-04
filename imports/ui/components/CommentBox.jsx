/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable consistent-return */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */

import React from 'react';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import {
  Comment,
  Button,
  TextArea,
  Form,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FaAngleDown from 'react-icons/lib/fa/angle-down';
import { Tracker } from 'meteor/tracker';
import CommentForm from './CommentForm';
import CommentReply from './CommentReply';

export default class CommentBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      replyVis: false,
      isEditable: false,
      tempComment: '',
    };

    Tracker.autorun(() => {
      Meteor.call('getUsername', this.props.comment.userId, (err, username) => {
        this.setState({ username });
      });
    });
  }

  componentDidMount() {
    this.setState({

      replyVis: false,
    });
  }

  showReplies() {
    const { replies } = this.props;
    if (replies) {
      return (replies.map((reply, index) => (
        <CommentReply key={index} {...this.props} subIndex={index} reply={reply} />
      )));
    }
    return null;
  }

  findTime() {
    return moment(this.props.comment.time);
  }

  showDownArrow() {
    if (this.state.replyVis === false) {
      if (!Meteor.userId()) {
        if (this.props.replies.length === 0) {
          return null;
        }

        return (

          <FaAngleDown
            className="arrow"
            size={17}
            onClick={() => {
              this.setState(prev => ({

                replyVis: !prev.replyVis,
              }));
            }}
          >
            Show
          </FaAngleDown>
        );
      }
      if (this.state.isEditable === false) {
        return (
          <a
            className="arrow"
            style={{ marginRight: '1.2rem' }}
            size={17}
            onClick={() => {
              this.setState(prev => ({

                replyVis: !prev.replyVis,
              }));
            }}
          >
            Replies
          </a>
        );
      }
    }
  }

  render() {
    const isOwner = Meteor.userId() === this.props.comment.userId && this.props.isMember;
    return (
      <div>
        <Comment style={{
          padding: '0.8rem', marginBottom: '0.9rem', marginTop: '0.9rem', backgroundColor: '#eeeeee',
        }}
        >
          <Comment.Content style={{ width: '100%' }}>
            {/* <Comment.Avatar src='/images/avatar/small/matt.jpg' /> */}
            {isOwner ? (
              <Button
                style={{ float: 'right', padding: '0.5rem' }}
                onClick={() => {
                  const confirmation = confirm('Are you sure you want to delete your comment?');
                  if (confirmation === true) { this.props.deleteComment(this.props.index); }
                }
                }
              >
                X
              </Button>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Comment.Author>{this.state.username}</Comment.Author>
              <Comment.Metadata style={{ paddingLeft: '0.8rem', paddingTop: '0.15rem' }}>
                <div>{this.findTime().fromNow()}</div>
              </Comment.Metadata>
            </div>

            {!this.state.isEditable ? <Comment.Text style={{ padding: '0.8rem 0', width: '95%' }}>{this.props.comment.comment}</Comment.Text> : null}
            {this.state.isEditable ? (
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
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {this.showDownArrow()}

              {this.state.replyVis ? (
                <a
                  className="arrow"
                  style={{ marginRight: '1.2rem' }}
                  size={17}
                  onClick={() => {
                    this.setState(prev => ({
                      replyVis: !prev.replyVis,
                    }));
                  }}
                >
                  Hide
                </a>
              ) : null}

              { isOwner ? (
                <a
                  onClick={() => {
                    if (this.state.isEditable === false) {
                      this.setState({
                        isEditable: true,
                        tempComment: this.props.comment.comment,
                      });
                    } else {
                      this.setState({
                        isEditable: false,
                      }, () => {
                        this.props.editComment(this.state.tempComment, this.props.index);
                      });
                    }
                  }}
                  className="arrow"
                >
                  {this.state.isEditable ? 'Save' : 'Edit'}
                </a>
              ) : null}
              {this.state.isEditable ? <a style={{ marginLeft: '1.2rem' }} size={17} className="arrow" onClick={() => { this.setState({ isEditable: false }); }}>Cancel</a> : null}
            </div>
          </Comment.Content>
        </Comment>
        {this.state.replyVis ? (
          <div>
            <div>{this.showReplies()}</div>
            {Meteor.userId() && this.props.isMember
              ? <div><CommentForm option={this.props.index} {...this.props} /></div> : null}
          </div>
        ) : null}
      </div>
    );
  }
}
