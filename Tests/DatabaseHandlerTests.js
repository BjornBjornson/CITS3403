//Testing file for database handler
//All testing done using test collection
var chai = require('chai');
var expect = chai.expect
var db = require('../db.js')
var factory = require('./factory.js')

var databaseHandler = require('../dataparser.js');
//Test Read function first(so can be used later)
describe("Read Entries",function(){
  it('readEntry() should read an entry with the id provided',function(done){
    //this test is done by having a predone entry in the collection
    var oid = factory.testEntry._id.$oid;
    var result = databaseHandler.readEntry(oid,'User');
    expect(result.to.deep.equal(factory.testEntry));
    done();
  })
})

//Test create function
describe("Create Entries", function(){
  it('createEntry() should create a database entry with given paramaters', function (){
    var testData = {
      'username':'xxDragonSlayerxx',
      'email':'example@example.com',
      'password':'salt',
      'region':'AUS',
      'ageGroup':'13-18',
      'active':'Morning'
    }
    expect(databaseHandler.createEntry(
      testData,'User')).to.not.throw;
  });
});
