import React from 'react'

const TitleBar = (props)=>{

    return (
        <div className = 'title-bar'>
            <div>
                <h1>{props.title}</h1>
            </div>
        </div>
    )
}

export default TitleBar