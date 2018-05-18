import React from 'react'
import Upload from './Upload'
import Meteor from 'meteor/meteor'
import { Sims} from '../api/sims'



const UploadSim = () =>{

    return(
        <Upload methodName = {(name, iframe,callback)=>{
            Sims.insert({name,iframe},callback())
        }}/>
    )

}

export default UploadSim