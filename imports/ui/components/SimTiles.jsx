/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable import/extensions */
import FaPencil from 'react-icons/lib/fa/pencil';
import React, { useState, useEffect } from 'react';
import {
  Card, Button, Menu, Modal, Input,
} from 'semantic-ui-react';
import { Tracker } from 'meteor/tracker';
import FaCode from 'react-icons/lib/fa/code';
import MdSave from 'react-icons/lib/md/save';
import { generateSrc } from '../../functions/index.js';
import SimPreview from './SimPreview';

const SimTile = (props) => {
  const {
    sim, slides, curSlide, update, index,
  } = props;
  const [selectedSim, setSelectedSim] = useState(null);
  const [onDelete, setOnDelete] = useState(false);
  const [tagEditable, changeTagEditable] = useState(false);
  const [titleEditable, changeTitleEditable] = useState(false);
  const [tempTag, changeTempTag] = useState('');
  const [tempTitle, changeTempTitle] = useState('');

  useEffect(() => {
    Tracker.autorun(() => {
      Meteor.call('getUsername', sim.userId, (err, username) => {
        changeOwnerName(username);
      });
    });
  });

  const [ownerName, changeOwnerName] = useState('');

  return (
    <div style={{ width: '100%' }}>
      <Card
        onClick={() => {
          if (!onDelete) setSelectedSim(sim);
        }}
        style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
      >
        <Card.Content style={{ flex: 14 }}>
          <Card.Header>{sim.title}</Card.Header>
          <Card.Meta style={{ marginTop: '0.4rem' }}>{ownerName}</Card.Meta>
        </Card.Content>
        <Card.Content style={{ flex: 1 }}>
          <Button
            onMouseOver={() => {
              setOnDelete(true);
            }}
            onMouseOut={() => {
              setOnDelete(false);
            }}
            icon
          >
            X
          </Button>
        </Card.Content>
      </Card>
      <Modal size="small" style={{ width: 'auto' }} open={!!selectedSim}>
        <Modal.Header>
          Preview
          <div className="close-button">
            <a
              className="link-to-code"
              target="_blank"
              href={
                selectedSim
                  ? `https://editor.p5js.org/${selectedSim.username}/sketches/${
                    selectedSim.project_id
                  }`
                  : ''
              }
            >
              <Button>
                <FaCode />
              </Button>
            </a>
            <Button
              onClick={() => {
                setSelectedSim(null);
              }}
            >
              X
            </Button>
          </div>
        </Modal.Header>
        <Modal.Content>
          <SimPreview
            userId={selectedSim ? selectedSim.userId : null}
            index={index}
            slides={slides}
            curSlide={curSlide}
            save={update}
            w={selectedSim ? selectedSim.w : 640}
            h={selectedSim ? selectedSim.h : 360}
            src={
              selectedSim
                ? generateSrc(selectedSim.username, selectedSim.project_id)
                : null
            }
          />
          {selectedSim ? (
            <Card style={{ width: '100%' }}>
              <Card.Content
                style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
              >
                {!titleEditable ? (
                  <h5 style={{ flex: 14 }}>{selectedSim.title}</h5>
                ) : null}
                {titleEditable ? (
                  <Input
                    onChange={(e, d) => {
                      changeTempTitle(d.value);
                    }}
                    value={tempTitle}
                    style={{
                      flex: 14,
                      marginRight: '1.2rem',
                    }}
                  />
                ) : null}
                <Button
                  onClick={() => {
                    if (titleEditable === false) {
                      changeTitleEditable(true);
                      changeTempTitle(selectedSim.title);
                    } else {
                      changeTitleEditable(false);
                    }
                  }}
                  style={{ float: 'right', flex: 1 }}
                  icon
                >
                  {titleEditable ? <MdSave icon /> : <FaPencil icon />}
                </Button>
              </Card.Content>
              <Card.Content
                style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
              >
                {!tagEditable ? (
                  <h5 style={{ flex: 14 }}>
                    {`<iframe src="${generateSrc(
                      selectedSim.username,
                      selectedSim.project_id,
                    )}"></iframe>`}

                  </h5>
                ) : null}
                {tagEditable ? (
                  <Input
                    onChange={(e, d) => {
                      changeTempTag(d.value);
                    }}
                    value={tempTag}
                    style={{ flex: 14, marginRight: '1.2rem' }}
                  />
                ) : null}
                <Button
                  onClick={() => {
                    if (tagEditable === false) {
                      changeTagEditable(true);
                      changeTempTag(
                        `<iframe src="${generateSrc(
                          selectedSim.username,
                          selectedSim.project_id,
                        )}"></iframe>`,
                      );
                    } else {
                      changeTagEditable(false);
                    }
                  }}
                  icon
                  style={{ flex: 1 }}
                >
                  {tagEditable ? <MdSave icon /> : <FaPencil icon />}
                </Button>
              </Card.Content>
            </Card>
          ) : null}
        </Modal.Content>
      </Modal>
    </div>
  );
};

const SimTiles = (props) => {
  const { slides, curSlide } = props;
  const sims = slides[curSlide].iframes;

  return (
    <Menu>
      {sims.map((sim, index) => (
        <SimTile
          index={index}
          sim={sim}
          slides={props.slides}
          curSlide={props.curSlide}
          update={props.update}
        />
      ))}
    </Menu>
  );
};

export default SimTiles;
