import React from 'react'
import CommentBox from './CommentBox'

const CommentsList  = (props) => {

    const showComments = () => {
        
        const { slides, curSlide } = props

        if(slides.length>0) {
            comments = slides[curSlide].comments
            return comments.map((comment, index)=>{
                return (
                    <CommentBox key = {index} comment = {comment} index = {index} {...props}/>
                )
            })
        }
    }


    return (
        <div>{showComments()}</div>
    )

}

export default CommentsList