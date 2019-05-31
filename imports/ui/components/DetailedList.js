/* eslint-disable */
import React, {
  Fragment,
  useState,
  useEffect,
  useRef,
} from 'react';
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

  const { userId } = props;

  const isOwner = Meteor.userId() === userId;

  useEffect(() => {
    Tracker.autorun(() => {
      Meteor.call('getUsername', userId, (err, username) => {
        changeOwnerName(username);
        })
    })
})

    return (
        <Card style={{ margin: '0', display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
            <Card.Content style={{ flex: 5 }}>
                {isEditable ? <Input ref={input} onChange={(e, d) => {

                    changeTempTitle(d.value)

                }} value={tempTitle} /> : <Card.Header>{props.title}</Card.Header>}
                <Card.Meta style={{ marginTop: '0.4rem' }}>{ownerName}</Card.Meta>
            </Card.Content>
            <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'row', height: '4.8rem' }}>

                {isOwner?<Fragment>

                    {isEditable ? <Button onClick={() => {

                        enableEditable(false)
                        props.changeTitleOfSlide(tempTitle, props.index)

                    }}>Save</Button> : <Button icon onClick={() => {
                        enableEditable(true)
                        changeTempTitle(props.title)
                    }}><FaPencil /></Button>}

                    {<Button onClick = {()=>{

                        const confirmation = confirm('Are you sure you want to delete?')

                        if(confirmation == true)  
                            props.delete(props.index)

                    }} icon>X</Button>}

                </Fragment>:null}

            </Card.Content>
        </Card>
    )
}

const DetailedList = (props) => {

    const renderSlides = () => {

        return props.slides.map((slide, index) => {

            return <ListTile userId = {slide.userId} delete = {props.delete} changeTitleOfSlide = {props.changeTitleOfSlide} index = {index} key={index} title={slide.title} />
        })
    }

    return (<Menu vertical style={{ width: '100%' }}>{renderSlides()}</Menu>)
}

export default DetailedList