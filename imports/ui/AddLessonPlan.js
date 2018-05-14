import React from 'react'
import { LessonPlans } from '../api/lessonplans'

const AddLessonPlans = ()=>{

    return (
        
        <div className = 'item'>

            <form onSubmit = {(e)=>{

                e.preventDefault()

                let slides = []
                const name = e.target.lessonplan.value

                slides[0] = {
                    note:'',
                    iframes: []
                }

                if(name) {
                    LessonPlans.insert({name,slides})
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