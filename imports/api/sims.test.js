import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import {Sims } from './sims'

if(Meteor.isServer) {

    describe('Sims', function() {

        beforeEach(function(){
            Sims.remove({})
        })

        it('should insert a sim if authenticated', function() {

            const userId = 'testId'                           
            const _id = Meteor.server.method_handlers['sims.insert'].apply({userId})
            
            expect(Sims.findOne({_id, userId})).to.exist

        })

        it('should not insert a sim if not authenticated', function() {
            expect(()=>{                        
                Meteor.server.method_handlers['sims.insert']() 
            }).to.throw()            
        })

    })

}