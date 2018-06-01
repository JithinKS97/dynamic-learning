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



// const add = (a, b) => a + b

// it('should add two numbers', function() {
//     const res = add(2, 3)

//     expect(res).toBe(5)
// }) 
