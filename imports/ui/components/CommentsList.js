import React from 'react'
import { Comment, Header} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import CommentBox from './CommentBox'
import {Link} from 'react-router-dom'
import {Meteor} from 'meteor/meteor'
 
const CommentsList  = (props) => {

    const showComments = () => {
        
        const { slides, curSlide } = props

        if(slides.length>0) {
            comments = slides[curSlide].comments
            return comments.map((comment, index)=>{
                return <CommentBox key = {index} index = {index} comment = {comment} {...props}/>

            })
        }
    }


    return (
        <div>
            <Comment.Group> 
                <Header as='h3' dividing>
                    Comments
                </Header>
                {showComments()}                
            </Comment.Group>  
            {Meteor.userId()?null:<h3><Link to ='/login'>Login</Link> to participate in the discussion</h3>}
        </div>
    )

}

export default CommentsList