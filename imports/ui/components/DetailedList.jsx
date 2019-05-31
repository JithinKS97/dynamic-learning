/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  Card,
  Button,
  Input,
} from 'semantic-ui-react';
import FaPencil from 'react-icons/lib/fa/pencil';
import { Tracker } from 'meteor/tracker';

const ListTile = (props) => {
  const [isEditable, enableEditable] = useState(false);
  const [tempTitle, changeTempTitle] = useState('');
  const input = useRef();
  const [ownerName, changeOwnerName] = useState('');
  const [slideChangeDisable, changeSlideChangeDisable] = useState(false);

  const {
    userId,
    changeTitleOfSlide,
    title,
    deleteSlide,
    index,
    saveChanges,
  } = props;

  const isOwner = Meteor.userId() === userId;

  useEffect(() => {
    Tracker.autorun(() => {
      Meteor.call('getUsername', userId, (err, username) => {
        changeOwnerName(username);
      });
    });
  });

  return (
    <Card
      onClick={() => {
        if (!slideChangeDisable) { saveChanges(undefined, index); }
      }}
      style={{
        margin: '0', display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between',
      }}
    >
      <Card.Content
        style={{ flex: 5 }}
      >
        {isEditable ? (
          <Input
            ref={input}
            onChange={(_e, d) => {
              changeTempTitle(d.value);
            }}
            value={tempTitle}
          />
        ) : <Card.Header style={{ width: '100%' }}>{title}</Card.Header>}
        <Card.Meta style={{ marginTop: '0.4rem' }}>{ownerName}</Card.Meta>
      </Card.Content>
      <Card.Content style={{
        flex: 1, display: 'flex', flexDirection: 'row', height: '4.8rem',
      }}
      >

        {isOwner ? (
          <Fragment>

            {isEditable ? (
              <Button onClick={() => {
                enableEditable(false);
                changeTitleOfSlide(tempTitle, index);
              }}
              >
                Save
              </Button>
            ) : (
              <Button
                icon
                onClick={() => {
                  enableEditable(true);
                  changeTempTitle(props.title);
                }}
              >
                <FaPencil />

              </Button>
            // eslint-disable-next-line react/jsx-no-comment-textnodes
            )}

            <Button
              onMouseOver={() => {
                changeSlideChangeDisable(true);
              }}
              onMouseOut={() => {
                changeSlideChangeDisable(false);
              }}
              onClick={() => {
                // eslint-disable-next-line no-restricted-globals
                if (confirm('Are you sure you want to delete?')) { deleteSlide(props.index); }
              }}
              icon
            >
              X
            </Button>
          </Fragment>
        ) : null}

      </Card.Content>
    </Card>
  );
};

ListTile.propTypes = {
  userId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  changeTitleOfSlide: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  deleteSlide: PropTypes.func.isRequired,
  saveChanges: PropTypes.func.isRequired,
};

const DetailedList = (props) => {
  const {
    slides,
    deleteSlide,
    changeTitleOfSlide,
    saveChanges,
  } = props;
  const renderSlides = () => slides.map((slide, index) => (
    <ListTile
      userId={slide.userId}
      deleteSlide={deleteSlide}
      changeTitleOfSlide={changeTitleOfSlide}
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      index={index}
      title={slide.title}
      saveChanges={saveChanges}
    />
  ));
  return (<Menu vertical style={{ width: '100%' }}>{renderSlides()}</Menu>);
};

DetailedList.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteSlide: PropTypes.func.isRequired,
  changeTitleOfSlide: PropTypes.func.isRequired,
  saveChanges: PropTypes.func.isRequired,
};

export default DetailedList;
