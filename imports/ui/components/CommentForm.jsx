import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Form, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import PropTypes from 'prop-types';

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
    } = this.props;
    if (indexOfComment === -1) {
      if (this.comment.value) {
        const comment = this.comment.value;
        slides[curSlide].comments.push({
          comment,
          userId: Meteor.userId(),
          time: Date.now(),
          replies: [],
        });
        updateSlides(slides);
        this.comment.value = '';
      }
    } else if (this.comment.value) {
      const comment = this.comment.value;
      slides[curSlide].comments[indexOfComment].replies.push({
        comment,
        userId: Meteor.userId(),
        time: Date.now(),
      });
      updateSlides(slides);
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
          <textarea rows="3" placeholder="Comment" ref={e => this.comment = e} />
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
};
