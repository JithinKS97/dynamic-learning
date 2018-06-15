import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

import { Comment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

const CommentBox = (props,) => {

    momentNow = moment(props.comment.time)

    return (
        <Comment>
            <Comment.Content>

                    {props.comment.userId == Meteor.userId()?<Button style = {{float:'right', padding:'0.5rem'}} onClick = {() =>{

                        const confirmation = confirm('Are you sure you want to delete your comment?')
                        if(confirmation == true)
                            props.deleteComment(props.index)
                        }
                    }>X</Button>:null}
                
                <Comment.Author>{props.comment.username}</Comment.Author>
                <Comment.Metadata>{momentNow.fromNow()}</Comment.Metadata>
                <Comment.Text>{props.comment.comment} </Comment.Text>
                
            </Comment.Content>
        </Comment>        
    )
} 

export default CommentBox