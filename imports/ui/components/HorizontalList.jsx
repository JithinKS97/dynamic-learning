import React, { Component } from 'react';
import { Menu, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

export default class HorizontalList extends Component {
  renderList() {
    const {
      slides,
      userId,
      saveChanges,
      deleteSlide,
    } = this.props;

    return slides.map((slide, index) => (
      <Menu.Item
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: userId === Meteor.userId() ? 'space-around' : 'center',
        }}
      >
        <Button onClick={() => { saveChanges(undefined, index); }}>
          {index + 1}
        </Button>
        {userId === Meteor.userId()
          ? (
            <Button onClick={() => { deleteSlide(index); }}>
                X
            </Button>
          ) : null}
      </Menu.Item>
    ));
  }

  render() {
    return (
      <Menu style={{ height: '100%' }}>
        {this.renderList()}
      </Menu>
    );
  }
}

HorizontalList.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  userId: PropTypes.string.isRequired,
  saveChanges: PropTypes.func.isRequired,
  deleteSlide: PropTypes.func.isRequired,
};
