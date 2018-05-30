import React from 'react'
import Upload from '../components/Upload'
import { Meteor } from 'meteor/meteor'
import { Sims} from '../../api/sims'



const UploadSim = () =>{

    Meteor.subscribe('sims')

    return(
        <Upload methodName = 'sims.insert' />
    )
}

export default UploadSim