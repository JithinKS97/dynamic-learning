import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react'
import { useState } from 'react'

export default () => {

  const Header = () => {

    const [fontColor, setFontColor] = useState('white')

    return (
      <div style={headerContainer}>
         <Link to='/about'>
          <div 
            onMouseEnter={()=>setFontColor('black')} style={{
              color: fontColor,
              float:'right',
              display:'inline-block',
              fontSize:'1.3rem',
              cursor:'pointer'
            }}
            onMouseLeave={()=>setFontColor('white')}
          >
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
    <div style={style}>
      <Header/>
      <div style={ContainerStyle}>
        <img style={imageStyle} src='/logo-and-title.png'></img>
        <Buttons/>
      </div>
    </div>
  )
}

const style = {
  backgroundColor:'#1ed760',
  height:'100vh',
  display:'flex',
  flexDirection:'column',
  justifyContent:'center'
}

const imageStyle = {
  width:'250px',
  height:'250px',
  minHeight: '200px',
  minWidth:'200px',
  margin:'auto'
}

const ContainerStyle = {
  width:'300px',
  height:'270px',
  minHeight: '200px',
  minWidth:'200px',
  margin:'auto',
  textAlign:'center'
}

const headerContainer ={
  position:'fixed',
  top:0,
  width:'100vw',
  padding:'1.5rem'
}