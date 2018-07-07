import React from 'react'
import Rnd from 'react-rnd'
import { Dimmer, Loader } from 'semantic-ui-react'

export default class SimPreview extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            h:360,
            w:640,
            loading:true
        }
    }

    iframeLoaded = () => {

        this.setState({
            loading:false
        })
        
    }

    render() {
        return (
 
            
                <Rnd

                    style = {{position:'relative', marginBottom:'1.6rem'}}

                    disableDragging = { true }

                    enableResizing = {{
                                            
                        bottom: false,
                        bottomLeft: false,
                        bottomRight: true,
                        left: false,
                        right: false,
                        top: false,
                        topLeft: false,
                        topRight: false
                    }}
                    

                    onResize={({ref}) => {                

                        this.setState({
                            
                            h: ref.offsetHeight,
                            w: ref.offsetWidth
                        })
                    }}
                
                >
                    <Dimmer active = {this.state.loading}>
                        <Loader/>
                    </Dimmer>
                    
                    <iframe 
                        style = {{border: this.props.src?'2px solid grey':'none'}}
                        className = 'iframe'
                        scrolling = 'no'
                        onLoad = {this.iframeLoaded.bind(this)}
                        ref = {e => this.iframe = e} 
                        height = {this.state.h+'px'} 
                        width = {this.state.w+'px'}
                        src={this.props.src}>
                    </iframe>
                </Rnd>

        )
    }
   
}