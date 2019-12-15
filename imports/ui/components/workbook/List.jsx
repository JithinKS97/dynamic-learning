import React, { useState } from 'react';
import {
  SortableContainer,
  SortableElement,
  arrayMove,
} from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import { FiTrash } from 'react-icons/fi';

const SortableItem = SortableElement(({
  slideNo,
  props,
}) => {
  const [hoveringOnDelete, setHoveringOnDelete] = useState(false);
  const [currentHovering, setCurrentHovering] = useState(-1);
  return (
    <div
      key={slideNo}
      className="workbook-editor__slides-list__item"
      style={{
        backgroundColor: slideNo === props.curSlide ? '#102028' : null,
        border: slideNo === props.curSlide ? '1px solid #102028' : null,
      }}
      onClick={() => {
        if (!hoveringOnDelete) {
          props.changeSlide(slideNo);
        }
      }}
      onMouseEnter={() => {
        setCurrentHovering(slideNo);
      }}
      onMouseLeave={() => {
        setCurrentHovering(-1);
      }}
    >
      <div
        style={{
          color: slideNo === props.curSlide ? '#1ed760' : null,
          paddingTop: '0.2rem',
        }}
      >
        Slide
        {' '}
        {slideNo + 1}
      </div>
      <div
        style={{
          visibility: slideNo === currentHovering ? 'visible' : 'hidden',
        }}
        onMouseEnter={() => {
          setHoveringOnDelete(true);
        }}
        onMouseLeave={() => {
          setHoveringOnDelete(false);
        }}
        onClick={() => {
          const confirmation = confirm('Are you sure you want to delete?');
          if (confirmation === true) { props.deleteSlide(slideNo); }
        }}
      >
        <FiTrash className="workbook-editor__slides-list__delete-button" style={{ padding: 0, margin: 0 }} />
      </div>
    </div>
  );
});

const SortableList = SortableContainer(({ items }) => (
  <div>
    {items}
  </div>
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
    <div>
      <SortableList
        pressDelay={200}
        items={renderSlides()}
        updateBeforeSortStart={(node) => {
          props.changeSlide(node.index);
        }}
        onSortEnd={onSortEnd}
      />
    </div>
  );
};

List.propTypes = {
  setStateAfterRearranging: PropTypes.func.isRequired,
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  changeSlide: PropTypes.func.isRequired,
};

export default List;
