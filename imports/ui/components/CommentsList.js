import React from 'react'
import { Comment, Header} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import CommentBox from './CommentBox'
import {Link} from 'react-router-dom'
import {Meteor} from 'meteor/meteor'

export default class commentsList extends React.Component {

    constructor(props) {

        super(props)
        this.commentRefs = []
    }
    

    collapse() {

        if(!this.commentRefs)
            return
            
        this.commentRefs.map(comment=>{

            if(comment) {

                comment.setState({

                    replyVis:false
                })
            }
        })
    }

    showComments(){

        const { slides, curSlide } = this.props

        if(slides.length>0) {

            let comments = slides[curSlide].comments

            return comments.map((comment, index)=>{

                let replies = comment.replies
                

                return (

                    <CommentBox 
                        ref = { el => this.commentRefs[index] = el}
                        key = {index} 
                        index = {index} 
                        comment = {comment} 
                        {...this.props} 
                        replies={replies}
                    />
                )

            })
        }
    }

    render() {

        return (
            <div>
                <Comment.Group>
                    <Header as='h3' dividing>
                        Comments
                    </Header>
                    {this.showComments()}
                </Comment.Group>
                {Meteor.userId()?null:<h3><Link to ='/login'>Login</Link> to participate in the discussion</h3>}
            </div>
        )
    }
}
