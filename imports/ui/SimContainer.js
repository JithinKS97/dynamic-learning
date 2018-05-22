import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){
        super(props)
        this.iframe = React.createRef()        
    }
    
    render(){
        
        return(

            <div className = 'sim'>
                {this.props.src?<iframe scrolling = 'no' height = {this.props.h+'px'} width = {this.props.w+'px'}ref = {this.iframe} src={this.props.src}></iframe>:null}               
            </div>
        )
    }
}
