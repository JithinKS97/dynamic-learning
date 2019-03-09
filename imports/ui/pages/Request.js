import React from "react";
import List from "../components/List";
import Upload from "../components/Upload";
import { Requests } from "../../api/requests";
import CommentForm from "../components/CommentForm";
import CommentsList from "../components/CommentsList";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import SimPreview from "../components/SimPreview";
import FaTrash from "react-icons/lib/fa/trash";
import FaCode from "react-icons/lib/fa/code";
import {
  Grid,
  Button,
  Form,
  Modal,
  Dimmer,
  Loader,
  Segment,
  Menu,
  Input,
  TextArea
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { Tracker } from "meteor/tracker";
import { withTracker } from "meteor/react-meteor-data";

/* This component renders the page where the teachers post the requests for the new simulation
    and the teachers and the other users have discussions about the simulations that they are trying to make.
*/

class Request extends React.Component {
  constructor(props) {
    super(props);

    /*
            If there are no topics, some elements need not be displayed, show variable is used to hide them.
            slides holds the contents of each slides. Each slide constitute the new request topics, the comments
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
      requestTitle: true,

      titleInTheForm: "",
      descriptionInTheForm: "",

      loading: true,
      initialized: false,

      topicTitleModalOpen: false,

      topicTitle: ""
    };
    this.update.bind(this);
    this.pushSim.bind(this);
    this.requestExists = false;
    this.deleteSim.bind(this);
    this.push.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props == nextProps) return;

    const show = !!nextProps.request.slides[0].title;

    this.setState({
      ...nextProps.request,
      loading: nextProps.loading,
      show,
      initialized: true
    });
  }

  push(title) {

    if(!title)
        return

    const { slides } = this.state;

    const curSlide = slides.length;

    if (this.state.show == false) {
      slides[0].title = title;
      this.setState({ slides, show: true });
    } else {
      const slide = {
        title: title,
        comments: [],
        iframes: []
      };
      slides.push(slide);
      this.setState({
        title,
        slides,
        curSlide
      });
    }

    this.update();
  }

  update() {
    if (!Meteor.userId()) return;

    const { slides } = this.state;

    Meteor.call("requests.update", this.state._id, slides);
  }

  deleteSlide(index) {
    const isOwner = this.state.userId == Meteor.userId();

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
  }

  reset() {
    const slides = [];

    const slide = {
      comments: [],
      iframes: [],
      title: ""
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

  saveChanges(slides, curSlide) {
    if (slides == undefined) {
      this.setState(
        {
          curSlide
        },
        () => {
          this.commentsList.collapse();
        }
      );
    } else if (curSlide == undefined) {
      this.setState({
        slides
      });
    } else {
      this.setState({
        slides,
        curSlide
      });
    }
    this.update();
  }

  pushSim(title, src, w, h, linkToCode) {
    const { slides, curSlide } = this.state;

    const objectToPush = {
      userId: Meteor.userId(),
      src,
      w: 640,
      h: 360,
      x: 0,
      y: 0,
      title,
      linkToCode
    };

    slides[curSlide].iframes.push(objectToPush);
    this.setState({
      slides
    });
    this.update();
  }

  deleteSim(index, userId) {
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
  }

  deleteComment(index) {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments.splice(index, 1);
    this.saveChanges(slides);
  }

  deleteReplyComment(index, subIndex) {
    const { slides, curSlide } = this.state;
    slides[curSlide].comments[index].replies.splice(subIndex, 1);
    this.saveChanges(slides);
  }

  setTitle(e) {
    e.preventDefault();

    if (!(this.state.descriptionInTheForm && this.state.titleInTheForm)) {
      alert("Fill the details");

      return;
    }

    this.setState(
      {
        requestTitle: this.state.titleInTheForm
      },
      () => {
        Meteor.call(
          "requests.title.update",
          this.state._id,
          this.state.requestTitle,
          this.state.descriptionInTheForm
        );
      }
    );
  }

  displaySims() {
    const { slides, curSlide } = this.state;
    const sims = slides[curSlide];

    if (sims)
      return sims.iframes.map((sim, index) => {
        return (
          <Menu.Item
            style={{ display: "flex", justifyContent: "space-between" }}
            key={index}
          >
            <Button
              onClick={() => {
                this.setState({
                  selectedSim: sim,
                  selectedSimIndex: index
                });
              }}
              style={{ width: "100%", textAlign: "left" }}
            >
              {sim.title}
            </Button>
            {Meteor.userId() == sim.userId ? (
              <Button
                onClick={() => {
                  this.deleteSim(index, sim.userId);
                }}
              >
                <FaTrash />
              </Button>
            ) : null}
          </Menu.Item>
        );
      });
  }

  displayMenu() {
    const { slides, curSlide } = this.state;
    const sim = slides[curSlide];
    if (sim) {
      if (sim.iframes.length > 0) {
        return (
          <Menu style={{ display: "flex", width: "100%" }} vertical>
            {this.displaySims()}
          </Menu>
        );
      }
    }
  }

  render() {

    const isOwner = this.state.userId == Meteor.userId();

    return (
      <Segment>
        <Dimmer inverted active={!this.props.requestExists}>
          <Loader />
        </Dimmer>

        <Modal
          size="small"
          style={{ width: "auto" }}
          open={!!this.state.selectedSim}
        >
          <Modal.Header>
            Preview
            <div className="close-button">
              <a
                className="link-to-code"
                target="_blank"
                href={
                  this.state.selectedSim
                    ? this.state.selectedSim.linkToCode
                    : ""
                }
              >
                <Button>
                  <FaCode />
                </Button>
              </a>
              <Button
                onClick={() => {
                  this.setState({ selectedSim: null });
                }}
              >
                X
              </Button>
            </div>
          </Modal.Header>
          <Modal.Content>
            <SimPreview
              userId={
                this.state.selectedSim ? this.state.selectedSim.userId : null
              }
              index={this.state.selectedSimIndex}
              slides={this.state.slides}
              curSlide={this.state.curSlide}
              save={this.update.bind(this)}
              w={this.state.selectedSim ? this.state.selectedSim.w : 640}
              h={this.state.selectedSim ? this.state.selectedSim.h : 360}
              src={this.state.selectedSim ? this.state.selectedSim.src : null}
            />
          </Modal.Content>
        </Modal>

        <div>
          <Grid divided="vertically" style={{ height: "100vh" }}>
            <Grid.Row style={{ height: "20vh" }}>
              <div style={{ padding: "1.6rem" }}>
                <Button
                  onClick={() => {
                    history.back();
                  }}
                >
                  Back
                </Button>

                {isOwner ? (
                  <Button
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
                  </Button>
                ) : null}

                <div style={{ paddingLeft: "1.6rem" }}>
                  <h1 style={{ margin: "0.8rem 0" }}>
                    {this.state.requestTitle}
                  </h1>
                  <p style={{ paddingLeft: "1.6rem" }}>
                    {this.state.description}
                  </p>
                </div>
              </div>
            </Grid.Row>

            <Grid.Row style={{ height: "80vh" }}>
              <Grid.Column
                width={4}
                style={{ overflow: "auto", padding: "0 1.6rem" }}
              >
                {isOwner ? (
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
                  <List
                    userId={this.state.userId}
                    from={"request"}
                    showTitle={true}
                    {...this.state}
                    saveChanges={this.saveChanges.bind(this)}
                    delete={this.deleteSlide.bind(this)}
                  />
                ) : null}
              </Grid.Column>
              <Grid.Column
                width={7}
                style={{ overflow: "auto", padding: "0 1.6rem" }}
              >
                {this.state.show ? (
                  <CommentsList
                    ref={el => (this.commentsList = el)}
                    {...this.state}
                    saveChanges={this.saveChanges.bind(this)}
                    deleteReplyComment={this.deleteReplyComment.bind(this)}
                    deleteComment={this.deleteComment.bind(this)}
                  />
                ) : null}
                <br />
                {this.state.show && !!Meteor.userId() ? (
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
                {Meteor.userId() ? (
                  <div style={{ marginBottom: "1.6rem" }}>
                    {this.state.show ? (
                      <Upload methodToRun={this.pushSim.bind(this)} />
                    ) : null}
                  </div>
                ) : null}

                {this.state.show ? this.displayMenu.bind(this)() : null}
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Modal size="tiny" open={this.state.topicTitleModalOpen}>
            <Modal.Header>Topic title</Modal.Header>

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

          {isOwner ? (
            <Modal open={!!!this.state.requestTitle} size="tiny">
              <Modal.Header>
                Details for the request
                <Link to={{ pathname: `/createlessonplan/${this.state._id}` }}>
                  <Button link className="close-button">
                    X
                  </Button>
                </Link>
              </Modal.Header>

              <Modal.Content>
                <Modal.Description>
                  <Form onSubmit={this.setTitle.bind(this)}>
                    <Form.Field>
                      <label>Title</label>
                      <Input
                        name="title"
                        onChange={(e, { value }) => {
                          this.setState({
                            titleInTheForm: value
                          });
                        }}
                        value={this.state.titleInTheForm}
                      />
                    </Form.Field>

                    <Form.Field>
                      <label>Add a description</label>
                      <TextArea
                        name="description"
                        onChange={(e, { value }) => {
                          this.setState({
                            descriptionInTheForm: value
                          });
                        }}
                        value={this.state.descriptionInTheForm}
                      />
                    </Form.Field>

                    <p>Note: You can edit these details later</p>

                    <Form.Field>
                      <Button>Submit</Button>
                    </Form.Field>
                  </Form>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          ) : null}
        </div>
      </Segment>
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
      iframes: []
    };
  }

  return {
    request,
    loading,
    requestExists
  };
})(Request));
