import React from 'react'
import { Meteor } from 'meteor/meteor'


export default class CommentForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.comment = React.createRef()
    }

    postComment(e) {

        e.preventDefault()

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
                    <button>Submit</button>
                </form>
            </div>
        )
    }
}