/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import Rnd from 'react-rnd';
import { TiArrowMove } from 'react-icons/ti';
import { FaTimes, FaCopy } from 'react-icons/fa';
import { MdNetworkCell } from 'react-icons/md';

export default class MultipleChoice extends React.Component {
  render() {
    const {
      curSlide,
      index,
      updateSlides,
      deleteQuestion,
      isPreview,
      slides,
    } = this.props;
    const updatedSlides = JSON.parse(JSON.stringify(slides));

    return (
      <Rnd
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
        dragHandleClassName=".textbox-handle"
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
                  <FaTimes
                    className="sim-delete"
                    size="20"
                    onClick={() => {
                      const confirmation = confirm(
                        'Are you sure you want to delete the textbox?',
                      );

                      if (!confirmation) return;

                      deleteQuestion(index);
                    }}
                  >
                    X
                  </FaTimes>

                  <TiArrowMove size="22" className="textbox-handle" />

                  <FaCopy
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      this.handleCopy(updatedSlides, curSlide, index);
                    }}
                    className="sim-copy"
                    size="18"
                  />
                </div>

                <div style={{ marginLeft: '0.6rem', float: 'right' }}>
                  <MdNetworkCell />
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ width: '400px' }}>
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
            <div style={{ paddingRight: '15px' }}> A </div>
            <div
              style={{ gridColumnStart: 2 }}
              contentEditable
              ref={(e) => { updatedSlides[curSlide].questions[index].a = e ? e.value : ''; }}
            >
              Answer Choice A
            </div>
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
            <div style={{ paddingRight: '15px' }}> B </div>
            <div
              style={{ gridColumnStart: 2 }}
              contentEditable
              onChange={(e) => { updatedSlides[curSlide].questions[index].b = e.target.value; }}
            >
              Answer Choice B
            </div>
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
            <div style={{ paddingRight: '15px' }}> C </div>
            <div
              style={{ gridColumnStart: 2 }}
              contentEditable
              onChange={(e) => { updatedSlides[curSlide].questions[index].c = e.target.value; }}
            >
              Answer Choice C
            </div>
          </div>
          <br />
          <div
            style={{ color: 'white', bottom: 0, display: 'inline-grid' }}
          >
            <div style={{ paddingRight: '15px' }}> D </div>
            <div
              style={{ gridColumnStart: 2 }}
              contentEditable
              onChange={(e) => { updatedSlides[curSlide].questions[index].d = e.target.value; }}
            >
              Answer Choice D
            </div>
          </div>
        </div>
      </Rnd>
    );
  }
}
