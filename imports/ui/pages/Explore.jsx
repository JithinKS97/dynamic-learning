import React from "react";
import { Grid, Header, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { FaBook, FaChalkboardTeacher, FaCode } from "react-icons/fa";
import SharedLessons from "../components/sharingList/SharedLessons";
import SharedWorkbooks from "../components/sharingList/SharedWorkbooks";
import RequestsList from "../components/sharingList/RequestsList";

export default class Explore extends React.Component {
  constructor(props) {
    super(props);
    Meteor.subscribe("workbooks.public");
    Meteor.subscribe("lessons.public");
  }

  render() {
    return (
      <div style={{ padding: "1.6rem" }}>
        <Link to="/">
          <Button>Back</Button>
        </Link>
        <Grid style={{ marginTop: "0.8rem" }} columns={3} divided>
          <Grid.Row style={{ height: "100vh", scrolling: "no" }}>
            <Grid.Column
              style={{ backgroundColor: "#F0F0F0", padding: "1rem" }}
            >
              <Header as="h3">
                <FaBook /> Workbooks
              </Header>
              <SharedWorkbooks />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">
                <FaChalkboardTeacher /> Lessons
              </Header>
              <SharedLessons />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">
                <FaCode /> Help make simulations
              </Header>
              <RequestsList />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
