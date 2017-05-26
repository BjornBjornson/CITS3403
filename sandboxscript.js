//this script was for testing purposes.

var handler = require('./dataparser');
process.env.NODE_ENV = "PRODUCTION";
var mongoose = require('mongoose');
var db = require('./db');
var factory = require('./test/factory.js');
var schema = require('./schemas');

handler.createEntry(factory.validUser,'users');
handler.createEntry(factory.validUser2,'users');
