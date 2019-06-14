/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import 'react-sortable-tree/style.css';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Modal,
  Form,
  Label,
  Checkbox,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import FaTrash from 'react-icons/lib/fa/trash';
import FaEdit from 'react-icons/lib/fa/edit';
import MdSettings from 'react-icons/lib/md/settings';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import TagsInput from 'react-tagsinput';

import { LessonPlans } from '../../api/lessonplans';
import LessonPlanViewer from './LessonPlanViewer';

/*
  This component displays the lessonplan files in nested tree structure.
  You will be able to create directories and add lessonplans to it.
  Deletion of a directory will result in the deletion of all the directories in it
  along with the lessonplans in all of the nested directories
  and the main directory.
*/
class LessonPlansDirectories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      modal2Open: false,
      selectedLessonPlanId: null,
      node: null,
      editable: false,
      title: null,
      isPublic: null,
      tags: [],
      redirectToLessonPlan: false,
    };
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  handle2Open = () => this.setState({ modal2Open: true });

  handle2Close = () => this.setState({ modal2Open: false });

  addNewFolder = (e) => {
    e.preventDefault();
    // New directory is created here.
    if (!this.folderName.value) {
      return;
    }

    this.handle2Close();
    Meteor.call('lessonplans.folder.insert', this.folderName.value);
    this.folderName.value = '';
  }

  addNewLessonPlan = () => {
    if (!this.lessonPlanName.value) {
      return;
    }

    this.handleClose();
    Meteor.call('lessonplans.insert', this.lessonPlanName.value);
    this.lessonPlanName.value = '';
  }

  editTitle = () => {
    const { editable, selectedLessonPlanId } = this.state;
    if (!this.title && editable === true) {
      return;
    }

    if (editable === true) {
      if (!this.title.value) {
        this.setState({ editable: false });

        return;
      }

      Meteor.call('lessonplans.updateTitle', selectedLessonPlanId, this.title.value);

      this.setState({
        editable: false,
        title: this.title.value,
      });
    } else {
      this.setState({ editable: true });
    }
  }

  handleTagsInput = (tags) => {
    const { node: { _id } } = this.state;
    this.setState({ tags }, () => {
      Meteor.call('lessonplans.tagsChange', _id, tags);
    });
  }

  render() {
    const {
      redirectToLessonPlan,
      selectedLessonPlanId,
      editable,
      isPublic,
      modalOpen,
      modal2Open,
      tags,
      title,
      node,
    } = this.state;
    // eslint-disable-next-line react/prop-types
    const { lessonplansExists, treeData } = this.props;
    const canDrop = ({ node: theNode, nextParent }) => {
      /* To prevent a file to be added as a child of a file
          and to prevent a directory to be added as a child of a file.
      */

      if (theNode && nextParent) {
        if (theNode.isFile && nextParent.isFile) {
          return false;
        }
      }

      if (theNode && nextParent) {
        if (!theNode.isFile && nextParent.isFile) {
          return false;
        }
      }

      return true;
    };

    const removeLessonPlansInside = (theNode) => {
      /* The deletion takes place recursively.
          If the node is a file, using the id in it, it is removed
          from the database.
          If the node has no children, returned otherwise
          we recursively move to the children nodes.
      */
      if (theNode.isFile) {
        Meteor.call('lessonplans.remove', theNode._id);

        return;
      }

      if (theNode.children.length === 0) {
        return;
      }

      theNode.children.forEach((child) => {
        removeLessonPlansInside(child);
      });
    };

    if (redirectToLessonPlan === true) {
      return <Redirect to={`/createlessonplan/${selectedLessonPlanId}`} />;
    }

    return (
      <div>
        <Dimmer inverted active={!lessonplansExists}>
          <Loader />
        </Dimmer>
        <Modal
          trigger={<Button onClick={this.handleOpen}>Create new lessonplan</Button>}
          open={modalOpen}
          onClose={this.handleClose}
          size="tiny"
        >
          <Modal.Header>
            Lessonplan details
            <Button className="close-button" onClick={this.handleClose}>
                &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form onSubmit={this.addNewLessonPlan}>
                <Form.Field>
                  {/* eslint-disable-next-line */}
                  <label>Name</label>
                  {/* eslint-disable-next-line no-return-assign */}
                  <input ref={e => this.lessonPlanName = e} placeholder="Name" />
                </Form.Field>
                <Button type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <Modal
          size="fullscreen"
          open={!!selectedLessonPlanId}
          style={{ transform: 'scale(0.73, 0.73)', marginTop: '5rem' }}
        >
          <Modal.Header>
            Preview
            <Button
              className="close-button"
              style={{ marginLeft: '0.8rem' }}
              onClick={() => {
                this.setState({ selectedLessonPlanId: null, editable: false });
              }}
            >
              &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <LessonPlanViewer _id={selectedLessonPlanId} />
            </Modal.Description>
            <Modal.Description
              style={{
                padding: '1.8rem 0',
                transform: 'scale(1.3, 1.3)',
                transformOrigin: 'left',
              }}
            >
              {!editable
                ? (
                  <Label style={{
                    width: '24rem',
                    textAlign: 'center',
                    marginTop: '0.8rem',
                  }}
                  >
                    {node ? <h2>{title}</h2> : null}
                  </Label>
                ) : null}
              {editable
                ? (
                  <input
                    ref={(e) => { this.title = e; }}
                    style={{ width: '24rem', padding: '0.8rem' }}
                  />
                ) : null}
              <Button onClick={this.editTitle} style={{ marginLeft: '2rem' }}>{editable ? 'Submit' : 'Edit title'}</Button>
              <br />
              <Checkbox
                style={{ margin: '0.8rem 0' }}
                label="Share with others"
                checked={isPublic}
                ref={(e) => { this.checkbox = e; }}
                onChange={() => {
                  Meteor.call('lessonplans.visibilityChange', selectedLessonPlanId, !this.checkbox.state.checked);
                  this.setState({ isPublic: !this.checkbox.state.checked });
                }}
              />
              <br />
              <div style={{ width: `${100 / 1.3}%` }}>
                {isPublic
                  ? <TagsInput value={tags} onChange={this.handleTagsInput} />
                  : null}
              </div>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <Modal
          trigger={<Button onClick={this.handle2Open}>Create a folder</Button>}
          open={modal2Open}
          onClose={this.handle2Close}
          size="tiny"
        >
          <Modal.Header>
            New folder
            <Button className="close-button" onClick={this.handle2Close}>
              &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form onSubmit={this.addNewFolder}>
                <Form.Field>
                  <label>Name</label>
                  <input ref={(e) => { this.folderName = e; }} placeholder="Name" />
                </Form.Field>
                <Button type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <div style={{ height: 400, padding: '1.6rem' }}>
          <SortableTree
            onVisibilityToggle={({ node: theNode, expanded }) => {
              Meteor.call('lessonplans.folder.visibilityChange', theNode._id, expanded);
            }}
            theme={FileExplorerTheme}
            canDrop={canDrop}
            treeData={treeData}
            // eslint-disable-next-line react/no-unused-state
            onChange={theTreeData => this.setState({ treeData: theTreeData })}
            onMoveNode={(args) => {
              if (args.nextParentNode) {
                Meteor.call('lessonplans.directoryChange', args.node._id, args.nextParentNode._id);
                Meteor.call('lessonplans.folder.visibilityChange', args.nextParentNode._id, true);
              } else {
                Meteor.call('lessonplans.directoryChange', args.node._id, '0');
              }
            }}
            generateNodeProps={({ node: theNode }) => ({
              buttons: [
                <button
                  onClick={() => {
                    this.setState({
                      selectedLessonPlanId: theNode._id,
                    }, () => {
                      this.setState({
                        redirectToLessonPlan: true,
                      });
                    });
                  }}
                  className="icon__button"
                  style={{ display: theNode.isFile ? 'block' : 'none' }}
                >
                  <FaEdit size={17} color="black" />
                </button>,
                <button
                  onClick={() => {
                    this.setState({
                      node: theNode,
                      selectedLessonPlanId: theNode._id,
                      title: theNode.title,
                      isPublic: theNode.isPublic,
                      tags: theNode.tags,
                    });
                  }}
                  style={{ display: theNode.isFile ? 'block' : 'none' }}
                  className="icon__button"
                >
                  <MdSettings size={17} color="black" />
                </button>,
                <button
                  className="icon__button"
                  onClick={() => {
                    // eslint-disable-next-line
                    const input = confirm('Are you sure you want to perform this deletion?');
                    if (!input) {
                      return;
                    }

                    if (!theNode.isFile) {
                      removeLessonPlansInside(theNode);
                    }

                    Meteor.call('lessonplans.remove', theNode._id);
                  }}
                >
                  <FaTrash size={17} color="black" />
                </button>,
              ],
            })}
          />
        </div>
      </div>
    );
  }
}

export default withTracker(() => {
  const lessonplansHandle = Meteor.subscribe('lessonplans');
  const loading = !lessonplansHandle.ready();
  const flatData = LessonPlans.find({ userId: Meteor.userId() }).fetch();
  const lessonplansExists = !loading && !!flatData;

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
    lessonplansExists,
    treeData,
  };
})(LessonPlansDirectories);
