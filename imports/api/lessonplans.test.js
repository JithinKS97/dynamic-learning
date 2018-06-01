import { Meteor } from 'meteor/meteor'
import { LessonPlans } from './lessonplans'
import { expect } from 'chai';


if(Meteor.isServer) {

    describe('Lessonplans', function() {

        it('should insert a lessonplan', function() {

            const userId = 'testId'                           
            const _id = Meteor.server.method_handlers['lessonplans.insert'].apply({userId})
            
            expect(LessonPlans.findOne({_id, userId})).to.exist
        })

        it('should not insert a lessonplan if not authenticated', function() {
            expect(()=>{                        
                Meteor.server.method_handlers['lessonplans.insert']() 
            }).to.throw()            
        })
        
    })
} 