const express = require("express");
var expressSession = require('express-session');
const db = require('./db.js');
var ejs = require('ejs');
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
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname,'Front-end'));
app.set('view engine', 'html');

//Passport 
passport.use('login', new LocalStrategy({ //how to handle login routines
    passReqToCallback : true //To pass the request to this function
	usernameField : 'UPE',
    passwordField : 'AUTHC',
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
    });
  }
));

passport.use('newUser', new LocalStrategy({ //how to handle login routines
    passReqToCallback : true //To pass the request to this function
  }, 
	function(req, username, email, done){ //
	
	if (dbConnect.findEntry(username, "User")!= "No entry found"){
		console.log("username exists");
		return done(null, false, { message: 'Username taken'};
	}
	else if(dbConnect.findEntry(email, "User")!= "No entry found"){
		console.log("Email already in use");
		return done(null, false, { message: 'Email taken'};
	}
	else{
		var user = dbConnect.createEntry(req.body, "User");
		return done(null, user);
	});
	)});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/', (req, res)=>{
	res.render("Home");
	console.log("Hello There");
});
app.post('/', (req, res)=>{
	console.log(req.url);
	console.log(req.body);
	console.log("that's another post");
	res.send("Hello World");
});
app.post('/signup', (req, res)=>{
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
app.post('/login', passport.authenticate('login', {
	successRedirect: '/home';
	failureRedirect: '/';
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
