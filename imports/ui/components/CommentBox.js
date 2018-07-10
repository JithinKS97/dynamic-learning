import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

import { Comment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import { Tracker } from 'meteor/tracker'

export default class CommentBox extends React.Component {

    constructor(props) {

        super(props)
        this.momentNow = moment(this.props.comment.time)
        this.state = {
            username:''
        }

        Tracker.autorun(()=>{
            
            Meteor.call('getUsername', this.props.comment.userId, (err, username) => {

                this.setState({username})
            })
        })

    }


    render() {
        return (
            <Comment style = {{padding:'0.8rem', backgroundColor:'#eeeeee'}}>
                <Comment.Content style = {{width:'100%'}}>

                        {this.props.comment.userId == Meteor.userId()?<Button style = {{float:'right', padding:'0.5rem'}} onClick = {() =>{

                            const confirmation = confirm('Are you sure you want to delete your comment?')
                            if(confirmation == true)
                                this.props.deleteComment(this.props.index)
                            }
                        }>X</Button>:null}

                    <p>{this.props.comment.comment} </p>
                    <p>{this.momentNow.fromNow()}</p> 
                    <p>{this.state.username}</p>                              
                    
                </Comment.Content>
            </Comment>        
        )
    }
}