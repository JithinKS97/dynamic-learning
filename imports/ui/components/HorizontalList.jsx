/* eslint-disable react/prop-types, react/no-array-index-key */
import React, { Component } from 'react';
import { Menu, Button } from 'semantic-ui-react';


export default class HorizontalList extends Component {
  renderList() {
    const {
      slides,
      userId,
      saveChanges,
      deleteSlide,
    } = this.props;

    return slides.map((slide, index) => { // eslint-disable-line arrow-body-style
      return (
        <Menu.Item
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
                &times;
              </Button>
            ) : null}
        </Menu.Item>
      );
    });
  }

  render() {
    return (
      <Menu style={{ height: '100%' }}>
        {this.renderList()}
      </Menu>
    );
  }
}
