import React from 'react';
import { Meteor } from 'meteor/meteor';
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { FaTrash } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import {
  Button, Modal, Form, Dimmer, Loader,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Sims } from '../../../api/sims';
import Upload from '../Upload';

class SimsDirectories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  addNewFolder = (e) => {
    e.preventDefault();

    /* New directory is created here. */

    if (!this.folderName.value) return;

    Meteor.call('sims.folder.insert', this.folderName.value);

    this.handleClose();
    this.folderName.value = '';
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  simulationsNotAddedMessage = () => {
    const { simsExists, treeData } = this.props;
    if (simsExists) {
      if (treeData.length === 0 && Meteor.userId()) {
        return <h3>You havent added any simulations yet!</h3>;
      } return null;
    }
  }

  render() {
    const canDrop = ({ node, nextParent }) => {
      /* To prevent a file to be added as a child of a file
          and to prevent a directory to be added as a child of a file.
      */

      if (node && nextParent) {
        if (node.isFile && nextParent.isFile) return false;
      }

      if (node && nextParent) {
        if (!node.isFile && nextParent.isFile) return false;
      }

      return true;
    };

    const removeSimsInside = (node) => {
      /* The deletion takes place recursively.
          If the node is a file, using the id in it, it is removed
          from the database.

          If the node has no children, returned, otherwise
          we recursively move to the children nodes.
      */

      if (node.isFile) {
        Meteor.call('sims.remove', node._id);
        return;
      }

      if (node.children.length === 0) {
        return;
      }
      node.children.map((child) => {
        removeSimsInside(child);
      });
    };

    const {
      simsExists, isPreview, height, treeData, getNode,
    } = this.props;
    const { modalOpen } = this.state;

    return (
      <div>
        <Dimmer inverted active={!simsExists}>
          <Loader />
        </Dimmer>

        <Upload isPreview={false} methodToRun="sims.insert" />

        <Modal
          trigger={
            isPreview ? null : (
              <Button onClick={this.handleOpen}>Create a folder</Button>
            )
          }
          open={modalOpen}
          onClose={this.handleClose}
          size="tiny"
        >
          <Modal.Header>
            New folder
            <Button className="close-button" onClick={this.handleClose}>
              X
            </Button>
          </Modal.Header>

          <Modal.Content>
            <Modal.Description>
              <Form onSubmit={this.addNewFolder}>
                <Form.Field>
                  <label>Name</label>
                  <input ref={(e) => { this.folderName = e; }} placeholder="Name" />
                </Form.Field>

                <Button type="submit">Submit</Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>

        <div style={{ height, padding: '1.6rem' }}>
          {Meteor.userId() ? null : (
            <h3>You need to login to add your own simulations</h3>
          )}
          {this.simulationsNotAddedMessage()}

          <SortableTree
            onVisibilityToggle={({ node, expanded }) => {
              Meteor.call('sims.folder.visibilityChange', node._id, expanded);
            }}
            theme={FileExplorerTheme}
            canDrag={!isPreview}
            treeData={treeData}
            // eslint-disable-next-line react/no-unused-state
            onChange={t => this.setState({ treeData: t })}
            canDrop={canDrop}
            onMoveNode={(args) => {
              if (args.nextParentNode) {
                Meteor.call(
                  'sims.folder.visibilityChange',
                  args.nextParentNode._id,
                  true,
                );
                Meteor.call(
                  'sims.folderChange',
                  args.node._id,
                  args.nextParentNode._id,
                );
              } else {
                Meteor.call('sims.folderChange', args.node._id, '0');
              }
            }}
            // eslint-disable-next-line no-shadow
            generateNodeProps={({ node }) => ({
              onClick: () => {
                if (!node.isFile) return;

                if (!isPreview) return;

                getNode(node);
              },

              buttons: [
                <button
                  className="icon__button"
                  style={{
                    display: node.isFile ? 'block' : 'none',
                    visibility: isPreview ? 'hidden' : 'visible',
                    verticalAlign: 'middle',
                  }}
                  onClick={() => {
                    getNode(node);
                  }}
                >
                  <MdSettings size={22} color="black" />
                </button>,

                <button
                  className="icon__button"
                  style={{ verticalAlign: 'middle' }}
                  onClick={() => {
                    const input = confirm(
                      'Are you sure you want to perform this deletion?',
                    );
                    if (!input) return;

                    if (!node.isFile) {
                      removeSimsInside(node);
                    }

                    Meteor.call('sims.remove', node._id);
                  }}
                >
                  <FaTrash size={17} color="black" />
                </button>,
              ],
            })}
          />

          {isPreview
          && Meteor.userId()
          && treeData.length > 0 ? (
            <p style={{ bottom: '0px' }}>
              Note: Go to dashboard to organize the sims into folders
            </p>
            ) : null}
        </div>
      </div>
    );
  }
}

SimsDirectories.propTypes = {
  simsExists: PropTypes.bool.isRequired,
  isPreview: PropTypes.bool.isRequired,
  height: PropTypes.number.isRequired,
  treeData: PropTypes.arrayOf(PropTypes.object).isRequired,
  getNode: PropTypes.func.isRequired,
};

const SimsDirectoriesContainer = withTracker(() => {
  const simsHandle = Meteor.subscribe('sims');
  const loading = !simsHandle.ready();
  const flatData = Sims.find({ userId: Meteor.userId() }).fetch();
  const simsExists = !loading && !!flatData;

  const getKey = node => node._id;
  const getParentKey = node => node.parent_id;
  const rootKey = '0';

  const treeData = getTreeFromFlatData({
    flatData,
    getKey,
    getParentKey,
    rootKey,
  });

  return {
    simsExists,
    treeData: simsExists ? treeData : [],
  };
})(SimsDirectories);

export default SimsDirectoriesContainer;
