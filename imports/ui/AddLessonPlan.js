import React from 'react'
import { LessonPlans } from '../api/lessonplans'
import { Requests } from '../api/requests'
import {Meteor} from 'meteor/meteor'

const AddLessonPlans = ()=>{

    return (
        
        <div>
            <form onSubmit = {(e)=>{

                e.preventDefault()

                let slides = []
                const name = e.target.lessonplan.value
                
                /* Here, we initialise the first slide of the lesson plan,
                   This is done for avoiding checking whether fields in the 
                   slides are empty before acccessing it.

                   Each time a slide is pushed, the internal structure of slides
                   are defined first.
                */

                slides[0] = {
                    note:'',
                    iframes: []
                }

                /* There will be a Request document for each LessonPlan document.
                   So the Request document is created along with LessonPlan document.
                   It is given the same id as the Lessonplan document. docs is the
                   id of the inserted LessonPlan document.

                   The same approach of defining the internal structure of slide before
                   inserting it is followed for slides of Request document.
                */

                if(name) {


                    LessonPlans.insert({
                        name,
                        slides,
                        userId:Meteor.userId()
                    },(err, docs)=>{

                        slides = []
                        slides[0] = {
                            title:'',
                            comments:[],
                            iframes:[]
                        }

                        Requests.insert({_id:docs, slides})
                    })
                } 

                e.target.lessonplan.value = ''

            }}>
                <input type = 'text' name = 'lessonplan' placeholder = 'Name'/>
                <button>Add</button>
            </form>
        </div>
    )
}

export default AddLessonPlans