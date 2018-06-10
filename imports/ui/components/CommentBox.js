import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

const CommentBox = (props) => {

    momentNow = moment(props.comment.time)

    return (
        <div className = 'comment'>

            {props.comment.userId == Meteor.userId()?<button className = 'button' style = {{float:'right'}} onClick = {() =>{

                const confirmation = confirm('Are you sure you want to delete your comment?')
                if(confirmation == true)
                    props.deleteComment(props.index)
                }
            }>X</button>:null}

            <p>{props.comment.comment}</p>
            <p>{props.comment.username}</p>
            <p>{momentNow.fromNow()}</p>
        </div>
    )
} 

export default CommentBox