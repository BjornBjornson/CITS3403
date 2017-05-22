/**
This file tests the schema (not the database itself)
**/
var expect = require('chai').expect;
var User = require('../schemas.js');


describe('User', function(){
  //needs more tests(setup way to automate testcases)
  it('Should be invalid if username is empty',function(done){
    //setup empty user
    var u = new User();
    //validate
    u.validate(function(err){
      //expect errors
      expect(err.errors.username).to.exist;
      //move to next test
      done();
    })
  })
  //another failcase
  it('Should be invalid if game is not in list',function(done){
    var testData = {
      'name':'xxDragonSlayerxx',
      'game':'Call of Duty Space Warfare: Doritos Edition',
      'mode':'Ranked'
    }
    //setup user
    var u = new User(testData);
    //validate
    u.validate(function(err){
      //expect errors
      expect(err.errors.game).to.exist;
      //move to next test
      done();
    })
  })
})
