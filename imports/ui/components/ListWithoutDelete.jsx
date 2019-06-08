
/* eslint-disable */
import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Menu } from 'semantic-ui-react'

const List = (props) => {

  const isOwner = Meteor.userId() == props.userId

  const renderSlides = () => {

    /* This component is intended for rendering slides list*/

    const slides = props.slides

    if (slides.length != 0) {

      return slides.map((slide, index) => {

        /* There first button is intended for displaying the contents
           withrespect to the current slide.

           The second button is intended for the deletion of the slide.

           Both these operations are not performed here. But the functions
           that execute the operations are passed.
        */

        return (
          <Menu.Item
            style={{ width: '9rem' }}
            key={index}
            onClick={() => { props.saveChanges(undefined, index) }}
          >
            {props.showTitle ? slide.title : index + 1}

          </Menu.Item>
        )
      })
    }
  }


  return (
    <Menu vertical icon>
      {renderSlides()}
    </Menu>
  )
}

export default List

