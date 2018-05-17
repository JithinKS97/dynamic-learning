import React from 'react'
import Upload from './Upload'
import Meteor from 'meteor/meteor'

export default class UploadSim extends React.Component {


    render() {
        return(
            <Upload methodName = {'sims.insert'}/>
        )
    }
}