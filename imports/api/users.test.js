import { validateNewUser } from './users'
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai';  

if(Meteor.isServer) {
    describe('users', function(){
    
        it('should allow valid email address', function() {    
            const testUser = {
                emails:[
                    {
                        address: 'test@example.com'
                    }                
                ]
            }    
            const res = validateNewUser(testUser); 
            expect(res).to.be.true  
    
        })

        it('should reject invalid address', function() {         

            const testUser = {
                emails:[
                    {
                        address: 'example'
                    }                
                ]
            }  
                    
            expect(()=>{
                validateNewUser(testUser)
            }).to.throw()

        })
    })
}
