import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'

import { Comment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import { Tracker } from 'meteor/tracker'

export default class CommentReplies extends React.Component {
  constructor(props) {

      super(props)
      this.state = {
          username:''
      }

      Tracker.autorun(()=>{

          Meteor.call('getUsername', this.props.reply.userId, (err, username) => {

                this.setState({

                    username
                })

          })
      })

  }

  findTime() {

    return moment(this.props.reply.time)
  }

  render() {

      return (
        <div>

          <Comment style = {{padding:'0.8rem', marginLeft:'1.6rem' ,marginBottom:'0.9rem' , backgroundColor:'#eeeeee'}}>
              <Comment.Content style = {{width:'100%',margin:'1'}}>

                  {this.props.reply.userId == Meteor.userId()?

                    <Button

                      style = {{float:'right', padding:'0.5rem'}}

                      onClick = {() =>{

                        const confirmation = confirm('Are you sure you want to delete your comment?')
                        if(confirmation == true)
                          this.props.deleteReplyComment(this.props.index, this.props.subIndex)
                  }
                  }>X</Button>:null}

                  <div style = {{display:'flex', flexDirection:'row'}}>
                      <Comment.Author>{this.state.username}</Comment.Author>
                      <Comment.Metadata style = {{paddingLeft:'0.8rem', paddingTop:'0.15rem'}}>
                          <div>{this.findTime().fromNow()}</div>
                      </Comment.Metadata>
                  </div>

                  <Comment.Text style = {{paddingTop:'0.8rem', width:'95%'}}>{this.props.reply.comment}</Comment.Text>
              </Comment.Content>
          </Comment>

        </div>
      )
  }
}
