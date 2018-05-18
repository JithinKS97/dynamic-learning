import React from 'react'
import Comment from './Comment'

export default class Comments extends React.Component {

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
                    <Comment key = {index} comment = {comment}/>
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