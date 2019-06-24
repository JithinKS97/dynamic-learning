/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import {
  Grid,
  Button,
  Form,
  Modal,
  Dimmer,
  Loader,
  Segment,
  Input,
  TextArea,
  Header,
  Container,
  Card,
  Menu,
  Label,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import FaPencil from 'react-icons/lib/fa/pencil';
import DetailedList from '../components/DetailedList';
import Upload from '../components/Upload';
import { Requests } from '../../api/requests';
import CommentForm from '../components/CommentForm';
import CommentsList from '../components/CommentsList';
import SimTiles from '../components/SimTiles';
import 'semantic-ui-css/semantic.min.css';

/* This component renders the page where the teachers post
    the requests for the new simulation
    and the teachers and the other users have discussions
    about the simulations that they are trying to make.
*/

export class Request extends React.Component {
  constructor(props) {
    super(props);

    /*
    If there are no topics, some elements need not be displayed,
    show variable is used to hide them.
    slides hold the contents of each slide. Each slide constitute
    the new request topics, the comments
    of each users and the simulations uploaded by them.

    curSlide holds the number of the current slide that is displayed.

    Iniitialized is set to true after the data is fetched from the
    database and set to the state.
    See the componentDidUpdate lifecycle method.

    selectedSim holds the sim that is currently selected and
    displayed inside the modal.
  */

    this.state = {
      show: false,
      slides: [],
      curSlide: 0,

      requestTitle: '',
      description: '',

      editTitle: '',
      editDescription: '',

      topicTitleModalOpen: false,
      topicTitle: '',

      showEditDescription: false,
      redirectToLessonplan: false,

      showMembershipRequests: false,
      pendingMembers: [],

      membersName: [],

      showMembers: false,
      backPressed: false,
      _idToNameMappings: {},
    };
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
  }

  componentWillReceiveProps(nextProps) {
    if (this.props === nextProps) return;

    /**
     * If the title for the first slide has not been yet set, show is false
     */

    const { request } = nextProps;

    const show = !!request.slides[0].title;

    this.setState(
      {
        ...request,
        show,

        editDescription: request.description,
        editTitle: request.requestTitle,
      },
      () => {
        const { requestTitle, description } = this.state;
        if (!(requestTitle && description)) {
          this.setState({
            showEditDescription: true,
          });
        }

        this.generatePendingMembersList();
        this.generateMembersList();
      },
    );
  }

  pendingRequestsList = () => {
    const { pendingMembers, _id } = this.state;
    return pendingMembers
      .filter(item => item)
      .map(member => (
        <Card
          key={member.userId}
          style={{
            display: 'flex',
            flexDirection: 'row',
            margin: 0,
            width: '100%',
          }}
        >
          <Card.Content>
            {member.username}
            <Button
              style={{ float: 'right' }}
              onClick={() => {
                Meteor.call(
                  'requests.addMember',
                  _id,
                  member.userId,
                  () => {
                    this.generatePendingUsersNamesList();
                  },
                  () => {
                    alert('successfully added !!!');
                  },
                );
              }}
            >
                Accept
            </Button>
            <Button
              style={{ float: 'right' }}
              onClick={() => this.setState({
                infouser: member.username,
                infouserType: Meteor
                  .users
                  .findOne({ username: member.username }).profile.accountType,
                infouserEmail: Meteor
                  .users
                  .findOne({ username: member.username }).emails[0].address,
                viewinfo: true,
              })}
            >
              View Info
            </Button>
          </Card.Content>
        </Card>
      ));
  }

  generatePendingMembersList = () => {
    const { pendingRequests } = this.state;
    if (pendingRequests) {
      Meteor.call(
        'getUsernames',
        pendingRequests,
        (err, pendingMembers) => {
          this.setState({
            pendingMembers,
          });
        },
      );
    }
  };

  generateMembersList = () => {
    const { members, allMembers } = this.state;
    if (members) {
      Meteor.call('getUsernames', members, (err, membersName) => {
        this.setState({
          membersName,
        });
      });
    }
    if (allMembers) {
      Meteor.call('getUsernames', members, (err, membersName) => {
        const _idToNameMappings = {};
        membersName.map((member) => { _idToNameMappings[member.userId] = member.username; });
        this.setState({
          _idToNameMappings,
        });
      });
    }
  };

  displayMembersName = () => {
    const { members, membersName } = this.state;

    if (!members) return;

    return membersName.map(member => <li key={member.userId}>{member.username}</li>);
  };


  findTime = time => moment(time)

  push = (title) => {
    const { isOwner, isAuthenticated, updateToDatabase } = this.props;

    if (!(isOwner && isAuthenticated)) return;

    if (!title) return;

    const { slides, show } = this.state;

    const curSlide = slides.length;

    if (show === false) {
      slides[0].title = title;
      slides[0].userId = Meteor.userId();
      slides[0].time = Date.now();
      this.setState({ slides, show: true }, () => {
        updateToDatabase(slides, 'editingSlidesList');
      });
    } else {
      const slide = {
        title,
        comments: [],
        iframes: [],
        userId: Meteor.userId(),
        time: Date.now(),
      };
      slides.push(slide);
      this.setState(
        {
          slides,
          curSlide,
        },
        () => {
          updateToDatabase(slides, 'editingSlidesList');
        },
      );
    }
  }

  update = () => {
    const { isAuthenticated } = this.props;
    if (!isAuthenticated) return;

    const { slides, _id } = this.state;
    const { updateToDatabase } = this.props;

    updateToDatabase(_id, slides);
  };

  deleteSlide = (index) => {
    const { slides } = this.state;
    const { isOwner, isAuthenticated } = this.props;

    if (!(isAuthenticated && isOwner)) return;

    if (isOwner) {
      if (slides.length !== 1) {
        slides.splice(index, 1);
        let { curSlide } = this.state;
        if (index === 0) {
          curSlide = 0;
        }
        if (curSlide === slides.length) curSlide = slides.length - 1;
        this.changeSlide(curSlide);
        this.updateSlides(slides, 'editingSlidesList');
      } else this.reset();
    }
  };

  reset = () => {
    const slides = [];

    const slide = {
      comments: [],
      iframes: [],
      title: '',
      userId: Meteor.userId(),
    };

    slides.push(slide);

    this.setState(
      {
        curSlide: 0,
        slides,
        show: false,
      },
      () => {
        this.update();
      },
    );
  }

  updateSlides = (updatedSlides, operation, args) => {
    const { isAuthenticated, updateToDatabase } = this.props;
    if (!(isAuthenticated)) return;
    this.setState(
      {
        slides: updatedSlides,
      },
      () => {
        const { slides } = this.state;
        updateToDatabase(slides, operation, args);
      },
    );
  }

  changeSlide = (toSlideNo) => {
    this.setState(
      {
        curSlide: toSlideNo,
      },
      () => {
        this.commentsList.collapse();
        this.update();
      },
    );
  }

  pushSim = (title, username, project_id) => {
    const { members } = this.state;
    const { currentUserId, updateToDatabase } = this.props;
    if (members) { this.isMember = members.includes(currentUserId); }

    if (!(Meteor.userId() && this.isMember)) return;

    const { slides, curSlide } = this.state;

    const objectToPush = {
      userId: Meteor.userId(),
      username,
      project_id,
      w: 640,
      h: 360,
      x: 0,
      y: 0,
      title,
      time: Date.now(),
    };

    slides[curSlide].iframes.push(objectToPush);

    this.setState({
      slides,
    });
    updateToDatabase(slides, 'memberOp');
  }

  deleteSim = (index, userId) => {
    /* This function decides what to do when cross Button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */

    if (Meteor.userId() !== userId) return;

    const confirmation = confirm('Are you sure you want to delete this sim');
    if (!confirmation) return;

    const { slides, curSlide } = this.state;
    const { iframes } = slides[curSlide];
    iframes.splice(index, 1);
    slides[curSlide].iframes = iframes;
    this.updateSlides(slides, 'editSim', { index, curSlide });
  };

  deleteComment = (index) => {
    const { isAuthenticated, currentUserId } = this.props;
    const { slides, curSlide } = this.state;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index].userId)) { return; }
    const deletedComment = slides[curSlide].comments.splice(index, 1);
    this.updateSlides(slides, 'editComment', { _id: deletedComment._id, curSlide });
  }

  editComment = (editedComment, index, _id) => {
    const { isAuthenticated, currentUserId } = this.props;
    const { slides, curSlide } = this.state;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index].userId)) { return; }
    slides[curSlide].comments[index].comment = editedComment;
    slides[curSlide].comments[index].lastEditedTime = Date.now();
    this.updateSlides(slides, 'editComment', { _id, curSlide });
  };

  deleteReplyComment = (index, subIndex) => {
    const { slides, curSlide } = this.state;
    const { isAuthenticated, currentUserId } = this.props;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index]
      .replies[subIndex].userId)
    ) { return; }
    const deletedReplyId = slides[curSlide].comments[index].replies.splice(subIndex, 1)[0]._id;
    this.updateSlides(slides, 'editReply', {
      curSlide,
      commentId: slides[curSlide].comments[index]._id,
      replyId: deletedReplyId,
    });
  }

  editReplyComment = (index, subIndex, editedComment) => {
    const { slides, curSlide } = this.state;
    const { isAuthenticated, currentUserId } = this.props;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index]
      .replies[subIndex].userId)
    ) { return; }
    slides[curSlide].comments[index].replies[subIndex].comment = editedComment;
    slides[curSlide].comments[index].replies[subIndex].lastEditedTime = Date.now();
    this.updateSlides(slides, 'editReply', {
      curSlide,
      commentId: slides[curSlide].comments[index]._id,
      replyId: slides[curSlide].comments[index].replies[subIndex]._id,
    });
  };

  setTitleAndDescription = () => {
    const { editDescription, editTitle } = this.state;
    const { updateTitleInTheDatabase, isOwner, isAuthenticated } = this.props;

    if (!(isAuthenticated && isOwner)) return;

    if (!(editDescription && editTitle)) {
      alert('Fill the details');
      return;
    }

    this.setState(
      {
        requestTitle: editTitle,
        description: editDescription,
        showEditDescription: false,
      },
      () => {
        updateTitleInTheDatabase(editTitle, editDescription);
      },
    );
  }

  changeTitleOfSlide = (newTitle, index) => {
    if (!newTitle) return false;
    const { slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));

    updatedSlides[index].title = newTitle;

    this.updateSlides(updatedSlides, 'editingSlidesList');

    return true;
  };

  handleJoin = () => {
    if (!Meteor.userId()) {
      alert('Login to participate in the discussion');
      return;
    }

    const { _id } = this.state;

    Meteor.call(
      'requests.addPendingRequest',
      _id,
      Meteor.userId(),
      () => {
        alert('Your request has been send');
      },
    );
  };

  handleLeave = () => {
    const { _id } = this.state;
    Meteor.call(
      'requests.removeMember',
      _id,
      Meteor.userId(),
      () => {
        alert('You have left the forum');
      },
    );
  };

  render = () => {
    const {
      members,
      userId,
      redirectToLessonplan,
      _id,
      pendingMembers,
      createdAt,
      description,
      show,
      slides,
      requestTitle,
      curSlide,
      showMembershipRequests,
      topicTitleModalOpen,
      topicTitle,
      showMembers,
      showEditDescription,
      editTitle,
      editDescription,
      infouser,
      infouserType,
      infouserEmail,
      viewinfo,
      backPressed,
      _idToNameMappings,
    } = this.state;
    console.log(_idToNameMappings);
    const {
      requestExists, isOwner, currentUserId, isAuthenticated, updateToDatabase,
    } = this.props;
    if (members) { this.isMember = members.includes(currentUserId); }

    if (redirectToLessonplan) { return <Redirect to={`/createlessonplan/${_id}`} />; }
    if (backPressed) {
      if (this.props.location.state.from === 'dashboard') {
        return <Redirect to="/dashboard/requests" />;
      // eslint-disable-next-line no-else-return
      } else {
        return <Redirect to={`/createlessonplan/${_id}`} />;
      }
    }

    // console.log(show);
    // console.log(isAuthenticated);
    // console.log(this.isMember);

    return (
      <div>
        <Menu style={{ margin: 0 }}>
          <Menu.Item
            onClick={() => {
              this.setState({
                backPressed: true,
              });
            }}
          >
            Back
          </Menu.Item>

          {isOwner ? (
            <Menu.Item
              onClick={() => {
                const confirmation = confirm(
                  'Are you sure you want to close this forum?',
                );

                if (confirmation && isOwner) {
                  Meteor.call('requests.reset', _id);
                  history.back();
                }
              }}
            >
              Close this forum
            </Menu.Item>
          ) : null}

          {Meteor.userId() && !this.isMember ? (
            <Menu.Item
              onClick={() => {
                this.handleJoin();
              }}
            >
              Join
            </Menu.Item>
          ) : null}

          {Meteor.userId()
          && this.isMember
          && Meteor.userId() !== userId ? (
            <Menu.Item
              onClick={() => {
                this.handleLeave();
              }}
            >
              Leave
            </Menu.Item>
            ) : null}

          {Meteor.userId() === userId && this.isMember ? (
            <Menu.Item
              onClick={() => {
                this.setState({
                  showMembershipRequests: true,
                });
              }}
            >
              Membership requests
              {pendingMembers.length > 0 ? (
                <Label color="teal">{pendingMembers.length}</Label>
              ) : null}
            </Menu.Item>
          ) : null}

          <Menu.Item
            onClick={() => {
              this.setState({
                showMembers: true,
              });
            }}
          >
            Members
          </Menu.Item>

          <Menu.Item style={{ backgroundColor: '#E5E4E2' }}>
            Opened
            {' '}
            {this.findTime(createdAt).fromNow()}
          </Menu.Item>
        </Menu>
        <Segment style={{ marginTop: '0px' }}>
          <Dimmer inverted active={!requestExists}>
            <Loader />
          </Dimmer>

          <Grid divided="vertically">
            <Grid.Row style={{ height: '15vh' }}>
              <div style={{ padding: '1.6rem', paddingTop: '0px' }}>
                <Container textAlign="left" style={{ width: '100%' }}>
                  <div style={{ alignItems: 'center', display: 'flex' }}>
                    <div>
                      <h1 className="requestTitle" style={{ height: '2.4rem', margin: 'auto 0' }}>
                        {requestTitle}
                      </h1>
                    </div>
                    {isOwner && this.isMember ? (
                      <Button
                        onClick={() => {
                          this.setState({
                            showEditDescription: true,
                          });
                        }}
                        icon
                        style={{ marginLeft: '1.2rem' }}
                      >
                        <FaPencil />
                      </Button>
                    ) : null}
                  </div>

                  <p className="requestDescription" style={{ paddingLeft: '1.6rem', marginTop: '0.6rem' }}>
                    {description}
                  </p>
                </Container>
              </div>
            </Grid.Row>

            <Grid.Row
              divided
              style={{ height: `${window.innerHeight * 0.85 - 48}px` }}
            >
              <Grid.Column width={4} style={{ overflow: 'auto' }} centered="true">
                <Header as="h3" dividing>
                  Topics
                </Header>

                {Meteor.userId() && isOwner ? (
                  <Button
                    onClick={() => {
                      this.setState({
                        topicTitleModalOpen: true,
                      });
                    }}
                  >
                    Create new topic
                  </Button>
                ) : null}

                {show ? (
                  <DetailedList
                    items={slides}
                    curSlide={curSlide}
                    handleClick={this.changeSlide}
                    deleteItem={this.deleteSlide}
                    changeTitleOfItem={this.changeTitleOfSlide}
                    isMember={this.isMember}
                    _idToNameMappings={_idToNameMappings}
                  />
                ) : null}
              </Grid.Column>
              <Grid.Column
                width={7}
                style={{ overflow: 'auto', padding: '0 1.6rem' }}
              >
                {show ? (
                  <CommentsList
                    _idToNameMappings={_idToNameMappings}
                    isMember={this.isMember}
                    isAuthenticated={isAuthenticated}
                    ref={(el) => { this.commentsList = el; }}
                    slides={slides}
                    curSlide={curSlide}
                    updateSlides={this.updateSlides}
                    deleteReplyComment={this.deleteReplyComment}
                    deleteComment={this.deleteComment}
                    editComment={this.editComment}
                    editReplyComment={this.editReplyComment}
                  />
                ) : (
                  <h2>Create a topic to start the discussion</h2>
                )}

                {show && isAuthenticated && this.isMember ? (
                  <CommentForm
                    // indexOfComment is -1 since it is the main form.
                    // indexOfComment > 0 for commentForm for replies
                    indexOfComment={-1}
                    slides={slides}
                    curSlide={curSlide}
                    updateSlides={this.updateSlides}
                    isMember={this.isMember}
                    isAuthenticated={isAuthenticated}
                  />
                ) : null}
              </Grid.Column>
              <Grid.Column
                width={5}
                style={{ overflow: 'auto', padding: '0 1.6rem' }}
              >
                <Header as="h3" dividing>
                  Uploaded sims
                </Header>

                {Meteor.userId() && this.isMember ? (
                  <div style={{ marginBottom: '1.6rem' }}>
                    {show ? (
                      <Upload methodToRun={this.pushSim} />
                    ) : null}
                  </div>
                ) : null}

                {show ? (
                  <SimTiles
                    slides={slides}
                    curSlide={curSlide}
                    update={updateToDatabase}
                    deleteSim={this.deleteSim}
                    isMember={this.isMember}
                    _idToNameMappings={_idToNameMappings}
                  />
                ) : null}
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Modal
            open={viewinfo}
            onClose={() => this.setState({ viewinfo: false })}
            size="tiny"
          >
            <Modal.Header>
              {infouser}
              <Button className="close-button" onClick={() => this.setState({ viewinfo: false })}>
              X
              </Button>
            </Modal.Header>

            <Modal.Content>
              <Modal.Description>
              Account Type:
                {' '}
                {infouserType}
                {' '}
                <br />
              Email:
                {' '}
                {infouserEmail}
              </Modal.Description>

            </Modal.Content>

          </Modal>
          <Modal size="tiny" open={showMembershipRequests}>
            <Modal.Header>
              Membership requests
              <Button
                icon
                style={{ float: 'right' }}
                onClick={() => {
                  this.setState({ showMembershipRequests: false });
                }}
              >
                X
              </Button>
            </Modal.Header>
            <Modal.Content>
              <div style={{ width: '100%' }}>
                {this.pendingRequestsList()}
                {pendingMembers.length === 0 ? (
                  <p>No requests to show</p>
                ) : null}
              </div>
            </Modal.Content>
          </Modal>

          <Modal size="tiny" open={topicTitleModalOpen}>
            <Modal.Header>
              Topic title
              <Button
                icon
                onClick={() => {
                  this.setState({ topicTitleModalOpen: false });
                }}
                style={{ float: 'right' }}
              >
                X
              </Button>
            </Modal.Header>

            <Modal.Content>
              <Form>
                <Form.Field>
                  <label>Title for the topic</label>
                  <Input
                    ref={(e) => { this.topicTitle = e; }}
                    onChange={(e, { value }) => {
                      this.setState({
                        topicTitle: value,
                      });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <Button
                    onClick={() => {
                      if (Meteor.userId() && this.isMember) { this.push(topicTitle); }

                      this.setState({
                        topicTitle: '',
                        topicTitleModalOpen: false,
                      });
                    }}
                  >
                    Submit
                  </Button>
                </Form.Field>
              </Form>
            </Modal.Content>
          </Modal>

          <Modal size="tiny" open={showMembers}>
            <Modal.Header>
              Members
              <Button
                icon
                style={{ float: 'right' }}
                onClick={() => {
                  this.setState({ showMembers: false });
                }}
              >
                X
              </Button>
            </Modal.Header>
            <Modal.Content>
              <ul style={{ marginLeft: '1.2rem' }}>
                {this.displayMembersName()}
              </ul>
            </Modal.Content>
          </Modal>

          {isOwner ? (
            <Modal open={showEditDescription} size="tiny">
              <Modal.Header>
                Details for the request
                <Button
                  onClick={() => {
                    if (!(requestTitle && description)) {
                      this.setState({
                        redirectToLessonplan: true,
                      });
                    } else {
                      this.setState({
                        showEditDescription: false,
                      });
                    }
                  }}
                  className="close-button"
                >
                  X
                </Button>
              </Modal.Header>

              <Modal.Content>
                <Modal.Description>
                  <Form onSubmit={() => { this.setTitleAndDescription(); }}>
                    <Form.Field>
                      <label>Title</label>
                      <Input
                        value={editTitle}
                        name="title"
                        onChange={(e, { value }) => {
                          this.setState({
                            editTitle: value,
                          });
                        }}
                      />
                    </Form.Field>

                    <Form.Field>
                      <label>Add a description</label>
                      <TextArea
                        name="description"
                        value={editDescription}
                        onChange={(e, { value }) => {
                          this.setState({
                            editDescription: value,
                          });
                        }}
                      />
                    </Form.Field>

                    <Form.Field>
                      <Button>Submit</Button>
                    </Form.Field>
                  </Form>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          ) : null}
        </Segment>
      </div>
    );
  }
}

Request.propTypes = {
  requestExists: PropTypes.bool,
  request: PropTypes.shape({
    userId: PropTypes.string,
    _id: PropTypes.string,
    slides: PropTypes.array,
    requestTitle: PropTypes.string,
    updatedAt: PropTypes.number,
    createdAt: PropTypes.number,
    description: PropTypes.string,
    members: PropTypes.array,
    pendingRequests: PropTypes.array,
  }),
  updateTitleInTheDatabase: PropTypes.func,
  isAuthenticated: PropTypes.bool,
  updateToDatabase: PropTypes.func,
  isOwner: PropTypes.bool,
  currentUserId: PropTypes.string,
};

Request.defaultProps = {
  requestExists: false,
  request: { slides: [] },
  updateTitleInTheDatabase: () => {},
  isAuthenticated: false,
  updateToDatabase: () => {},
  isOwner: false,
  currentUserId: '',
};

const RequestContainer = withTracker(({ match }) => {
  const requestsHandle = Meteor.subscribe('requests');
  const loading = !requestsHandle.ready();
  let request = Requests.findOne(match.params._id);
  const requestExists = !loading && !!request;

  if (!request) {
    request = {};
    request.slides = [];
  }

  if (request.slides.length === 0) {
    request.slides[0] = {
      title: '',
      comments: [],
      iframes: [],
      time: Date.now(),
    };
  }

  return {
    request,
    loading,
    requestExists,
    updateTitleInTheDatabase: (editTitle, editDescription) => {
      Meteor.call(
        'requests.title.update',
        request._id,
        editTitle,
        editDescription,
      );
    },
    isAuthenticated: !!Meteor.userId(),
    isOwner: request.userId === Meteor.userId(),
    updateToDatabase: (slides, operation, args) => { Meteor.call('requests.update', request._id, slides, operation, args); },
    currentUserId: Meteor.userId(),
  };
})(Request);

export default RequestContainer;
