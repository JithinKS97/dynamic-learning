import React from 'react';
import PropTypes from 'prop-types';
import TextBox from './TextBox';

export default class TextBoxes extends React.Component {
  renderTextBoxes = () => {
    const { slides, curSlide } = this.props;

    if (!slides[curSlide]) { return; }
    if (!slides[curSlide].textboxes) { return; }

    return slides[curSlide].textboxes.map((textbox, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={index}>
        <TextBox
          index={index}
          value={textbox.value}
          {...this.props}
        />
      </div>
    ));
  }

  render() {
    return (
      <div>{this.renderTextBoxes()}</div>
    );
  }
}

TextBoxes.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object),
  curSlide: PropTypes.number,
};

TextBoxes.defaultProps = {
  slides: [{ textboxes: [] }],
  curSlide: 0,
};
