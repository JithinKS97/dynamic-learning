import React from 'react';
import moment from 'moment';
import {
  Comment,
  Button,
  TextArea,
  Form,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Icon } from 'react-icons-kit';
import {angleDown} from 'react-icons-kit/fa/angleDown';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import CommentReply from './CommentReply';

export default class CommentBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      replyVis: false,
      isEditable: false,
      tempComment: '',
    };
  }

  componentDidMount() {
    this.setState({

      replyVis: false,
    });
  }

  showReplies() {
    const {
      replies,
      deleteReplyComment,
      editReplyComment,
      isMember,
      index,
      _idToNameMappings,
    } = this.props;
    if (replies) {
      return (replies.map((reply, i) => (
        <CommentReply
          key={reply.createdAt}
          subIndex={i}
          reply={reply}
          deleteReplyComment={deleteReplyComment}
          editReplyComment={editReplyComment}
          isMember={isMember}
          index={index}
          username={_idToNameMappings[reply.userId]}
        />
      )));
    }
  }

  findTime() {
    const { comment: { createdAt } } = this.props;
    return moment(createdAt);
  }

  findLastEditedTime() {
    const { comment: { lastEditedTime } } = this.props;
    return moment(lastEditedTime);
  }

  showDownArrow() {
    const { replyVis, isEditable } = this.state;
    const { replies, currentUserId } = this.props;
    if (replyVis === false) {
      if (!currentUserId) {
        if (replies.length === 0) {
          return null;
        }

        return (

          <Icon
            icon={angleDown}
            className="arrow"
            size={17}
            onClick={() => {
              this.setState(prev => ({

                replyVis: !prev.replyVis,
              }));
            }}
          >
            Show
          </Icon>
        );
      }
      if (isEditable === false) {
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
    const {
      isMember,
      comment: { userId },
      deleteComment,
      index,
      // eslint-disable-next-line react/prop-types
      comment: { comment, _id },
      editComment,
      slides,
      curSlide,
      updateSlides,
      isAuthenticated,
      comment: { lastEditedTime },
      username,
      currentUserId,
    } = this.props;
    const {
      isEditable,
      tempComment,
      replyVis,
    } = this.state;
    const isOwner = currentUserId === userId && isMember;
    return (
      <div>
        <Comment style={{
          padding: '0.8rem', marginBottom: '0.8rem', marginTop: '0.8rem', backgroundColor: '#eeeeee',
        }}
        >
          <Comment.Content style={{ width: '100%' }}>
            {/* <Comment.Avatar src='/images/avatar/small/matt.jpg' /> */}
            {isOwner ? (
              <Button
                style={{ float: 'right', padding: '0.5rem' }}
                onClick={() => {
                  const confirmation = confirm('Are you sure you want to delete your comment?');
                  if (confirmation === true) { deleteComment(index); }
                }
                }
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

            {!isEditable ? <Comment.Text style={{ padding: '0.8rem 0', width: '95%' }}>{comment}</Comment.Text> : null}
            {isEditable ? (
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
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {this.showDownArrow()}

              {replyVis ? (
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
                    if (isEditable === false) {
                      this.setState({
                        isEditable: true,
                        tempComment: comment,
                      });
                    } else {
                      this.setState({
                        isEditable: false,
                      }, () => {
                        editComment(tempComment, index, _id);
                      });
                    }
                  }}
                  className="arrow"
                >
                  {isEditable ? 'Save' : 'Edit'}
                </a>
              ) : null}
              {isEditable ? <a style={{ marginLeft: '1.2rem' }} size={17} className="arrow" onClick={() => { this.setState({ isEditable: false }); }}>Cancel</a> : null}
            </div>
          </Comment.Content>
        </Comment>
        {replyVis ? (
          <div>
            <div>{this.showReplies()}</div>
            {currentUserId && isMember
              ? (
                <div>
                  <CommentForm
                    indexOfComment={index}
                    slides={slides}
                    curSlide={curSlide}
                    updateSlides={updateSlides}
                    isAuthenticated={isAuthenticated}
                    isMember={isMember}
                  />
                </div>
              ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

CommentBox.propTypes = {
  isMember: PropTypes.bool.isRequired,
  comment: PropTypes.shape({
    comment: PropTypes.string,
    userId: PropTypes.string,
    createdAt: PropTypes.number,
    replies: PropTypes.arrayOf(PropTypes.object).isRequired,
    lastEditedTime: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
  editComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  replies: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteReplyComment: PropTypes.func.isRequired,
  editReplyComment: PropTypes.func.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  curSlide: PropTypes.number.isRequired,
  updateSlides: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  username: PropTypes.string,
  _idToNameMappings: PropTypes.objectOf(PropTypes.string).isRequired,
  currentUserId: PropTypes.string.isRequired,
};

CommentBox.defaultProps = {
  username: '',
};
