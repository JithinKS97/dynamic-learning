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

        if(this.comment.value) {
            const slides = this.props.slides
            const curSlide = this.props.curSlide            
            const comment = this.comment.value
            slides[curSlide].comments.push({comment, username:Meteor.user().username, userId:Meteor.userId(), time:Date.now()})
            this.props.saveChanges(slides)
            this.comment.value = ''
        }

    }
        
    render() {
        return (
            <div>
                <form onSubmit = {this.postComment.bind(this)}>
                    <textarea placeholder = 'Comment' style = {{width:'100%',height:'10rem', marginBottom:'1.6rem', padding:'1.6rem', resize:'none'}} ref = {e => this.comment = e}/>
                    <br/>
                    <button className = 'button' onClick = {this.postComment.bind(this)}>Submit</button>
                </form>
            </div>
        )
    }
}