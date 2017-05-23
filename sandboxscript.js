var handler = require('./dataparser');
process.env.NODE_ENV = "TEST";
var mongoose = require('mongoose');
var db = require('./db');
var factory = require('./Tests/factory.js');
var schema = require('./schemas');
/*
handler.createEntry(factory.validUser,'users');
handler.createEntry(factory.validUser2,'users');
*/
handler.getAllEntries('users');
handler.findEntry({'username':"bob"},'users');
