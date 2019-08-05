/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
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
  Card,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { FaTrash, FaEdit, FaPencilAlt } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import TagsInput from 'react-tagsinput';

import Classes from '../../api/classes';
import { Workbooks } from '../../api/workbooks';
import WorkbookViewer from './WorkbookViewer';

/*
  This component displays the workbook files in nested tree structure.
  You will be able to create directories and add workbooks to it.
  Deletion of a directory will result in the deletion of all the directories in it
  along with the workbooks in all of the nested directories
  and the main directory.
*/
class WorkbooksDirectories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderNameModal: false,
      modalOpen: false,
      modal2Open: false,
      selectedWorkbookId: null,
      node: null,
      editable: false,
      title: null,
      isPublic: null,
      tags: [],
      redirectToWorkbook: false,
      classes: [],
      tempTitle: '',
      tempFolderTitle: '',
      selectedFolderId:'',
    };
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
    Meteor.subscribe('classes');

    Tracker.autorun(() => {
      if (Meteor.user()) {
        // this.setState({
        //   user: Meteor.user().username,
        // });
      }
      if (Meteor.user() && Meteor.user().classes) {
        this.setState({
          classes: Meteor.user().classes,
        });
      } else {
        this.setState({
          classes: [],
        });
      }
    });
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  handle2Open = () => this.setState({ modal2Open: true });

  handle2Close = () => this.setState({ modal2Open: false });

  folderNameModalClose = () => this.setState({ folderNameModal: false });

  addNewFolder = (e) => {
    e.preventDefault();
    // New directory is created here.
    if (!this.folderName.value) {
      return;
    }

    this.handle2Close();
    Meteor.call('workbooks.folder.insert', this.folderName.value);
    this.folderName.value = '';
  }

  addNewWorkbook = () => {
    if (!this.workbookName.value) {
      return;
    }

    this.handleClose();
    Meteor.call('workbooks.insert', this.workbookName.value);
    this.workbookName.value = '';
  }

  openClassModal = (id, title) => {
    this.setState({
      addToClassId: id,
      classmodal: true,
      title,
    });
  }

  editTitle = () => {
    const {
      editable, selectedWorkbookId, node: { title }, tempTitle,
    } = this.state;

    if (editable === true) {
      if (!this.title.value) {
        this.setState({ editable: false });

        return;
      }

      Meteor.call('workbooks.updateTitle', selectedWorkbookId, tempTitle || title);

      this.setState({
        editable: false,
        title: tempTitle || title,
      }, () => {
        // eslint-disable-next-line no-shadow
        const { node, title } = this.state;
        const tempNode = node;
        tempNode.title = title;
        this.setState({
          node: tempNode,
        });
      });
    } else {
      this.setState({ editable: true, tempTitle: title });
    }
  }

  handleTagsInput = (tags) => {
    const { node: { _id } } = this.state;
    this.setState({ tags }, () => {
      Meteor.call('workbooks.tagsChange', _id, tags);
    });
  }

  render() {
    const {
      redirectToWorkbook,
      selectedWorkbookId,
      editable,
      isPublic,
      modalOpen,
      modal2Open,
      tags,
      title,
      node,
      classmodal,
      addToClassId,
      classes,
    } = this.state;
    // eslint-disable-next-line react/prop-types
    const { workbooksExists, treeData } = this.props;
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

    const removeWorkbooksInside = (theNode) => {
      /* The deletion takes place recursively.
          If the node is a file, using the id in it, it is removed
          from the database.
          If the node has no children, returned otherwise
          we recursively move to the children nodes.
      */
      if (theNode.isFile) {
        Meteor.call('workbooks.remove', theNode._id);

        return;
      }

      if (theNode.children.length === 0) {
        return;
      }

      theNode.children.forEach((child) => {
        removeWorkbooksInside(child);
      });
    };

    if (redirectToWorkbook === true) {
      return <Redirect to={`/createworkbook/${selectedWorkbookId}`} />;
    }

    // To check if workbook is already added to the class
    // If yes, 'Remove' is returned, else 'Add' is returned
    const addOrRemove = (classcode, workbookId) => {
      const classObject = Classes.findOne({ classcode });
      if (classObject) {
        if (classObject.lessons && classObject.lessons.includes(workbookId)) {
          return 'Remove';
        }

        return 'Add';
      }
    };

    const shouldDisplayManageClass = () => {
      try {
        if (Meteor.user()) {
          if (Meteor.user().profile.accountType === 'Teacher') {
            return true;
          }
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    return (
      <div>
        <Dimmer inverted active={!workbooksExists}>
          <Loader />
        </Dimmer>
        <Modal
          trigger={<Button onClick={this.handleOpen}>Create new workbook</Button>}
          open={modalOpen}
          onClose={this.handleClose}
          size="tiny"
        >
          <Modal.Header>
            Workbook details
            <Button className="close-button" onClick={this.handleClose}>
              &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form onSubmit={this.addNewWorkbook}>
                <Form.Field>
                  {/* eslint-disable-next-line */}
                  <label>Name</label>
                  {/* eslint-disable-next-line no-return-assign */}
                  <input ref={e => this.workbookName = e} placeholder="Name" />
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
          open={!!selectedWorkbookId}
          style={{ transform: 'scale(0.7, 0.7)', marginTop: '5rem' }}
        >
          <Modal.Header>
            Preview
            <Button
              className="close-button"
              style={{ marginLeft: '0.8rem' }}
              onClick={() => {
                this.setState({ selectedWorkbookId: null, editable: false });
              }}
            >
              X
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <WorkbookViewer _id={selectedWorkbookId} />
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
                    // eslint-disable-next-line react/destructuring-assignment
                    value={this.state.tempTitle}
                    ref={(e) => { this.title = e; }}
                    style={{
                      width: '24rem',
                      padding: '0.6rem',
                      marginTop: '0.8rem',
                      fontSize: '1.8rem',
                      border: '1px solid blue',
                    }}
                    onChange={() => {
                      this.setState({
                        tempTitle: this.title.value,
                      });
                    }}
                  />
                ) : null}
              <Button
                onClick={this.editTitle}
                style={{ marginLeft: '2rem' }}
              >
                {editable ? 'Submit' : <FaPencilAlt /> }

              </Button>
              {shouldDisplayManageClass() ? (
                <Button
                  color="blue"
                  style={{ marginLeft: '2rem' }}
                  onClick={
                  () => this.openClassModal(selectedWorkbookId, title)
                  }
                >
                Manage classes
                </Button>
              ) : null}
              <br />
              <Checkbox
                style={{ margin: '0.8rem 0' }}
                label="Share with others"
                checked={isPublic}
                ref={(e) => { this.checkbox = e; }}
                onChange={() => {
                  Meteor.call('workbooks.visibilityChange', selectedWorkbookId, !this.checkbox.state.checked);
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


        <Modal open={this.state.folderNameModal}
        onClose={this.folderNameModalClose}
        size="tiny">
          
           <Modal.Header>
             Folder Details
            <Button className="close-button" onClick={this.folderNameModalClose}>
              &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
            
                  {/* eslint-disable-next-line */}
                  <label>Name</label>
                  <br></br>
                  {/* eslint-disable-next-line no-return-assign */}
                  <input value = {this.state.tempFolderTitle}
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
                   placeholder="Name" />
                   <br></br>
                
                
                <Button onClick={() => {
              Meteor.call('workbooks.folder.nameUpdate', this.state.selectedFolderId, this.folderRenameInput.value)
              this.setState({
                folderNameModal: false,
               // folderRenameInput:this.folderRenameInput
              })
            }}>Rename</Button>
          
            
            
            </Modal.Description>
        
            </Modal.Content>
        </Modal>

        <div style={{ height: 400, padding: '1.6rem' }}>
          <SortableTree
            onVisibilityToggle={({ node: theNode, expanded }) => {
              Meteor.call('workbooks.folder.visibilityChange', theNode._id, expanded);
            }}
            theme={FileExplorerTheme}
            canDrop={canDrop}
            treeData={treeData}
            // eslint-disable-next-line react/no-unused-state
            onChange={theTreeData => this.setState({ treeData: theTreeData })}
            onMoveNode={(args) => {
              if (args.nextParentNode) {
                Meteor.call('workbooks.directoryChange', args.node._id, args.nextParentNode._id);
                Meteor.call('workbooks.folder.visibilityChange', args.nextParentNode._id, true);
              } else {
                Meteor.call('workbooks.directoryChange', args.node._id, '0');
              }
            }}
            generateNodeProps={({ node: theNode }) => ({
              buttons: [
                <button
                  onClick={() => {
                    this.setState({

                      selectedWorkbookId: theNode._id,
                    }, () => {
                      this.setState({
                        redirectToWorkbook: true,
                        tempTitle: theNode.title,
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
                    if(theNode.isFile) {
                      this.setState({
                        node: theNode,
                        selectedWorkbookId: theNode._id,
                        title: theNode.title,
                        isPublic: theNode.isPublic,
                        tags: theNode.tags,
                      });
                    } else {
                      this.setState({
                        folderNameModal:true,
                        selectedFolderId: theNode._id,
                        tempFolderTitle: theNode.title,
                        //selectedWorkbookId: theNode._id
                      })
                    }
       
                  }}
   
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
                      removeWorkbooksInside(theNode);
                    }

                    Meteor.call('workbooks.remove', theNode._id);
                  }}
                >
                  <FaTrash size={17} color="black" />
                </button>,
              ],
            })}
          />
        </div>
        <Modal
          open={classmodal}
          onClose={() => this.setState({ classmodal: false })}
          size="tiny"
        >
          <Modal.Header>
            Add workbook
            {' '}
            {title}
            {' '}
              to
            <Button className="close-button" onClick={() => this.setState({ classmodal: false })}>
              X
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              {classes.map(c => (
                <Card style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  margin: 0,
                }}
                >
                  <Card.Content>
                    <Card.Header>
                      {
                        Classes
                          .findOne({ classcode: c })
                          ? Classes.findOne({ classcode: c }).name
                          : null
                      }
                    </Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <Button
                      ref={(e) => { this.addButton = e; }}
                      style={{ float: 'right' }}
                      onClick={() => {
                        if (addOrRemove(c, addToClassId) === 'Add') {
                          Meteor.call('classes.addlesson', c, addToClassId, (err) => {
                            if (!err) {
                              alert('Added to class');
                              this.forceUpdate();
                            }
                          });
                        } else {
                          Meteor.call('classes.removeLesson', c, addToClassId, (err) => {
                            if (!err) {
                              alert('Removed from class');
                              this.forceUpdate();
                            }
                          });
                        }
                      }}
                    >
                      {addOrRemove(c, addToClassId)}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default withTracker(() => {
  const workbooksHandle = Meteor.subscribe('workbooks');
  const loading = !workbooksHandle.ready();
  const flatData = Workbooks.find({ userId: Meteor.userId() }).fetch();
  const workbooksExists = !loading && !!flatData;

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
    workbooksExists,
    treeData,
  };
})(WorkbooksDirectories);
