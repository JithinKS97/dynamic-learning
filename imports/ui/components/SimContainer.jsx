import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export default class SimContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const iframeLoaded = () => {
      /* For the communication to the iframe document, we create a MessageChannel,
          port 1 is the port in this window. On recieveing a message here, we call
          handleMessage.
      */

      this.setState({
        loading: false,
      });

      this.channel = null;
      this.channel = new MessageChannel();
      this.channel.port1.onmessage = this.handleMessage.bind(this);
      const data = {};
      data.operation = 'sendingPort';
      this.otherWindow.postMessage(data, '*', [this.channel.port2]);
    };

    this.otherWindow = this.iframe.contentWindow;

    this.iframe.addEventListener('load', iframeLoaded, false);
  }

  loadDataToSketch() {
    const { curSlide, index, slides } = this.props;

    const tempSlides = Object.values($.extend(true, {}, slides));

    if (slides[curSlide].iframes[index].data) {
      this.otherWindow.postMessage(
        { operation: 'load', data: tempSlides[curSlide].iframes[index].data },
        '*',
      );
    } else {
      this.otherWindow.postMessage({ operation: 'load', data: {} }, '*');
    }
  }

  handleMessage(e) {
    /* If the iframe is just a preview, we need not have the message operations.
       If the operation propety of the object is save, the data is fetched and saved
       to the data property of the simulation.
       If the opration property is load, the data stored is send back.
    */

    const {
      curSlide, index, slides, saveChanges, undo, redo, save, interact,
    } = this.props;

    const tempSlides = Object.values($.extend(true, {}, slides));

    if (e.data.operation === 'save') {
      tempSlides[curSlide].iframes[index].data = e.data.data;

      /**
       * Here we are changing the state of a single sim and so
       * we need not load data to the all the sims when this happens
       * To indicate this, a third parameter true is passed
       */

      saveChanges(tempSlides, undefined, true);
    } else if (e.data.operation === 'load') {
      this.otherWindow.postMessage(
        { operation: 'load', data: tempSlides[curSlide].iframes[index].data },
        '*',
      );
    } else if (e.data.operation === 'keyPress') {
      if (e.data.Key === 'z') {
        undo();
      } else if (e.data.Key === 'y') {
        redo();
      } else if (e.data.Key === 's') {
        save();
      } else if (e.data.Key === 'd') {
        interact();
      }
    }
  }

  render() {
    const { loading } = this.state;
    const { h, w, src } = this.props;

    return (
      <div className="sim">
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
        {src ? (
          <div>
            <iframe
              className="iframe"
              ref={(e) => { this.iframe = e; }}
              scrolling="no"
              height={h}
              width={w}
              src={src}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

SimContainer.propTypes = {
  h: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  src: PropTypes.string.isRequired,
  curSlide: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  saveChanges: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  interact: PropTypes.func.isRequired,
};
