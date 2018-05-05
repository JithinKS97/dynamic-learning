import React from 'react'

export default class Drawingboard extends React.Component {
    render() {

        const boardStyle = {
            width:400,
            height:400,
            backgroundColor:'red'
        }

        return(
        <div style={boardStyle}>
            <p>Drawing-board</p>
        </div>
        );
    }
}