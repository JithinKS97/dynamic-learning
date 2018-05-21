import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){
        super(props)
        this.iframe = React.createRef()

        
    }


    componentDidMount() {
        
    }
    
    render(){
        
        return(

            <div className = 'sim'>
                <iframe src={this.props.src}></iframe>                   
            </div>
        )
    }
}
