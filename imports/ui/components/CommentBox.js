import React from 'react'
import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import CommentReplies from './CommentReplies'
import CommentForm from './CommentForm'
import { Comment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import FaAngleDown from 'react-icons/lib/fa/angle-down'
import FaAngleUp from 'react-icons/lib/fa/angle-up'

import { Tracker } from 'meteor/tracker'

export default class CommentBox extends React.Component {

    componentDidMount() {

        this.setState({

            retplyVis: false
        })
    }   



    constructor(props) {

        super(props)
        
        this.state = {
            username:'',
            replyVis: false
        }

        Tracker.autorun(()=>{

            Meteor.call('getUsername', this.props.comment.userId, (err, username) => {

                this.setState({username})
            })
        })

    }

    showReplies(){

      let replies=this.props.replies
      if(replies){
        return replies.map((reply, index)=>{
            return (
              <CommentReplies key = {index} {...this.props} subIndex = {index} reply={reply}/>
            )
        })
      }
    }

    findTime() {

        return moment(this.props.comment.time)
    }

    render() {

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
                            <div>{this.findTime().fromNow()}</div>
                        </Comment.Metadata>
                    </div>
                    
                    <Comment.Text style = {{paddingTop:'0.8rem', width:'95%'}}>{this.props.comment.comment}</Comment.Text>

                    {this.state.replyVis?null:<FaAngleDown style = {{marginTop:'0.4rem'}} size={17} onClick = {()=>{

                        this.setState(prev=>{

                            return {

                                replyVis:!prev.replyVis
                            }
                        })
                    }}>Show</FaAngleDown>}


                    {this.state.replyVis?<FaAngleUp style = {{marginTop:'0.4rem'}} size={17} onClick = {()=>{

                        this.setState(prev=>{

                            return {

                                replyVis:!prev.replyVis
                            }
                        })
                    }}>Show</FaAngleUp>:null}



                    {/* <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                    </Comment.Actions> */}
                </Comment.Content>
            </Comment>
            {this.state.replyVis?<div>
                <div>{this.showReplies()}</div>
                {Meteor.userId()?<div><CommentForm option = {this.props.index} {...this.props}/></div>:null}
            </div>:null}
        </div>
        )
    }
}
