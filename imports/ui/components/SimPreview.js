import React from 'react'
import Rnd from 'react-rnd'

export default class SimPreview extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            h:360,
            w:640
        }
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
                

                onResize={(e, direction, ref, delta, position) => {                

                    this.setState({
                        h: ref.offsetHeight,
                        w: ref.offsetWidth
                    })
                }}
            
            >
                <iframe 
                    style = {{border: this.props.src?'2px solid grey':'none'}}
                    className = 'iframe'
                    // ref = {e => this.iframe = e} 
                    scrolling = 'no' 
                    height = {this.state.h+'px'} 
                    width = {this.state.w+'px'}
                    src={this.props.src}>
                </iframe>
            </Rnd>
        )
    }
   
}