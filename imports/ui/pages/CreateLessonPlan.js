import React from 'react'
import DrawingBoardCmp from '../components/DrawingBoardCmp'
import { LessonPlans } from '../../api/lessonplans'
import SimsList from '../components/SimsList'
import Lists from '../components/List'
import AddSim from '../components/AddSim'
import { Link, Redirect } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { withTracker } from 'meteor/react-meteor-data';
import { Menu, Button, Dimmer, Loader, Segment, Modal, Form, Grid, List } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { expect } from 'chai';
import TextBoxes from '../components/TextBoxes'
import DOMPurify from 'dompurify'

import FaTrash from 'react-icons/lib/fa/trash'
import FaEdit from 'react-icons/lib/fa/edit'


/* This Component is intended for the development of a lessonplan by the teachers. Each lessonplan
    is composed of a sequence of slides. Each slide contains a note (the drawing on the canvas which is
    is of type string) and array of simulations. The changes need to be saved explicitly by clicking
    the save button for updating the database.
*/


export class CreateLessonPlan extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            /*Title holds the title of the lessonplan. CurSlide holds the current slide on which we are in.
                id holds the id of the current lessonplan. Initialzed is set to true once data is fetched from the
                database and is filled in the state. loginNotification becomes true when save button is pressed
                and the user is not logged in. Checked holds the interact checkbox value. RedirectToLogin is set to
                true if we want to redirect the user to the login page. Checked holds the interact checkbox value.
                RedirectToDashboard set to true if we want to redirect the user to the dashboard
            */

            title: true,
            curSlide: 0,
            slides: [],
            _id: '',
            initialized: false,
            loginNotification: false,
            redirectToLogin: false,
            interactEnabled: false,
            redirectToDashboard: false,
            forkedLessonPlanId: null,
            author: '',
            copied: false,
            scaleX: 1,
            description: [],
            showDescription: false,
            addDescription: false,
            saving:false
        }

        /* PageCount holds the the value associated with the extra length of the canvas
            PushSlide is for creation of new slide, save to save the slides to the db,
            handleKeyDown for dealing with shortcuts (See the definitions below)
        */

        this.pageCount = 0;
        this.pushSlide.bind(this)
        this.save.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)

        this.changePageCount.bind(this)

        this.undoStacks = []
        this.redoStacks = []

        this.savingChanges = false

    }

    handleWindowResize = () => {

        this.setState({

            scaleX: (document.getElementsByClassName('twelve wide column')[0].offsetWidth / 1366)
        })
        this.handleScroll()
    }

  


    handleKeyDown = (e) => {

        /*
            This function handles the shortcut key functionalities.
         */

        

        if (e.keyCode === 90 && e.ctrlKey)
            this.undo()

        if (e.keyCode === 89 && e.ctrlKey)
            this.redo()

        if(e.keyCode === 83 && e.ctrlKey){
            e.preventDefault()
            this.save()
        }

        if(e.keyCode === 68 && e.ctrlKey) {
            e.preventDefault()
            this.interact()
        }
        if(e.keyCode === 67 && e.ctrlKey){

            this.db.reset();
            this.saveAfterReset()
        }
    }

    saveAfterReset = () => {

        const slides = Object.values($.extend(true, {}, this.state.slides))
        const { curSlide } = this.state            
        slides[curSlide].note = this.db.getImg()
        this.setState({
            slides
        })  
    }

    componentDidMount() {

        this.db = this.drawingBoard

        window.onresize = this.handleWindowResize

        /* board:reset and board:stopDrawing are events associated with the drawing
           board. They are triggered whenever we press the reset button or stop
           the drawing. Whenever these events are triggered, the onChange method is
           called. See the definition below.
        */

        // this.db.ev.bind('board:reset', this.onChange.bind(this));
        // this.db.ev.bind('board:stopDrawing', this.onChange.bind(this));

        window.addEventListener("keydown", this.handleKeyDown, false);
        this.handleWindowResize()
        $(window).scroll(this.handleScroll)

        

    }

    handleScroll = () => {

        /**
         * When transform is used the fixed value of position of drawing-board-controls is disabled
         * So as we scroll, the top value is explicitly brought down by changing the top value to
         * the window.scrollTop
         */

        const scrollTop = $(window).scrollTop();
        $('.drawingBoardControls')[0].style.top = scrollTop/this.state.scaleX + 'px'
    }


    componentWillReceiveProps(nextProps) {


        if (nextProps.lessonplanExists == false)
            return

        const lessonplan = nextProps.lessonplan

        if (this.state.initialized === true)
            return

        this.setState({
            ...lessonplan,
            initialized: true,

        }, () => {

            Meteor.call('getUsername', this.state.userId, (err, name) => {

                this.setState({
                    author: name
                })
            })

            if (this.state.slides.length == 0) {

                this.pushSlide(this.state.slides)

                this.setSizeOfPage(0)
                this.db.reset('0')

                this.saveChanges(this.state.slides)
                this.interact()

            }
            else {
                this.pageCount = this.state.slides[this.state.curSlide].pageCount || 0;

                /* The size of the page is set first, then we completely reset the canvas
                    And the notes are drawn back to the canvas
                */

                this.setSizeOfPage(this.pageCount)

                this.db.reset();
                this.db.setImg(this.state.slides[this.state.curSlide].note)

                this.saveChanges(this.state.slides)
                this.interact()

            }
        })
    }

    componentWillUnmount() {

        window.removeEventListener("keydown", this.handleKeyDown, false)
    }


    setSizeOfPage(pageCount) {


        /*
            This function sets the size of the canvas. By default the size of the page is
            900px. The user can add extra poges. With each addition the size of the page
            increases by 300px.
            First the size of the container is incremented, then the canvas's size is
            incremented
        */
       

        $('.canvas-container')[0].style.height = (900 + pageCount * 300) + 'px';
        $('.upper-canvas')[0].style.height = $('.canvas-container')[0].style.height;
        $('.lower-canvas')[0].style.height = $('.canvas-container')[0].style.height;
        $('.upper-canvas')[0].height = 900 + pageCount * 300;
        $('.lower-canvas')[0].height = 900 + pageCount * 300;
        this.db.b.setHeight($('.upper-canvas')[0].height)
        
    }

    onChange() {

        /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */

        const slides = Object.values($.extend(true, {}, this.state.slides))

        const { curSlide } = this.state

        const note = this.db.getImg()

        slides[curSlide].note = note
        slides[curSlide].pageCount = this.pageCount

        this.saveChanges(slides)
    }

    addNewSlide(e) {

        /* this.savethis.savethis.savethis.savethis.savethis.savethis.savethis.save
            Used for creating a new slide
        */

        let { curSlide, slides } = this.state
        this.pushSlide(slides)
        curSlide = slides.length - 1
        this.setState({
            curSlide
        }, () => {

            this.pageCount = 0
            this.setSizeOfPage(0)
            this.db.reset('0');
        })
    }


    setStateAfterRearranging(slides, newIndex) {

        this.setState({
            slides
        }, () => {
            this.saveChanges(undefined, newIndex)
        })
    }

    pushSlide(slides) {

        /* To create a new slide, first the structure of slide is defined and
           then pushed to the slides array.
        */

        const newSlide = {
            note: [],
            iframes: [],
            pageCount: 0,
            textboxes: []
        }

        slides.push(newSlide)

        this.setState({
            slides
        })
    }

    reset() {

        /* The current slide is made 0 and slides set to empty array.
           The first slide is initialized here. And the old notes are
           cleared.
        */

        this.setState({

            curSlide: 0,
            slides: []
        }, () => {

            const { slides } = this.state
            this.pushSlide(slides)
            this.setSizeOfPage(0)
            this.db.reset('0')
        })
    }

    save() {

        /* This function is intended for saving the slides to the database.
            If not logged in, user is asked to login first.
        */



        if (!Meteor.userId()) {

            this.setState({ loginNotification: true })
            return
        }

        if (this.addSim.state.isOpen)
            return

        if (this.state.userId != Meteor.userId()) {

            const confirmation = confirm("Are you sure you want to fork this lessonplan?")

            if (!confirmation)
                return

            Meteor.call('lessonplans.insert', this.state.title, (err, id) => {

                Meteor.call('lessonplans.update', id, this.state.slides)

                this.setState({

                    redirectToDashboard: true,
                    forkedLessonPlanId: id
                }, () => {

                    confirm('Forked succesfully')
                })
            })
            return
        }
        else {

            const { _id, slides } = this.state

            const lessonplan = LessonPlans.findOne({ _id: this.state._id })

            /* If the slides in the state has the same values as that of the slides
                in the database, we need not save, expect to deep include by chai checks this equality.
                If they are not same, an error is thrown. When we catch the error, we can see that the
                data are different and we initiate the save.
            */

            try {
                expect({ slides: lessonplan.slides }).to.deep.include({ slides: this.state.slides })
            }
            catch (error) {


                if (error) {

                    this.setState({
                        saving:true
                    })

                    Meteor.call('lessonplans.update', _id, slides, (err) => {
                        alert('Saved successfully')
                        this.setState({
                            saving:false
                        })
                        
                    })
                }
            }
        }

    }

    pushToUndoStacks = (oldSlide) => {

        /**
         * oldSlide is the object that get pushed to the undoStack
         */

        if (this.shouldNotUndo)
            return

        if (!this.undoStacks[this.state.curSlide]) {

            this.undoStacks[this.state.curSlide] = []
        }

        try {
            expect(oldSlide).to.deep.include(this.undoStacks[this.state.curSlide][this.undoStacks[this.state.curSlide].length - 1])
        }
        catch (error) {
            LessonPlans.find

            if (error) {
                this.undoStacks[this.state.curSlide].push(oldSlide)
            }
        }
    }

    saveChanges(slides, curSlide, shouldNotLoad, shouldNotPushToUndoStack) {

        /* This function is used in multiple places to save the changes (not in the database, but
            in the react state).
           Depending upon the changes made, they are saved looking upon arguments given when the
           function was called.
        */

        
        if (slides == undefined) {

            const slide = this.state.slides[this.state.curSlide]

            if (this.undoStacks[this.state.curSlide]) {

                if (this.undoStacks[this.state.curSlide].length === 0)
                    if (!shouldNotPushToUndoStack)
                        this.pushToUndoStacks(slide)
            }

            this.setState({
                curSlide
            }, () => {

                this.pageCount = this.state.slides[this.state.curSlide].pageCount || 0;
                this.setSizeOfPage(this.pageCount)

                this.db.reset()
        
                this.db.setImg(this.state.slides[this.state.curSlide].note)
                this.simsList.loadDataToSketches()
            })
        }
        else if (curSlide == undefined) {
            

            const slide = this.state.slides[this.state.curSlide]
            if (!shouldNotPushToUndoStack)
                this.pushToUndoStacks(slide)

            this.setState({
                slides
            }, () => {

                /**
                 * shouldNotLoad is true only when a sim is individually updated and saved
                 * Here, we need not load data to all the sims
                 * So if shouldNotLoad is true, we return without calling loadDatatoSketches
                 */

                if (shouldNotLoad)
                    return

                this.simsList.loadDataToSketches()
            })
        }
        else {

            const slide = this.state.slides[this.state.curSlide]

            if (!shouldNotPushToUndoStack)
                this.pushToUndoStacks(slide)

            this.setState({
                slides,
                curSlide
            }, () => {

                this.pageCount = this.state.slides[this.state.curSlide].pageCount || 0;
                this.setSizeOfPage(this.pageCount)

                this.db.reset()

                this.db.setImg(this.state.slides[this.state.curSlide].note)
                this.simsList.loadDataToSketches()
            })
        }
    }

    deleteSlide(index) {

        /* This function decides what to do when the X button is pressed in the
           slide element. If there is only one element. it is not deleted,
           it is just reset. Otherwise, the slide is deleted and the current slide is set.
        */

        const slides = Object.values($.extend(true, {}, this.state.slides))

        if (slides.length != 1) {

            slides.splice(index, 1)

            let { curSlide } = this.state
            this.undoStacks.splice(index, 1)

            if (index == 0) {
                curSlide = 0
            }
            if (curSlide == slides.length)
                curSlide = slides.length - 1

            this.saveChanges(slides, curSlide)
        }
        else {
            this.undoStacks = []
            this.reset()
        }
    }

    deleteSim(index) {

        /* This function decides what to do when cross button in the simulation is pressed.
            The simulation is deleted from the iframes array of the
            current slide and the changes are saved.
        */

        const slides = Object.values($.extend(true, {}, this.state.slides))

        const { curSlide } = this.state
        const iframes = slides[curSlide].iframes
        iframes.splice(index, 1)
        slides[this.state.curSlide].iframes = iframes
        this.saveChanges(slides)

    }

    deleteTextBox = (index) => {

        const slides = Object.values($.extend(true, {}, this.state.slides))

        const { curSlide } = this.state
        const textboxes = slides[curSlide].textboxes
        textboxes.splice(index, 1)
        slides[this.state.curSlide].textboxes = textboxes
        this.saveChanges(slides)
    }

    interact() {

        /*
          To interact with the simulation, interact should be enabled which disables the pointer events in the canvas,
           so that when we interact with the simulation, no drawings are made. Unchecking the interact, unsets the
           pointer events.
         */

        if (this.addSim.state.isOpen)
            return

        if (!this.state.interactEnabled) {
            $('.upper-canvas')[0].style['pointer-events'] = 'none'
            $('.lower-canvas')[0].style['pointer-events'] = 'none'
        }
        else {
            $('.upper-canvas')[0].style['pointer-events'] = 'unset'
            $('.lower-canvas')[0].style['pointer-events'] = 'unset'
        }

        this.setState((state) => {
            return {
                interactEnabled: !state.interactEnabled
            }
        })
    }

    checkCanvasSize() {

        /*
            This function ensures that the the size of the Canvas is not reduced to a value less
            than the bottom most point of the last sim/textbox
            
            initially maxHeight is set to the lowest possible value = -Infinity
            Then we iterate through each object i.e textboxes and sims
            
            The y coordinate of bottom of lowest element is found out

            If y > height of canvas after reduction, 1 is returned
        */
        
        var maxHeight = -Infinity;

        var j = $('textarea').length, textarea;
        
        while(j--) {
            
            textarea = $('textarea').eq(j).parents().eq(1)
            if ((textarea.position().top + textarea.height()) > maxHeight)
                maxHeight = textarea.position().top + textarea.height()
        }

        var i = $('iframe').length, iframe;      

        while (i--) {
            iframe = $('iframe').eq(i - 1).parents().eq(3);
            if ((iframe.position().top + iframe.height()) > maxHeight)
                maxHeight = iframe.position().top + iframe.height();
        }

        if (($('canvas')[0].height - 300)*this.state.scaleX < maxHeight)
            return 1;

        return 0;
    }

    undo = () => {

        /**
         * The function is triggered when undo button is pressed or shortcut ctrl+z is pressed
         * From the undoStacks, from the curSlide, slide object is popped and slide is restored
         * When this is done, redoStacks is pushed with current state
         */

        const slide = this.undoStacks[this.state.curSlide].pop()

        if(!this.redoStacks[this.state.curSlide]) {

            this.redoStacks[this.state.curSlide] = []
        }                  
        
        if (slide) {

            this.redoStacks[this.state.curSlide].push(this.state.slides[this.state.curSlide])
            this.restoreStateBack(slide)
        }
    }

    redo() {

        /**
         * When undo is called, the current state is saved to redoStack
         */

        const slide = this.redoStacks[this.state.curSlide].pop()
             
        if (slide) {

            this.undoStacks[this.state.curSlide].push(this.state.slides[this.state.curSlide])  
            this.restoreStateBack(slide)
        }
    }

    restoreStateBack = (slide) => {

        const slides = Object.values($.extend(true, {}, this.state.slides)) 

        slides[this.state.curSlide] = slide

        this.setState({
            slides
        }, () => {

            this.pageCount = this.state.slides[this.state.curSlide].pageCount || 0;
            this.setSizeOfPage(this.pageCount)
            this.simsList.loadDataToSketches()
            /**
             * When reset is called, we need not push the slide to undostack
             */
            this.preventUndo = true
            this.db.reset('0')
            this.preventUndo = false
            this.db.setImg(this.state.slides[this.state.curSlide].note)

            /**
             * If note has empty string,
             * we explicitly clear the canvas
             */

            if (!this.state.slides[this.state.curSlide].note) {

                this.preventUndo = true
                this.db.reset({ webStorage: false, history: false, background: true });
                this.preventUndo = false
            }
        })
    }

    headToRequestPage() {

        this.setState({ redirectToRequest: true })
    }


    changePageCount(option) {

        /*
            The function is used for increasing or decreasing the size of the page.
            Option will receive either 1 or -1, 1 means to increase the size, -1 means to decrease
            Theight attrubute of the canvas is obtained and 300 is added / subtracted to it
            The image is restored to the canvas
            The page count value is added to the slide
        */

        var temp = this.db.getImg();
        
        
        this.pageCount += option;
        $('.upper-canvas')[0].style.height = ($('.upper-canvas')[0].height + option * 300).toString() + 'px';
        $('.lower-canvas')[0].style.height = ($('.lower-canvas')[0].height + option * 300).toString() + 'px';
        $('.upper-canvas')[0].height += option * 300;
        $('.lower-canvas')[0].height += option * 300;
        $('.canvas-container')[0].style.height = $('.lower-canvas')[0].style.height;
        this.db.b.setHeight($('.upper-canvas')[0].height)
       
        /**
         * When reset is called here, we need not push to undo stack
         * preventUndo variable is used for preventing object being added to undoStacks
         */

        this.preventUndo = true

        this.db.reset('0');

        this.preventUndo = false

        this.db.setImg(temp);
        const slides = Object.values($.extend(true, {}, this.state.slides))
        slides[this.state.curSlide].pageCount = this.pageCount;
        this.saveChanges(slides)
    }

    addTextBox = () => {

        const slides = Object.values($.extend(true, {}, this.state.slides))

        const { curSlide } = this.state

        if (!slides[curSlide].textboxes) {

            slides[curSlide].textboxes = []
        }

        const newTextBox = {

            value: 'new text box'
        }

        slides[curSlide].textboxes.push(newTextBox)

        this.saveChanges(slides)
    }

    setCopiedState(set) {

        if(set)
            this.setState({copied: true})
        else
            this.setState({copied: false})
    }

    addDescription = () => {

        this.setState({ showDescription: false })
        this.setState({ addDescription: false })

        if (this.subject.value === '')
            var subject = this.subject.placeholder
        else
            var subject = this.subject.value

        if (this.topic.value === '')
            var topic = this.topic.placeholder
        else
            var topic = this.topic.value

        if (this.learningObjectives.value === '')
            var learningObjectives = this.learningObjectives.placeholder
        else 
            var learningObjectives = DOMPurify.sanitize(this.learningObjectives.value.replace(new RegExp('\r?\n', 'g'), '<br />'))

        if (this.inClassActivities.value === '')
            var inClassActivities = this.inClassActivities.placeholder
        else 
            var inClassActivities = DOMPurify.sanitize(this.inClassActivities.value.replace(new RegExp('\r?\n', 'g'), '<br />'))

        if (this.resources.value === '')
            var resources = this.resources.placeholder
        else 
            var resources = DOMPurify.sanitize(this.resources.value.replace(new RegExp('\r?\n', 'g'), '<br />'))
        
        if (this.assessments.value === '')
            var assessments = this.assessments.placeholder
        else
            var assessments = this.assessments.value

        if (this.standards.value === '')
            var standards = this.standards.placeholder
        else
            var standards = this.standards.value

        var description = {
            subject: subject,
            topic: topic,
            learningObjectives: learningObjectives,
            inClassActivities: inClassActivities,
            resources: resources,
            assessments: assessments,
            standards: standards
        }

        Meteor.call('lessonplans.description', this.state._id, description, (err) => {
            alert("Description addedd successfully")
        })

    }

    checkDescExist = () => {

        var a = LessonPlans.find({ _id: this.state._id, description: { "$exists": true } }).fetch()
        if (a.length != 0)
            return true
        else {
            Meteor.call('lessonplans.addDescriptionField', this.state._id, (err) => {
                return true
            })
        }
    }

    checkDescription = () => {

        var res = LessonPlans.find({ _id: this.state._id }).fetch()
        var desc = res[0].description
        return (Object.keys(desc).length === 0 && desc.constructor === Object)
    }

    renderDescription = () => {
        if (Object.keys(this.state.description).length === 0 && this.state.description.constructor === Object) {
            return (
                <p>No description to show</p>
            )
        }
        else {
            return (
                <List divided relaxed>
                    <List.Item>
                        <List.Header>Subject</List.Header>
                        {this.state.description.subject}
                    </List.Item>
                    <List.Item>
                        <List.Header>Topic</List.Header>
                        {this.state.description.topic}
                    </List.Item>
                    <List.Item>
                        <List.Header>Learning Objectives</List.Header>
                        <div dangerouslySetInnerHTML={{ __html: this.state.description.learningObjectives }} />
                    </List.Item>
                    <List.Item>
                        <List.Header>In-Class Activites</List.Header>
                        <div dangerouslySetInnerHTML={{ __html: this.state.description.inClassActivities }} />
                    </List.Item>
                    <List.Item>
                        <List.Header>Resources</List.Header>
                        <div dangerouslySetInnerHTML={{ __html: this.state.description.resources }} />
                    </List.Item>
                    <List.Item>
                        <List.Header>Assessments</List.Header>
                        {this.state.description.assessments}
                    </List.Item>
                    <List.Item>
                        <List.Header>Standards</List.Header>
                        {this.state.description.standards}
                    </List.Item>
                </List>
            )
        }
    }

    calcHeightOfCanvasContainer = () => {

        if(this.state.slides.length>0) {

            return 900 + this.state.slides[this.state.curSlide].pageCount*300
        }
        else {
            return 900
        }
    }

    render() {

        const { showDescription, addDescription } = this.state

        if (this.state.redirectToLogin) {

            return <Redirect to={`/login`} />
        }

        if (this.state.redirectToDashboard) {

            return <Redirect to={`/dashboard/lessonplans`} />
        }

        return (

            <Segment style={{ padding: 0, margin: 0 }}>

                <Dimmer active={!this.state.initialized}>
                    <Loader />
                </Dimmer>

                <Modal size='tiny' open={this.state.loginNotification}>
                    <Modal.Header>
                        You need to login to save changes
                        <Button style={{ float: 'right' }} onClick={() => {
                            this.setState({ loginNotification: false })
                        }}>X</Button>
                    </Modal.Header>
                    <Modal.Content>
                        <Modal.Description style={{ textAlign: 'center' }}>

                            <Button onClick={() => {

                                Session.set('stateToSave', this.state)

                                this.setState({ redirectToLogin: true })

                            }} style={{ marginTop: '1.6rem' }}>Login</Button>


                        </Modal.Description>
                    </Modal.Content>
                </Modal>


                <Grid style={{ height: this.calcHeightOfCanvasContainer()*this.state.scaleX + 'px', padding: 0, margin: 0 }} columns={3} divided>
                    <Grid.Row style={{ overflow: 'hidden' }}>
                        <Grid.Column style={{ position:'fixed', textAlign: 'center', overflow: 'auto' }} width={2}>
                            {this.state.saving?<p>Saving...</p>:null}
                            <Button style={{ marginTop: '0.8rem' }} onClick={this.addNewSlide.bind(this)}>Create Slide</Button>
                            <h1>{this.state.curSlide + 1}</h1>
                            <Lists

                                slides={this.state.slides}
                                curSlide={this.state.curSlide}
                                saveChanges={this.saveChanges.bind(this)}
                                delete={this.deleteSlide.bind(this)}
                                setStateAfterRearranging={this.setStateAfterRearranging.bind(this)}
                                from={'createLessonplan'}
                                isPreview={false}
                            />
                        </Grid.Column>

                        <Grid.Column style={{

                            margin: '0 auto',
                            padding: 0,
                            overflowX: 'hidden',
                            overflowY: 'hidden',
                            height: this.calcHeightOfCanvasContainer()*this.state.scaleX + 'px'

                        }} width={12}
                        >
                            <div className = 'canvas-cont' style={{ backgroundColor:'black',width:'1366px', transform: `scale(${this.state.scaleX},${this.state.scaleX})`, transformOrigin: 'top left' }}>

                                <TextBoxes

                                    slides={this.state.slides}
                                    curSlide={this.state.curSlide}
                                    saveChanges={this.saveChanges.bind(this)}
                                    delete={this.deleteTextBox.bind(this)}
                                    isPreview={false}
                                    setCopiedState={this.setCopiedState.bind(this)}
                                />


                                <SimsList

                                    slides={this.state.slides}
                                    curSlide={this.state.curSlide}
                                    saveChanges={this.saveChanges.bind(this)}
                                    delete={this.deleteSim.bind(this)}
                                    isPreview={false}
                                    setCopiedState={this.setCopiedState.bind(this)}
                                    isRndRequired={true}
                                    undo={this.undo.bind(this)}
                                    redo={this.redo.bind(this)}
                                    ref={e => this.simsList = e}
                                    save={this.save.bind(this)}
                                    interact = {this.interact.bind(this)}
                                />

                                <DrawingBoardCmp
                                    toolbarVisible={true}
                                    ref={e => this.drawingBoard = e}
                                    onChange = {this.onChange.bind(this)}
                                    saveAfterReset = {this.saveAfterReset.bind(this)}
                                />

                            </div>


                        </Grid.Column>


                        <Grid.Column width={2} style={{position:'fixed', right:0}}>

                            <AddSim 
                                isPreview={true} 
                                ref={e => this.addSim = e} 
                                curSlide={this.state.curSlide}
                                slides = {this.state.slides}
                                saveChanges={this.saveChanges.bind(this)}
                            />

                            <Menu color={'blue'} icon vertical>
                                <Menu.Item>
                                    <Button 
                                        toggle 
                                        active={!this.state.interactEnabled}
                                        onClick={this.interact.bind(this)}
                                    >
                                        {this.state.interactEnabled ? 'Draw' : 'Interact'}
                                    </Button>
                                </Menu.Item>

                                <Menu.Item>
                                    <Button onClick={() => { this.addSim.addSim() }} color='black'>
                                        Add simulation
                                    </Button>
                                </Menu.Item>


                                {Meteor.userId() ?
                                    <Menu.Item> <Button color='blue' onClick={() => {

                                        const lessonplan = LessonPlans.findOne({ _id: this.state._id })

                                        try {
                                            expect({ slides: lessonplan.slides }).to.deep.include({ slides: this.state.slides })
                                        }
                                        catch (error) {

                                            if (error) {

                                                const confirmation = confirm('Are you sure you want to leave. Any unsaved changes will be lost!')

                                                if (!confirmation)
                                                    return
                                            }
                                            else
                                                return
                                        }

                                        this.setState({

                                            redirectToDashboard: true
                                        })
                                    }}>Home</Button></Menu.Item>
                                    : null}

                                {!!Meteor.userId() && this.state.userId == Meteor.userId() ?
                                    <Link to={`/request/${this.state._id}`}><Menu.Item link>Request for new sim</Menu.Item></Link>
                                    : null}


                                <Menu.Item onClick={() => {
                                    const confirmation = confirm('Are you sure you want to reset all?')
                                    if (confirmation == true)
                                        this.reset()
                                }}>
                                    Reset lessonplan
                                </Menu.Item>

                                <Menu.Item onClick={() => { this.undo() }}>
                                    Undo
                                </Menu.Item>

                                <Menu.Item onClick={() => { this.redo() }}>
                                    Redo
                                </Menu.Item>

                                <Menu.Item onClick={() => {
                                    this.save()
                                }}>
                                    {Meteor.userId() == this.state.userId || !Meteor.userId() ? 'Save' : 'Fork and Save'}
                                </Menu.Item>

                                <Menu.Item
                                ref="increaseCanvasButton"
                                onClick={()=>{

                                    this.changePageCount(1)
                                }}
                                >
                                Increase Canvas size
                                </Menu.Item>

                                <Menu.Item
                                onClick={() => {

                                    if (this.pageCount == 0 || this.checkCanvasSize()) {
                                        alert("Canvas size cannot be decreased further!");
                                        return;
                                    }

                                    this.changePageCount(-1);
                                }}
                                >
                                Decrease Canvas size
                                </Menu.Item>

                                {!!!Meteor.userId() ? <Menu.Item onClick={() => {

                                    const confirmation = confirm('You will be redirected to login page. Changes will be saved for you.')
                                    if (!confirmation)
                                        return

                                    Session.set('stateToSave', this.state)

                                    this.setState({ redirectToLogin: true }
                                    )
                                }}>
                                    Login
                                </Menu.Item> : null}
                                {!Meteor.userId() ? <Link to={`/explore`}><Menu.Item link>Back</Menu.Item></Link> : null}

                                <Menu.Item onClick={() => {

                                    this.addTextBox()

                                }}>
                                    Add textbox
                                </Menu.Item>

                                {this.checkDescExist() ?
                                    !!Meteor.userId() && this.state.userId == Meteor.userId() && this.checkDescription() ?
                                        <Modal
                                            size="small"
                                            onClose={() => { this.setState({ addDescription: false }) }}
                                            open={addDescription}
                                            trigger={<Menu.Item onClick={() => { this.setState({ addDescription: true }) }}>Add description</Menu.Item>} >
                                            <Modal.Header>
                                                Lesson Description
                                            <Button className='close-button' onClick={() => { this.setState({ addDescription: false }) }}>
                                                    X
                                            </Button>
                                            </Modal.Header>

                                            <Modal.Content>
                                                <Modal.Description>
                                                    <Form onSubmit={this.addDescription}>
                                                        <Form.Field required>
                                                            <label>Subject</label>
                                                            <input ref={e => this.subject = e} required />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>Topic</label>
                                                            <input ref={e => this.topic = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>Learning Objective(s)</label>
                                                            <textArea rows={1} ref={e => this.learningObjectives = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>In-Class Activities</label>
                                                            <textArea rows={1} ref={e => this.inClassActivities = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>References/Resources</label>
                                                            <textArea rows={1} ref={e => this.resources = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>Assessments</label>
                                                            <input ref={e => this.assessments = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <label>Standards</label>
                                                            <input ref={e => this.standards = e} placeholder="-" />
                                                        </Form.Field>
                                                        <Form.Field>
                                                            <Button type='submit'>Submit</Button>
                                                        </Form.Field>
                                                    </Form>
                                                </Modal.Description>
                                            </Modal.Content>
                                        </Modal>
                                        :
                                        <Modal
                                            size="small"
                                            onClose={() => { this.setState({ showDescription: false }) }}
                                            open={showDescription}
                                            trigger={<Menu.Item onClick={() => {
                                                this.setState({ showDescription: true })
                                                var res = LessonPlans.find({ _id: this.state._id }).fetch()
                                                this.setState({ description: res[0].description })
                                            }}>View description</Menu.Item>} >
                                            <Modal.Header>
                                                Lesson Description

                                            <Button className='close-button' onClick={() => { this.setState({ showDescription: false }) }}>
                                                    X
                                            </Button>

                                                {(!!Meteor.userId() && this.state.userId == Meteor.userId()) ?
                                                    <Modal
                                                        size="small"
                                                        onClose={() => { this.setState({ addDescription: false }) }}
                                                        open={addDescription}
                                                        trigger={
                                                            <FaEdit
                                                                style={{ cursor: "pointer", marginLeft: "15px" }}
                                                                size={17} color="black"
                                                                onClick={() => { this.setState({ addDescription: true }) }} />} >
                                                        <Modal.Header>
                                                            Lesson Description
                                                        <Button className='close-button' onClick={() => { this.setState({ addDescription: false }) }}>
                                                                X
                                                        </Button>
                                                        </Modal.Header>

                                                        <Modal.Content>
                                                            <Modal.Description>
                                                                <Form onSubmit={this.addDescription}>
                                                                    <Form.Field>
                                                                        <label>Subject</label>
                                                                        <input ref={e => this.subject = e} placeholder={this.state.description.subject} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>Topic</label>
                                                                        <input ref={e => this.topic = e} placeholder={this.state.description.topic} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>Learning Objective(s)</label>
                                                                        <textArea rows={1} ref={e => this.learningObjectives = e} placeholder={this.state.description.learningObjectives} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>In-Class Activities</label>
                                                                        <textArea rows={1} ref={e => this.inClassActivities = e} placeholder={this.state.description.inClassActivities} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>References/Resources</label>
                                                                        <textArea rows={1} ref={e => this.resources = e} placeholder={this.state.description.resources} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>Assessments</label>
                                                                        <input ref={e => this.assessments = e} placeholder={this.state.description.assessments} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <label>Standards</label>
                                                                        <input ref={e => this.standards = e} placeholder={this.state.description.standards} />
                                                                    </Form.Field>
                                                                    <Form.Field>
                                                                        <Button type='submit'>Update</Button>
                                                                    </Form.Field>
                                                                </Form>

                                                            </Modal.Description>
                                                        </Modal.Content>
                                                    </Modal>
                                                    : null}
                                                {(!!Meteor.userId() && this.state.userId == Meteor.userId()) ?
                                                    <FaTrash
                                                        style={{ cursor: "pointer", marginLeft: "15px" }}
                                                        size={17}
                                                        color="black"
                                                        onClick={() => {
                                                            const confirmation = confirm('Are you sure you want to perform this deletion?')

                                                            if (!confirmation)
                                                                return

                                                            Meteor.call('lessonplans.removeDescription', this.state._id, (err) => {
                                                                this.setState({ description: [] })
                                                            })
                                                        }}
                                                    />
                                                    :
                                                    null}

                                            </Modal.Header>

                                            <Modal.Content>
                                                <Modal.Description>
                                                    {this.renderDescription()}
                                                </Modal.Description>
                                            </Modal.Content>
                                        </Modal>

                                    :
                                    null
                                }


                                {this.state.copied ? <Menu.Item>

                                    <div style={{ display: 'flex', flexDirection: 'row' }}>

                                        <Button onClick={() => {

                                            if (Session.get('copiedObject')) {

                                                const object = Session.get('copiedObject')

                                                const slides = Object.values($.extend(true, {}, this.state.slides))

                                                const { curSlide } = this.state

                                                if (object.type === 'sim') {

                                                    slides[curSlide].iframes.push(object.copiedObject)

                                                }
                                                else if (object.type === 'text') {


                                                    slides[curSlide].textboxes.push(object.copiedObject)
                                                }

                                                this.saveChanges(slides)
                                            }

                                        }} color='blue'>
                                            Paste
                                    </Button>
                                        <Button onClick={() => {

                                            this.setCopiedState(false)
                                            Session.set('copiedObject', null)

                                        }} color='red'>X</Button>

                                    </div>

                                </Menu.Item> : null}
                            </Menu>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>



                <Modal size='tiny' open={!!!this.state.title}>
                    <Modal.Header>
                        Enter the title for the lessonplan
                    </Modal.Header>

                    <Modal.Content>
                        <Modal.Description>
                            <Form onSubmit={() => {

                                if (!this.title.value)
                                    return

                                this.setState({

                                    title: this.title.value
                                })

                            }}>
                                <Form.Field>
                                    <label>Title</label>
                                    <input ref={e => this.title = e} />
                                </Form.Field>
                                <Form.Field>
                                    <Button type='submit'>Submit</Button>
                                </Form.Field>
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                </Modal>

            </Segment>

        )
    }
}

export default CreatelessonPlanContainer = withTracker(({ match }) => {

    let lessonplansHandle

    /*
        If the user is logged in, we fetch his lessonplans.
        Otherwise, we fetch every public lessonplans.
    */

    if (Meteor.userId()) {

        lessonplansHandle = Meteor.subscribe('lessonplans')
    }
    else {

        lessonplansHandle = Meteor.subscribe('lessonplans.public')
    }

    /*
        loading becomes false when we get the lessonplans collection.
    */

    const loading = !lessonplansHandle.ready()

    let lessonplan, lessonplanExists


    if (match.params._id === undefined) {

        /*
            If lessonplan creator is taken by creating a new lessonplan,
            the id will be undefined, so an empty list of slides is created with title null.
        */

        lessonplanExists = true
        const slides = []
        lessonplan = { slides, title: null }
    }
    else {

        /*
            If id is not null, we are trying to open an existing lessonplans, so it is fetched from the database.
            If the lessonplan exists for the id provided, loading is set to false.
        */

        lessonplan = LessonPlans.findOne(match.params._id)

        lessonplanExists = !loading && !!lessonplan
    }


    return {

        /*
            LessonplanExists is returned for determining if the loading screen display.
            If lessonplan exists, it is returned, otherwise an empty array is returned.
            Go to the componentWillReceiveProps to see what we do with the returned lessonplan.
        */

        lessonplanExists,
        lessonplan: lessonplanExists ? lessonplan : []
    }

})(CreateLessonPlan)