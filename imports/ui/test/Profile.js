var chai = require('chai'); 
var expect = chai.expect; 
var Profile = require('../components/Profile'); 
var enzyme = require('enzyme');
var shallow = enzyme.shallow; 

describe('Profile testing', function() {
    it('Does not render without authentication', function() {
        const profile = shallow(<Profile />); 
        expect(profile.to.throw()); 
    })
})


