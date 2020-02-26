/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'react-icons-kit';
import { history } from 'react-icons-kit/fa/history';
import { Session } from 'meteor/session';
import { arrowLeft } from 'react-icons-kit/fa/arrowLeft';
import { ic_add_circle_outline } from 'react-icons-kit/md/ic_add_circle_outline';
import AddSim from '../../components/AddSim';

export const renderRightMenu = (editorRef) => {
  const {
    curSlide,
    slides,
    interactEnabled,
    userId,
    _id,
  } = editorRef.state;

  return (
    <>
      <AddSim
        ref={(e) => {
          editorRef.addSim = e;
        }}
        curSlide={curSlide}
        slides={slides}
        updateSlides={editorRef.updateSlides}
      />

      <div className="workbook-editor__right-menu">
        <div>
          <h2 style={{ color: '#1ed760' }}>DRAW</h2>
          <label className="switch">
            <input checked={!interactEnabled} onClick={editorRef.toggleInteract} type="checkbox" />
            <span className="slider round" />
          </label>

          <div
            className="workbook-editor__right-menu__button"
            onClick={() => {
              editorRef.addSim.addSim();
            }}
            color="black"
          >
              + Simulation
          </div>
          {!!Meteor.userId() && userId === Meteor.userId() ? (
            <Link
              to={{
                pathname: `/request/${_id}`,
                state: { from: 'createlessonplan' },
              }}
            >
              <div
                className="workbook-editor__right-menu__button"
              >
                  Discussion forum
              </div>
            </Link>
          ) : null}
          <div
            className="workbook-editor__right-menu__button"
            onClick={() => {
              editorRef.saveToDatabase();
            }}
          >
            {Meteor.userId() === userId || !Meteor.userId()
              ? 'Save'
              : 'Fork and Save'}
          </div>
          <div style={{ backgroundColor: '#102028', margin: '1rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'white', paddingTop: '1rem' }}>Canvas size</div>
            <div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                margin: '1rem',
              }}
              >
                <div
                  className="workbook-editor__small-button"
                    // eslint-disable-next-line react/no-string-refs
                  ref="increaseCanvasButton"
                  onClick={() => {
                    editorRef.changePageCount(1);
                  }}
                >
                    +
                </div>

                <div
                  className="workbook-editor__small-button"
                  onClick={() => {
                    if (editorRef.pageCount === 0 || editorRef.checkCanvasSize()) {
                      alert('Canvas size cannot be decreased further!');
                      return;
                    }

                    editorRef.changePageCount(-1);
                  }}
                >
                    -
                </div>
              </div>
            </div>
          </div>

          {!Meteor.userId() ? (
            <div
              className="workbook-editor__right-menu__button"
              onClick={() => {
                const confirmation = confirm(
                  'You will be redirected to login page. Changes will be saved for you.',
                );
                if (!confirmation) return;

                Session.set('stateToSave', editorRef.state);

                editorRef.setState({ redirectToLogin: true });
              }}
            >
                Login
            </div>
          ) : null}
          {!Meteor.userId() ? (
            <Link to="/explore">
              <div className="workbook-editor__right-menu__button" link>Back</div>
            </Link>
          ) : null}
          {!editorRef.checkDescription() && Meteor.userId() ? (
            <div
              className="workbook-editor__right-menu__button"
              onClick={() => {
                editorRef.handleAddDescription();
              }}
            >
            Add description
            </div>
          ) : (
            <div
              onClick={() => {
                editorRef.handleShowDescription();
              }}
              className="workbook-editor__right-menu__button"
            >
            View description
            </div>
          )}
          <a
            target="_blank"
            href="https://github.com/JithinKS97/dynamic-learning"
          >
            <div className="workbook-editor__right-menu__button" link>Contribute</div>
          </a>

          <div
            className="workbook-editor__right-menu__button"
            onClick={() => {
              Meteor.call('workbook.submitAnswers');
            }}
          >
              Submit answers
          </div>
        </div>
        <div>
          <div className="reset-workbook-container">
            <div
              className="reset-workbook-container__icon"
              onClick={editorRef.reset}
            >
              <Icon icon={history} size="1.7em" />
            </div>
            <div className="reset-workbook-container__text">
                Reset Workbook
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const renderLeftMenuHeader = (editorRef) => {
  const {
    saving,
  } = editorRef.state;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#203038',
        paddingBottom: '0.2rem',
      }}
      className="workbook-left-menu-header"
    >
      {saving ? <div style={{ color: 'white', marginTop: '0.5rem' }}>Saving...</div> : null}

      {Meteor.userId() ? (
        <div
          className="dashboard-arrow-container"
          onClick={editorRef.handleRedirectToDashboard}
        >
          <Icon icon={arrowLeft} color="fff" size="1.2rem" />
        </div>
      ) : null}
      <div>
        <img className="workbook-editor__slides-list__logo" alt="dynamic-learning-logo" src="/symbol.png" />
      </div>
      <div
        className="workbook-editor__slides-list__add-slide"
        style={{ marginTop: '0.8rem', marginLeft: '1rem', marginRight: '1rem' }}
        onClick={editorRef.addNewSlide}
      >
        <div style={{ height: '1.8rem' }}>
          <Icon icon={ic_add_circle_outline} />
        </div>
      </div>
    </div>
  );
};
