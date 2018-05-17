import React from 'react'
import List from './List'
import SimsList from './SimsList'
import Upload from './Upload'
import { Requests } from '../api/requests'
import { Meteor } from 'meteor/tracker'

export default class Request extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            show:false,
            slides: [],
            currSlide: 0,
            lessonplan_id: this.props.location.state.lessonplan_id
        }
        this.update.bind(this)
    }

    componentDidMount() {
        Tracker.autorun(()=>{
            const request = Requests.findOne(this.state.lessonplan_id)
            if(request) {

                const show = !!request.slides[0].title

                this.setState({
                    ...request,
                    show
                })
            }
        })
    }

    deleteSlide() {

    }

    saveChanges() {
        
    }

    deleteSim() {

    }

    push(e) {

        e.preventDefault();
        slides = this.state.slides

        if(this.state.show == false) {            
            slides[0].title = this.refs.title.value
            this.setState({slides, show:true})            
        }
        else {
            slide = {
                title: this.refs.title.value,
                comments: [],
                iframes: []
            }
            slides.push(slide)
            this.setState({
                slides
            })
        }
        this.refs.title.value = ''
        this.update()
    }

    update() {
        const slides = this.state.slides
        Requests.update(this.state.lessonplan_id, {$set:{slides}})
    }

    render() {

    return (
            <div>
                <h1>Request</h1>
                <SimsList delete = {this.deleteSim.bind(this)} {...this.state}/>
                <Upload isOpen = {true} methodName = {'sims.insert'}/>

                <form onSubmit = {this.push.bind(this)}>
                    <input ref = 'title'/>
                    <button>New request</button>
                </form>
                {this.state.show?<List showTitle = {true} {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>:null}
            </div>
        )  
    }
}