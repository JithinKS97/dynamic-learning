import React, { Component } from 'react';
import { Comment, Header } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CommentBox from './CommentBox';

export default class commentsList extends Component {
  constructor(props) {
    super(props);
    this.commentRefs = [];
  }

  collapse() {
    if (!this.commentRefs) {
      return;
    }

    this.commentRefs.forEach((comment) => {
      if (comment) {
        comment.setState({ replyVis: false });
      }
    });
  }

  showComments() {
    const { slides, curSlide, _idToNameMappings } = this.props;
    if (slides.length > 0) {
      const { comments } = slides[curSlide];

      return comments.map((comment, index) => {
        const { replies } = comment;
        return (
          <CommentBox
            ref={(el) => { this.commentRefs[index] = el; }}
            key={comment.time}
            index={index}
            username={_idToNameMappings[comment.userId]}
            comment={comment}
            {...this.props}
            replies={replies}
          />
        );
      });
    }
  }

  render() {
    const { isAuthenticated } = this.props;
    return (
      <div>
        <Comment.Group>
          <Header style={{ marginBottom: '1.2rem' }} as="h3" dividing>
            Comments
          </Header>
          {this.showComments()}
        </Comment.Group>
        {isAuthenticated
          ? null : (
            <h3>
              <Link to="/login">Login</Link>
              to participate in the discussion
            </h3>
          )
        }
      </div>
    );
  }
}

commentsList.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  curSlide: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  _idToNameMappings: PropTypes.objectOf(PropTypes.string).isRequired,
};
