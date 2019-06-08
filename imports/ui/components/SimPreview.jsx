import React from 'react';
import Rnd from 'react-rnd';
import { Dimmer, Loader } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export default class SimPreview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      h: 360,
      w: 640,
      loading: true,
    };
  }

  componentDidMount() {
    const { w, h } = this.props;
    this.setState({
      h,
      w,
    });
  }

  iframeLoaded = () => {
    this.setState({
      loading: false,
    });
  };

  render() {
    const {
      slides, curSlide, index, src,
    } = this.props;
    const { loading, w, h } = this.state;
    return (
      <Rnd
        resizeHandleStyles={{
          width: '100px',
          height: '100px',
        }}
        style={{ position: 'relative', marginBottom: '1.6rem' }}
        disableDragging
        enableResizing={{
          bottom: false,
          bottomLeft: false,
          bottomRight: true,
          left: false,
          right: false,
          top: false,
          topLeft: false,
          topRight: false,
        }}
        onResize={(e, direction, ref) => {
          this.setState(
            {
              h: ref.offsetHeight,
              w: ref.offsetWidth,
            },
            () => {
              if (!slides) return;

              slides[curSlide].iframes[
                index
              ].w = ref.offsetWidth;
              slides[curSlide].iframes[
                index
              ].h = ref.offsetHeight;
            },
          );
        }}

        onResizeStop={() => {
          const {
            save,
          } = this.props;
          save();
        }}
      >
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>

        <iframe
          style={{ border: src ? '2px solid grey' : 'none' }}
          className="iframe"
          scrolling="no"
          onLoad={this.iframeLoaded}
          ref={(e) => { this.iframe = e; }}
          width={`${w || 640}px`}
          height={`${h || 360}px`}
          src={src}
        />
      </Rnd>
    );
  }
}

SimPreview.propTypes = {
  save: PropTypes.func,
  slides: PropTypes.arrayOf(PropTypes.object),
  curSlide: PropTypes.number,
  index: PropTypes.number,
  src: PropTypes.string.isRequired,
  w: PropTypes.number,
  h: PropTypes.number,
};

SimPreview.defaultProps = {
  w: 640,
  h: 360,
  curSlide: 0,
  slides: [],
  index: 0,
  save: () => null,
};
