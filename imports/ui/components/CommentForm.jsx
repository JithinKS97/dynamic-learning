/* eslint-disable react/prop-types, react/jsx-no-bind */
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Form, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';


export default class CommentForm extends Component {
  componentDidMount() {
    this.postComment.bind(this);
  }

  postComment(e, { value }) { // eslint-disable-line no-unused-vars
    const {
      option,
      slides,
      curSlide,
      saveChanges,
    } = this.props;
    if (option === -1) {
      if (this.comment.value) {
        const comment = this.comment.value;
        slides[curSlide].comments.push({
          comment,
          userId: Meteor.userId(),
          time: Date.now(),
          replies: [],
        });
        saveChanges(slides);
        this.comment.value = '';
      }
    } else if (this.comment.value) {
      const comment = this.comment.value;
      slides[curSlide].comments[option].replies.push({
        comment,
        userId: Meteor.userId(),
        time: Date.now(),
      });
      saveChanges(slides);
      this.comment.value = '';
    }
  }

  render() {
    const { option } = this.props;
    return (
      <Form
        style={{ marginLeft: option === -1 ? '0rem' : '1.6rem', maxWidth: '650px' }}
        onSubmit={this.postComment.bind(this)}
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
