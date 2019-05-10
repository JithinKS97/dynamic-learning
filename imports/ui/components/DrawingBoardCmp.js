import React from 'react'
import { Button, Dropdown, Menu } from 'semantic-ui-react'
import { fabric } from 'fabric'
import FaPencil from 'react-icons/lib/fa/pencil'
import FaEraser from 'react-icons/lib/fa/eraser'
import { ChromePicker } from 'react-color';

export default class DrawingBoardCmp extends React.Component {

    constructor(props ) {

        super(props)
        this.state = {
            mode:'eraser',
            size:5,
            selectedColor:'white'
        }
    }

    componentDidMount() {

        this.b = new fabric.Canvas('c', {isDrawingMode:true, width:1366, height:900, backgroundColor:'black'});
        this.b.on('mouse:up', ()=>{this.props.onChange()})
        
        this.eraser = new fabric.PencilBrush(this.b)
        this.eraser.globalCompositeOperation = 'destination-out'
        this.eraser.width = 5

        this.brush = new fabric.PencilBrush(this.b)
        this.brush.color = 'white'
        this.brush.width = 5

        this.b.freeDrawingBrush = this.brush

    }

    reset = () => {

        this.b.clear()
    }

    getImg() {

        return JSON.stringify(this.b)
    }

    setImg(canvasObjects) {

        if(canvasObjects) {
            this.b.loadFromJSON((canvasObjects))
        }
    }

    toggleMode() {

        if(this.state.mode === 'eraser') {

            this.setState({
                mode:'pencil'
            },()=>{

                this.b.freeDrawingBrush = this.eraser
            })
        }
        else {

            this.setState({
                mode:'eraser'
            },()=>{

                this.b.freeDrawingBrush = this.brush
            })
        }
    }

    handleChangeComplete = (color) => {
        this.setState({ selectedColor: color.hex },()=>{

            this.brush.color = color.hex

        });
      };

    render() {

        const brushSizes = [2,3,4,5,12,16,32]

        return(
            <div>
                <Menu 
                    className = 'drawingBoardControls' 
                    style = {{visibility:this.props.toolbarVisible?'visible':'hidden', position:'fixed', zIndex:3, display:'flex', flexDirection:'row'}}
                >
                    <Menu.Item onClick = {()=>{this.toggleMode()}}>
                        {this.state.mode === 'pencil'?<FaPencil/>:<FaEraser/>}
                    </Menu.Item>
                    <Dropdown pointing className='link item' text={this.state.size}>
                        <Dropdown.Menu>
                            {brushSizes.map(brushSize=><Dropdown.Item onClick = {(e,d)=>{
                                
                                this.brush.width = d.text
                                this.eraser.width = d.text

                                this.setState({

                                    size:d.text
                                })
                                
                            }} key = {brushSize} text = {brushSize}></Dropdown.Item>)}
                        </Dropdown.Menu>                        
                    </Dropdown>
                    <Dropdown style = {{backgroundColor:this.state.selectedColor}} pointing className='link item'>
                        <Dropdown.Menu>
                            <ChromePicker disableAlpha color={ this.state.selectedColor } onChangeComplete={ this.handleChangeComplete } />
                        </Dropdown.Menu>                    
                    </Dropdown>
                    <Menu.Item onClick = {()=>{
                        
                            this.reset()
                            this.props.saveAfterReset()
                        
                        }}>Clear canvas
                    </Menu.Item>
                </Menu>
                <canvas id = 'c'></canvas>
            </div>
            
        )
    }
}

/**
 * db.getImg()
 * db.setImg()
 * db.reset()
 * 
 * These are the three functions which this component makes available to CreateLessonPlan
 * 
 * If we want to replace drawingboard.js someday, all it takes is to replace the above three functions
 */
