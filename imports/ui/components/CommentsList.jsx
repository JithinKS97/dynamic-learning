/* eslint-disable react/prop-types, react/no-array-index-key, no-return-assign */
import React, { Component } from 'react';
import { Comment, Header } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
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
    const { slides, curSlide } = this.props;
    if (slides.length > 0) {
      const { comments } = slides[curSlide];

      return comments.map((comment, index) => {
        const { replies } = comment;

        return (
          <CommentBox
            ref={el => this.commentRefs[index] = el}
            key={index}
            index={index}
            comment={comment}
            {...this.props}
            replies={replies}
          />
        );
      });
    }

    return null; // this is a hack
  }

  render() {
    return (
      <div>
        <Comment.Group>
          <Header as="h3" dividing>
            Comments
          </Header>
          {this.showComments()}
        </Comment.Group>
        {Meteor.userId()
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
