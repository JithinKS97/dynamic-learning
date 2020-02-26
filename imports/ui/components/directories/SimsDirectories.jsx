import React from 'react';
import { Meteor } from 'meteor/meteor';
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

import { trash } from 'react-icons-kit/fa/trash';
import { ic_build } from 'react-icons-kit/md/ic_build';
import {
  Button, Modal, Form, Dimmer, Loader,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import { Tracker } from 'meteor/tracker';

import { Icon } from 'react-icons-kit';
import { fileO } from 'react-icons-kit/fa/fileO';
import { folderO } from 'react-icons-kit/fa/folderO';
import { Sims } from '../../../api/sims';
import Upload from '../Upload';


export default class SimsDirectories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      aboutToDelete: false,
    };
  }

  componentDidMount() {
    Tracker.autorun(() => {
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

      this.setState({
        simsExists,
        treeData: simsExists ? treeData : [],
      });
    });
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
    const { simsExists, treeData } = this.state;
    if (simsExists) {
      if (treeData.length === 0 && Meteor.userId()) {
        // eslint-disable-next-line react/no-unescaped-entities
        return <h3 style={{ marginLeft: '1rem' }}>You haven't added any simulations yet!</h3>;
      } return null;
    }
  }

  openSimUploadModal = () => {
    this.uploadSimRef.handleOpen();
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
      simsExists, treeData,
    } = this.state;
    const { modalOpen } = this.state;
    // eslint-disable-next-line react/prop-types
    const { height, getNode, isPreview } = this.props;

    return (
      <div>
        <Dimmer inverted active={!simsExists}>
          <Loader />
        </Dimmer>

        <Upload
          ref={(e) => { this.uploadSimRef = e; }}
          isPreview={false}
          methodToRun="sims.insert"
        />

        <Modal
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

        <div className="lighter-grey-background" style={{ height, paddingTop: '1rem' }}>
          {Meteor.userId() ? null : (
            <h3>You need to login to add your own simulations</h3>
          )}
          {this.simulationsNotAddedMessage()}

          <SortableTree
            onVisibilityToggle={({ node, expanded }) => {
              Meteor.call('sims.folder.visibilityChange', node._id, expanded);
            }}
            theme={FileExplorerTheme}
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
                const { aboutToDelete } = this.state;
                if (!node.isFile) return;
                if (!aboutToDelete) { getNode(node); }
              },

              title: (
                <div style={{
                  display: 'flex', flexDirection: 'row', marginLeft: '1rem', marginTop: '0.5rem',
                }}
                >
                  {node.isFile ? <Icon icon={fileO} size="1.1rem" /> : <Icon icon={folderO} size="1.1rem" />}
                  <div style={{ marginLeft: '1rem' }}>{node.title}</div>
                </div>
              ),

              buttons: [
                <button
                  className="icon__button"
                  style={{
                    display: node.isFile && !isPreview ? 'block' : 'none',
                    verticalAlign: 'middle',
                  }}
                  onClick={() => {
                    getNode(node);
                  }}
                >
                  <Icon icon={ic_build} className="tile_right_icon" />
                </button>,

                <button
                  className="icon__button"
                  onMouseEnter={() => this.setState({ aboutToDelete: true })}
                  onMouseLeave={() => this.setState({ aboutToDelete: false })}
                  style={{ verticalAlign: 'middle', display: isPreview ? 'none' : 'block' }}
                  onClick={() => {
                    if (!confirm(
                      'Are you sure you want to perform this deletion?',
                    )) return;
                    if (!node.isFile) {
                      removeSimsInside(node);
                    }

                    Meteor.call('sims.remove', node._id);
                  }}
                >
                  <Icon icon={trash} className="tile_right_icon" />
                </button>,
              ],
            })}
          />

          {/* {isPreview
          && Meteor.userId()
          && treeData.length > 0 ? (
            <p style={{ bottom: '0px' }}>
              Note: Go to dashboard to organize the sims into folders
            </p>
            ) : null} */}
        </div>
      </div>
    );
  }
}
