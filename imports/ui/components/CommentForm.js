import React from 'react'
import { Meteor } from 'meteor/meteor'


export default class CommentForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {

        this.postComment.bind(this)
    }

    postComment(e) {

        e.preventDefault()
        console.log(this.comment)

        if(this.comment.value) {
            slides = this.props.slides
            curSlide = this.props.curSlide            
            comment = this.comment.value
            slides[curSlide].comments.push({comment, userId:Meteor.userId(), time:Date.now()})
            this.props.saveChanges(slides)
            this.comment.value = ''
        }

    }
        
    render() {
        return (
            <div>
                <form onSubmit = {this.postComment.bind(this)}>
                    <input ref = {e => this.comment = e}/>
                    <button onClick = {this.postComment.bind(this)}>Submit</button>
                </form>
            </div>
        )
    }
}