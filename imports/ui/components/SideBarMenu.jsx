import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { ic_arrow_drop_down } from 'react-icons-kit/md/ic_arrow_drop_down';

export default class SideBarMenu extends React.Component {
  toggleAccordion = () => {
    const panel = document.getElementsByClassName('sidebar-menu__item--accordion-items')[0];
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  }

  render() {
    return (
      <>
        <ul className="sidebar-menu">
          <Link to="profile" className="sidebar-menu__item">Profile</Link>
          <div className="sidebar-menu__item sidebar-menu__item--accordion" onClick={this.toggleAccordion}>
            <div>Manage</div>
            <Icon icon={ic_arrow_drop_down} />
          </div>
          <div className="sidebar-menu__item--accordion-items">
            <Link to="workbooks" className="sidebar-menu__item">Workbooks</Link>
            <Link to="lessons" className="sidebar-menu__item">Lessons</Link>
            <Link to="uploadsim" className="sidebar-menu__item">Simulations</Link>
          </div>
          <Link to="classes" className="sidebar-menu__item">Classes</Link>
          <Link to="requests" className="sidebar-menu__item">Discussion forums</Link>
          <Link to="assessments" className="sidebar-menu__item">Assessments</Link>
          <Link to="watchlesson" className="sidebar-menu__item">Watch lesson</Link>
        </ul>
      </>
    );
  }
}
