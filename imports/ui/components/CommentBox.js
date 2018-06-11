import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

const CommentBox = (props) => {

    momentNow = moment(props.comment.time)

    return (
        <div className = 'comment'>

            {props.comment.userId == Meteor.userId()?<button className = 'button' style = {{float:'right', padding:'0.5rem', margin:0}} onClick = {() =>{

                const confirmation = confirm('Are you sure you want to delete your comment?')
                if(confirmation == true)
                    props.deleteComment(props.index)
                }
            }>X</button>:null}

            <p>{props.comment.comment}</p>
            <p style = {{color:'grey', padding:0, marginBottom: '0.6rem', fontSize:'1.4rem'}}>{props.comment.username}</p>
            <p style = {{color:'grey', padding:0, margin:0, fontSize:'1.4rem'}}>{momentNow.fromNow()}</p>
        </div>
    )
} 

export default CommentBox