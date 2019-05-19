import React from "react";
import { Dropdown, Menu } from "semantic-ui-react";
import { fabric } from "fabric";
import FaPencil from "react-icons/lib/fa/pencil";
import FaSquareO from "react-icons/lib/fa/square-o";
import { SwatchesPicker } from "react-color";
import FaCircleO from "react-icons/lib/fa/circle-o";
import GoDash from "react-icons/lib/go/dash";
import MdPhotoSizeSelectSmall from "react-icons/lib/md/photo-size-select-small";
import MdFormatColorFill from "react-icons/lib/md/format-color-fill";
import MdClose from "react-icons/lib/md/close";

let _clipboard

export default class DrawingBoardCmp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      option: "pencil",
      size: 6,
      selectedFill: "white",
      selectedStroke: "white"
    };
    this.brushSizes = [0, 1, 2, 3, 4, 5, 6, 8, 12, 16, 32];
    this.newObject;
    this.started = false;
  }

  componentDidMount() {
    
    this.b = new fabric.Canvas("c", {      
      isDrawingMode: true,
      width: 1366,
      height: 900,
      backgroundColor: "black"
    });

    this.b.on("mouse:up", this.handleMouseUp);
    this.b.on("mouse:down", this.handleMouseDown);
    this.b.on("mouse:move", this.handleMouseMove);
    
    this.pencil = new fabric.PencilBrush(this.b);
    this.pencil.color = "white";
    this.pencil.width = 5;

    this.b.freeDrawingBrush = this.pencil;
  }

  handleMouseDown = e => {

    if (this.state.option === "rect") {
      
      this.started = true;

      this.newObject = new fabric.Rect({
        left: e.pointer.x,
        top: e.pointer.y,
        width: 0,
        height: 0,
        fill: this.state.selectedFill,
        stroke: this.state.selectedStroke,
        strokeWidth: this.state.size,
        selectable:false,
        hoverCursor:'default'
      });

      this.b.add(this.newObject);
    }
    else if(this.state.option === 'ellipse') {

      this.started = true;

      this.newObject = new fabric.Ellipse({

        left: e.pointer.x,
        top: e.pointer.y,
        rx:0,
        ry:0,
        fill: this.state.selectedFill,
        stroke: this.state.selectedStroke,
        strokeWidth: this.state.size,        
        selectable:false,
        hoverCursor:'default'

      })

      this.b.add(this.newObject)
    }
    else if(this.state.option === 'line') {

      this.started = true

      this.newObject = new fabric.Line([e.pointer.x, e.pointer.y, e.pointer.x, e.pointer.y], {

        strokeWidth: this.state.size,
        stroke: this.state.selectedStroke,
        originX: 'center',
        originY: 'center',
        selectable:false,
        hoverCursor:'default'
      })

      this.b.add(this.newObject)
    }    
  };
  
  copy = () => {

    let copiedObject

    this.b.getActiveObject().clone(function(cloned) {
      copiedObject = cloned
    });

    return copiedObject
  }

  paste = (_clipboard) => {
    // clone again, so you can do multiple copies.
    _clipboard.clone((clonedObj) => {
      this.b.discardActiveObject();
      clonedObj.set({
        left: 50,
        top: 50,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = this.b;
        clonedObj.forEachObject((obj) => {
          this.b.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        this.b.add(clonedObj);
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      this.b.setActiveObject(clonedObj);
      this.b.requestRenderAll();
    });
  }

  handleMouseMove = e => {

    if(this.state.option === 'pencil')
      return

    if (this.state.option == "rect") {
      if (this.started === false) return;

      const width = e.pointer.x - this.newObject.left;
      const height = e.pointer.y - this.newObject.top;

      this.newObject.set("width", width).set("height", height);
      this.newObject.setCoords();

      this.b.renderAll();
    }
    else if(this.state.option === 'ellipse') {
      
      if (this.started === false) return;

      const rx = e.pointer.x - this.newObject.left;
      const ry = e.pointer.y - this.newObject.top;

      if(rx <0 || ry  <0)
        return

      this.newObject.set({"rx": rx/2, "ry":ry/2})
      this.newObject.setCoords();

      this.b.renderAll();
    }
    else if(this.state.option === 'line') {

      if(this.started == false) return;
 
      this.newObject.set({ x2: e.pointer.x, y2: e.pointer.y });
      this.newObject.setCoords();

      this.b.renderAll()
    }
  };

  shouldComponentUpdate(nextProps, nextState) {

    if(
        this.state.size!=nextState.size || 
        this.state.option!=nextState.option ||
        this.state.selectedFill!=nextState.selectedFill ||
        this.state.selectedStroke!=nextState.selectedStroke
      )
      return true
    else
      return false
  }

  handleMouseUp = () => {

    if (this.state.option == "rect") {
      /**
       * We need not add new rectangle to the canvas if its size is 0
       */

      if (this.newObject.width === 0 || this.newObject.height === 0) return;

      if (this.started === true) this.started = false;
    }
    else if(this.state.option === 'ellipse') {

      if (this.newObject.rx === 0 || this.newObject.ry === 0) return;

      if (this.started === true) this.started = false;
    }
    else if(this.state.option === 'line') {

      // if(this.b.x1 === this.b.x2 && this.b.y1 === this.b.y2)
      //   return

      if(this.started === true) this.started = false;
    }

    this.props.onChange();
  };

  reset = () => {
    this.b.clear();
  };

  getImg() {
    return JSON.stringify(this.b);
  }

  setImg = (canvasObjects) => {

    if (canvasObjects) {
      this.b.loadFromJSON(canvasObjects);
    }

    if(this.state.option != 'select')
      this.setSelectionStatus(false)
  }

  setSelectionStatus = (status) => {

    this.b.selection = status

    this.b.forEachObject(function(object){ 
      
      object.selectable = status; 
      object.hoverCursor = status?'hand':'default'

    });
  }

  setOption(option) {

    if(this.props.interactEnabled === true)
      this.props.interact()

    this.setState(
      {
        option
      },
      () => {
        if (option === "pencil") {

          this.b.freeDrawingBrush = this.pencil;
          this.b.isDrawingMode = true;

        } else if (option === 'select') {

          this.b.isDrawingMode = false
          this.setSelectionStatus(true)

        } else {         

          this.setSelectionStatus(false)
          this.b.isDrawingMode = false;
        }
      }
    );
  }

  handleFillSelection = color => {

    if(this.state.option === 'select') {

      this.b.getActiveObjects().map(object=>{

        if(object.get('type') !== 'path')
          object.set({fill:color.hex})        
      })
      
      this.b.renderAll()
      this.props.onChange();
    }

    this.setState({ selectedFill: color.hex });
  };

  handleStrokeSelection = color => {

    if(this.state.option === 'select') {

      this.b.getActiveObjects().map(object=>{

        object.set({stroke:color.hex})        
      })
      
      this.b.renderAll()
      this.props.onChange();
    }

    this.setState({ selectedStroke: color.hex }, () => {
      this.pencil.color = color.hex;
    });
  };

  getIcon() {

    if(this.state.option === 'rect')
      return <FaSquareO/>
    else if(this.state.option === 'ellipse')
      return <FaCircleO/>
    else if(this.state.option === 'line')
      return <GoDash/>
    else return <FaSquareO/>
  }

  render() {
    return (
      <div>
        <Menu
          className="drawingBoardControls"
          style={{
            height: "1.2rem",
            visibility: this.props.toolbarVisible ? "visible" : "hidden",
            position: "fixed",
            zIndex: 3,
            display: "flex",
            flexDirection: "row"
          }}
        >
          <Menu.Item active = {'select' === this.state.option} onClick = {()=>{this.setOption('select')}}>
              <MdPhotoSizeSelectSmall/>
            </Menu.Item>

          <Menu.Item
            active={"pencil" === this.state.option}
            onClick={() => {
              this.setOption("pencil");
            }}
          >
            <FaPencil />
          </Menu.Item>

          <Dropdown pointing className="link item" text={this.state.size}>
            <Dropdown.Menu>
              {this.brushSizes.map(brushSize => (
                <Dropdown.Item
                  onClick={(e, d) => {

                    this.pencil.width = d.text;

                    if(this.state.option === 'select') {

                      this.b.getActiveObjects().map(object=>{
                
                        object.set({strokeWidth:d.text})  
                                
                      })
                      
                      this.b.renderAll()
                      this.props.onChange();
                    }

                    this.setState({
                      size: d.text
                    });
                  }}
                  key={brushSize}
                  text={brushSize}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown
            icon={
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <MdFormatColorFill style={{ marginRight: "0.8rem" }} />
                <div
                  style={{
                    width: "1.2rem",
                    border: "2px solid  #e8e8e8",
                    height: "1.2rem",
                    backgroundColor: this.state.selectedFill
                  }}
                />
              </div>
            }
            pointing
            className="link item"
          >
          <Dropdown.Menu>
              <SwatchesPicker
                color={this.state.selectedFill}
                onChangeComplete={this.handleFillSelection}
              />
              <Dropdown.Item
                text = '  No fill'
                icon={<MdClose color="red" />}
                onClick = {()=>{

                  if(this.state.option === 'select') {

                    this.b.getActiveObjects().map(object=>{
              
                      object.set({fill:'transparent'})        
                    })
                    
                    this.b.renderAll()
                    this.props.onChange();
                  }

                  this.setState({selectedFill:'transparent'})
                
                }}        
              />
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown
            icon={
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}
              >
                <FaPencil style={{ marginRight: "0.8rem" }} />
                <div
                  style={{
                    width: "1.2rem",
                    border: "2px solid  #e8e8e8",
                    height: "1.2rem",
                    backgroundColor: this.state.selectedStroke
                  }}
                />
              </div>
            }
            pointing
            className="link item"
          >
            <Dropdown.Menu>
              <SwatchesPicker
                color={this.state.selectedStroke}
                onChangeComplete={this.handleStrokeSelection}
              />
            </Dropdown.Menu>
          </Dropdown>

          <Menu.Item
            onClick={() => {
              this.reset();
              this.props.saveAfterReset();
            }}
          >
            Clear canvas
          </Menu.Item>

          <Dropdown style = {{background:this.state.option === 'rect' || this.state.option === 'ellipse' || this.state.option === 'line'?'#e8e8e8':'white'}}pointing className="link item" icon = {this.getIcon()}>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                this.setOption("rect")
              }}>
                <FaSquareO />
              </Dropdown.Item>
              <Dropdown.Item onClick = {()=>{
                this.setOption("ellipse")
                
              }}>
                <FaCircleO/>
              </Dropdown.Item>
              <Dropdown.Item  onClick = {()=>{
                this.setOption("line")
              }}>
                <GoDash/>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </Menu>
        <canvas id="c" />
      </div>
    );
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
