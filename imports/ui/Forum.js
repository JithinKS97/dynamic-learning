import React from 'react'

export default class Forum extends React.Component {

    constructor(props) {
        super(props)
        this.showComments.bind(this)
    }

    postComment(e) {

        e.preventDefault()

        slides = this.props.slides
        currSlide = this.props.currSlide
        
        comment = this.refs.comment.value
        slides[currSlide].comments.push(comment)

        this.props.saveChanges(slides)
        this.refs.comment.value = ''

    }

    showComments() {
        slides = this.props.slides
        currSlide = this.props.currSlide
        if(slides.length>0) {
            comments = slides[currSlide].comments
            return comments.map((comment, index)=>{
                return (
                    <div key = {index}>
                        <p>{comment}</p>
                    </div>
                )
            })
        }
    }
        
    render() {
        return (
            <div>
                <form onSubmit = {this.postComment.bind(this)}>
                    <input ref = 'comment'/>
                    <button>Submit</button>
                </form>
                {this.showComments()}
            </div>
        )
    }
}