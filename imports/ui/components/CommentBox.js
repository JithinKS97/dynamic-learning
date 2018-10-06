import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import CommentReplies from './CommentReplies'
import CommentForm from './CommentForm'
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

    print_replies(){

      let replies=this.props.replies
      if(replies){
        return replies.map((reply, index)=>{
            return (
              <CommentReplies {...this.props} subIndex = {index} reply={reply}/>
            )
        })
      }
    }

    render() {

        console.log(this.props)

        return (
          <div>
            <Comment style = {{padding:'0.8rem',marginBottom:'0.9rem',marginTop:'0.9rem', backgroundColor:'#eeeeee'}}>
                <Comment.Content style = {{width:'100%'}}>
                    {/* <Comment.Avatar src='/images/avatar/small/matt.jpg' /> */}
                    {this.props.comment.userId == Meteor.userId()?<Button style = {{float:'right', padding:'0.5rem'}} onClick = {() =>{

                    const confirmation = confirm('Are you sure you want to delete your comment?')
                    if(confirmation == true)
                        this.props.deleteComment(this.props.index)
                    }
                    }>X</Button>:null}
                    <div style = {{display:'flex', flexDirection:'row'}}>
                        <Comment.Author>{this.state.username}</Comment.Author>
                        <Comment.Metadata style = {{paddingLeft:'0.8rem', paddingTop:'0.15rem'}}>
                            <div>{this.momentNow.fromNow()}</div>
                        </Comment.Metadata>
                    </div>
                    <div></div>
                    <Comment.Text style = {{paddingTop:'0.8rem', width:'95%'}}>{this.props.comment.comment}</Comment.Text>
                    {/* <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                    </Comment.Actions> */}
                </Comment.Content>
            </Comment>
            <div>
              {
              this.print_replies()
              }
            </div>
            <div>
              <CommentForm option = {this.props.index} {...this.props}/>

            </div>
        </div>
        )
    }
}
