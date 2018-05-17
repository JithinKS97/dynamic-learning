import React from 'react'
import List from './List'
import SimsList from './SimsList'

export default class Request extends React.Component {

    constructor(props) {

        const slide = {
            iframes:[]
        }

        const slides = []
        slides.push(slide)

        super(props)
        this.state = {
            slides,
            currSlide:0
        }
    }

    deleteSlide() {

    }

    saveChanges() {
        
    }

    deleteSim() {

    }

    render() {
    return (
            <div>
                <h1>Request</h1>
                <List {...this.state} delete = {this.deleteSlide.bind(this)} saveChanges= {this.saveChanges.bind(this)}/>
                <SimsList delete = {this.deleteSim.bind(this)} {...this.state}/>
            </div>
        )  
    }
}