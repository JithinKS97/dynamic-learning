import React from 'react'
import Upload from './Upload'
import Meteor from 'meteor/meteor'

const UploadSim = () =>{

    return(
        <Upload isOpen = {true} methodName = {()=>{
            console.log('hellooo')
        }}/>
    )

}

export default UploadSim