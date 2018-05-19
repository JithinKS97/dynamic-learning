import React from 'react'
import CommentBox from './CommentBox'

export default class CommentsList extends React.Component {

    constructor(props) {
        super(props)
        this.showComments.bind(this)
    }

    showComments() {
        slides = this.props.slides
        currSlide = this.props.currSlide
        if(slides.length>0) {
            comments = slides[currSlide].comments
            return comments.map((comment, index)=>{
                return (
                    <CommentBox key = {index} comment = {comment} index = {index} {...this.props}/>
                )
            })
        }
    }

    render() {
        return (
            <div>{this.showComments()}</div>
        )
    }
}