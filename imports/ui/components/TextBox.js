import React from 'react'
import Rnd from 'react-rnd'

import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaClose from 'react-icons/lib/fa/close'

import MdNetworkCell from 'react-icons/lib/md/network-cell'

export default class TextBox extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            value:''
        }
    }

    

    render() {

        const { slides, curSlide, index } = this.props

        return (
            
            <Rnd
                // style = {{backgroundColor:'red'}}
                className = 'textbox-floating'
                bounds = '.drawing-board-canvas'
                
                dragHandleClassName = '.textbox-handle'

                position={{ 
                    x: slides[curSlide].textboxes[index].x?slides[curSlide].textboxes[index].x:100, 
                    y: slides[curSlide].textboxes[index].y?slides[curSlide].textboxes[index].y:100
                }}


                onResize={(e, direction, ref, delta, position) => {
                                  
                    const {slides, curSlide, index} = this.props

                    slides[curSlide].textboxes[index].w = ref.offsetWidth
                    slides[curSlide].textboxes[index].h = ref.offsetHeight

                    this.props.saveChanges(slides)
                }}

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

                onDragStop = {(e,d)=>{

                    const {slides, curSlide, index} = this.props

                    slides[curSlide].textboxes[index].x = d.lastX
                    slides[curSlide].textboxes[index].y = d.lastY

                    this.props.saveChanges(slides)

                }}
            >   
                <div className = 'textArea' style ={{
                    
                    display:'flex', 
                    flexDirection:'row',
                    pointerEvents:this.props.isPreview?'none':'unset'
                    
                }}>
                    <textarea
                        
                        ref = {e => this.textarea = e}

                        style = {{
                            resize: 'none',
                            padding:'0.6rem',
                            backgroundColor:'rgba(0,0,0,0)',
                            color:'white',
                            fontSize:'20px',
                            border:'1px solid #404040',
                            width: slides[curSlide].textboxes[index].w?slides[curSlide].textboxes[index].w + 'px':'400px',
                            height: slides[curSlide].textboxes[index].h?slides[curSlide].textboxes[index].h + 'px':'200px'
                        }}

                        value = {slides[curSlide].textboxes[index].value?slides[curSlide].textboxes[index].value:''}

                        onChange = {(e)=>{

                            const {slides, curSlide, index, saveChanges} = this.props
                            
                            slides[curSlide].textboxes[index].value = e.target.value

                            saveChanges(slides)
                        
                        }}

                        onDrag = {()=>{

                            const {slides, curSlide, index, saveChanges} = this.props
                            
                            slides[curSlide].textboxes[index].w = this.textarea.offsetWidth
                            slides[curSlide].textboxes[index].h = this.textarea.offsetHeight

                            saveChanges(slides)

                        }}

                    />
                    {this.props.isPreview?null:<div className = 'sim-nav' style = {{display:'flex', flexDirection:'column'}}>

                            <div style = {{display:'flex', flexDirection:'column',justifyContent:'space-between', height:'100%'}}>
                                
                                <div style = {{display:'flex', flexDirection:'column', marginLeft:'0.1rem'}}>
                                    <FaClose className = 'sim-delete' size = '20' onClick = {()=>{

                                        const confirmation = confirm('Are you sure you want to delete the textbox?')

                                        if(!confirmation)
                                            return

                                        this.props.deleteTextBox(this.props.index)

                                    }}>X</FaClose>
                            
                                    <TiArrowMove size = '22' className = 'textbox-handle'/>
                                </div>

                                <div style = {{marginLeft:'0.8rem', float:'right'}}><MdNetworkCell/></div>

                            </div>
                    </div>}
                </div>
            </Rnd>
        )
    }
}