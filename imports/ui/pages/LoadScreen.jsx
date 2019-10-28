import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react'
import { useState } from 'react'

export default () => {

  const Header = () => {

    const [fontColor, setFontColor] = useState('white')

    return (
      <div style={headerContainer}>
        <div 
          onMouseEnter={()=>setFontColor('black')} style={{
            color: fontColor,
            float:'right',
            display:'inline-block',
            fontSize:'1.5rem',
            cursor:'pointer'
          }}
          onMouseLeave={()=>setFontColor('white')}
        >
          About
        </div>
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
      width:'10rem',
      borderRadius:'20px',
      height:'3rem',
      fontSize:'1.2rem'
    }

    return (
      <div style={buttonContainerStyle}> 
       <Button style={buttonStyle} inverted>Explore</Button>
       <Button style={buttonStyle} inverted>Login</Button>
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
  width:'300px',
  height:'300px',
  minHeight: '250px',
  minWidth:'250px',
  margin:'auto'
}

const ContainerStyle = {
  width:'340px',
  height:'300px',
  minHeight: '250px',
  minWidth:'250px',
  margin:'auto',
  textAlign:'center'
}

const headerContainer ={
  position:'fixed',
  top:0,
  width:'100vw',
  padding:'1.5rem'
}