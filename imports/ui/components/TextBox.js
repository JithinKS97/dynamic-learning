import React from 'react'
import Rnd from 'react-rnd'

import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaClose from 'react-icons/lib/fa/close'

import MdNetworkCell from 'react-icons/lib/md/network-cell'

import FaCopy from "react-icons/lib/fa/copy";

export default class TextBox extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            value:''
        }

        this.handleCopy = this.handleCopy.bind(this)

        this.keyStrokes = 0

    }

    handleCopy(slides, curSlide, index) {

        let copiedText = $.extend(true, {}, slides[curSlide].textboxes[index])       

        copiedText.x = 50
        copiedText.y = 50

        this.props.setCopiedState(true)

        alert('text copied')

        Session.set('copiedObject', {type:'text', copiedObject:copiedText})
    }

    render() {

        const slides = JSON.parse(JSON.stringify(this.props.slides))

        const { curSlide, index } = this.props

        return (
            
            <Rnd
                // style = {{backgroundColor:'red'}}
                className = 'textbox-floating'
                bounds = '.canvas-container'

                size={{ width: slides[curSlide].textboxes[index].w?slides[curSlide].textboxes[index].w:400,  height:  slides[curSlide].textboxes[index].h?slides[curSlide].textboxes[index].h:200}}     
                
                dragHandleClassName = '.textbox-handle'

                position={{ 
                    x: slides[curSlide].textboxes[index].x?slides[curSlide].textboxes[index].x:100, 
                    y: slides[curSlide].textboxes[index].y?slides[curSlide].textboxes[index].y:100
                }}


                onResize={(e, direction, ref, delta, position) => {
                                  
                    const {index} = this.props

                    slides[curSlide].textboxes[index].w = ref.offsetWidth
                    slides[curSlide].textboxes[index].h = ref.offsetHeight

                    this.props.saveChanges(slides)
                }}
                

                enableResizing = {{
                                    
                    bottom: false,
                    bottomLeft: false,
                    bottomRight: this.props.isPreview?false:true,
                    left: false,
                    right: false,
                    top: false,
                    topLeft: false,
                    topRight: false
                }}

                onDragStop = {(e,d)=>{

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

                            const {saveChanges} = this.props
                            
                            slides[curSlide].textboxes[index].value = e.target.value

                            /**
                             * The below code ensures that slides are pushed to the undo stack only when there is 
                             * a pause in the key stroke sequence. Otherwise for every keypress we should push slides
                             * to the undo stack.
                             * 
                             * For every keysroke, this.keystroke is incremented
                             * 
                             * Function in setTimeout runs 1.5s after every keystroke
                             * 
                             * If this.keystrokes > 0 within that time, it means a sequence of 
                             * keystrokes have occured, so we slides to undo stack.
                             */

                            this.keyStrokes++

                            setTimeout(()=>{

                                if(this.keyStrokes > 0)  {

                                    saveChanges(this.props.slides, undefined, undefined, false)
                                    this.keyStrokes = 0

                                }

                            }, 1500)

                            saveChanges(slides, undefined, undefined, true)
                        
                        }}

                        onDrag = {()=>{

                            const {saveChanges} = this.props
                            
                            slides[curSlide].textboxes[index].w = this.textarea.offsetWidth
                            slides[curSlide].textboxes[index].h = this.textarea.offsetHeight

                            saveChanges(slides)

                        }}

                    />
                    {this.props.isPreview?null:<div className = 'sim-nav' style = {{display:'flex', flexDirection:'column'}}>

                            <div style = {{display:'flex', flexDirection:'column',justifyContent:'space-between', height:'100%', marginLeft:'0.5rem'}}>
                                
                                <div style = {{display:'flex', flexDirection:'column', marginLeft:'0.1rem'}}>
                                    <FaClose className = 'sim-delete' size = '20' onClick = {()=>{

                                        const confirmation = confirm('Are you sure you want to delete the textbox?')

                                        if(!confirmation)
                                            return

                                        this.props.delete(this.props.index)

                                    }}>X</FaClose>
                            
                                    <TiArrowMove size = '22' className = 'textbox-handle'/>

                                    <FaCopy style = {{marginTop:'0.5rem'}} onClick = {()=>{

                                        const {slides, curSlide, index} = this.props

                                        this.handleCopy(slides, curSlide, index)                                        

                                    }} className = 'sim-copy' size = '18' /> 

                                </div>

                                <div style = {{marginLeft:'0.6rem', float:'right'}}><MdNetworkCell/></div>

                            </div>
                    </div>}
                </div>
            </Rnd>
        )
    }
}