import React from 'react'
import { Dropdown, Menu } from 'semantic-ui-react'
import { fabric } from 'fabric'
import FaPencil from 'react-icons/lib/fa/pencil'
import FaSquareO from 'react-icons/lib/fa/square-o'
import FaEraser from 'react-icons/lib/fa/eraser'
import { SwatchesPicker } from 'react-color';
import FaCircleO from 'react-icons/lib/fa/circle-o'
import GoDash from 'react-icons/lib/go/dash'

export default class DrawingBoardCmp extends React.Component {

    constructor(props ) {

        super(props)
        this.state = {
            option:'pencil',
            size:5,
            selectedColor:'white'
        }
        this.brushSizes = [2,3,4,5,12,16,32]
    }

    componentDidMount() {

        this.b = new fabric.Canvas('c', {isDrawingMode:true, width:1366, height:900, backgroundColor:'black'});

        this.b.on('mouse:up', this.handleMouseUp)
        this.b.on('mouse:down', this.handleMouseMove)
        this.b.on('mouse:move', this.handleMouseMove)
        
        this.eraser = new fabric.PencilBrush(this.b)
        this.eraser.globalCompositeOperation = 'destination-out'
        this.eraser.width = 5

        this.pencil = new fabric.PencilBrush(this.b)
        this.pencil.color = 'white'
        this.pencil.width = 5

        this.b.freeDrawingBrush = this.pencil
    }

    handleMouseDown = () => {

        console.log('mouse down')
    }

    handleMouseMove = () => {

        
    }

    handleMouseUp = () => {

        if(this.state.mode === 'pencil' || this.state.mode === 'eraser')
            this.props.onChange()
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

    setOption(option) {

        this.setState({
            option
        },()=>{

            if(option === 'pencil')
                this.b.freeDrawingBrush = this.pencil
            else if(option === 'eraser')
                this.b.freeDrawingBrush = this.eraser
        })
    }

    handleChangeComplete = (color) => {

        this.setState({ selectedColor: color.hex },()=>{
            this.pencil.color = color.hex
        });
      }

    render() {

        return(
            <div>
                <Menu 
                    className = 'drawingBoardControls' 
                    style = {{height:'1.2rem', visibility:this.props.toolbarVisible?'visible':'hidden', position:'fixed', zIndex:3, display:'flex', flexDirection:'row'}}
                >
                    <Menu.Item active = {'pencil' === this.state.option} onClick = {()=>{this.setOption('pencil')}}>
                        <FaPencil/>
                    </Menu.Item>

                    <Menu.Item active = {'eraser' === this.state.option}  onClick = {()=>{this.setOption('eraser')}}>
                        <FaEraser/>
                    </Menu.Item>

                    <Dropdown pointing className='link item' text={this.state.size}>
                        <Dropdown.Menu>
                            {this.brushSizes.map(brushSize=><Dropdown.Item onClick = {(e,d)=>{
                                
                                this.pencil.width = d.text
                                this.eraser.width = d.text

                                this.setState({
                                    size:d.text
                                })
                                
                            }} key = {brushSize} text = {brushSize}></Dropdown.Item>)}
                        </Dropdown.Menu>                        
                    </Dropdown>

                    <Dropdown style = {{backgroundColor:this.state.selectedColor}} pointing className='link item'>
                        <Dropdown.Menu>
                            <SwatchesPicker 
                                 
                                color={ this.state.selectedColor } 
                                onChangeComplete={ this.handleChangeComplete } 
                            />
                        </Dropdown.Menu>                    
                    </Dropdown>

                    <Menu.Item onClick = {()=>{
                        
                            this.reset()
                            this.props.saveAfterReset()
                        
                        }}>Clear canvas
                    </Menu.Item>

                    <Menu.Item active = {this.state.option === 'line'} onClick = {()=>{this.setOption('line')}}>
                        <GoDash/>
                    </Menu.Item>

                    <Menu.Item active = {this.state.option === 'rect'} onClick = {()=>{this.setOption('rect')}}>
                        <FaSquareO/>
                    </Menu.Item>

                    <Menu.Item active = {this.state.option === 'circle'} onClick = {()=>{this.setOption('circle')}}>
                        <FaCircleO/>
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
