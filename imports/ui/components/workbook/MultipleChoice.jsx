/* eslint-disable */

import React from 'react';
import { Rnd } from 'react-rnd';
import { Icon } from 'react-icons-kit';
import { move } from 'react-icons-kit/iconic/move'
import { copy } from 'react-icons-kit/fa/copy';
import {remove} from 'react-icons-kit/fa/remove'
import {ic_signal_cellular_4_bar} from 'react-icons-kit/md/ic_signal_cellular_4_bar';
import { Tracker } from 'meteor/tracker';

export default class MultipleChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acolor: '',
      bcolor: '',
      ccolor: '',
      dcolor: '',
    };
    this.clicked = '';
  }

  componentDidMount() {
    Tracker.autorun(() => {
      const {
        curSlide,
        slides,
        index,
        userId,
      } = this.props;
      const updatedSlides = JSON.parse(JSON.stringify(slides));
      this.clicked = updatedSlides[curSlide].questions[index].response || '';
      this.setState({
        acolor: this.clicked === 'a' ? 'red' : 'black',
        bcolor: this.clicked === 'b' ? 'red' : 'black',
        ccolor: this.clicked === 'c' ? 'red' : 'black',
        dcolor: this.clicked === 'd' ? 'red' : 'black',
      });
    });
  }

  componentDidUpdate() {
    const {
      curSlide,
      slides,
      index,
    } = this.props;
    const updatedSlides = JSON.parse(JSON.stringify(slides));
    this.clicked = updatedSlides[curSlide].questions[index].response || '';
    const atemp = this.clicked === 'a' ? 'red' : 'black';
    const btemp = this.clicked === 'b' ? 'red' : 'black';
    const ctemp = this.clicked === 'c' ? 'red' : 'black';
    const dtemp = this.clicked === 'd' ? 'red' : 'black';
    if (this.state.acolor !== atemp || this.state.bcolor !== btemp || this.state.ccolor !== ctemp ||
      this.state.dcolor !== dtemp) {
      this.setState({
        acolor: this.clicked === 'a' ? 'red' : 'black',
        bcolor: this.clicked === 'b' ? 'red' : 'black',
        ccolor: this.clicked === 'c' ? 'red' : 'black',
        dcolor: this.clicked === 'd' ? 'red' : 'black',
      },()=>{
        console.log(this.state)
      });
    }
  }


  handleCopy(slides, curSlide, index) {
    const copiedText = $.extend(true, {}, slides[curSlide].textboxes[index]);

    copiedText.x = 50;
    copiedText.y = 50;

    const { setCopiedState } = this.props;

    setCopiedState(true);

    alert('text copied');

    Session.set('copiedObject', { type: 'text', copiedObject: copiedText });
  }

  clickButton(option) {
    const {
      slides,
      curSlide,
      updateSlides,
      index,
    } = this.props;
    const updatedSlides = JSON.parse(JSON.stringify(slides));
    this.clicked = option;

    this.setState((state)=>{
      return {
        acolor: this.clicked === 'a' ? 'red' : 'black',
        bcolor: this.clicked === 'b' ? 'red' : 'black',
        ccolor: this.clicked === 'c' ? 'red' : 'black',
        dcolor: this.clicked === 'd' ? 'red' : 'black',
      }
    });
    if(this.state[this.clicked+'color'] === 'red') {
      updatedSlides[curSlide].questions[index].response = '';
    } else {
      updatedSlides[curSlide].questions[index].response = this.clicked;
    }
    updateSlides(updatedSlides);
  }

  handleClose() {
    this.setState({
      modalOpen: false,
    });
  }

  render() {
    const {
      curSlide,
      index,
      updateSlides,
      deleteQuestion,
      isPreview,
      slides,
      userId,
      scale,
      additionalScale,
    } = this.props;
    const {
      modalOpen,
    } = this.state;
    const updatedSlides = JSON.parse(JSON.stringify(slides));

    return (
      <Rnd
        scale={additionalScale ? additionalScale * scale : scale}
        className="textbox-floating"
        bounds=".canvas-container"
        size={{
          width: updatedSlides[curSlide].questions[index].w
            ? updatedSlides[curSlide].questions[index].w
            : 400,
          height: updatedSlides[curSlide].questions[index].h
            ? updatedSlides[curSlide].questions[index].h
            : 200,
        }}
        dragHandleClassName="textbox-handle"
        position={{
          x: updatedSlides[curSlide].questions[index].x
            ? updatedSlides[curSlide].questions[index].x
            : 100,
          y: updatedSlides[curSlide].questions[index].y
            ? updatedSlides[curSlide].questions[index].y
            : 100,
        }}
        onResize={(_e, _direction, ref) => {
          updatedSlides[curSlide].questions[index].w = ref.offsetWidth;
          updatedSlides[curSlide].questions[index].h = ref.offsetHeight;
          updateSlides(updatedSlides);
        }}
        enableResizing={{
          bottom: false,
          bottomLeft: false,
          bottomRight: !isPreview,
          left: false,
          right: false,
          top: false,
          topLeft: false,
          topRight: false,
        }}
        onDragStop={(_e, d) => {
          updatedSlides[curSlide].questions[index].x = d.lastX;
          updatedSlides[curSlide].questions[index].y = d.lastY;
          updateSlides(updatedSlides);
        }}
      >
        <div
          className="textArea"
          style={{
            display: 'flex',
            flexDirection: 'row',
            pointerEvents: isPreview ? 'none' : 'unset',
          }}
        >
          <textarea
            ref={(e) => { this.textarea = e; }}
            style={{
              resize: 'none',
              padding: '0.6rem',
              backgroundColor: 'rgba(0,0,0,0)',
              color: 'white',
              fontSize: '20px',
              border: '1px solid #404040',
              width: updatedSlides[curSlide].questions[index].w
                ? `${updatedSlides[curSlide].questions[index].w}px`
                : '400px',
              height: updatedSlides[curSlide].questions[index].h
                ? `${updatedSlides[curSlide].questions[index].h}px`
                : '200px',
            }}
            value={
              updatedSlides[curSlide].questions[index].content
                ? updatedSlides[curSlide].questions[index].content
                : ''
            }
            readOnly={Meteor.userId() !== userId}
            onChange={(e) => {
              updatedSlides[curSlide].questions[index].content = e.target.value;

              /**
               * The below code ensures that slides are pushed to the undo stack only when there is
               * a pause in the key stroke sequence. Otherwise for every keypress
               * we should push slides to the undo stack.
               *
               * For every keysroke, this.keystroke is incremented
               *
               * Function in setTimeout runs 1.5s after every keystroke
               *
               * If this.keystrokes > 0 within that time, it means a sequence of
               * keystrokes have occured, so we slides to undo stack.
               */

              this.keyStrokes += 1;

              setTimeout(() => {
                // eslint-disable-next-line no-shadow
                const { slides } = this.props;

                if (this.keyStrokes > 0) {
                  updateSlides(slides);
                  this.keyStrokes = 0;
                }
              }, 1500);

              updateSlides(updatedSlides, undefined, true);
            }}
            onDrag={() => {
              updatedSlides[curSlide].questions[index].w = this.textarea.offsetWidth;
              updatedSlides[curSlide].questions[index].h = this.textarea.offsetHeight;

              updateSlides(updatedSlides);
            }}
          />
          {isPreview ? null : (
            <div
              className="sim-nav"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  marginLeft: '0.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: '0.1rem',
                  }}
                >
                  <Icon
                    icon={remove}
                    className="sim-delete"
                    size="20"
                    onClick={() => {
                      const confirmation = confirm(
                        'Are you sure you want to delete the question?',
                      );

                      if (!confirmation) return;

                      deleteQuestion(index);
                    }}
                  >
                    X
                  </Icon>

                  <Icon icon={move} size="22" className="textbox-handle" />

                  <Icon
                    icon={copy}
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      this.handleCopy(updatedSlides, curSlide, index);
                    }}
                    className="sim-copy"
                    size="18"
                  />
                </div>
                <Icon icon={ic_signal_cellular_4_bar} style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '400px' }}>
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
             <div style={{ paddingRight: '15px', border: '1px solid #404040', backgroundColor: this.state.acolor }} onClick={() => this.clickButton('a')}> A </div> 
            <textarea
              readOnly={Meteor.userId() !== userId}
              style={{
                gridColumnStart: 2, backgroundColor: 'black', border: '1px solid #404040', color: 'white', resize: 'none', width: '345px',
              }}
              onChange={(e) => { updatedSlides[curSlide].questions[index].a = e ? e.target.value : ''; updateSlides(updatedSlides); }}
              value={updatedSlides[curSlide].questions[index].a ? updatedSlides[curSlide].questions[index].a : ''}
            />
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
             <div style={{ paddingRight: '15px', border: '1px solid #404040', backgroundColor: this.state.bcolor }} onClick={() => this.clickButton('b')}> B </div> 
            <textarea
              readOnly={Meteor.userId() !== userId}
              style={{
                gridColumnStart: 2, backgroundColor: 'black', border: '1px solid #404040', color: 'white', resize: 'none', width: '345px',
              }}
              onChange={(e) => { updatedSlides[curSlide].questions[index].b = e ? e.target.value : ''; updateSlides(updatedSlides); }}
              value={updatedSlides[curSlide].questions[index].b ? updatedSlides[curSlide].questions[index].b : ''}
            />
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
             <div style={{ paddingRight: '15px', border: '1px solid #404040', backgroundColor: this.state.ccolor }} onClick={() => this.clickButton('c')}> C </div> 
            <textarea
              readOnly={Meteor.userId() !== userId}
              style={{
                gridColumnStart: 2, backgroundColor: 'black', border: '1px solid #404040', color: 'white', resize: 'none', width: '345px',
              }}
              onChange={(e) => { updatedSlides[curSlide].questions[index].c = e ? e.target.value : ''; updateSlides(updatedSlides); }}
              value={updatedSlides[curSlide].questions[index].c ? updatedSlides[curSlide].questions[index].c : ''}
            />
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
             <div style={{ paddingRight: '15px', border: '1px solid #404040', backgroundColor: this.state.dcolor }} onClick={() => this.clickButton('d')}> D </div> 
            <textarea
              readOnly={Meteor.userId() !== userId}
              style={{
                gridColumnStart: 2, backgroundColor: 'black', border: '1px solid #404040', color: 'white', resize: 'none', width: '345px',
              }}
              onChange={(e) => { updatedSlides[curSlide].questions[index].d = e ? e.target.value : ''; updateSlides(updatedSlides); }}
              value={updatedSlides[curSlide].questions[index].d ? updatedSlides[curSlide].questions[index].d : ''}
            />
          </div>
        </div>
      </Rnd>
    );
  }
}
