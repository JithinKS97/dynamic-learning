import React from 'react';
import Comments from '../../api/comments';
import { Tracker } from 'meteor/tracker';
import {
    Button, Form, Comment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

// this component allows us to view the comments made by a user on a lesson

export default class LessonComment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: '',
            comments: []
        };
    }

    componentDidMount() {
        Meteor.subscribe('comments');
        Meteor.subscribe('getAccounts');

        Tracker.autorun(() => {
            if (Meteor.user()) {
                this.setState({
                    user: Meteor.user().username,
                });
            }
            this.setState({
                comments: Comments.find().fetch()
            })
        })
    }

    deleteComment = (_id) => {
        Meteor.call('comments.delete', _id);
        this.setState({
            comments: Comments.find().fetch()
        });
    }

    addComment = () => {
        const { lessonid } = this.props;
        Meteor.call('comments.insert', this.comment.value, Meteor.userId(), lessonid);
        this.setState({
            comments: Comments.find().fetch()
        });
    }

    render = () => {
        const { comments } = this.state;
        const { lessonid } = this.props;
        return (
            <div style={{ paddingTop: '1.5rem', marginLeft: '1.2rem', width: '40%' }}>
                {comments.map(comment => {
                    return (
                        <Comment style={{
                            padding: '0.8rem', marginBottom: '0.8rem', marginTop: '0.8rem', backgroundColor: '#eeeeee',
                        }}>
                            <Comment.Content>
                                {
                                    Meteor.userId() === comment.userid &&
                                    <Button
                                        onClick={() => this.deleteComment(comment._id)}
                                        style={{ float: 'right' }}
                                    >
                                        X
                                </Button>
                                }
                                <Comment.Author>
                                    <b>
                                        {Meteor.users.findOne({ _id: comment.userid }).username}
                                    </b>
                                </Comment.Author>
                                {comment.content}

                            </Comment.Content>
                        </Comment>
                    );
                    // <div> {comment.lessonid === lessonid && comment.content} </div>
                })}
                <Form
                    style={{ marginTop: '0.5rem', marginBottom: '0.9rem' }}
                    onSubmit={() => this.addComment()}
                >
                    <Form.Field>
                        {/* eslint-disable-next-line no-return-assign */}
                        <textarea rows="3" placeholder="Comment" ref={e => this.comment = e} />
                    </Form.Field>
                    <Form.Field>
                        <Button type="submit">Submit</Button>
                    </Form.Field>
                </Form>
            </div>
        )
    }
}