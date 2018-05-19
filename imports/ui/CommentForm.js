import React from 'react'


export default class CommentForm extends React.Component {

    constructor(props) {
        super(props)
    }

    postComment(e) {

        e.preventDefault()

        if(this.refs.comment.value) {
            slides = this.props.slides
            currSlide = this.props.currSlide
            
            comment = this.refs.comment.value
            slides[currSlide].comments.push(comment)

            this.props.saveChanges(slides)
            this.refs.comment.value = ''
        }
    }
        
    render() {
        return (
            <div>
                <form onSubmit = {this.postComment.bind(this)}>
                    <input ref = 'comment'/>
                    <button>Submit</button>
                </form>
            </div>
        )
    }
}