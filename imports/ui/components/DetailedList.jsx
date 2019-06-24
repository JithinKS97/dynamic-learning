import React, {
  Fragment,
  useState,
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
import MdSave from 'react-icons/lib/md/save';
import moment from 'moment';

const ListTile = (props) => {
  const [isEditable, enableEditable] = useState(false);
  const [tempTitle, changeTempTitle] = useState('');
  const input = useRef();
  const [slideChangeDisable, changeSlideChangeDisable] = useState(false);

  const {
    userId,
    changeTitleOfItem,
    title,
    deleteItem,
    index,
    handleClick,
    time,
    isMember,
    curSlide,
    username,
  } = props;

  const findTime = () => moment(time);

  const isOwner = Meteor.userId() === userId && !!isMember;


  return (
    <Card
      onClick={() => {
        if (!slideChangeDisable) { handleClick(index); }
      }}
      style={{
        margin: '0',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: curSlide === index ? '#F2F2F2' : 'white',
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
        <Card.Meta style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'row' }}>
          <div>{username}</div>
          <div style={{ marginLeft: '0.2rem' }}>{findTime().fromNow()}</div>
        </Card.Meta>
      </Card.Content>
      <Card.Content style={{
        flex: 1, display: 'flex', flexDirection: 'row', height: '4.8rem',
      }}
      >

        {isOwner ? (
          <Fragment>

            {isEditable ? (
              <Button
                icon
                onClick={() => {
                  enableEditable(false);
                  changeTitleOfItem(tempTitle, index);
                }}
              >
                <MdSave />
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
            )}

            <Button
              onMouseOver={() => {
                changeSlideChangeDisable(true);
              }}
              onMouseOut={() => {
                changeSlideChangeDisable(false);
              }}
              onClick={() => {
                if (confirm('Are you sure you want to delete?')) { deleteItem(props.index); }
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
  userId: PropTypes.string,
  title: PropTypes.string.isRequired,
  changeTitleOfItem: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  deleteItem: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  time: PropTypes.number.isRequired,
  isMember: PropTypes.bool,
  curSlide: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
};

ListTile.defaultProps = {
  isMember: false,
  userId: '',
};

const DetailedList = (props) => {
  const {
    items,
    deleteItem,
    changeTitleOfItem,
    handleClick,
    curSlide,
    _idToNameMappings,
  } = props;
  const renderSlides = () => items.map((item, index) => (
    <ListTile
      userId={item.userId}
      deleteItem={deleteItem}
      changeTitleOfItem={changeTitleOfItem}
      // eslint-disable-next-line react/no-array-index-key
      key={index}
      index={index}
      title={item.title}
      handleClick={handleClick}
      time={item.time}
      isMember={props.isMember}
      curSlide={curSlide}
      username={_idToNameMappings[item.userId]}
    />
  ));
  return (<Menu vertical style={{ width: '100%' }}>{renderSlides()}</Menu>);
};

DetailedList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteItem: PropTypes.func.isRequired,
  changeTitleOfItem: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  isMember: PropTypes.bool,
  curSlide: PropTypes.number.isRequired,
  _idToNameMappings: PropTypes.objectOf(PropTypes.string).isRequired,
};

DetailedList.defaultProps = {
  isMember: false,
};

export default DetailedList;
