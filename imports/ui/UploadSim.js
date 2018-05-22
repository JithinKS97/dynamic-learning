import React from 'react'
import Upload from './Upload'
import Meteor from 'meteor/meteor'
import { Sims} from '../api/sims'



const UploadSim = () =>{

    return(
        <Upload methodName = {(name, src, w, h, callback)=>{

            const x = 0
            const y = 0

            Sims.insert({name,src,w,h, x, y},callback())
        }}/>
    )

}

export default UploadSim