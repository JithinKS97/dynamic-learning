/* eslint-disable react/prop-types */
import React from 'react';
import { Rnd } from 'react-rnd';
import { TiArrowMove } from 'react-icons/ti';
import { FaTimes, FaCopy } from 'react-icons/fa';
import { MdNetworkCell } from 'react-icons/md';

export default class ShortResponse extends React.Component {
  constructor(props) {
    super(props);
    this.handleCopy = this.handleCopy.bind(this);
    this.keyStrokes = 0;
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

  render() {
    const {
      curSlide,
      index,
      updateSlides,
      deleteShortResponse,
      isPreview,
      slides,
      userId,
      scale,
    } = this.props;
    const updatedSlides = JSON.parse(JSON.stringify(slides));

    return (
      <Rnd
        scale={scale}
        className="textbox-floating"
        bounds=".canvas-container"
        size={{
          width: updatedSlides[curSlide].shortresponse[index].w
            ? updatedSlides[curSlide].shortresponse[index].w
            : 400,
          height: updatedSlides[curSlide].shortresponse[index].h
            ? updatedSlides[curSlide].shortresponse[index].h
            : 200,
        }}
        dragHandleClassName="textbox-handle"
        position={{
          x: updatedSlides[curSlide].shortresponse[index].x
            ? updatedSlides[curSlide].shortresponse[index].x
            : 100,
          y: updatedSlides[curSlide].shortresponse[index].y
            ? updatedSlides[curSlide].shortresponse[index].y
            : 100,
        }}
        onResize={(_e, _direction, ref) => {
          updatedSlides[curSlide].shortresponse[index].w = ref.offsetWidth;
          updatedSlides[curSlide].shortresponse[index].h = ref.offsetHeight;
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
          updatedSlides[curSlide].shortresponse[index].x = d.lastX;
          updatedSlides[curSlide].shortresponse[index].y = d.lastY;
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
              width: updatedSlides[curSlide].shortresponse[index].w
                ? `${updatedSlides[curSlide].shortresponse[index].w}px`
                : '400px',
              height: updatedSlides[curSlide].shortresponse[index].h
                ? `${updatedSlides[curSlide].shortresponse[index].h}px`
                : '200px',
            }}
            value={
              updatedSlides[curSlide].shortresponse[index].content
                ? updatedSlides[curSlide].shortresponse[index].content
                : ''
            }
            readOnly={Meteor.userId() !== userId}
            onChange={(e) => {
              updatedSlides[curSlide].shortresponse[index].content = e.target.value;

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
              updatedSlides[curSlide].shortresponse[index].w = this.textarea.offsetWidth;
              updatedSlides[curSlide].shortresponse[index].h = this.textarea.offsetHeight;

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

                      deleteShortResponse(index);
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
        <div>
          <textarea
            value={updatedSlides[curSlide].shortresponse[index].responses[Meteor.userId()]
              ? updatedSlides[curSlide].shortresponse[index].responses[Meteor.userId()] : ''}
            style={{
              resize: 'none',
              backgroundColor: 'rgba(0,0,0,0)',
              color: 'white',
              fontSize: '20px',
              border: '1px solid #404040',
              width: updatedSlides[curSlide].shortresponse[index].w
                ? `${updatedSlides[curSlide].shortresponse[index].w * 0.92}px`
                : '370px',
            }}
            onChange={(e) => {
              updatedSlides[curSlide].shortresponse[index].responses[Meteor.userId()] = e ? e.target.value : '';
              updateSlides(updatedSlides);
            }}
          />
        </div>
      </Rnd>
    );
  }
}
