import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Button, Modal, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import SimPreview from './SimPreview';
import 'semantic-ui-css/semantic.min.css';
import { generateSrc, isValidp5EmbedTag } from '../../functions/index.js';

export default class Upload extends React.Component {
  /* This component performs the function of uploading the iframe
    src stores the src of the input iframe tag, isOpen is for opening
    and closing of the modal.
  */

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      username: '',
      project_id: '',
    };
  }

  componentDidMount() {
    Meteor.subscribe('sims');
  }

  onEnter(e) {
    e.preventDefault();
    const embedTag = this.src.value;

    if (isValidp5EmbedTag(embedTag)) {
      this.setState({

        username: embedTag.match('org/(.*)/embed')[1],
        project_id: embedTag.match('embed/(.*)"')[1],
      });
    } else {
      this.setState({

        username: '',
        project_id: '',
      });
    }
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { methodToRun } = this.props;
    const { username, project_id } = this.state;
    const w = '640px';
    const h = '360px';
    const name = this.name.value;

    if (username && project_id && name) {
      let uploaded = false;

      if (typeof methodToRun === 'string') {
        Meteor.call(methodToRun, name, username, project_id, w, h);
        uploaded = true;
      } else if (typeof methodToRun === 'function') {
        methodToRun(name, username, project_id);
        uploaded = true;
      }
      if (uploaded === true) {
        alert('Uploaded succesfully');
        this.setState({
          project_id: '',
          modalOpen: false,
          username: '',
        });
      }
      this.handleClose();
    }
  }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => this.setState({
    modalOpen: false,
    username: '',
    project_id: '',
  })

  render() {
    const {
      modalOpen, project_id, username,
    } = this.state;
    return (
      <Modal
        closeOnRootNodeClick={false}
        style={{ height: 'auto', width: 'auto', minWidth: '36rem' }}
        open={modalOpen}
        onClose={this.handleClose}
        size="tiny"
      >
        <Modal.Header>
          Add simulation
          <Button className="close-button" onClick={this.handleClose}>
            X
          </Button>
        </Modal.Header>

        <Modal.Content>

          <Form>
            <Form.Field>
              <label>iframe tag from p5.js Web Editor</label>
              <input ref={(e) => { this.src = e; }} onChange={this.onEnter.bind(this)} placeholder="iframe tag" />
            </Form.Field>
          </Form>

          {project_id && username
            ? (
              <Form onSubmit={this.onSubmit} style={{ marginTop: '0.8rem' }}>
                <Form.Field>
                  <label>Preview</label>
                  <SimPreview
                    src={generateSrc(username, project_id)}
                  />
                </Form.Field>

                <Form.Field>
                  <label>Name</label>
                  <input placeholder="Name" ref={(e) => { this.name = e; }} />
                </Form.Field>

                <Form.Field>
                  <Button>Submit</Button>
                  <Button style={{ marginTop: '0.8rem' }} onClick={this.handleClose}>Close</Button>
                </Form.Field>
              </Form>
            )
            : null
          }
        </Modal.Content>
      </Modal>
    );
  }
}

Upload.propTypes = {
  methodToRun: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
};
