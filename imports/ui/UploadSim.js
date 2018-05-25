import React from 'react'
import Upload from './Upload'
import { Meteor } from 'meteor/meteor'
import { Sims} from '../api/sims'



const UploadSim = () =>{

    return(
        <Upload methodName = {(name, src, w, h, callback)=>{

            const x = 0
            const y = 0
            data = {}

            Sims.insert({userId:Meteor.userId(),name,src,w,h, x, y, data},callback())
        }}/>
    )
}

export default UploadSim