//Testing file for database handler
var chai = require('chai');
var expect = chai.expect

var databaseHandler = require('../dataparser.js');
//TODO code to setup dummy database locally

//Test create function
describe("Database Handler", function(){
  it('createEntry() should create a database entry with given paramaters', function (){
    expect(databaseHandler.createEntry({
      'name':'Alex'})).to.equal(0);
  })
})
