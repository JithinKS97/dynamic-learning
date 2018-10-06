import React from 'react'
import { Meteor } from 'meteor/meteor'

import { Form, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';


export default class CommentForm extends React.Component {

    constructor(props) {
        
        super(props)
    }

    componentDidMount() {

        this.postComment.bind(this)
    }

    postComment(e, {value}) {

        if(this.comment.value) {
            const slides = this.props.slides
            const curSlide = this.props.curSlide            
            const comment = this.comment.value
            slides[curSlide].comments.push({comment, userId:Meteor.userId(), time:Date.now()})
            this.props.saveChanges(slides)
            this.comment.value = ''
        }
    }
        
    render() {
        return (
       
            <Form style = {{maxWidth:'650px'}} onSubmit = {this.postComment.bind(this)}>
                <Form.Field>
                    <textarea rows = '4' placeholder = 'Comment' ref = {e => this.comment = e}/>
                </Form.Field>
                <Form.Field>
                    <Button type = 'submit'>Submit</Button>
                </Form.Field>
            </Form>    
        )
    }
}