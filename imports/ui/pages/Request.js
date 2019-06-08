/* eslint-disable */
import React, { Fragment } from "react";
import DetailedList from "../components/DetailedList";
import Upload from "../components/Upload";
import { Requests } from "../../api/requests";
import CommentForm from "../components/CommentForm";
import CommentsList from "../components/CommentsList";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import SimTiles from "../components/SimTiles";
import moment from "moment";

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
  Label
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { withTracker } from "meteor/react-meteor-data";
import FaPencil from "react-icons/lib/fa/pencil";

/* This component renders the page where the teachers post the requests for the new simulation
    and the teachers and the other users have discussions about the simulations that they are trying to make.
*/

class Request extends React.Component {
  constructor(props) {
    super(props);

    /*
            If there are no topics, some elements need not be displayed, show variable is used to hide them.
            slides hold the contents of each slide. Each slide constitute the new request topics, the comments
            of each users and the simulations uploaded by them.

            curSlide holds the number of the current slide that is displayed.

            Iniitialized is set to true after the data is fetched from the database and set to the state.
            See the componentDidUpdate lifecycle method.

            selectedSim holds the sim that is currently selected and displayed inside the modal.
         */

    this.state = {
      show: false,
      slides: [],
      curSlide: 0,
      selectedSim: null,
      selectedSimIndex: null,

      requestTitle: "",
      description: "",

      editTitle: "",
      editDescription: "",

      loading: true,
      initialized: false,

      topicTitleModalOpen: false,
      topicTitle: "",

      showEditDescription: false,
      redirectToLessonplan: false,

      isHovering: false,

      showMembershipRequests: false,
      pendingMembers: [],

      membersName: [],

      showMembers: false
    };
    this.update.bind(this);
    this.pushSim.bind(this);
    this.requestExists = false;
    this.deleteSim.bind(this);
    this.push.bind(this);
    this.isMember;
  }

  findTime(time) {
    return moment(time);
  }

  pendingRequestsList = () => {
    return this.state.pendingMembers
      .filter(item => item)
      .map(member => {
        return (
          <Card
            style={{
              display: "flex",
              flexDirection: "row",
              margin: 0,
              width: "100%"
            }}
          >
            <Card.Content>
              {member.username}
              <Button
                style={{ float: "right" }}
                onClick={() => {
                  Meteor.call(
                    "requests.addMember",
                    this.state._id,
                    member.userId,
                    () => {
                      this.generatePendingUsersNamesList();
                    },
                    () => {
                      alert("successfully added !!!");
                    }
                  );
                }}
              >
                Accept
              </Button>
            </Card.Content>
          </Card>
        );
      });
  };

  generatePendingMembersList = () => {
    if (this.state.pendingRequests) {
      Meteor.call(
        "getUsernames",
        this.state.pendingRequests,
        (err, pendingMembers) => {
          this.setState({
            pendingMembers
          });
        }
      );
    }
  };

  generateMembersList = () => {
    if (this.state.members) {
      Meteor.call("getUsernames", this.state.members, (err, membersName) => {
        this.setState({
          membersName
        });
      });
    }
  };

  displayMembersName = () => {
    if (!this.state.members) return;

    return this.state.membersName.map(member => {
      return <li>{member.username}</li>;
    });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props == nextProps) return;

    /**
     * If the title for the first slide has not been yet set, show is false
     */

    const show = !!nextProps.request.slides[0].title;

    this.setState(
      {
        ...nextProps.request,
        loading: nextProps.loading,
        show,
        initialized: true,

        editDescription: nextProps.request.description,
        editTitle: nextProps.request.requestTitle
      },
      () => {
        if (!(this.state.requestTitle && this.state.description)) {
          this.setState({
            showEditDescription: true
          });
        }

        this.generatePendingMembersList();
        this.generateMembersList();
      }
    );
  }

  push(title) {
    if (!title) return;

    const { slides } = this.state;

    const curSlide = slides.length;

    if (this.state.show == false) {
      slides[0].title = title;
      slides[0].userId = Meteor.userId();
      slides[0].time = Date.now();
      this.setState({ slides, show: true }, () => {
        this.update();
      });
    } else {
      const slide = {
        title: title,
        comments: [],
        iframes: [],
        userId: Meteor.userId(),
        time: Date.now()
      };
      slides.push(slide);
      this.setState(
        {
          title,
          slides,
          curSlide
        },
        () => {
          this.update();
        }
      );
    }
  }

  update = () => {
    if (!Meteor.userId()) return;

    const { slides } = this.state;

    Meteor.call("requests.update", this.state._id, slides);
  };

  deleteSlide = index => {
    const isOwner = this.state.slides[index].userId == Meteor.userId();

    if (isOwner) {
      const { slides } = this.state;

      if (slides.length != 1) {
        slides.splice(index, 1);
        let { curSlide } = this.state;
        if (index == 0) {
          curSlide = 0;
        }
        if (curSlide == slides.length) curSlide = slides.length - 1;
        this.saveChanges(slides, curSlide);
      } else this.reset();
    }
  };

  reset() {
    const slides = [];

    const slide = {
      comments: [],
      iframes: [],
      title: "",
      userId: Meteor.userId()
    };

    slides.push(slide);

    this.setState(
      {
        curSlide: 0,
        slides,
        title: "",
        show: false
      },
      () => {
        this.update();
      }
    );
  }

  saveChanges = (slides, curSlide) => {
    if (slides == undefined) {
      this.setState(
        {
          curSlide
        },
        () => {
          this.commentsList.collapse();
          this.update();
        }
      );
    } else if (curSlide == undefined) {
      this.setState(
        {
          slides
        },
        () => {
          this.update();
        }
      );
    } else {
      this.setState(
        {
          slides,
          curSlide
        },
        () => {
          this.update();
        }
      );
    }
  };

  pushSim(title, username, project_id) {
    if (this.state.members)
      this.isMember = this.state.members.includes(Meteor.userId());

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
      time: Date.now()
    };

    slides[curSlide].iframes.push(objectToPush);

    this.setState({
      slides
    });
    this.update();
  }

  deleteSim = (index, userId) => {
    /* This function decides what to do when cross Button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */

    if (Meteor.userId() != userId) return;

    const confirmation = confirm("Are you sure you want to delete this sim");
    if (!confirmation) return;

    const { slides, curSlide } = this.state;
    const iframes = slides[curSlide].iframes;
    iframes.splice(index, 1);
    slides[this.state.curSlide].iframes = iframes;
    this.saveChanges(slides);
  };

  deleteComment(index) {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments.splice(index, 1);
    this.saveChanges(slides);
  }

  editComment = (editedComment, index) => {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments[index].comment = editedComment;
    this.saveChanges(slides);
  };

  deleteReplyComment(index, subIndex) {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments[index].replies.splice(subIndex, 1);
    this.saveChanges(slides);
  }

  editReplyComment = (index, subIndex, editedComment) => {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments[index].replies[subIndex].comment = editedComment;
    this.saveChanges(slides);
  };

  setTitle(e) {
    e.preventDefault();

    if (!(this.state.editDescription && this.state.editTitle)) {
      alert("Fill the details");
      return;
    }

    this.setState(
      {
        requestTitle: this.state.editTitle,
        showEditDescription: false
      },
      () => {
        Meteor.call(
          "requests.title.update",
          this.state._id,
          this.state.editTitle,
          this.state.editDescription
        );
      }
    );
  }

  changeTitleOfSlide = (newTitle, index) => {
    if (!newTitle) return false;

    const slides = Object.values($.extend(true, {}, this.state.slides));

    slides[index].title = newTitle;

    this.saveChanges(slides);

    return true;
  };

  handleJoin = () => {
    if (!Meteor.userId()) {
      alert("Login to participate in the discussion");
      return;
    }

    Meteor.call("");

    Meteor.call(
      "requests.addPendingRequest",
      this.state._id,
      Meteor.userId(),
      () => {
        alert("Your request has been send");
      }
    );
  };

  handleLeave = () => {
    Meteor.call(
      "requests.removeMember",
      this.state._id,
      Meteor.userId(),
      () => {
        alert("You have left the forum");
      }
    );
  };

  render() {
    if (this.state.members)
      this.isMember = this.state.members.includes(Meteor.userId());

    const isOwner = this.state.userId == Meteor.userId();

    if (this.state.redirectToLessonplan)
      return <Redirect to={`/createlessonplan/${this.state._id}`} />;

    return (
      <div>
        <Menu style={{ margin: 0 }}>
          <Menu.Item
            onClick={() => {
              history.back();
            }}
          >
            Back
          </Menu.Item>

          {isOwner ? (
            <Menu.Item
              onClick={() => {
                const confirmation = confirm(
                  "Are you sure you want to close this forum?"
                );

                if (confirmation && isOwner) {
                  Meteor.call("requests.reset", this.state._id);
                  history.back();
                }
              }}
            >
              Close this request forum
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

          {Meteor.userId() &&
          this.isMember &&
          Meteor.userId() !== this.state.userId ? (
            <Menu.Item
              onClick={() => {
                this.handleLeave();
              }}
            >
              Leave
            </Menu.Item>
          ) : null}

          {Meteor.userId() === this.state.userId && this.isMember ? (
            <Menu.Item
              onClick={() => {
                this.setState({
                  showMembershipRequests: true
                });
              }}
            >
              Membership requests
              {this.state.pendingMembers.length > 0 ? (
                <Label color = 'teal'>{this.state.pendingMembers.length}</Label>
              ) : null}
            </Menu.Item>
          ) : null}

          <Menu.Item
            onClick={() => {
              this.setState({
                showMembers: true
              });
            }}
          >
            Members
          </Menu.Item>

          <Menu.Item style={{ backgroundColor: "#E5E4E2" }}>
            Opened {this.findTime(this.state.createdAt).fromNow()}
          </Menu.Item>
        </Menu>
        <Segment style={{ marginTop: "0px" }}>
          <Dimmer inverted active={!this.props.requestExists}>
            <Loader />
          </Dimmer>

          <Grid divided="vertically">
            <Grid.Row style={{ height: "15vh" }}>
              <div style={{ padding: "1.6rem", paddingTop: "0px" }}>
                <Container textAlign={"left"} style={{ width: "100%" }}>
                  <div style={{ alignItems: "center", display: "flex" }}>
                    <div>
                      <h1 style={{ height: "2.4rem", margin: "auto 0" }}>
                        {this.state.requestTitle}
                      </h1>
                    </div>
                    {isOwner && this.isMember ? (
                      <Button
                        onClick={() => {
                          this.setState({
                            showEditDescription: true
                          });
                        }}
                        icon
                        style={{ marginLeft: "1.2rem" }}
                      >
                        <FaPencil />
                      </Button>
                    ) : null}
                  </div>

                  <p style={{ paddingLeft: "1.6rem", marginTop: "0.6rem" }}>
                    {this.state.description}
                  </p>
                </Container>
              </div>
            </Grid.Row>

            <Grid.Row
              divided
              style={{ height: `${window.innerHeight * 0.85 - 48}px` }}
            >
              <Grid.Column width={4} style={{ overflow: "auto" }} centered>
                <Header as="h3" dividing>
                  Requests list
                </Header>

                {Meteor.userId() && this.isMember ? (
                  <Button
                    onClick={() => {
                      this.setState({
                        topicTitleModalOpen: true
                      });
                    }}
                  >
                    Create new topic
                  </Button>
                ) : null}

                {this.state.show ? (
                  <DetailedList
                    items={this.state.slides}
                    curSlide={this.state.curSlide}
                    handleClick={this.saveChanges}
                    deleteItem={this.deleteSlide}
                    changeTitleOfItem={this.changeTitleOfSlide}
                    isMember={this.isMember}
                  />
                ) : null}
              </Grid.Column>
              <Grid.Column
                width={7}
                style={{ overflow: "auto", padding: "0 1.6rem" }}
              >
                {this.state.show ? (
                  <CommentsList
                    isMember={this.isMember}
                    ref={el => (this.commentsList = el)}
                    {...this.state}
                    saveChanges={this.saveChanges.bind(this)}
                    deleteReplyComment={this.deleteReplyComment.bind(this)}
                    deleteComment={this.deleteComment.bind(this)}
                    editComment={this.editComment}
                    editReplyComment={this.editReplyComment}
                  />
                ) : (
                  <h2>Create a topic to start the discussion</h2>
                )}
       
                {this.state.show && !!Meteor.userId() && this.isMember ? (
                  <CommentForm
                    option={-1}
                    {...this.state}
                    saveChanges={this.saveChanges.bind(this)}
                  />
                ) : null}
              </Grid.Column>
              <Grid.Column
                width={5}
                style={{ overflow: "auto", padding: "0 1.6rem" }}
              >
                <Header as="h3" dividing>
                  Uploaded sims
                </Header>

                {Meteor.userId() && this.isMember ? (
                  <div style={{ marginBottom: "1.6rem" }}>
                    {this.state.show ? (
                      <Upload methodToRun={this.pushSim.bind(this)} />
                    ) : null}
                  </div>
                ) : null}

                {this.state.show ? (
                  <SimTiles
                    slides={this.state.slides}
                    curSlide={this.state.curSlide}
                    update={this.update}
                    deleteSim={this.deleteSim}
                    isMember={this.isMember}
                  />
                ) : null}
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Modal size="tiny" open={this.state.showMembershipRequests}>
            <Modal.Header>
              Membership requests
              <Button
                icon
                style={{ float: "right" }}
                onClick={() => {
                  this.setState({ showMembershipRequests: false });
                }}
              >
                X
              </Button>
            </Modal.Header>
            <Modal.Content>
              <div style={{ width: "100%" }} vertical>
                {this.pendingRequestsList()}
                {this.state.pendingMembers.length === 0 ? (
                  <p>No requests to show</p>
                ) : null}
              </div>
            </Modal.Content>
          </Modal>

          <Modal size="tiny" open={this.state.topicTitleModalOpen}>
            <Modal.Header>
              Topic title
              <Button
                icon
                onClick={() => {
                  this.setState({ topicTitleModalOpen: false });
                }}
                style={{ float: "right" }}
              >
                X
              </Button>
            </Modal.Header>

            <Modal.Content>
              <Form>
                <Form.Field>
                  <label>Title for the topic</label>
                  <Input
                    ref={e => (this.topicTitle = e)}
                    onChange={(e, { value }) => {
                      this.setState({
                        topicTitle: value
                      });
                    }}
                  />
                </Form.Field>
                <Form.Field>
                  <Button
                    onClick={() => {
                      if (Meteor.userId() && this.isMember)
                        this.push(this.state.topicTitle);

                      this.setState({
                        topicTitle: "",
                        topicTitleModalOpen: false
                      });
                    }}
                  >
                    Submit
                  </Button>
                </Form.Field>
              </Form>
            </Modal.Content>
          </Modal>

          <Modal size="tiny" open={this.state.showMembers}>
            <Modal.Header>
              Members
              <Button
                icon
                style={{ float: "right" }}
                onClick={() => {
                  this.setState({ showMembers: false });
                }}
              >
                X
              </Button>
            </Modal.Header>
            <Modal.Content>
              <ul style={{ marginLeft: "1.2rem" }}>
                {this.displayMembersName()}
              </ul>
            </Modal.Content>
          </Modal>

          {isOwner ? (
            <Modal open={this.state.showEditDescription} size="tiny">
              <Modal.Header>
                Details for the request
                <Button
                  onClick={() => {
                    if (!(this.state.requestTitle && this.state.description))
                      this.setState({
                        redirectToLessonplan: true
                      });
                    else
                      this.setState({
                        showEditDescription: false
                      });
                  }}
                  className="close-button"
                >
                  X
                </Button>
              </Modal.Header>

              <Modal.Content>
                <Modal.Description>
                  <Form onSubmit={this.setTitle.bind(this)}>
                    <Form.Field>
                      <label>Title</label>
                      <Input
                        value={this.state.editTitle}
                        name="title"
                        onChange={(e, { value }) => {
                          this.setState({
                            editTitle: value
                          });
                        }}
                      />
                    </Form.Field>

                    <Form.Field>
                      <label>Add a description</label>
                      <TextArea
                        name="description"
                        value={this.state.editDescription}
                        onChange={(e, { value }) => {
                          this.setState({
                            editDescription: value
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

export default (RequestContainer = withTracker(({ match }) => {
  const requestsHandle = Meteor.subscribe("requests");
  const loading = !requestsHandle.ready();
  let request = Requests.findOne(match.params._id);
  requestExists = !loading && !!request;

  if (!request) {
    request = {};
    request.slides = [];
  }

  if (request.slides.length == 0) {
    request.slides[0] = {
      title: "",
      comments: [],
      iframes: [],
      time: Date.now()
    };
  }

  return {
    request,
    loading,
    requestExists
  };
})(Request));
