import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react'

export default () => {

  const Header = () => {
    return (
      <div className='loadscren__header-container'>
         <Link to='/about'>
          <div className = 'loadscreen__header-button'>
            About
          </div>
        </Link>
      </div>
    )
  }

  const Buttons = () => {

    const buttonContainerStyle = {
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-between',
      marginTop:'3rem',
    }

    const buttonStyle = {
      width:'8rem',
      borderRadius:'20px',
      height:'2.5rem',
      fontSize:'1rem'
    }

    return (
      <div style={buttonContainerStyle}>
        <Link to='/explore'>
          <Button style={buttonStyle} inverted>Explore</Button>
       </Link> 
       <Link to='/login'>
        <Button style={buttonStyle} inverted>Login</Button>
       </Link>
      </div>
    )
  }
 
  return (
    <div className='load-screen__main'>
      <Header/>
      <div className='loadscreen__container'>
        <img className='loadscreen__image' src='/logo-and-title.png'></img>
        <Buttons/>
      </div>
    </div>
  )
}