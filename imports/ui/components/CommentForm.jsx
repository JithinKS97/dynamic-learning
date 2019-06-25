/* eslint-disable prefer-template */
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Form, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import PropTypes from 'prop-types';

const generateRandomId = () => Math.random().toString(36).substr(2, 16);

export default class CommentForm extends Component {
  componentDidMount() {
    this.postComment.bind(this);
  }

  postComment = () => {
    const {
      indexOfComment,
      slides,
      curSlide,
      updateSlides,
      isAuthenticated,
      isMember,
    } = this.props;

    if (!(isAuthenticated && isMember)) return;

    if (indexOfComment === -1) {
      if (this.comment.value) {
        const comment = this.comment.value;
        slides[curSlide].comments.push({
          _id: generateRandomId(),
          comment,
          userId: Meteor.userId(),
          time: Date.now(),
          replies: [],
          edited: null,
        });
        updateSlides(slides, 'memberOp');
        this.comment.value = '';
      }
    } else if (this.comment.value) {
      const comment = this.comment.value;
      slides[curSlide].comments[indexOfComment].replies.push({
        _id: generateRandomId(),
        comment,
        userId: Meteor.userId(),
        time: Date.now(),
        edited: null,
      });
      updateSlides(slides, 'memberOp');
      this.comment.value = '';
    }
  }

  render() {
    const { indexOfComment } = this.props;
    return (
      <Form
        style={{ marginLeft: indexOfComment === -1 ? '0rem' : '1.6rem', maxWidth: '650px', marginBottom: '0.9rem' }}
        onSubmit={this.postComment}
      >
        <Form.Field>
          {/* eslint-disable-next-line no-return-assign */}
          <textarea rows="3" placeholder="Type something..." ref={e => this.comment = e} />
        </Form.Field>
        <Form.Field>
          <Button type="submit">Submit</Button>
        </Form.Field>
      </Form>
    );
  }
}

CommentForm.propTypes = {
  indexOfComment: PropTypes.number.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  curSlide: PropTypes.number.isRequired,
  updateSlides: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isMember: PropTypes.bool.isRequired,
};
