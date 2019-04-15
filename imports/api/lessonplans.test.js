import { Meteor } from 'meteor/meteor'
import { LessonPlans } from './lessonplans'
import { expect } from 'chai';
import { Requests } from './requests'


if(Meteor.isServer) {


    describe('Lessonplans', function() {
        
        const lessonplanOne = {
            _id:'testLessonPlanId1',
            name:'first lessonplan',
            userId:'testUserId1',
            slides:[{note:'sampleData', iframes:[{data:{},src:'sample1', w:'50', h:'50'}]}],
            updatedAt:0
        }

        const lessonplanTwo= {
            _id:'testLessonPlanId2',
            name:'another lessonplan',
            userId:'testUserId2',
            slides:[{note:'sampleData', iframes:[{data:{}, src:'sample1', w:'50', h:'50'}]}],
            updatedAt:0
        }    
    

        beforeEach(function(){
            LessonPlans.remove({})
            LessonPlans.insert(lessonplanOne)
            LessonPlans.insert(lessonplanTwo)
        })

        it('should not insert a lessonplan if not authenticated', function() {

            expect(()=>{                        
                Meteor.server.method_handlers['lessonplans.insert']()  
            }).to.throw()            
        })

        it('should insert a lessonplan and its request if authenticated', function() {

            const userId = lessonplanOne.userId                          
            const _id = Meteor.server.method_handlers['lessonplans.insert'].apply({userId})

            expect(LessonPlans.findOne({_id, userId})).to.exist
            expect(Requests.findOne({_id, userId})).to.exist 
        })

        it('should remove lessonplan and its request if authenticated', function(){

            Meteor.server.method_handlers['lessonplans.remove'].apply({userId:lessonplanOne.userId}, [lessonplanOne._id])
            expect(LessonPlans.findOne({_id:lessonplanOne._id})).to.not.exist
            expect(Requests.findOne({_id:lessonplanOne._id})).to.not.exist
        })

        it('should not remove lessonplan if not authenticated', function(){            
            expect(function(){
                Meteor.server.method_handlers['lessonplans.remove'].apply({},[lessonplanOne._id])
            }).to.throw()
        })

        it('should not remove lessonplan if id is invalid', function(){            
            expect(function(){
                Meteor.server.method_handlers['lessonplans.remove'].apply({userId:lessonplanOne.userId})
            }).to.throw()
        })

        it('should update lessonplan', function() {

            // const slides = [{note:'updatedData',iframes:[{data: {newData:''},src:'sample1', w:'50', h:'50'}, {data: {newData:''},src:'sample2', w:'100', h:'100'}]}]
                const slides = [{note:'updatedData', iframes:[{data: {}, src:'sample1', w:'50', h:'50'}]}]
                Meteor.server.method_handlers['lessonplans.update'].apply({userId:lessonplanOne.userId}, [lessonplanOne._id, slides])
                const lessonplan = LessonPlans.findOne(lessonplanOne._id)
                expect(lessonplan.updatedAt).to.be.greaterThan(0)

                expect(lessonplan).to.deep.include({slides, name:lessonplanOne.name})
            
        })

        it('should throw error if extra updates provided', function() {

            expect(()=>{
                const slides = [{note:'updatedData',extra:'', iframes:[{src:'sample1', w:'50', h:'50'}, {src:'sample2', w:'100', h:'100'}]}]

                Meteor.server.method_handlers['lessonplans.update'].apply({userId:lessonplanOne.userId}, [lessonplanOne._id, slides])
                const lessonplan = LessonPlans.findOne(lessonplanOne._id)

            }).to.throw()

        })

        it('should not update if user was not creator', function() {

            const slides = [{note:'updatedData',iframes:[{data:{},src:'sample1', w:'50', h:'50'}, {data:{}, src:'sample2', w:'100', h:'100'}]}]

            Meteor.server.method_handlers['lessonplans.update'].apply({userId:'invalidId'}, [lessonplanOne._id, slides])
            const lessonplan = LessonPlans.findOne(lessonplanOne._id)

            expect(lessonplan).to.deep.include(lessonplanOne)

        })

        it('should not update lessonplan if not authenticated', function(){            
            expect(function(){
                Meteor.server.method_handlers['lessonplans.update'].apply({},[lessonPlanOne._id])
            }).to.throw()
        })

        it('should not update lessonplan if id is invalid', function(){            
            expect(function(){
                Meteor.server.method_handlers['lessonplans.update'].apply({userId:lessonplanOne.userId})
            }).to.throw()
        })
        
        it(`should return a user's lessonplan`, function() {
            const res = Meteor.server.publish_handlers.lessonplans.apply({userId:lessonplanOne.userId})
            const lessonplans = res.fetch()
            expect(lessonplans.length).to.equal(1)
            expect(lessonplans[0]).to.deep.include(lessonplanOne)
        })

        it('should return 0 lessonplan for user that has none', function() {
            const res = Meteor.server.publish_handlers.lessonplans.apply({userId:'testId'})
            const lessonplans = res.fetch()
            expect(lessonplans.length).to.equal(0)
        })

    })
} 