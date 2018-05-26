import React from 'react'
import Upload from './Upload'
import { Meteor } from 'meteor/meteor'
import { Sims} from '../api/sims'



const UploadSim = () =>{

    return(
        <Upload methodName = {(name, src, w, h, callback)=>{

            Sims.insert({userId:Meteor.userId(),name, src, w, h},callback())
        }}/>
    )
}

export default UploadSim