import React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import {Meteor} from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

export default class SideBar extends React.Component {
    
    constructor(props) {

        super(props)
        this.state = {
            user: ''
        }

    }

    componentDidMount() {

        Tracker.autorun(()=>{

            if(Meteor.user())
                this.setState({
                    user: Meteor.user().username
                })

        })
    }

    render(){
        return (
            <div>
                <p style = {{paddingLeft:'0.8rem', marginTop:'0.8rem'}}>{`${this.state.user}`}</p>
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
}

