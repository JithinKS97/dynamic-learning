/* eslint-disable no-return-assign */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

import {
  Button, Modal, Form, Dimmer, Loader,
} from 'semantic-ui-react';
import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import 'semantic-ui-css/semantic.min.css';
import { Tracker } from 'meteor/tracker';
import { Icon } from 'react-icons-kit';
import { fileO } from 'react-icons-kit/fa/fileO';
import { folderO } from 'react-icons-kit/fa/folderO';
import { trash } from 'react-icons-kit/fa/trash';
import { Redirect } from 'react-router-dom';
import { pencil } from 'react-icons-kit/fa/pencil';
import { ic_build } from 'react-icons-kit/md/ic_build';
import { Lessons } from '../../../api/lessons';

export default class Tree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [],
      isOpen: false,
      title: '',
      toCreate: null,
      loading: true,
      selectedLessonId: null,
      redirectToLesson: false,
      tempFolderTitle: '',
      selectedFolderId: '',
    };
  }

  componentDidMount() {
    this.lessonsTracker = Tracker.autorun(() => {
      const lessonsHandle = Meteor.subscribe('lessons');
      const loading = !lessonsHandle.ready();
      const flatData = Lessons.find({ userId: Meteor.userId() }).fetch();

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
        treeData,
        loading,
      });
    });
  }

  componentWillUnmount() {
    this.lessonsTracker.stop();
  }

  openModalToCreate = (typeOfContent) => {
    this.setState({
      isOpen: true,
      toCreate: typeOfContent,
    });
  }

  handleSubmit = () => {
    const { title, toCreate } = this.state;
    if (!title) {
      this.setState({
        toCreate: null,
      });
    } else {
      if (toCreate === 'file') {
        Meteor.call('lessons.insert', title);
      } else {
        Meteor.call('lessons.folder.insert', title);
      }
      this.setState({
        isOpen: false,
        title: null,
      });
    }
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const { height } = this.props;

    const removeWorkbooksInside = (node) => {
      /* The deletion takes place recursively.
          If the node is a file, using the id in it, it is removed
          from the database.
          If the node has no children, returned otherwise
          we recursively move to the children nodes.
      */

      if (node.isFile) {
        Meteor.call('lessons.remove', node._id);
        return;
      }

      if (node.children.length === 0) {
        return;
      }
      // eslint-disable-next-line array-callback-return
      node.children.map((child) => {
        removeWorkbooksInside(child);
      });
    };

    const canDrop = ({ node, nextParent }) => {
      /* To prevent a file to be added as a child of a file
          and to prevent a directory to be added as a child of a file.
      */

      if (node && nextParent) {
        if (node.isFile && nextParent.isFile) {
          return false;
        }
      }

      if (node && nextParent) {
        if (!node.isFile && nextParent.isFile) {
          return false;
        }
      }

      return true;
    };

    const {
      redirectToLesson, selectedLessonId, loading, isOpen,
    } = this.state;

    if (redirectToLesson === true) {
      return <Redirect to={`/lesson/${selectedLessonId}`} />;
    }
    return (
      <div>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>

        <Modal size="tiny" open={isOpen}>
          <Modal.Header>
            New Folder
            <Button
              className="close-button"
              onClick={() => {
                this.setState({
                  isOpen: false,
                });
              }}
            >
              X
            </Button>
          </Modal.Header>

          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <label>Title</label>
                <input
                  ref={(e) => {
                    this.title = e;
                  }}
                  onChange={() => {
                    this.setState({
                      title: this.title.value,
                    });
                  }}
                  placeholder="Title"
                />
              </Form.Field>
              <Form.Field>
                <Button type="submit">Submit</Button>
              </Form.Field>
            </Form>
          </Modal.Content>
        </Modal>

        <Modal size="tiny" open={isOpen}>
          <Modal.Header>
            Folder Details
            <Button
              className="close-button"
              onClick={() => {
                this.setState({
                  isOpen: false,
                });
              }}
            >
                  X
            </Button>
          </Modal.Header>

          <Modal.Content>
            <Modal.Description>

              {/* eslint-disable-next-line */}
              <label>Name</label>
              <br />
              {/* eslint-disable-next-line no-return-assign */}
              <input
                value={this.state.tempFolderTitle}
                ref={e => this.folderRenameInput = e}
                style={{
                  width: '20rem',
                  padding: '0.4rem',
                  marginTop: '1rem',
                  marginBottom: '2rem',
                  fontSize: '1.2rem',

                }}
                onChange={() => {
                  this.setState({

                    tempFolderTitle: this.folderRenameInput.value,
                  });
                }}
                placeholder="Name"
              />
              <br />
              <Button onClick={() => {
                Meteor.call('lessons.folder.nameUpdate', this.state.selectedFolderId, this.folderRenameInput.value);
                this.setState({
                  isOpen: false,
                });
              }}
              >
                Rename
              </Button>

            </Modal.Description>
          </Modal.Content>
        </Modal>

        <div className="lighter-grey-background" style={{ height, paddingTop: '1rem' }}>
          <SortableTree
            theme={FileExplorerTheme}
            generateNodeProps={({ node }) => ({
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
                  onClick={() => {
                    this.setState(
                      {
                        selectedLessonId: node._id,
                      },
                      () => {
                        this.setState({
                          redirectToLesson: true,
                        });
                      },
                    );
                  }}
                  className="icon__button"
                  style={{ display: node.isFile ? 'block' : 'none' }}
                >
                  <Icon icon={pencil} className="tile_right_icon" />
                </button>,
                <button
                  onClick={() => {
                    if (!node.isFile) {
                      this.setState({
                        isOpen: true,
                        selectedFolderId: node._id,
                        tempFolderTitle: node.title,
                      });
                    }
                  }}

                  className="icon__button"
                  style={{ display: node.isFile ? 'none' : 'block' }}
                >
                  <Icon icon={ic_build} className="tile_right_icon" />
                </button>,
                <button
                  className="icon__button"
                  onClick={() => {
                    const input = confirm(
                      'Are you sure you want to perform this deletion?',
                    );
                    if (!input) {
                      return;
                    }

                    if (!node.isFile) {
                      removeWorkbooksInside(node);
                    }

                    Meteor.call('lessons.remove', node._id);
                  }}
                >
                  <Icon icon={trash} className="tile_right_icon" />
                </button>,
              ],
            })}
            canDrop={canDrop}
            // eslint-disable-next-line react/destructuring-assignment
            treeData={this.state.treeData}
            onChange={treeData => this.setState({ treeData })}
            onMoveNode={(args) => {
              if (args.nextParentNode) {
                Meteor.call(
                  'lessons.directoryChange',
                  args.node._id,
                  args.nextParentNode._id,
                );
                Meteor.call(
                  'lessons.folder.visibilityChange',
                  args.nextParentNode._id,
                  true,
                );
              } else {
                Meteor.call('lessons.directoryChange', args.node._id, '0');
              }
            }}
          />
        </div>
      </div>
    );
  }
}
