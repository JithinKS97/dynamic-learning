import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

const SideBar = () => {

    return (
        <div>
            <ul>
                
                <Menu vertical >
                    <Menu.Item link><Link to = 'lessonplans'>Manage lessonplans</Link></Menu.Item>                    
                    <Menu.Item link><Link  to = 'uploadsim'>Manage simulations</Link></Menu.Item>
                    <Menu.Item link><Link to = 'requests'>Help make simulations</Link></Menu.Item>   
                </Menu>
   
            </ul>
        </div>
    )
}

export default SideBar