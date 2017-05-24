const express = require("express");
var expressSession = require('express-session');
const db = require('./db.js');
var ejs = require('ejs');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var Group = mongoose.model('groups');
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
	usernameField : 'email',
    passwordField : 'password',
	passReqToCallback : true //To pass the request to this function
  }, 
  function(req, email, password, done) { //remember to encrypt the password at some point
    User.findOne({'email': email},function(err, user) {
		if (err) { throw(err); }
		if (!user) { //add in some sort of hashing function here.
			throw(err);
		}
		if (user.password != password) { //add in some sort of hashing function here.
			return done(null, false);
		}
		return done(null, user);
    }
	);
}));


passport.use('newUser', new LocalStrategy({ //how to handle login routines
    passReqToCallback : true, //To pass the request to this function
	usernameField : 'email',
  }, 
  function(req, email, password, done){ //
		//return false;
		User.findOne({'email': email},function(err, user) {
			if (err) { return done(err); }
			if (user) { //add in some sort of hashing function here.
			return done(null, false);
			}
		});
		/*User.findOne({'username':	username},function(err, user) {
			if (err) { return done(err); }
			if (user) { //add in some sort of hashing function here.
			return done(null, false, { message: 'Username already exists' });
			}
		});*/
		var user = new User();
		user.username= req.body.username;
		user.email = email;
		user.password = password;
		user.region = req.country;
		user.ageGroup='13-18';
		user.active = req.active;
		user.save(function(err){
			if(err){
				throw(err);
			}
			return done(null, user);
		});
		
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

var SSOcheck = function(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.header("Access-Control-Allow-Origin", "*"); //currently neccesary
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.ContentType=('text/plain');
	res.send("You're not logged in");
}


app.get('/login', (req, res)=>{ //when a request for the login page is heard:
	res.render("login"); //show them the login page
	console.log("Login There"); //tell serveradmin about it.
});

app.post('/login', passport.authenticate('login', { //login attempt here
	successRedirect: '/Home',
	failureRedirect: '/login'
}));

app.get('/newUser', (req, res)=>{ // Usercreate page. Holds the forms
	res.render("newUser");
	console.log("NewUser There");
});

app.post('/newUser', 
	passport.authenticate('newUser', { // endpoint for making a new user
		successRedirect: '/Home',
		failureRedirect: '/newUser'
	}));

app.get('/groupSearch', (req, res)=>{ // for searching for groups
	res.render("groupSearch");
	console.log("GroupSearch There");
});


app.post('/myGroupSearch',
	SSOcheck,
	function(req, res){ // for searching for groups
	console.log("Searching for group");
	Group.find({
		game: req.body.game,
		region: req.user.region,
		players: {$ne: req.user.id},
		roles: {$ne: req.body.role},
		mode: {$in: req.body.mode}
	},'name').lean().exec(function(err, doc){
		res.header("Access-Control-Allow-Origin", "*"); //currently neccesary
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.ContentType =('application/json');
		res.status = 200;
		if(err){
			console.log(err);
			res.send([{"message": "Sorry, something went wrong. Please try again."}]);
		}
		if(doc.length==0){
			res.send([{"message": "No results found"}]);
		}
		else{res.send(doc);}
	});

});

app.get('/groupPage', SSOcheck, (req, res)=>{ // group Page template, will service interactions with specific groups.
	res.render("groupPage");
	console.log("GrouPage There");
});

app.get('/about', (req, res)=>{  //landing home page
	res.render("about");
	console.log("aboutpage There");
});

app.get('/', (req, res)=>{  //landing home page
	res.render("Home");
	console.log("Homepage There");
});

app.get('/mygroups', SSOcheck, function(req, res){  //landing home page
	var theUser = req.user;
	console.log(theUser);
	res.header("Access-Control-Allow-Origin", "*"); //currently neccesary
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.ContentType =('application/json');
	res.status = 200;
	if(theUser.grouplist.length==0){res.send([{'message': 'you have no groups'}]);}
	else{
		var groups =theUser.grouplist;
		var sendlist = [];
		for(var i=0; i<groups.length; i++){
			var out = Group.findById(groups[i]);
			sendlist.append(out.name);
		}
		
		res.send(sendlist);
	}
	console.log("grouppage There");
});

app.get('/Home', (req, res)=>{// in case they get tricky, or I want to redirect them
	res.render("Home"),
	console.log("Home There");
});


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
