/**
This file tests the schema (not the database itself)
**/
var expect = require('chai').expect;
var schema = require('../schemas.js');
//user schema
describe('User', function(){
  var User = schema.User;

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
  //another failcase WIP
  it('Should be invalid if region not in list',function(done){
    var testData = {
      'username':'xxDragonSlayerxx',
      'email':'example@example.com',
      'password':'salt',
      'region':'AUS',
      'ageGroup':'13-18',
      'active':'Morning'
    }
    //setup user
    var u = new User(testData);
    //validate
    u.validate(function(err){
      //expect errors
      expect(err.errors.region).to.exist;
      //move to next test
      done();
    })
  })
  //should work
  it('Should be valid if required inputs are in',function(done){
    var testData = {
      'username':'xxDragonSlayerxx',
      'email':'example@example.com',
      'password':'salt',
      'region':'OCE',
      'ageGroup':'13-18',
      'active':'Morning'
    }
    var u = new User(testData);
    u.validate(function(err){
      //i think this is right syntax?
      expect(err).to.not.exist;
      done();
    })
  })
})

//Group Schema
describe('Group',function(){
  var Group = schema.Group;
  //failcase
  it('Should fail if nothing passed in',function(done){
    var group = new Group();
    group.validate(function(err){
      expect(err.errors.name).to.exist;
      done();
    });
  });
  //failcase
  it('Should fail if game is unknown',function(done){
    var testData = {
      'name':'Bob Joe',
      'game':'COD',
      'mode':'Ranked'
    }
    var group = new Group(testData);
    group.validate(function(err){
      expect(err.errors.game).to.exist;
      done();
    });
  });
  //passcase
  it('Should be valid if all entries are valid',function(done){
    var testData = {
      'name':'Bob Joe',
      'game':'LOL',
      'mode':'Ranked',
      'region':'OCE'
    }
    var group = new Group(testData);
    group.validate(function(err){

      expect(err).to.not.exist;
      done();
    });
  });

  //test default roles (currently tests if default exists not what it is)
  it('If no Role passed in should be set to a default',function(done){
    var testData = {
      'name':'Bob Joe',
      'game':'LOL',
      'mode':'Ranked',
      'region':'OCE'
    };
    var group = new Group(testData);
    group.validate(function(err){
      expect(group.roles).exist;
      done();
    })
  })


});
