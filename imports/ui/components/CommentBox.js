import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

const CommentBox = (props) => {

    momentNow = moment(props.comment.time)

    return (
        <div>
            <p>{props.comment.comment}</p>
            <p>{props.comment.username}</p>
            <p>{momentNow.fromNow()}</p>
            {props.comment.userId == Meteor.userId()?<button onClick = {() =>{

                    const confirmation = confirm('Are you sure you want to delete your comment?')
                    if(confirmation == true)
                        props.deleteComment(props.index)
                }
            }>X</button>:null}
        </div>
    )
} 

export default CommentBox