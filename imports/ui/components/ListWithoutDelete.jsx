import React from 'react';
import { Menu, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const List = (props) => {
  const { save } = props;

  const renderSlides = () => {
    /* This component is intended for rendering slides list */
    const { slides } = props;

    /* There first button is intended for displaying the contents
        withrespect to the current slide.

        The second button is intended for the deletion of the slide.

        Both these operations are not performed here. But the functions
        that execute the operations are passed.
    */

    if (slides.length !== 0) {
      return slides.map((slide, index) => (
        <Menu.Item
          style={{ width: '9rem' }}
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          onClick={() => {
            props.saveChanges(undefined, index);
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
      <Button onClick={() => save()}> Submit Answers </Button>
    </div>
  );
};


List.propTypes = {
  saveChanges: PropTypes.func.isRequired,
  showTitle: PropTypes.bool.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default List;
