import React from 'react'
import Header from '../components/Header'

import LessonPlans from '../components/LessonPlans'
import Requests from '../components/Requests'
import UploadSim from '../components/UploadSim'
import SideBar from '../components/SideBar'

import { Link, Route } from 'react-router-dom'
 
const Dashboard = ({match}) => {

    const renderOption = () => {

       const option = match.params.option

       switch(option) {
            case 'lessonplans':
                return <LessonPlans/>
            case 'requests':
                return <Requests/>
            case 'uploadsim':
                return <UploadSim/>
       }
    }

    return(
        <div className ='page'>
            <Header title = {match.params.option.toUpperCase()}/>
            <div className = 'page-content'>
                <div className = 'page-content__sidebar'><SideBar/></div>            
                <div className = 'page-content__main'>{
                    <div className = 'page-content__main__container'>
                        {renderOption()}
                    </div>
                }</div>          
            </div>    
        </div>
    )
}

export default Dashboard

