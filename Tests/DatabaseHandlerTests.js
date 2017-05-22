//Testing file for database handler
//All testing done using test collection
var chai = require('chai');
var expect = chai.expect
var db = require('../db.js')
var factory = require('./factory.js')
var mongoose = require('mongoose')

var databaseHandler = require('../dataparser.js');
//Test Read function first(so can be used later)
describe("Read Entries",function(){
  it('readEntry() should read an entry with the id provided',function(done){
    //this test is done by having a predone entry in the collection
    var oid = mongoose.Types.ObjectId(factory.testEntry._id.$oid);
    var result = databaseHandler.readEntry(oid,'User');
    console.log(result);
    done();
  })
})

//Test create function
describe("Create Entries", function(){
  it('createEntry() should create a database entry with given paramaters', function (done){
    var testData = {
      'username':'xxDragonSlayerxx',
      'email':'example@example.com',
      'password':'salt',
      'region':'OCE',
      'ageGroup':'13-18',
      'active':'Morning'
    }
    databaseHandler.createEntry(testData,'User');
    expect(databaseHandler.createEntry(
      testData,'User')).to.not.throw;
      done();
  });
});
