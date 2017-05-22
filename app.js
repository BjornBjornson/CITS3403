const express = require("express");
var expressSession = require('express-session');
const db = require('./db.js')
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
var dbConnect = ('./dataparser.js')
app.use(bodyParser.urlencoded({ extended: true })); //someone figure out what the extended refers to.
app.use(expressSession({secret: '<Put a secret key here>'}));
app.use(passport.initialize());
app.use(passport.session());


//Passport 
passport.use('login', new LocalStrategy({ //how to handle login routines
    passReqToCallback : true //To pass the request to this function
  }, 
  function(req, UPE, password, done) { //remember to encrypt the password at some point
    user = dbConnect.findEntry({ 'email': UPE }, 'User');
    if (err) { return done(err); }
    if (user == "No entry found") {
        return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.password != password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
    });
  }
));

passport.use('newUser', new LocalStrategy({ //how to handle login routines
// possibly not even neccessary to use passport for this, note: still in psuedocode.
    passReqToCallback : true //To pass the request to this function
  }, 
	function(req, done); //oh this is sooo wrong, going to have to either split this into different parts, and roll it beforehand, or integrate the done code. Currently just doing a first waft of a plan.
	if (dbConnect.findEntry(req.username, "User")!= "No entry found"){
		console.log("username exists");
		return "UName taken";
	}
	else if(dbConnect.findEntry(req.email, "User")!= "No entry found"){
		console.log("Email already in use");
		return "Email taken";
	}
	else{
		dbConnect.createEntry(req.body, "User");
	});
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

function validateLogin(object){ //Basic format for making sure all the fields are correctly formed.
	console.log(object);
	var mail = object.UPE; //User EMail field
	var Pass = object.AUTHC; //User's Password
	var correct = true; // Assuming it's correctly formatted until proven elsewise
	if(Pass.length < 7){
		correct = false;
		return correct; 
	}
	else{
		console.log(mail);
		var locA = mail.indexOf("@"); //location of At
		var locD = mail.lastIndexOf("."); //Location of Dot
		if ( (locA < 1) || ( locD - locA < 2 ) ) {
			correct = false;
			return correct;
		}
	}
	if(correct){
		console.log(Pass);
		console.log("Looks ok");
		console.log("Check the database here");
		var postThing = { //undebugged. Might have to make a string, then run JSON.parse(thingy) on it.
			Email: mail,
			Password: Pass
		};
		standInForDBInterpreter(postThing, 'User');
		//passport.authenticate('login',(mail, Pass)); //this is wrong, but considering whether the rest of the checks are redundant, will just call on login hit.
		return "<this is an auth token>"; //placeholder for login confirmation.
	}
};
function standInForDBInterpreter(value, table){
	console.log("putting thing in database");
};
app.get('/', (req, res)=>{
	console.log(req.url);
	console.log(req.query);
	console.log("that's another one");
	res.send("Hello World");
});
app.post('/', (req, res)=>{
	console.log(req.url);
	console.log(req.body);
	console.log("that's another post");
	res.send("Hello World");
});
app.post('/users', (req, res)=>{
	console.log(req.headers)
	console.log(req.url);
	console.log(req.body);
	console.log("that's a new user");
	res.ContentType =('text/plain');
	res.status = 200;
	var tosend = validateLogin(req.body);
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.send(tosend);
});
app.post('/login', (req, res)=>{
	console.log(req.headers)
	console.log(req.url);
	console.log(req.body);
	console.log("that's another login");
	res.ContentType =('text/plain');
	res.status = 200;
	var tosend = validateLogin(req.body);
	res.header("Access-Control-Allow-Origin", "*"); //currently neccesary
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.send(tosend); //must institure some variety of redirect on success/failure.
});
app.listen(port, () => {
  console.log('Server start on port ' +port);
});
