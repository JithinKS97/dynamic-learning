import React from 'react';
import PropTypes from 'prop-types';
import ShortResponse from './ShortResponse';

export default class ShortResponses extends React.Component {
  renderSR = () => {
    const { slides, curSlide } = this.props;

    if (!slides[curSlide]) { return; }
    if (!slides[curSlide].shortresponse) { return; }

    return slides[curSlide].shortresponse.map((sr, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={index}>
        <ShortResponse
          index={index}
          content={sr.content}
          {...this.props}
        />
      </div>
    ));
  }

  render() {
    return (
      <div>{this.renderSR()}</div>
    );
  }
}

