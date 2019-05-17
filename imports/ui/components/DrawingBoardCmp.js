import React from "react";
import { Dropdown, Menu } from "semantic-ui-react";
import { fabric } from "fabric";
import FaPencil from "react-icons/lib/fa/pencil";
import FaSquareO from "react-icons/lib/fa/square-o";
import FaEraser from "react-icons/lib/fa/eraser";
import { SwatchesPicker } from "react-color";
import FaCircleO from "react-icons/lib/fa/circle-o";
import GoDash from "react-icons/lib/go/dash";
import MdPhotoSizeSelectSmall from "react-icons/lib/md/photo-size-select-small";
import MdFormatColorFill from "react-icons/lib/md/format-color-fill";
import FaPaintBrush from "react-icons/lib/fa/paint-brush";
import MdClose from "react-icons/lib/md/close";

export default class DrawingBoardCmp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      option: "pencil",
      size: 6,
      selectedFill: "white",
      selectedStroke: "white"
    };
    this.brushSizes = [1, 2, 3, 4, 5, 6, 8, 12, 16, 32];
    this.newRect;
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

    this.eraser = new fabric.PencilBrush(this.b);
    this.eraser.globalCompositeOperation = "destination-out";
    this.eraser.width = 5;

    this.pencil = new fabric.PencilBrush(this.b);
    this.pencil.color = "white";
    this.pencil.width = 5;

    this.b.freeDrawingBrush = this.pencil;
  }

  handleMouseDown = e => {
    if (this.state.option === "rect") {
      this.started = true;

      this.newRect = new fabric.Rect({
        left: e.pointer.x,
        top: e.pointer.y,
        width: 0,
        height: 0,
        fill: this.state.selectedFill,
        stroke: this.state.selectedStroke,
        strokeWidth: this.state.size
      });

      this.newRect.selectable = false;
      this.b.add(this.newRect);
      this.b.setActiveObject(this.rect);
    }
  };

  handleMouseMove = e => {
    if (this.state.option == "rect") {
      if (this.started === false) return;

      const width = e.pointer.x - this.newRect.left;
      const height = e.pointer.y - this.newRect.top;

      this.newRect.set("width", width).set("height", height);

      this.b.renderAll();
    }
  };

  handleMouseUp = () => {
    if (this.state.option == "rect") {
      /**
       * We need not add new rectangle to the canvas if its size is 0
       */

      if (this.newRect.width === 0 || this.newRect.height === 0) return;

      this.b.add($.extend(true, {}, this.newRect));

      if (this.started === true) this.started = false;
    }

    this.props.onChange();
  };

  reset = () => {
    this.b.clear();
  };

  getImg() {
    return JSON.stringify(this.b);
  }

  setImg(canvasObjects) {
    if (canvasObjects) {
      this.b.loadFromJSON(canvasObjects);
    }
  }

  setOption(option) {
    this.setState(
      {
        option
      },
      () => {
        if (option === "pencil") {
          this.b.freeDrawingBrush = this.pencil;
          this.b.isDrawingMode = true;
        } else if (option === "eraser") {
          this.b.isDrawingMode = true;
          this.b.freeDrawingBrush = this.eraser;
        } else {
          this.b.isDrawingMode = false;
          this.b.selection = false;
        }
      }
    );
  }

  handleFillSelection = color => {
    this.setState({ selectedFill: color.hex }, () => {});
  };

  handleStrokeSelection = color => {
    this.setState({ selectedStroke: color.hex }, () => {
      this.pencil.color = color.hex;
    });
  };

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
          {/* <Menu.Item active = {'select' === this.state.option} onClick = {()=>{this.setOption('select')}}>
                        <MdPhotoSizeSelectSmall/>
                    </Menu.Item> */}

          <Menu.Item
            active={"pencil" === this.state.option}
            onClick={() => {
              this.setOption("pencil");
            }}
          >
            <FaPaintBrush />
          </Menu.Item>

          <Menu.Item
            active={"eraser" === this.state.option}
            onClick={() => {
              this.setOption("eraser");
            }}
          >
            <FaEraser />
          </Menu.Item>

          <Dropdown pointing className="link item" text={this.state.size}>
            <Dropdown.Menu>
              {this.brushSizes.map(brushSize => (
                <Dropdown.Item
                  onClick={(e, d) => {
                    this.pencil.width = d.text;
                    this.eraser.width = d.text;

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
              {/* <Dropdown.Item
                icon={<MdClose color="red" />}
                style={{ marginTop: "1.2rem" }}
              /> */}
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
              {/* <Dropdown.Item
                icon={<MdClose color="red" />}
                style={{ marginTop: "1.2rem" }}
              /> */}
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

          <Menu.Item
            active={this.state.option === "rect"}
            onClick={() => {
              this.setOption("rect");
            }}
          >
            <FaSquareO />
          </Menu.Item>

          {/* 
                    <Menu.Item active = {this.state.option === 'line'} onClick = {()=>{this.setOption('line')}}>
                        <GoDash/>
                    </Menu.Item>

                 

                    <Menu.Item active = {this.state.option === 'ellipse'} onClick = {()=>{this.setOption('ellipse')}}>
                        <FaCircleO/>
                    </Menu.Item> */}
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
