/* eslint-disable react/prop-types */
/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import { fabric } from 'fabric';
import {
  FaPencilAlt,
  FaCircle,
  FaSquareFull,
} from 'react-icons/fa';
import {
  IoMdUndo,
  IoMdRedo,
  IoIosCopy,
} from 'react-icons/io';
import { TiCancel } from 'react-icons/ti';
import { SwatchesPicker } from 'react-color';
import { GoRepoForked } from 'react-icons/go';
import {
  MdPhotoSizeSelectSmall,
  MdTextFields,
  MdQuestionAnswer,
  MdSave,
} from 'react-icons/md';
import PropTypes from 'prop-types';

export default class DrawingBoardCmp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: null,
      size: 6,
      selectedFill: '#2196f3',
      selectedStroke: '#d9d9d9',
      userId: props.userId,
      copied: props.copied,
    };
    this.brushSizes = [0, 1, 2, 3, 4, 5, 6, 8, 12, 16, 32];
    this.started = false;
    this.showStrokeSlider = false;
    this.showFillColorPicker = false;
    this.showStrokeColorPicker = false;
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
    this.pencil.color = 'white';
    this.pencil.width = 5;

    this.b.freeDrawingBrush = this.pencil;
    document.getElementsByClassName('stroke-width-selector')[0].value = 6;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      size,
      option,
      selectedFill,
      selectedStroke,
      userId,
      copied,
    } = this.state;
    if (
      size !== nextState.size
      || option !== nextState.option
      || selectedFill !== nextState.selectedFill
      || selectedStroke !== nextState.selectedStroke
      || userId !== nextProps.userId
      || copied !== nextProps.copied
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
        if (this.showStrokeSlider === true) {
          document.getElementsByClassName('stroke-width-selector-container')[0].style.display = 'none';
          this.showStrokeSlider = false;
        } else {
          this.closePopups();
          document.getElementsByClassName('stroke-width-selector-container')[0].style.display = 'inline';
          this.showStrokeSlider = true;
        }
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

  getImg() {
    return JSON.stringify(this.b);
  }

  closePopups = () => {
    document.getElementsByClassName('stroke-color-picker-container')[0].style.display = 'none';
    this.showStrokeColorPicker = false;
    document.getElementsByClassName('stroke-width-selector-container')[0].style.display = 'none';
    this.showStrokeSlider = false;
    document.getElementsByClassName('fill-color-picker-container')[0].style.display = 'none';
    this.showFillColorPicker = false;
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

  /*  handleNoFill = () => {
    const { option } = this.state;
    const { onChange } = this.props;
    if (option === 'select') {
      this.b.getActiveObjects().forEach((object) => {
        object.set({ fill: 'transparent' });
      });
      this.b.renderAll();
      onChange();
    }
    this.setState({ selectedFill: 'transparent' });
  }
*/

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
    document.getElementsByClassName('fill-icon')[0].style.backgroundColor = color.hex;
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
      document.getElementsByClassName('stroke-color-icon')[0].style.backgroundColor = color.hex;
    });
  };

  handleStrokeWidthChange = (e) => {
    const { onChange } = this.props;
    this.pencil.width = e.target.value;
    const strokeWidth = e.target.value;
    this.b.getActiveObjects().forEach((object) => {
      object.set({ strokeWidth });
    });
    this.b.renderAll();
    onChange();
  }

  handleFillColorPickerDisplay = () => {
    if (this.showFillColorPicker === false) {
      this.closePopups();
      document.getElementsByClassName('fill-color-picker-container')[0].style.display = 'inline';
      this.showFillColorPicker = true;
    } else {
      document.getElementsByClassName('fill-color-picker-container')[0].style.display = 'none';
      this.showFillColorPicker = false;
    }
  }

  handleStrokeColorPickerDisplay = () => {
    if (this.showStrokeColorPicker === false) {
      this.closePopups();
      document.getElementsByClassName('stroke-color-picker-container')[0].style.display = 'inline';
      this.showStrokeColorPicker = true;
    } else {
      document.getElementsByClassName('stroke-color-picker-container')[0].style.display = 'none';
      this.showStrokeColorPicker = false;
    }
  }

  handlePaste = () => {
    const {
      slides,
      curSlide,
      updateSlides,
    } = this.props;
    if (Session.get('copiedObject')) {
      const object = Session.get('copiedObject');

      const clonedSlides = Object.values(
        $.extend(true, {}, slides),
      );

      if (object.type === 'sim') {
        clonedSlides[curSlide].iframes.push(
          object.copiedObject,
        );
      } else if (object.type === 'text') {
        clonedSlides[curSlide].textboxes.push(
          object.copiedObject,
        );
      }

      updateSlides(clonedSlides);
    }
  }

  handleClearCanvas = () => {
    const { saveAfterReset } = this.props;
    this.reset();
    saveAfterReset();
  }

  renderIcon = () => {
    const { userId } = this.props;
    if (Meteor.userId() === userId || !Meteor.userId()) {
      return (
        <>
          <MdSave size="1.7em" />
          <span className="tooltiptext">Save</span>
        </>
      );
    }
    return (
      <>
        <GoRepoForked size="1.7em" />
        <span className="tooltiptext">Fork and save</span>
      </>
    );
  }

  render() {
    const {
      option,
      selectedFill,
      selectedStroke,
    } = this.state;
    const {
      undo,
      redo,
      saveToDatabase,
      addTextBox,
      addQuestion,
      copied,
      showToolbar,
    } = this.props;

    return (
      <div>
        <div style={{ display: showToolbar ? 'block' : 'none' }} className="drawing-board-controls-wrapper">
          <div className="drawing-board-controls">
            <div
              className={option === 'select' ? 'drawing-board-controls__item drawing-board-controls__item--selected tooltip' : 'drawing-board-controls__item tooltip'}
              onClick={() => { this.closePopups(); this.setOption('select'); }}
            >
              <MdPhotoSizeSelectSmall size="1.7em" />
              <span className="tooltiptext">Select</span>
            </div>
            <div
              className={option === 'pencil' ? 'drawing-board-controls__item drawing-board-controls__item--selected tooltip' : 'drawing-board-controls__item tooltip'}
              onClick={() => { this.setOption('pencil'); }}
            >
              <FaPencilAlt size="1.7em" />
              <span className="tooltiptext">Pencil</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={this.handleFillColorPickerDisplay}
            >
              <div className="fill-icon" />
              <span className="tooltiptext">Fill color</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={this.handleStrokeColorPickerDisplay}
            >
              <div className="stroke-color-icon" />
              <span className="tooltiptext">Stroke color</span>
            </div>
            <div
              className={option === 'ellipse' ? 'drawing-board-controls__item drawing-board-controls__item--selected tooltip' : 'drawing-board-controls__item tooltip'}
              onClick={() => { this.closePopups(); this.setOption('ellipse'); }}
            >
              <FaCircle size="1.7em" />
              <span className="tooltiptext">Ellipse</span>
            </div>
            <div
              className={option === 'rect' ? 'drawing-board-controls__item drawing-board-controls__item--selected tooltip' : 'drawing-board-controls__item tooltip'}
              onClick={() => { this.closePopups(); this.setOption('rect'); }}
            >
              <FaSquareFull size="1.7em" />
              <span className="tooltiptext">Rectangle</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); this.setOption('line'); }}
            >
              <div className="line-icon">
                <div className={option === 'line' ? 'line-icon__item line-icon__item--selected' : 'line-icon__item'} />
              </div>
              <span className="tooltiptext">Straight line</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); undo(); }}
            >
              <IoMdUndo size="1.7em" />
              <span className="tooltiptext">Undo</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); redo(); }}
            >
              <IoMdRedo size="1.7em" />
              <span className="tooltiptext">Redo</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); this.handleClearCanvas(); }}
            >
              <TiCancel size="1.7em" />
              <span className="tooltiptext">Clear canvas</span>
            </div>
            {/* <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); this.handleAddDescription(); }}
            >
              <AiOutlineFileText size="1.7em" />
              <span className="tooltiptext">Add description</span>
            </div> */}
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); addTextBox(); }}
            >
              <MdTextFields size="1.7em" />
              <span className="tooltiptext">Add textbox</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); addQuestion(); }}
            >
              <MdQuestionAnswer size="1.7em" />
              <span className="tooltiptext">Add question</span>
            </div>
            <div
              className="drawing-board-controls__item tooltip"
              onClick={() => { this.closePopups(); saveToDatabase(); }}
            >
              {this.renderIcon()}
            </div>
            <div
              className={copied === true ? 'drawing-board-controls__item tooltip' : 'drawing-board-controls__item empty-clipboard tooltip'}
              onClick={() => { this.closePopups(); this.handlePaste(); }}
            >
              <IoIosCopy size="1.7em" />
              <span className="tooltiptext">Paste</span>
            </div>
          </div>
          <div>
            <div className="stroke-width-selector-container">
              <input type="range" min="1" max="32" className="stroke-width-selector" onChange={this.handleStrokeWidthChange} />
            </div>
            <div className="fill-color-picker-container">
              <SwatchesPicker
                color={selectedFill}
                onChangeComplete={this.handleFillSelection}
              />
            </div>
            <div className="stroke-color-picker-container">
              <SwatchesPicker
                color={selectedStroke}
                onChangeComplete={this.handleStrokeSelection}
              />
            </div>
          </div>
        </div>
        <canvas id="c" />
      </div>
    );
  }
}

DrawingBoardCmp.propTypes = {
  interactEnabled: PropTypes.bool,
  interact: PropTypes.func,
  onChange: PropTypes.func,
  saveAfterReset: PropTypes.func,
  userId: PropTypes.string,
  copied: PropTypes.bool,
};

DrawingBoardCmp.defaultProps = {
  interactEnabled: false,
  interact: () => null,
  onChange: () => null,
  saveAfterReset: () => null,
  userId: null,
  copied: false,
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
