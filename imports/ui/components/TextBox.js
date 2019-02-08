import React from 'react'
import Rnd from 'react-rnd'

import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaClose from 'react-icons/lib/fa/close'

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
                className = 'textbox-floating'
                bounds = '.drawing-board-canvas'
                enableResizing = {false}
                dragHandleClassName = '.textbox-handle'

                position={{ 
                    x: slides[curSlide].textboxes[index].x?slides[curSlide].textboxes[index].x:100, 
                    y: slides[curSlide].textboxes[index].y?slides[curSlide].textboxes[index].y:100
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

                        onMouseUp = {()=>{

                            const {slides, curSlide, index, saveChanges} = this.props
                            
                            slides[curSlide].textboxes[index].w = this.textarea.offsetWidth
                            slides[curSlide].textboxes[index].h = this.textarea.offsetHeight

                            saveChanges(slides)

                        }}

                    />
                    {this.props.isPreview?null:<div className = 'sim-nav' style = {{display:'flex', flexDirection:'column'}}>

                            <div style = {{display:'flex', flexDirection:'column'}}>

                                <FaClose className = 'sim-delete' size = '20' onClick = {()=>{

                                    this.props.deleteTextBox(this.props.index)

                                }}>X</FaClose>
                        
                                <TiArrowMove size = '22' className = 'textbox-handle'/>

                            </div>
                    </div>}
                </div>
            </Rnd>
        )
    }
}