import React from 'react'
import { Link } from 'react-router-dom'

const SideBar = () => {

    return (
        <div className = 'page-content__sidebar__container'>
            <ul className = 'list-item'>
                <Link to = 'lessonplans'><li>Create lessons</li></Link>
                <Link to = 'requests'><li>Help make simulations</li></Link>
                <Link  to = 'uploadsim'><li>Upload simulations</li></Link>
            </ul>
        </div>
    )
}

export default SideBar