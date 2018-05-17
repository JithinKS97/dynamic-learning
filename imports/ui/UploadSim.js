import React from 'react'
import Upload from './Upload'
import Meteor from 'meteor/meteor'

const UploadSim = () =>{

    return(
        <Upload isOpen = {true} methodName = {'sims.insert'}/>
    )

}

export default UploadSim