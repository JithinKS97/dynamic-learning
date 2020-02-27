/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import {
  Modal,
  Button,
  Form,
  List,
} from 'semantic-ui-react';
import { Icon } from 'react-icons-kit';
import { edit } from 'react-icons-kit/fa/edit';

export const renderResponseModal = editorRef => (
  <Modal
    size="tiny"
      // eslint-disable-next-line react/destructuring-assignment
    open={editorRef.state.question}
    onClose={() => editorRef.setState({ question: false })}
  >
    <Modal.Header>
          Choose a question type.
      <Button
        className="close-button"
        onClick={() => editorRef.setState({ question: false })}
      >
            &times;
      </Button>
    </Modal.Header>

    <Modal.Content>
      <Modal.Description>
        <Button onClick={() => editorRef.addMCQ()}> Multiple Choice </Button>
        <Button onClick={() => editorRef.addShortResponse()}>
          {' '}
              Short Response
          {' '}
        </Button>
      </Modal.Description>
    </Modal.Content>
  </Modal>
);

export const renderDescriptionModal = (editorRef) => {
  const { description, showDescription } = editorRef.state;
  return (
    <Modal open={showDescription}>
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>Description</div>
          <div>
            {Meteor.userId() ? (
              <Button onClick={() => {
                editorRef.setState({
                  showDescription: false,
                  showEditDescription: true,
                });
              }}
              >
                <Icon icon={edit} />
              </Button>
            ) : null}
            <Button
              className="close-button"
              onClick={() => {
                editorRef.setState({ showDescription: false });
              }}
            >
              X
            </Button>
          </div>
        </div>
      </Modal.Header>
      {Object.keys(description).length === 0
      && description.constructor === Object ? (
        <Modal.Content>
          No description to show
        </Modal.Content>
        ) : (
          <Modal.Content>
            <List divided relaxed>
              <List.Item>
                <List.Header>Subject</List.Header>
                {description.subject}
              </List.Item>
              <List.Item>
                <List.Header>Topic</List.Header>
                {description.topic}
              </List.Item>
              <List.Item>
                <List.Header>Learning Objectives</List.Header>
                {description.learningObjectives}
              </List.Item>
              <List.Item>
                <List.Header>In-Class Activites</List.Header>
                {description.inClassActivities}
              </List.Item>
              <List.Item>
                <List.Header>Resources</List.Header>
                {description.resources}
              </List.Item>
              <List.Item>
                <List.Header>Assessments</List.Header>
                {description.assessments}
              </List.Item>
              <List.Item>
                <List.Header>Standards</List.Header>
                {description.standards}
              </List.Item>
            </List>
          </Modal.Content>
        )}

    </Modal>
  );
};

export const renderAddDescription = (editorRef) => {
  const { showAddDescription } = editorRef.state;

  return (
    <Modal
      size="small"
      onClose={() => {
        editorRef.setState({ showAddDescription: false });
      }}
      open={showAddDescription}
    >
      <Modal.Header>
        Lesson Description
        <Button
          className="close-button"
          onClick={() => {
            editorRef.setState({ showAddDescription: false });
          }}
        >
          X
        </Button>
      </Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Form onSubmit={editorRef.addDescription}>
            <Form.Field required>
              <label>Subject</label>
              <input
                ref={(e) => {
                  editorRef.subject = e;
                }}
                required
              />
            </Form.Field>
            <Form.Field>
              <label>Topic</label>
              <input
                ref={(e) => {
                  editorRef.topic = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <label>Learning Objective(s)</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.learningObjectives = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <label>In-Class Activities</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.inClassActivities = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <label>References/Resources</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.resources = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <label>Assessments</label>
              <input
                ref={(e) => {
                  editorRef.assessments = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <label>Standards</label>
              <input
                ref={(e) => {
                  editorRef.standards = e;
                }}
                placeholder="-"
              />
            </Form.Field>
            <Form.Field>
              <Button type="submit">Submit</Button>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export const renderEditDescription = (editorRef) => {
  const {
    description,
    showEditDescription,
  } = editorRef.state;
  return (
    <Modal
      size="small"
      open={showEditDescription}
    >
      <Modal.Header>
              Lesson Description
        <Button
          className="close-button"
          onClick={() => {
            editorRef.setState({ showEditDescription: false });
          }}
        >
                X
        </Button>
      </Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Form onSubmit={editorRef.addDescription}>
            <Form.Field>
              <label>Subject</label>
              <input
                ref={(e) => {
                  editorRef.subject = e;
                }}
                placeholder={description.subject}
              />
            </Form.Field>
            <Form.Field>
              <label>Topic</label>
              <input
                ref={(e) => {
                  editorRef.topic = e;
                }}
                placeholder={description.topic}
              />
            </Form.Field>
            <Form.Field>
              <label>Learning Objective(s)</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.learningObjectives = e;
                }}
                placeholder={description.learningObjectives}
              />
            </Form.Field>
            <Form.Field>
              <label>In-Class Activities</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.inClassActivities = e;
                }}
                placeholder={description.inClassActivities}
              />
            </Form.Field>
            <Form.Field>
              <label>References/Resources</label>
              <textArea
                rows={1}
                ref={(e) => {
                  editorRef.resources = e;
                }}
                placeholder={description.resources}
              />
            </Form.Field>
            <Form.Field>
              <label>Assessments</label>
              <input
                ref={(e) => {
                  editorRef.assessments = e;
                }}
                placeholder={description.assessments}
              />
            </Form.Field>
            <Form.Field>
              <label>Standards</label>
              <input
                ref={(e) => {
                  editorRef.standards = e;
                }}
                placeholder={description.standards}
              />
            </Form.Field>
            <Form.Field>
              <Button type="submit">Update</Button>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export const renderLoginNotificationModal = (editorRef) => {
  const {
    loginNotification,
  } = editorRef.state;

  return (
    <Modal size="tiny" open={loginNotification}>
      <Modal.Header>
            You need to login to save changes
        <Button
          style={{ float: 'right' }}
          onClick={() => {
            editorRef.setState({ loginNotification: false });
          }}
        >
              X
        </Button>
      </Modal.Header>
      <Modal.Content>
        <Modal.Description style={{ textAlign: 'center' }}>
          <Button
            onClick={() => {
              Session.set('stateToSave', editorRef.state);

              editorRef.setState({ redirectToLogin: true });
            }}
            style={{ marginTop: '1.6rem' }}
          >
                Login
          </Button>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export const renderWorkBookTitleModal = (editorRef) => {
  const {
    title,
  } = editorRef.state;

  return (
    <Modal size="tiny" open={!title}>
      <Modal.Header>Enter the title for the Workbook</Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Form
            onSubmit={() => {
              if (!editorRef.title.value) return;

              editorRef.setState({
                title: editorRef.title.value,
              });
            }}
          >
            <Form.Field>
              <label>Title</label>
              <input
                ref={(e) => {
                  editorRef.title = e;
                }}
              />
            </Form.Field>
            <Form.Field>
              <Button type="submit">Submit</Button>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};
