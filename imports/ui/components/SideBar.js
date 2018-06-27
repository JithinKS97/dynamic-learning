import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

const SideBar = () => {

    return (
        <div>
            <ul>
                
                <Menu vertical >
                    <Link to = 'lessonplans'><Menu.Item link>Manage lessonplans</Menu.Item></Link>                    
                    <Link  to = 'uploadsim'><Menu.Item link>Manage simulations</Menu.Item></Link>
                    <Link to = 'requests'><Menu.Item link>Help make simulations</Menu.Item></Link>   
                </Menu>
   
            </ul>
        </div>
    )
}

export default SideBar