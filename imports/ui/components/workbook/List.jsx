import React from 'react';
import { Menu } from 'semantic-ui-react';
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from 'react-sortable-hoc';
import PropTypes from 'prop-types';

const SortableItem = SortableElement(({
  slide,
  slideNo,
  props,
  index,
}) => (
  <Menu.Item
    style={{ display: 'flex', justifyContent: 'space-between' }}
    key={slideNo}
  >
    <div
      className="ui button lessonplanleftbutton slidenumber"
      style={{ width: '100%', textAlign: 'left', backgroundColor: index === props.curSlide ? 'lightGreen' : '#e0e1e2' }}
      onClick={() => { props.changeSlide(slideNo); }}
    >
      {slideNo + 1}
    </div>

    <div
        className="ui button lessonplanleftbutton"
        onClick={() => {
          const confirmation = confirm('Are you sure you want to delete?');
          if (confirmation === true) { props.deleteSlide(slideNo); }
        }}
      >
      X
    </div>

  </Menu.Item>
));

const SortableList = SortableContainer(({ items }) => (
  <Menu style={{ display: 'flex' }} icon vertical>
    {items}
  </Menu>
));

const List = (props) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const slidesCopy = [...props.slides];
    props.setStateAfterRearranging(arrayMove(slidesCopy, oldIndex, newIndex), newIndex);
  };
  const renderSlides = () => {
    const { slides } = props;
    if (slides.length !== 0) {
      const slideslist = slides.map((slide, index) => (

        // eslint-disable-next-line react/no-array-index-key
        <SortableItem key={index} index={index} slideNo={index} slide={slide} props={props} />
      ));
      return slideslist;
    }
    return null;
  };

  return (
    <SortableList
      pressDelay={200}
      items={renderSlides()}
      updateBeforeSortStart={(node) => {
        props.changeSlide(node.index);
      }}
      onSortEnd={onSortEnd}
    />
  );
};

List.propTypes = {
  setStateAfterRearranging: PropTypes.func.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  changeSlide: PropTypes.func.isRequired,
};

export default List;
