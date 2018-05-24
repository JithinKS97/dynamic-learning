import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){
        super(props)

        this.iframe = React.createRef()

        this.manageData.bind(this)
        
    }

    componentDidMount() { 
                
        window.addEventListener("message", this.manageData.bind(this), false);
        if(this.props.saveData)
            this.props.saveData(this.saveState.bind(this))
    }

    saveState() {   

        if(this.iframe)
            this.iframe.contentWindow.postMessage({operation:'save'}, 'http://localhost:8080')
    }

    loadState() {

        let { slides, curSlide, index } = this.props
        if(this.iframe)
            this.iframe.contentWindow.postMessage({operation:'load', data: slides[curSlide].iframes[index].data }, 'http://localhost:8080')
    }

    resetState() {
        if(this.iframe)
            this.iframe.contentWindow.postMessage({operation:'reset'}, 'http://localhost:8080')
    }

    manageData(event) {
        //This is the data to be saved to the server

        if(event.origin !== 'http://localhost:8080')
            return

        if(this.props && event.data) {            

            let {slides, curSlide, index} = this.props

            if(slides) {
                
                slides[curSlide].iframes[index].data = event.data
                this.props.saveChanges(slides, undefined)
            }

        }

       
    }


    render(){
        
        return(

            <div className = 'sim'>

                {
                    this.props.src?
                        <iframe 
                            ref = {e => this.iframe = e} 
                            scrolling = 'no' 
                            height = {this.props.h+'px'} 
                            width = {this.props.w+'px'} 
                            src={'http://localhost:8080'}>
                        </iframe>:null
                }

                {this.props.saveAndLoad?<button onClick = {this.saveState.bind(this)}>Save</button>:null}
                {this.props.saveAndLoad?<button onClick = {this.loadState.bind(this)}>Load</button>:null}
                {this.props.saveAndLoad?<button onClick = {this.resetState.bind(this)}>Reset</button>:null}

            </div>
        )
    }
}



