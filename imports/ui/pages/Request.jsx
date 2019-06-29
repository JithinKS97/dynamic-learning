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

/**
 * This component renders the Discussion forum page.
 * The forum is opened by the owner of a workbook.
 * Teachers, programmers and students discuss in this page about the lesson
 * and making new simulations.
 * The forum is made up of sequence of slides.
 * Each slide contains a discussion thread and sequence of simulations.
 */

export class Request extends React.Component {
  constructor(props) {
    super(props);

    /**
     * Explanation about the state variables used -
     *
     * show - If there are no topics, certain elements need to be hidden. show is used for this.
     *
     * slides - slides is an array and each slide holds comments (Array) and simulations (Array).
     *
     * curSlide - Holds the current slide no.
     *
     * requestTitle and description - carries the title and description at the top of the page.
     *
     * editTitle and editDescription - carries the values in the input components
     * (input and text area) in the modal box that appears when edit (Pencil) button is pressed.
     *
     * topicTitleModalOpen - shows the modal box that lets to enter the title of the new thread
     * created when Create new topic button is pressed.
     *
     * topicTitle - holds the name of the title of the new thread.
     *
     * showEditDescription - shows up the modal box that lets edit the title and description of
     * the workbook
     *
     * redirectToWorkbook - when true, redirects to the corresponding workbook of the forum.
     *
     * showMembershipRequests - Opens up the modal box that shows the pending membership requests.
     *
     * pendingMembers - an array of userIds of requesters.
     *
     * membersName - names of the members of the forums.
     *
     * showMembers - opens up the modal box that shows members of the forum.
     *
     * backPressed - to redirect to the previous page.
     *
     * _idToNameMappings = stores a mapping from userIds to usernames of
     * all the members (even that left)
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
      redirectToWorkbook: false,

      showMembershipRequests: false,
      pendingMembers: [],

      memberNameUserIds: [],

      showMembers: false,
      backPressed: false,
      _idToNameMappings: {},
    };
    // If the current user is the member of the forum
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
  }

  componentWillReceiveProps(nextProps) {
    // Only rerender when the props change.
    if (this.props === nextProps) return;
    const { request } = nextProps;
    let { curSlide } = this.state;

    // To ensure that when a slide is deleted, current Slide value is not beyond
    // the number of slides there are.
    if (curSlide > request.slides.length - 1) {
      curSlide = request.slides.length - 1;
      this.setState({
        curSlide,
      });
    }

    // If the title has not been set for the first slide, then show must be false.
    const show = !!request.slides[0].title;

    this.setState(
      {
        ...request,
        show,

        // The input fields in the title, description modal box set to the existing title
        // description values
        editDescription: request.description,
        editTitle: request.requestTitle,
      },
      () => {
        // If title and description has not been yet set, the title, description modal
        // box is open
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

  generatePendingMembersList = () => {
    // pendingRequests contains userIds of users who have sent requests for
    // joining the forum, but not accepted yet.
    // getUsernames fetches usernames of these users.
    // It returns array of objects. Each object is of the form { username, userId }
    const { pendingRequests } = this.state;
    if (pendingRequests) {
      Meteor.call(
        'getUsernames',
        pendingRequests,
        (_err, pendingMembers) => {
          this.setState({
            pendingMembers,
          });
        },
      );
    }
  };

  generateMembersList = () => {
    // members contain userIds of members of the discussion forum.
    const { members } = this.state;
    if (members) {
      Meteor.call('getUsernames', members, (_err, memberNameUserIds) => {
        this.setState({
          memberNameUserIds,
        });
      });
    }
    // allMembers contain userIds of all the present members and also members who left the forum
    // _idToNameMappings helps to instantly get the username with their userId.
    // _idToNameMappings[userId] returns username.
    const { allMembers } = this.state;
    if (allMembers) {
      Meteor.call('getUsernames', members, (_err, memberNameUserIds) => {
        const _idToNameMappings = {};
        memberNameUserIds.map((member) => { _idToNameMappings[member.userId] = member.username; });
        this.setState({
          _idToNameMappings,
        });
      });
    }
  };

  pendingRequestsList = () => {
    // Generates a list of cards from the pendingMembers
    // The card contains an accept button when pressed adds the
    // user as the member of the discussion forum by invoking 'requests.addMember'
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
                    // regenerates the pennding members list which updates the list.
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

  displayMembersName = () => {
    // To show the names of members as a list
    const { memberNameUserIds } = this.state;

    if (!memberNameUserIds) return;

    return memberNameUserIds.map(member => <li key={member.userId}>{member.username}</li>);
  };


  findTime = time => moment(time)

  push = (title) => {
    // isOwner is true when the current user is the one who opened the forum
    // isAuthenticated is true if the user is authenticated
    // updateDatabase is a function used to update the slides to the database
    const {
      isOwner, isAuthenticated, updateToDatabase, currentUserId,
    } = this.props;

    if (!(isOwner && isAuthenticated)) return;

    // If title is empty string, no slide is created
    if (!title) return;

    const { slides, show } = this.state;

    // Don't mutate the state variables directly, updatedSlides is created and changes done on it
    const updatedSlides = Object.values($.extend(true, {}, slides));

    const curSlide = slides.length;

    if (show === false) {
      updatedSlides[0].title = title;
      updatedSlides[0].userId = currentUserId;
      updatedSlides[0].createdAt = Date.now();
      this.setState({ slides: updatedSlides, show: true }, () => {
        // Only owner of the forum can 'modifySlidesList'
        updateToDatabase(updatedSlides, 'modifySlidesList');
      });
    } else {
      const slide = {
        title,
        comments: [],
        iframes: [],
        userId: currentUserId,
        createdAt: Date.now(),
      };
      updatedSlides.push(slide);
      this.setState(
        {
          slides: updatedSlides,
          curSlide,
        },
        () => {
          updateToDatabase(updatedSlides, 'modifySlidesList');
        },
      );
    }
  }

  deleteSlide = (index) => {
    const { slides } = this.state;
    const { isOwner, isAuthenticated } = this.props;
    // Don't mutate state variables directly, so a copy is created and changes made in it
    const updatedSlides = Object.values($.extend(true, {}, slides));

    if (!(isAuthenticated && isOwner)) return;

    if (updatedSlides.length !== 1) {
      updatedSlides.splice(index, 1);
      let { curSlide } = this.state;
      if (index === 0) {
        curSlide = 0;
      }
      if (curSlide === updatedSlides.length) curSlide = updatedSlides.length - 1;
      // If curSlide is the last slide and last slide is the one to get deleted
      // curSlide should be decremented
      this.changeSlide(curSlide);
      this.updateSlides(updatedSlides, 'modifySlidesList');
    } else this.reset();
  };

  reset = () => {
    // resets the slideslist
    const slides = [];
    const {
      updateToDatabase, isOwner, isAuthenticated, currentUserId,
    } = this.props;

    // Only owner of the forum is allowed to do this
    if (!(isOwner && isAuthenticated)) { return; }

    const slide = {
      comments: [],
      iframes: [],
      title: '',
      userId: currentUserId,
    };

    slides.push(slide);

    this.setState(
      {
        curSlide: 0,
        slides,
        show: false,
      },
      () => {
        updateToDatabase(slides, 'modifySlidesList');
      },
    );
  }

  updateSlides = (updatedSlides, operation, args) => {
    // Updates the slides in the state
    // operation is used to authenticate different operations in the server side
    const { updateToDatabase } = this.props;
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
    // Changes the current slide
    this.setState(
      {
        curSlide: toSlideNo,
      },
      () => {
        this.commentsList.collapse();
      },
    );
  }

  pushSim = (title, username, project_id) => {
    // pushSim adds a sim to the simulations array of the current slide
    // Only members of the forum are allowed to do this
    const {
      updateToDatabase, isAuthenticated, currentUserId, isMember,
    } = this.props;

    if (!(isAuthenticated && isMember)) return;

    const { slides, curSlide } = this.state;

    const updatedSlides = Object.values($.extend(true, {}, slides));

    const objectToPush = {
      userId: currentUserId,
      username,
      project_id,
      w: 640,
      h: 360,
      x: 0,
      y: 0,
      title,
      createdAt: Date.now(),
    };

    updatedSlides[curSlide].iframes.push(objectToPush);

    this.setState({
      slides: updatedSlides,
    });
    // The memberOp argument ensures that the only members are allowed to do this update
    updateToDatabase(updatedSlides, 'memberOp');
  }

  deleteSim = (index) => {
    // Used to delete the sim
    if (!confirm('Are you sure you want to delete this sim')) {
      return;
    }

    const { slides, curSlide } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));
    const { iframes } = slides[curSlide];
    iframes.splice(index, 1);
    updatedSlides[curSlide].iframes = iframes;
    this.updateSlides(updatedSlides, 'editSim', { index, curSlide });
  };

  deleteComment = (index) => {
    // The index of the comment is passed to delete it
    const { isAuthenticated, currentUserId } = this.props;
    const { slides, curSlide } = this.state;
    // Don't mutate state variables directly
    const updatedSlides = Object.values($.extend(true, {}, slides));
    if (
      !(isAuthenticated && currentUserId
        === slides[curSlide].comments[index].userId)
    ) { return; }
    const deletedCommentId = updatedSlides[curSlide].comments.splice(index, 1)[0]._id;
    // Each comment has an Id associated with it
    // In the server side, it is ensured that only the owner of the comment
    // is allowed to delete it
    this.updateSlides(updatedSlides, 'editComment', { _id: deletedCommentId, curSlide });
  }

  editComment = (editedComment, index, _id) => {
    // Comment is edited here
    const { isAuthenticated, currentUserId } = this.props;
    const { slides, curSlide } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index].userId)) { return; }
    updatedSlides[curSlide].comments[index].comment = editedComment;
    updatedSlides[curSlide].comments[index].lastEditedTime = Date.now();
    this.updateSlides(updatedSlides, 'editComment', { _id, curSlide });
  };

  deleteReplyComment = (index, subIndex) => {
    // Reply to the comment is deleted
    // Reply comment is identified by the subIndex
    const { slides, curSlide } = this.state;
    const { isAuthenticated, currentUserId } = this.props;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index]
      .replies[subIndex].userId)
    ) { return; }
    const updatedSlides = Object.values($.extend(true, {}, slides));
    const deletedReplyId = updatedSlides[curSlide]
      .comments[index]
      .replies.splice(subIndex, 1)[0]
      ._id;
    this.updateSlides(updatedSlides, 'editReply', {
      curSlide,
      commentId: updatedSlides[curSlide].comments[index]._id,
      replyId: deletedReplyId,
    });
  }

  editReplyComment = (index, subIndex, editedComment) => {
    // Reply comment is edited here
    const { slides, curSlide } = this.state;
    const { isAuthenticated, currentUserId } = this.props;
    if (!(isAuthenticated && currentUserId === slides[curSlide].comments[index]
      .replies[subIndex].userId)
    ) { return; }
    const updatedSlides = Object.values($.extend(true, {}, slides));
    updatedSlides[curSlide].comments[index].replies[subIndex].comment = editedComment;
    updatedSlides[curSlide].comments[index].replies[subIndex].lastEditedTime = Date.now();
    this.updateSlides(updatedSlides, 'editReply', {
      curSlide,
      commentId: updatedSlides[curSlide].comments[index]._id,
      replyId: updatedSlides[curSlide].comments[index].replies[subIndex]._id,
    });
  };

  setTitleAndDescription = () => {
    const {
      editDescription, editTitle, requestTitle, description,
    } = this.state;
    const {
      updateTitleInTheDatabase, isOwner, isAuthenticated, changeOpenedTime,
    } = this.props;

    if (!(isAuthenticated && isOwner)) return;

    // description and requestTitle is empty string when forum is opened
    // So openedTime should be reset
    if (!(description && requestTitle)) {
      changeOpenedTime();
    }

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
    const { isOwner, isAuthenticated } = this.props;
    if (!(isOwner && isAuthenticated)) { return; }
    const { slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));

    updatedSlides[index].title = newTitle;

    this.updateSlides(updatedSlides, 'modifySlidesList');

    return true;
  };

  handleJoin = () => {
    // Only authenticated people can join the discussion
    const { isAuthenticated } = this.props;
    if (!isAuthenticated) {
      alert('Login to participate in the discussion');
      return;
    }

    const { _id } = this.state;

    Meteor.call(
      'requests.addPendingRequest',
      _id,
      () => {
        alert('Your request has been send');
      },
    );
  };

  handleLeave = () => {
    const { _id, members } = this.state;
    const { currentUserId, isAuthenticated } = this.props;
    if (!(isAuthenticated && members.includes(currentUserId))) { return; }
    Meteor.call(
      'requests.removeMember',
      _id,
      () => {
        alert('You have left the forum');
      },
    );
  };

  render = () => {
    const {
      redirectToWorkbook,
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
    const {
      requestExists,
      isOwner,
      isAuthenticated,
      updateToDatabase,
      isMember,
      currentUserId,
    } = this.props;
    if (redirectToWorkbook) { return <Redirect to={`/createworkbook/${_id}`} />; }
    if (backPressed) {
      const { location: { state: { from } } } = this.props;
      if (from === 'dashboard') {
        return <Redirect to="/dashboard/requests" />;
      // eslint-disable-next-line no-else-return
      } else {
        return <Redirect to={`/createworkbook/${_id}`} />;
      }
    }
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

          {isAuthenticated && !isMember ? (
            <Menu.Item
              onClick={() => {
                this.handleJoin();
              }}
            >
              Join
            </Menu.Item>
          ) : null}

          {isAuthenticated
          && isMember
          && !isOwner ? (
            <Menu.Item
              onClick={() => {
                this.handleLeave();
              }}
            >
              Leave
            </Menu.Item>
            ) : null}

          {isOwner && isMember ? (
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
            {this.findTime(createdAt || Date.now()).fromNow()}
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
                    {isOwner && isMember ? (
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

                {isAuthenticated && isOwner ? (
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
                    isMember={isMember}
                    _idToNameMappings={_idToNameMappings}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
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
                    isMember={isMember}
                    isAuthenticated={isAuthenticated}
                    ref={(el) => { this.commentsList = el; }}
                    slides={slides}
                    curSlide={curSlide}
                    updateSlides={this.updateSlides}
                    deleteReplyComment={this.deleteReplyComment}
                    deleteComment={this.deleteComment}
                    editComment={this.editComment}
                    editReplyComment={this.editReplyComment}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                ) : (
                  <h2>Create a topic to start the discussion</h2>
                )}

                {show && isAuthenticated && isMember ? (
                  <CommentForm
                    // indexOfComment is -1 since it is the main form.
                    // indexOfComment > 0 for commentForm for replies
                    indexOfComment={-1}
                    slides={slides}
                    curSlide={curSlide}
                    updateSlides={this.updateSlides}
                    isMember={isMember}
                    currentUserId={currentUserId}
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

                {isAuthenticated && isMember ? (
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
                    isMember={isMember}
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
                      this.push(topicTitle);

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
                        redirectToWorkbook: true,
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
  location: PropTypes.shape({
    hash: PropTypes.string,
    key: PropTypes.string,
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  isMember: PropTypes.bool,
  changeOpenedTime: PropTypes.func,
};

Request.defaultProps = {
  requestExists: false,
  request: { slides: [] },
  updateTitleInTheDatabase: () => {},
  isAuthenticated: false,
  updateToDatabase: () => {},
  isOwner: false,
  currentUserId: '',
  location: {},
  isMember: false,
  changeOpenedTime: () => {},
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
    isMember: request.members ? request.members.includes(Meteor.userId()) : false,
    isOwner: request.userId === Meteor.userId(),
    updateToDatabase: (slides, operation, args) => { Meteor.call('requests.update', request._id, slides, operation, args); },
    currentUserId: Meteor.userId(),
    changeOpenedTime: () => { Meteor.call('requests.changeOpenedTime', request._id); },
  };
})(Request);

export default RequestContainer;
