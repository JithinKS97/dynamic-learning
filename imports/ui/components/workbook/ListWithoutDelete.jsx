/*eslint-disable*/
import React from 'react';
import { Menu, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const List = (props) => {
  const { save } = props;

  const renderSlides = () => {
    const { slides } = props;

    if (slides.length !== 0) {
      return slides.map((slide, index) => (
        <Menu.Item
          style={{ width: '9rem' }}
          key={index}
          onClick={() => {
            props.changeSlide(index);
          }}
        >
          {props.showTitle ? slide.title : index + 1}
        </Menu.Item>
      ));
    }
  };

  return (
    <div>
      <Menu vertical icon>
        {renderSlides()}
      </Menu>
    </div>
  );
};


List.propTypes = {
  saveChanges: PropTypes.func.isRequired,
  showTitle: PropTypes.bool.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default List;
