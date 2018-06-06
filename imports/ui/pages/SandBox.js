import React from 'react'
import Immutable from'immutable'

export default class Sandbox extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      isDrawing:false,
      ppts: new Immutable.List()
    }
  }

  componentDidMount() {

    this.mouse = {x:0, y:0}

    const container_style = getComputedStyle(this.container)

    this.canvas.width = parseInt(container_style.getPropertyValue('width'))
    this.canvas.height = parseInt(container_style.getPropertyValue('height'))


    this.ctx = this.canvas.getContext('2d')

    this.ctx.lineWidth = 1;
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = 'white'
    this.ctx.shadowBlur = this.ctx.lineWidth*1.1
    this.ctx.shadowColor = this.ctx.strokeStyle

    this.pts = []

    this.draw.bind(this)

  }
  
  onMouseDown() {

    this.setState({
      isDrawing:true
    })
  }

  onMouseUp() {

    this.setState(prevState => {
      return {
        ppts: prevState.ppts.clear(),
        isDrawing:false
      }
    })

    this.pts = []
  }

  onMouseMove(mouseEvent) {

    if(this.state.isDrawing) {

      const boundingRect = this.container.getBoundingClientRect();
      
      this.mouse.x = mouseEvent.clientX - boundingRect.left
      this.mouse.y = mouseEvent.clientY - boundingRect.top

      const point = new Immutable.Map({
        x: mouseEvent.clientX - boundingRect.left,
        y: mouseEvent.clientY - boundingRect.top,
      })

      this.setState(prevState => {
        return {
          ppts: prevState.ppts.push(point),
        }
      })

      this.pts.push({x:this.mouse.x, y:this.mouse.y})

      this.draw()
    }
  }

  draw() {

    const { ppts } = this.state

    this.ctx.beginPath()
    const pts = ppts.get(0)

    if(pts) {
      this.ctx.moveTo(pts.get('x'), pts.get('y'))
    }

    ppts.map((pts, index) => {

      if(index>0 && index<ppts.size-2) {

        const next_pts = ppts.get(index)

        const c = (pts.get('x') + next_pts.get('x')) / 2
        const d = (pts.get('y') + next_pts.get('y')) / 2
  
        this.ctx.quadraticCurveTo(pts.get('x'), pts.get('y'), c, d)
    
      }

    })


    // this.pts.map( (pt, index) => {
      
    //   if(index>0 && index<this.pts.length-2) {

    //     let c = (this.pts[index].x + this.pts[index + 1].x) / 2
    //     let d = (this.pts[index].y + this.pts[index + 1].y) / 2
    
    //     this.ctx.quadraticCurveTo(this.pts[index].x, this.pts[index].y, c, d)
      
    //   }
    //   else if(index == this.pts.length-2)
    //     this.ctx.quadraticCurveTo(this.pts[index].x, this.pts[index].y, this.pts[index+1].x, this.pts[index+1].y)

    // })

    this.ctx.stroke()
  }

  render() {
    return(
      <div 
        
        ref = {e => this.container = e} 
        style = {{width:'640px', 
        height:'360px', 
        backgroundColor:'black'}}

      >
        <canvas
          onMouseDown  = {this.onMouseDown.bind(this)}
          onMouseUp = {this.onMouseUp.bind(this)}
          onMouseMove = {this.onMouseMove.bind(this)}
          ref = {e => this.canvas = e}
        />

      </div>
    )
  }
}