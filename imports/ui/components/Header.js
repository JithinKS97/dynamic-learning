import React from 'react'
import { Accounts } from 'meteor/accounts-base'

const Header = (props)=>{

    return (
        <div className = 'header'>   
            <div className = 'header__content'>   
                <h1 className = 'header__title'>{props.title}</h1>
                <button className = 'button button--link-text' onClick = {()=>{Accounts.logout()}}>Log out</button>
            </div>  
        </div>
    )
}

export default Header