import React from 'react';
import { Rnd } from 'react-rnd';
import { Meteor } from 'meteor/meteor';
import 'semantic-ui-css/semantic.min.css';
import { TiArrowMove } from 'react-icons/ti';
import {
  FaTimes,
  FaCode,
  FaCopy,
} from 'react-icons/fa';
import { MdNetworkCell } from 'react-icons/md';
import { Button } from 'semantic-ui-react';
import { Session } from 'meteor/session';
import PropTypes from 'prop-types';
import SimContainer from './SimContainer';
import SimPreview from './SimPreview';
import { generateSrc } from '../../functions/index.js';

export default class SimsList extends React.Component {
  constructor(props) {
    super(props);
    this.renderSims.bind(this);
    this.simsRefArray = [];
  }

  handleCopy(slides, curSlide, index) {
    const copiedSim = $.extend(true, {}, slides[curSlide].iframes[index]);

    copiedSim.x = 50;
    copiedSim.y = 50;

    const { setCopiedState } = this.props;
    setCopiedState(true);

    alert('Sim copied');

    Session.set('copiedObject', { type: 'sim', copiedObject: copiedSim });
  }

  loadDataToSketches() {
    this.simsRefArray.map((sim) => {
      if (!sim) return;

      sim.loadDataToSketch();
    });
  }

  renderSims() {
    function calcMargin(iframes, index) {
      if (iframes.length === 1) {
        return 0;
      } if (iframes.length - 1 !== index) {
        return '13rem';
      }
      return '6rem';
    }

    /* This component displays a list of simulations.
           The props contain the current slide no. and the slides.
           The iframes of the current slide are obtained and rendered.
           On clicking the X button the delete function passed in the props is called.
        */

    const {
      curSlide,
      slides,
      isRndRequired,
      isPreview,
      updateSlides,
      deleteSim,
      userId,
      scale,
    } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    const updatedSlides = Object.values($.extend(true, {}, slides));

    if (updatedSlides.length !== 0) {
      const { iframes } = updatedSlides[curSlide];

      return iframes.map((iframe, index) => {
        /* Rnd is the react component which is used for dragging and resizing
            of the iframes. For more information about it, look in the documentation
            of React-Rnd.
            The size and the positions are initialized. The size with the values entered
            when the simulations are uploaded, and the position values
            are 0 by default initially.
            onDragStop is called everytime the iframe is stopped
            dragging, we set its position
            to the current position it had when it has been
            finished dragging. The changes are saved.
            onResize is called everytime the iframe is resized. The dimensions of the iframes
            are set accordingly.
            IsRnd is the prop that is passed to decide whether we need the resize
            and drag feature enabled.
            isPreview is a variable which specifies whether the iframe is just a preview
            or is it the real simulation used in the workbook.
        */

        if (isRndRequired) {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="sim-floating">
              <Rnd
                scale={scale * 0.7}
                bounds=".canvas-container"
                dragHandleClassName="sim-handle"
                resizeHandleClasses="sim-resize"
                size={{
                  width: isPreview ? iframe.w : iframe.w + 40,
                  height: iframe.h,
                }}
                position={{ x: iframe.x, y: iframe.y }}
                onDragStart={() => {
                  const sims = $('.sim');

                  for (let i = 0; i < sims.length; i += 1) {
                    sims[i].style['pointer-events'] = 'none';
                  }
                }}
                onDragStop={(e, d) => {
                  const sims = $('.sim');

                  for (let i = 0; i < sims.length; i += 1) {
                    sims[i].style['pointer-events'] = 'unset';
                  }

                  updatedSlides[curSlide].iframes[index].x = d.lastX;
                  updatedSlides[curSlide].iframes[index].y = d.lastY;

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
                onResize={(e, direction, ref) => {
                  updatedSlides[curSlide].iframes[index].w = isPreview
                    ? ref.offsetWidth
                    : ref.offsetWidth - 40;
                  updatedSlides[curSlide].iframes[index].h = ref.offsetHeight;
                  updateSlides(updatedSlides);
                }}
              >
                {/* The index is passed so that we can pass and retrieve
                                    data of this iframe. iframe is passed to set the
                                    height and with of the iframe.
                                */}
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <SimContainer
                    {...this.props}
                    index={index}
                    src={generateSrc(iframe.username, iframe.project_id)}
                    {...iframe}
                    ref={(e) => { this.simsRefArray[index] = e; }}
                  />
                  <div>
                    <a
                      style={{
                        marginLeft: '0.5rem',
                        display: isPreview ? 'block' : 'none',
                      }}
                      className="link-to-code"
                      target="_blank"
                      href={iframe.linkToCode}
                    >
                      <FaCode size="22" />
                    </a>
                  </div>
                  <div
                    className="sim-nav"
                    style={{
                      marginLeft: '0.5rem',
                      visibility: !isPreview ? 'visible' : 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <FaTimes
                        className="sim-delete"
                        onClick={() => {
                          const confirmation = confirm(
                            'Are you sure you want to remove this?',
                          );

                          if (confirmation === true) deleteSim(index);
                        }}
                        size="20"
                      />

                      <TiArrowMove size="22" className="sim-handle" />

                      <a
                        className="link-to-code"
                        target="_blank"
                        href={`https://editor.p5js.org/${
                          iframe.username
                        }/sketches/${iframe.project_id}`}
                      >
                        <FaCode size="22" />
                      </a>

                      <FaCopy
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => {
                          this.handleCopy(updatedSlides, curSlide, index);
                        }}
                        className="sim-copy"
                        size="18"
                      />
                    </div>

                    <div
                      style={{
                        float: 'right',
                        marginLeft: '0.6rem',
                        marginBottom: '0.1rem',
                      }}
                    >
                      <MdNetworkCell />
                    </div>
                  </div>
                </div>
              </Rnd>
            </div>
          );
        }
        return (
          <div
            style={{ marginBottom: calcMargin(iframes, index) }}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
          >
            <Button
              style={{
                visibility: userId === Meteor.userId() ? 'visible' : 'hidden',
                marginTop: '0.8rem',
                marginBottom: '0.8rem',
                float: 'center',
              }}
              onClick={() => {
                const confirmation = confirm(
                  'Are you sure you want to remove this?',
                );
                if (confirmation === true) deleteSim(index);
              }}
            >
                X
            </Button>

            <div>
              <SimPreview
                isPreview={false}
                {...this.props}
                index={index}
                src={generateSrc(iframe.username, iframe.project_id)}
                {...iframe}
                w={iframe.w}
                h={iframe.h}
              />
            </div>
            <div>
              <a
                style={{
                  marginLeft: '0.5rem',
                  display: isPreview ? 'block' : 'none',
                }}
                className="link-to-code-lesson"
                target="_blank"
                href={`https://editor.p5js.org/${iframe.username}/sketches/${
                  iframe.project_id
                }`}
              >
                <FaCode size="22" />
              </a>
            </div>
          </div>
        );
      });
    }
  }

  render() {
    return <div>{this.renderSims()}</div>;
  }
}

SimsList.propTypes = {
  setCopiedState: PropTypes.func,
  curSlide: PropTypes.number,
  slides: PropTypes.arrayOf(PropTypes.object),
  isRndRequired: PropTypes.bool,
  isPreview: PropTypes.bool,
  deleteSim: PropTypes.func,
  userId: PropTypes.string,
  updateSlides: PropTypes.func,
  scale: PropTypes.number,
};

SimsList.defaultProps = {
  setCopiedState: () => null,
  curSlide: 0,
  slides: [{}],
  isRndRequired: true,
  isPreview: false,
  deleteSim: () => null,
  userId: '',
  updateSlides: () => null,
  scale: 1,
};
