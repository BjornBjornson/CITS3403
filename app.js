const express = require("express");
var mongoose = require('mongoose');
var User = mongoose.model('users');
var expressSession = require('express-session');
const db = require('./db.js');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
var dbConnect = ('./dataparser.js')
app.use(bodyParser.urlencoded({ extended: true })); //someone figure out what the extended refers to.
app.use(expressSession({secret: '<Put a secret key here>'})); //setting up a secret key, also setting up express' session library.
app.use(passport.initialize());  
app.use(passport.session()); //passport piggybacks off express' library, adding the ability to quietly append session tokens.
app.use(express.static(__dirname + '/Front-end')); //telling express to treat all public files as if 'Front-end' were their root directory.
app.engine('html', ejs.renderFile); //defining the an engine I'm calling 'html' to use the ejs middleware
app.set('views', path.join(__dirname,'Front-end')); //telling it where to find the html files
app.set('view engine', 'html'); //telling it to use the tool I defined two lines above

//Passport 
passport.use('login', new LocalStrategy({ //how to handle login routines
	usernameField : 'UPE',
    passwordField : 'AUTHC',
	passReqToCallback : true //To pass the request to this function
  }, 
  function(req, UPE, AUTHC, done) { //remember to encrypt the password at some point
    var user = dbConnect.findEntry({ 'email': UPE }, 'User');
    if (err) { return done(err); }
    if (user == "No entry found") {
        return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.password != AUTHC) { //add in some sort of hashing function here.
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);  
  }
 ));

passport.use('newUser', new LocalStrategy({ //how to handle login routines
    passReqToCallback : true //To pass the request to this function
  }, 
	function(req, username, email, done){ //
		
		if (dbConnect.findEntry(username, "User")!= "No entry found"){
			console.log("username exists");
			return done(null, false, { message: 'Username taken'});
		}
		else if(dbConnect.findEntry(email, "User")!= "No entry found"){
			console.log("Email already in use");
			return done(null, false, { message: 'Email taken'});
		}
		else{
			var user = dbConnect.createEntry(req.body, "User");
			return done(null, user);
		}
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
/*
above requires mongoose. Considering popping passport verification into a different file.
passport.deserializeUser(function(id, done) {
  var user = readEntry(id, 'User');
  if(err){
	  done(err, user, {message: 'An error occurred in user verification'});  
  }
  else if(user){
	  done(null, user);
  }
  else{
	  done(err, user, {message: 'An error occurred in user verification'});
  }
});
*/
app.get('/login', (req, res)=>{ //Login page display.
	res.render("login");
	console.log("Login There");
});
app.get('/newUser', (req, res)=>{ // Usercreate page. Holds the forms
	res.render("newUser");
	console.log("NewUser There");
});
app.get('/groupSearch', (req, res)=>{ // for searching for groups
	res.render("groupSearch");
	console.log("GroupSearch There");
});
app.get('/groupPage', (req, res)=>{ // group Page template, will service interactions with specific groups. 
	res.render("groupPage");
	console.log("GrouPage There");
});
app.get('/', (req, res)=>{  //landing home page
	res.render("Home");
	console.log("Homepage There");
});
app.get('/Home', (req, res)=>{// in case they get tricky, or I want to redirect them
	res.render("Home");
	console.log("Home There");
});
app.post('/signup', passport.authenticate('newUser', { // endpoint for making a new user
	successRedirect: '/Home',
	failureRedirect: '/newUser'
}));
app.post('/login', passport.authenticate('login', { //login attempt here
	successRedirect: '/Home',
	failureRedirect: '/login'
}));
/*(req, res)=>{ //hold onto this. might not be useful for login, but might be useful for other functions.
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
	
});*/
app.listen(port, () => {
  console.log('Server start on port ' +port);
});
