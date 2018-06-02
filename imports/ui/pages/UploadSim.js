import React from 'react'
import Upload from '../components/Upload'
import { Meteor } from 'meteor/meteor'
import { Sims} from '../../api/sims'
import { Link } from 'react-router-dom'


const UploadSim = () =>{

    Meteor.subscribe('sims')

    return(
        <div>
            <h1>Upload simulations</h1>
            <Link to = 'dashboard'>Dashboard</Link>
            <Upload method = 'sims.insert' />
        </div>
    )
}

export default UploadSim