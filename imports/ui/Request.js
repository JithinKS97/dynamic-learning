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
            slides: [],
            currSlide: 0,
            lessonplan_id: this.props.location.state.lessonplan_id
        }
    }

    componentDidMount() {
        Tracker.autorun(()=>{
            const request = Requests.findOne(this.state.lessonplan_id)
            this.setState({
                ...request
            })
        })
    }

    deleteSlide() {

    }

    saveChanges() {
        
    }

    deleteSim() {

    }

    push() {

        slides = this.state.slides

        const slide = {
            iframes:[],
            comments:[]
        }

        slides.push(slide)
        this.setState({
            slides
        },()=>{
            Requests.update(this.state.lessonplan_id, {$set:{slides}})
        })
        
    }

    render() {
    return (
            <div>
                <h1>Request</h1>
                <SimsList delete = {this.deleteSim.bind(this)} {...this.state}/>
                <Upload isOpen = {true} methodName = {'sims.insert'}/>
                <button onClick = {this.push.bind(this)}>New request</button>
                <List {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
            </div>
        )  
    }
}