import React from 'react'
import Upload from '../components/Upload'
import { Meteor } from 'meteor/meteor'
import { Sims} from '../../api/sims'



const UploadSim = () =>{

    return(
        <Upload methodName = {(name, src, w, h, callback)=>{
            /* To the sim, we are inserting the name of the simulation,
               src of the iframe tag and the width and the height
            */
           
            Sims.insert({userId:Meteor.userId(),name, src, w, h},callback())
        }}/>
    )
}

export default UploadSim