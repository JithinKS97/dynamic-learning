/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { fabric } from 'fabric';
import {
  FaPencilAlt,
  FaRegSquare,
  FaRegCircle,
} from 'react-icons/fa';
import { SwatchesPicker } from 'react-color';
import { GoDash } from 'react-icons/go';
import {
  MdPhotoSizeSelectSmall,
  MdTextFields,
  MdQuestionAnswer,
  MdSave,
  MdInvertColorsOff,
} from 'react-icons/md';
import PropTypes from 'prop-types';

export default class DrawingBoardCmp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: 'pencil',
      size: 6,
      selectedFill: 'white',
      selectedStroke: 'white',
    };
    this.brushSizes = [0, 1, 2, 3, 4, 5, 6, 8, 12, 16, 32];
    this.started = false;
  }

  componentDidMount() {
    this.b = new fabric.Canvas('c', {
      isDrawingMode: true,
      width: 1366,
      height: 900,
      backgroundColor: 'black',
    });

    this.b.on('mouse:up', this.handleMouseUp);
    this.b.on('mouse:down', this.handleMouseDown);
    this.b.on('mouse:move', this.handleMouseMove);

    this.pencil = new fabric.PencilBrush(this.b);
    this.pencil.color = '#d9d9d9';
    this.pencil.width = 5;

    this.b.freeDrawingBrush = this.pencil;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      size,
      option,
      selectedFill,
      selectedStroke,
    } = this.state;
    if (
      size !== nextState.size
      || option !== nextState.option
      || selectedFill !== nextState.selectedFill
      || selectedStroke !== nextState.selectedStroke
    ) {
      return true;
    }

    return false;
  }

  setOption(option) {
    const { interact, interactEnabled } = this.props;
    if (interactEnabled === true) {
      interact();
    }

    this.setState({ option }, () => {
      if (option === 'pencil') {
        this.b.freeDrawingBrush = this.pencil;
        this.b.isDrawingMode = true;
      } else if (option === 'select') {
        this.b.isDrawingMode = false;
        this.setSelectionStatus(true);
      } else {
        this.setSelectionStatus(false);
        this.b.isDrawingMode = false;
      }
    });
  }

  getIcon() {
    const { option } = this.state;
    if (option === 'rect') {
      return <FaRegSquare />;
    }

    if (option === 'ellipse') {
      return <FaRegCircle />;
    }

    if (option === 'line') {
      return <GoDash />;
    }

    return <FaRegSquare />;
  }

  getImg() {
    return JSON.stringify(this.b);
  }

  handleMouseDown = (e) => {
    const {
      option,
      selectedFill,
      selectedStroke,
      size,
    } = this.state;
    if (option === 'rect') {
      this.started = true;
      this.newObject = new fabric.Rect({
        left: e.pointer.x,
        top: e.pointer.y,
        width: 0,
        height: 0,
        fill: selectedFill,
        stroke: selectedStroke,
        strokeWidth: size,
        selectable: false,
        hoverCursor: 'default',
      });
      this.b.add(this.newObject);
    } else if (option === 'ellipse') {
      this.started = true;
      this.newObject = new fabric.Ellipse({
        left: e.pointer.x,
        top: e.pointer.y,
        rx: 0,
        ry: 0,
        fill: selectedFill,
        stroke: selectedStroke,
        strokeWidth: size,
        selectable: false,
        hoverCursor: 'default',
      });
      this.b.add(this.newObject);
    } else if (option === 'line') {
      this.started = true;
      this.newObject = new fabric.Line([e.pointer.x, e.pointer.y, e.pointer.x, e.pointer.y], {
        strokeWidth: size,
        stroke: selectedStroke,
        originX: 'center',
        originY: 'center',
        selectable: false,
        hoverCursor: 'default',
      });

      this.b.add(this.newObject);
    }
  };

  copy = () => {
    let copiedObject;
    this.b.getActiveObject().clone((cloned) => {
      copiedObject = cloned;
    });

    return copiedObject;
  };

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
  };

  handleMouseMove = (e) => {
    const { option } = this.state;
    if (option === 'pencil') {
      return;
    }

    if (option === 'rect') {
      if (this.started === false) {
        return;
      }

      const width = e.pointer.x - this.newObject.left;
      const height = e.pointer.y - this.newObject.top;
      this.newObject.set('width', width).set('height', height);
      this.newObject.setCoords();
      this.b.renderAll();
    } else if (option === 'ellipse') {
      if (this.started === false) {
        return;
      }

      const rx = e.pointer.x - this.newObject.left;
      const ry = e.pointer.y - this.newObject.top;
      if (rx < 0 || ry < 0) {
        return;
      }

      this.newObject.set({ rx: rx / 2, ry: ry / 2 });
      this.newObject.setCoords();
      this.b.renderAll();
    } else if (option === 'line') {
      if (this.started === false) {
        return;
      }

      this.newObject.set({ x2: e.pointer.x, y2: e.pointer.y });
      this.newObject.setCoords();
      this.b.renderAll();
    }
  };

  handleMouseUp = () => {
    const { option } = this.state;
    const { onChange } = this.props;
    if (option === 'rect') {
      /**
       * We need not add new rectangle to the canvas if its size is 0
       */
      if (this.newObject.width === 0 || this.newObject.height === 0) {
        return;
      }

      if (this.started === true) {
        this.started = false;
      }
    } else if (option === 'ellipse') {
      if (this.newObject.rx === 0 || this.newObject.ry === 0) {
        return;
      }

      if (this.started === true) {
        this.started = false;
      }
    } else if (option === 'line') {
      if (this.started === true) {
        this.started = false;
      }
    }

    onChange();
  };

  reset = () => {
    this.b.clear();
  };

  setImg = (canvasObjects) => {
    const { option } = this.state;
    if (canvasObjects) {
      this.b.loadFromJSON(canvasObjects);
    }

    if (option !== 'select') {
      this.setSelectionStatus(false);
    }
  };

  setSelectionStatus = (status) => {
    this.b.selection = status;
    this.b.forEachObject((object) => {
      object.selectable = status;
      object.hoverCursor = status ? 'hand' : 'default';
    });
  };

  handleFillSelection = (color) => {
    const { option } = this.state;
    const { onChange } = this.props;
    if (option === 'select') {
      this.b.getActiveObjects().forEach((object) => {
        if (object.get('type') !== 'path') {
          object.set({ fill: color.hex });
        }
      });
      this.b.renderAll();
      onChange();
    }

    this.setState({ selectedFill: color.hex });
  };

  handleStrokeSelection = (color) => {
    const { option } = this.state;
    const { onChange } = this.props;
    if (option === 'select') {
      this.b.getActiveObjects().forEach((object) => {
        object.set({ stroke: color.hex });
      });
      this.b.renderAll();
      onChange();
    }

    this.setState({ selectedStroke: color.hex }, () => {
      this.pencil.color = color.hex;
    });
  };

  render() {
    const {
      option,
      size,
      selectedFill,
      selectedStroke,
    } = this.state;
    const {
      toolbarVisible,
      onChange,
      saveAfterReset,
    } = this.props;
    return (
      <div>
        <Menu
          className="drawingBoardControls"
          style={{
            height: '1.2rem',
            visibility: toolbarVisible ? 'visible' : 'hidden',
            position: 'sticky',
            top: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Menu.Item
            active={option === 'select'}
            onClick={() => { this.setOption('select'); }}
          >
            <MdPhotoSizeSelectSmall />
          </Menu.Item>
          <Menu.Item
            active={option === 'pencil'}
            onClick={() => { this.setOption('pencil'); }}
          >
            <FaPencilAlt />
          </Menu.Item>
          <Dropdown pointing className="link item" text={size}>
            <Dropdown.Menu>
              {this.brushSizes.map(brushSize => (
                <Dropdown.Item
                  onClick={(e, d) => {
                    this.pencil.width = d.text;
                    if (option === 'select') {
                      this.b.getActiveObjects().forEach((object) => {
                        object.set({ strokeWidth: d.text });
                      });
                      this.b.renderAll();
                      onChange();
                    }

                    this.setState({ size: d.text });
                  }}
                  key={brushSize}
                  text={brushSize}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            icon={
              (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <MdFormatColorFill style={{ marginRight: '0.8rem' }} />
                  <div
                    style={{
                      width: '1.2rem',
                      border: '2px solid  #e8e8e8',
                      height: '1.2rem',
                      backgroundColor: selectedFill,
                    }}
                  />
                </div>
            )
            }
            pointing
            className="link item"
          >
            <Dropdown.Menu>
              <SwatchesPicker
                color={selectedFill}
                onChangeComplete={this.handleFillSelection}
              />
              <Dropdown.Item
                text="  No fill"
                icon={<MdClose color="red" />}
                onClick={() => {
                  if (option === 'select') {
                    this.b.getActiveObjects().forEach((object) => {
                      object.set({ fill: 'transparent' });
                    });
                    this.b.renderAll();
                    onChange();
                  }

                  this.setState({ selectedFill: 'transparent' });
                }}
              />
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            icon={
              (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <FaPencilAlt style={{ marginRight: '0.8rem' }} />
                  <div
                    style={{
                      width: '1.2rem',
                      border: '2px solid  #e8e8e8',
                      height: '1.2rem',
                      backgroundColor: selectedStroke,
                    }}
                  />
                </div>
              )
            }
            pointing
            className="link item"
          >
            <Dropdown.Menu>
              <SwatchesPicker
                color={selectedStroke}
                onChangeComplete={this.handleStrokeSelection}
              />
            </Dropdown.Menu>
          </Dropdown>

          <Menu.Item
            onClick={() => {
              this.reset();
              saveAfterReset();
            }}
          >
            Clear canvas
          </Menu.Item>

          <Dropdown
            style={{ background: option === 'rect' || option === 'ellipse' || option === 'line' ? '#e8e8e8' : 'white' }}
            pointing
            className="link item"
            icon={this.getIcon()}
          >
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                this.setOption('rect');
              }}
              >
                <FaRegSquare />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                this.setOption('ellipse');
              }}
              >
                <FaRegCircle />
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {
                this.setOption('line');
              }}
              >
                <GoDash />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

        </Menu>
        <canvas id="c" />
      </div>
    );
  }
}

DrawingBoardCmp.propTypes = {
  interactEnabled: PropTypes.bool,
  interact: PropTypes.func,
  toolbarVisible: PropTypes.bool,
  onChange: PropTypes.func,
  saveAfterReset: PropTypes.func,
};

DrawingBoardCmp.defaultProps = {
  interactEnabled: false,
  interact: () => null,
  toolbarVisible: false,
  onChange: () => null,
  saveAfterReset: () => null,
};

/**
 * db.getImg()
 * db.setImg()
 * db.reset()
 *
 * These are the three functions which this component makes available to WorkbookEditor
 *
 * If we want to replace drawingboard.js someday, all it takes is to replace the above
 * three functions
 */
