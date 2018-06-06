import React from 'react'
import Immutable from'immutable'

export default class Sandbox extends React.Component {

  constructor(props) {

    super(props)

    this.state = {
      isDrawing:false,
    }

  }

  componentDidMount() {

    this.mouse = {x:0, y:0}
    this.prev_mouse = {x: 0, y: 0}

    const container_style = getComputedStyle(this.container)

    this.canvas.width = parseInt(container_style.getPropertyValue('width'))
    this.canvas.height = parseInt(container_style.getPropertyValue('height'))


    this.ctx = this.canvas.getContext('2d')

    this.ctx.lineWidth = 1;
    this.ctx.lineJoin = 'round'
    this.ctx.lineCap = 'round'
    this.ctx.strokeStyle = 'white'
    this.ctx.shadowBlur = this.ctx.lineWidth*1.25
    this.ctx.shadowColor = 'white'

    this.pts = []

    this.draw.bind(this)

  }
  
  onMouseDown() {

    this.setState({
      isDrawing:true
    })
  }

  onMouseUp() {

    this.setState({
      isDrawing: false
    })

    this.pts = []
  }

  onMouseMove(mouseEvent) {

    if(this.state.isDrawing) {

      const boundingRect = this.container.getBoundingClientRect();

      
      this.mouse.x = mouseEvent.clientX - boundingRect.left
      this.mouse.y = mouseEvent.clientY - boundingRect.top

      this.pts.push({x:this.mouse.x, y:this.mouse.y})

      this.draw()
    }
  }

  draw() {

    this.ctx.beginPath()

    this.ctx.moveTo(this.pts[0].x, this.pts[0].y);

    this.pts.map( (pt, index) => {
      
      if(index>0 && index<this.pts.length-2) {

        let c = (this.pts[index].x + this.pts[index + 1].x) / 2
        let d = (this.pts[index].y + this.pts[index + 1].y) / 2
    
        this.ctx.quadraticCurveTo(this.pts[index].x, this.pts[index].y, c, d)
      
      }
      else if(index == this.pts.length-2) {
        this.ctx.quadraticCurveTo(this.pts[index].x, this.pts[index].y, this.pts[index+1].x, this.pts[index+1].y)
      }
    })

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

// (function() {
	
// 	var canvas = document.querySelector('#paint');
// 	var ctx = canvas.getContext('2d');
	
// 	var sketch = document.querySelector('#sketch');
// 	var sketch_style = getComputedStyle(sketch);
// 	canvas.width = parseInt(sketch_style.getPropertyValue('width'));
// 	canvas.height = parseInt(sketch_style.getPropertyValue('height'));
	
	
// 	// Creating a tmp canvas
// 	var tmp_canvas = document.createElement('canvas');
// 	var tmp_ctx = tmp_canvas.getContext('2d');
// 	tmp_canvas.id = 'tmp_canvas';
// 	tmp_canvas.width = canvas.width;
// 	tmp_canvas.height = canvas.height;
	
// 	sketch.appendChild(tmp_canvas);

// 	var mouse = {x: 0, y: 0};
// 	var last_mouse = {x: 0, y: 0};
	
// 	// Pencil Points
// 	var ppts = [];
	
// 	/* Mouse Capturing Work */
// 	tmp_canvas.addEventListener('mousemove', function(e) {
// 		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
// 		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
// 	}, false);
	
	
// 	/* Drawing on Paint App */
// 	tmp_ctx.lineWidth = 5;
// 	tmp_ctx.lineJoin = 'round';
// 	tmp_ctx.lineCap = 'round';
// 	tmp_ctx.strokeStyle = 'blue';
// 	tmp_ctx.fillStyle = 'blue';
	
// 	tmp_canvas.addEventListener('mousedown', function(e) {
// 		tmp_canvas.addEventListener('mousemove', onPaint, false);
		
// 		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
// 		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
// 		ppts.push({x: mouse.x, y: mouse.y});
		
// 		onPaint();
// 	}, false);
	
// 	tmp_canvas.addEventListener('mouseup', function() {
// 		tmp_canvas.removeEventListener('mousemove', onPaint, false);
		
// 		// Writing down to real canvas now
// 		ctx.drawImage(tmp_canvas, 0, 0);
// 		// Clearing tmp canvas
// 		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
// 		// Emptying up Pencil Points
// 		ppts = [];
// 	}, false);
	
// 	var onPaint = function() {
		
// 		// Saving all the points in an array
// 		ppts.push({x: mouse.x, y: mouse.y});
		
// 		if (ppts.length < 3) {
// 			var b = ppts[0];
// 			tmp_ctx.beginPath();
// 			//ctx.moveTo(b.x, b.y);
// 			//ctx.lineTo(b.x+50, b.y+50);
// 			tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
// 			tmp_ctx.fill();
// 			tmp_ctx.closePath();
			
// 			return;
// 		}
		
// 		// Tmp canvas is always cleared up before drawing.
// 		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
// 		tmp_ctx.beginPath();
// 		tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
		
// 		for (var i = 1; i < ppts.length - 2; i++) {
// 			var c = (ppts[i].x + ppts[i + 1].x) / 2;
// 			var d = (ppts[i].y + ppts[i + 1].y) / 2;
			
// 			tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
// 		}
		
// 		// For the last 2 points
// 		tmp_ctx.quadraticCurveTo(
// 			ppts[i].x,
// 			ppts[i].y,
// 			ppts[i + 1].x,
// 			ppts[i + 1].y
// 		);
// 		tmp_ctx.stroke();
		
// 	};
	
// }());
