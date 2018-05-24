import React from 'react'
import { Meteor } from 'meteor/meteor'


export default class CommentForm extends React.Component {

    constructor(props) {
        super(props)
    }

    postComment(e) {

        e.preventDefault()

        if(this.refs.comment.value) {
            slides = this.props.slides
            curSlide = this.props.curSlide
            
            comment = this.refs.comment.value
            
            slides[curSlide].comments.push({comment, userId:Meteor.userId(), time:Date.now()})

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