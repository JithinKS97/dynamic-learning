import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

import { Comment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

const CommentBox = (props,) => {

    momentNow = moment(props.comment.time)

    const getUsername = () => {
    
        const user = Meteor.users.findOne({_id: props.userId})
        if(user)
            return user.username       
    } 

    return (
        <Comment style = {{padding:'0.8rem', backgroundColor:'#eeeeee'}}>
            <Comment.Content>

                    {props.comment.userId == Meteor.userId()?<Button style = {{float:'right', padding:'0.5rem'}} onClick = {() =>{

                        const confirmation = confirm('Are you sure you want to delete your comment?')
                        if(confirmation == true)
                            props.deleteComment(props.index)
                        }
                    }>X</Button>:null}

                <p>{props.comment.comment} </p>
                <p>{momentNow.fromNow()}</p> 
                <p>{props.comment.username}</p>                              
                
            </Comment.Content>
        </Comment>        
    )
} 

export default CommentBox