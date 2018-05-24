import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){
        super(props)

        this.iframe = React.createRef()

        this.saveState.bind(this)
        this.loadState.bind(this)
        this.resetState.bind(this)        
        this.manageData.bind(this)
    }

    componentDidMount() {           
        window.addEventListener("message", this.manageData.bind(this), false);
    }

    saveState() {
        this.iframe.current.contentWindow.postMessage({operation:'save'}, 'http://localhost:8080')
    }

    loadState() {

        let { slides, curSlide, index } = this.props
        this.iframe.current.contentWindow.postMessage({operation:'load', data: slides[curSlide].iframes[index].data }, 'http://localhost:8080')
    }

    resetState() {
        this.iframe.current.contentWindow.postMessage({operation:'reset'}, 'http://localhost:8080')
    }

    manageData(event) {
        //This is the data to be saved to the server

        if(event.origin !== 'http://localhost:8080')
            return

        console.log(event.data)

        let { slides, curSlide, index } = this.props    
        slides[curSlide].iframes[index].data = event.data
        this.props.saveChanges(slides, curSlide)        
    }

    render(){
        
        return(

            <div className = 'sim'>

                {this.props.saveAndLoad?<button onClick = {this.saveState.bind(this)}>Save</button>:null}
                {this.props.saveAndLoad?<button onClick = {this.loadState.bind(this)}>Load</button>:null}
                {this.props.saveAndLoad?<button onClick = {this.resetState.bind(this)}>Reset</button>:null}

                {
                    this.props.src?
                        <iframe 
                            ref = {this.iframe} 
                            scrolling = 'no' 
                            height = {this.props.h+'px'} 
                            width = {this.props.w+'px'} 
                            src={'http://localhost:8080'}>
                        </iframe>:null
                }

            </div>
        )
    }
}



