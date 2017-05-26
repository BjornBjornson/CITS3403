const express = require("express");
var expressSession = require('express-session');
const db = require('./db.js');
var ejs = require('ejs');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('users');
var Group = mongoose.model('groups');
var Conversation = mongoose.model('conversations')
var Message = mongoose.model('msgs')
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
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
		if (err) { return done(err); }
		if (!user) { //add in some sort of hashing function here.
			return done(null, false);
		}
		if (!user.validPassword(password)) {
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
		user.password = user.generateHash(password);
		/*user.generateHash(password, (err, hash)=>{
			if(err){
				return done(err);
			}
			user.password=hash;
		});*/
		user.region = req.body.country;
		user.ageGroup='13-18';
		user.active = req.body.active;
		user.save(function(err){
			if(err){
				return done(err);
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
app.post('/logout', SSOcheck, function(req, res){
	req.session.destroy(function(err){
		res.redirect("/Home");
	});
});
app.get('/logout', function(req, res){
	res.render("logout");
});
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
	console.log(req.query.groupName);
	Group.findOne({'name': req.query.groupName}).exec(function(err, doc){
		if(err){
			console.log(err);
			res.redirect("Home");
		}
		if(!doc){
			res.redirect('groupCreate');
		}
		else{
			res.render("groupPage");
			console.log("GrouPage There");
		}
	});
});
//note: using a chain of asynchronous calls, but the success variable happens at the bottom of the chain,
//so it only gets called at the end.
app.post('/groupPage', SSOcheck, (req, res)=>{ // group Page template, will service interactions with specific groups.
	console.log(req.url);
	Group.findOne({'name': req.query.groupName}, 'players -_id', function(err, doc){
		console.log(doc);
		console.log('this group');
		if(err){
			res.send(err);
			return false;
		}
		if(!doc){
			console.log("NO GROUP");
			res.redirect('groupCreate');
			return false;
		}
		console.log("ELSE");
		User.find({_id: {$in: doc['players']}}, 'username -_id', function(err, names){
			console.log(doc['players']);
			var userThere= [];
			if(err){
				res.send(err);
				console.log(err);
			}
			for(var a in names){
				if(names[a].username.localeCompare(req.user.username)!=0){
					userThere= [{'user': 'false'}];
				}
				else{
					userThere=[{'user': 'true'}];
					res.send(userThere.concat(names));
					return true;
				}
			}
			console.log(userThere);
			res.send(userThere.concat(names));
			
		});
	});
});
app.put('/groupPage', SSOcheck, (res, req)=>{
	
});


app.get('/about', (req, res)=>{  //landing home page
	res.render("about");
	console.log("aboutpage There");
});

app.get('/', (req, res)=>{  //landing home page
	res.render("Home");
	console.log("Homepage There");
});
app.get('/groupCreate', function(req, res){
	if(req.isAuthenticated){
		res.render('groupCreate');
	}
	else{
		res.redirect('login');
		console.log('someone is being "clever" with groupCreate');
	}
});
app.post('/groupCreate', function(req, res){
	console.log("Creating group");
	if(req.isAuthenticated){
		var wegood = Group.findOne({'name': req.body.name}).exec(function(err, doc){
			if(err){
				console.log(err);
				res.redirect("groupCreate?error="+err);
				return false;
			}
			if(doc){
				console.log(doc);
				console.log("doc");
				res.redirect('groupCreate?name=alreadyexists');
				return false;
			}
			
			else{
				console.log(req.body);
				var group = new Group();
				group.name= req.body.name;
				group.game = req.body.game;
				group.mode = req.body.mode;
				group.region = req.body.region;
				group.players = [req.user.id];
				group.save(function(err, group, num){
					if(err){
						res.redirect('groupCreate?Error:'+err);
					}
					console.log(group.name);
					console.log(group._id);
					console.log("updating user");
					console.log(req.user.id);
					User.findByIdAndUpdate(req.user._id, {$push: {grouplist: group._id}}, function(err, doc){
						console.log('updating user');
						console.log(doc);});
					//User.findByIdAndUpdate(req.user._id, {$push: {'grouplist': group.id}});
					res.redirect('groupPage?groupName='+group.name);
				});
			}
		});
	}
});
app.get('/mygroups', SSOcheck, function(req, res){  //landing home page
	var theUser = req.user;
	console.log(theUser.grouplist.length);
	res.header("Access-Control-Allow-Origin", "*"); //currently neccesary
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.ContentType =('application/json');
	res.status = 200;
	if(theUser.grouplist.length==0){res.send([{'message': 'you have no groups'}]);}
	else{
		var groups =theUser.grouplist;
		console.log("<Groups>")
		console.log(groups);
		Group.findById(groups[0], function(err, doc){
			console.log(doc);
		});
		console.log("</Groups>");
		var sendlist = [];
		Group.find({_id: {$in: groups}}, 'name -_id', function(err, found){
			if(err){
				res.send(err);
			}	
			res.send(found);
		});
	}
});

app.get('/Home', (req, res)=>{// in case they get tricky, or I want to redirect them
	res.render("Home"),
	console.log("Home There");
});

app.get('/mail', (req, res) => {
	if(req.isAuthenticated){
		res.render('mail')
	}
	else{
		res.redirect('login');
		console.log('not logged in')
	}
})

//populate list of conversations
app.get('/mail/list', SSOcheck, (req, res) => {
	var theUser = req.user
	console.log(theUser)
	Conversation.find({ participants: theUser._id }).lean().populate('participants').exec(function (err, doc) {
		res.header("Access-Control-Allow-Origin", "*")
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		res.ContentType =('application/json')
		if(err) {
			res.status = 401
			console.error(err)
			res.send([{ 'message': 'Sorry. Something went wrong' }])
		} else if(doc.length == 0) {
			res.status = 204
			res.send([{ 'message': 'No conversations' }])
		} else {
			res.status = 200
			res.send(doc)
		}
	})
})

//populate chat history
app.get('/mail/:convId', SSOcheck, (req, res) => {
	convId = req.params.convId
	console.log(theUser)
	Message.find({ conversation: convId }, 'author message timestamp').lean().populate('author').exec(function (err, doc) {
		res.header("Access-Control-Allow-Origin", "*") 
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		res.ContentType =('application/json')
		if(err) {
			res.status = 401
			console.error(err)
			res.send([{ 'message': 'Sorry. Something went wrong' }])
		} else if(doc.length == 0) {
			res.status = 204
			res.send([{ 'message': 'No messages' }])
		} else {
			res.status = 200
			res.send(doc)
		}
	})

})

//send new message
app.post('/mail/:convId', SSOcheck, (req, res) => {
	convId = req.params.convId
	console.log(convId)
	var msg = new Message()
	msg.author = req.user._id
	msg.conversation = convId
	msg.message = req.body.replyText
	msg.timestamp = new Date()
	msg.save(function (err) {
		res.header("Access-Control-Allow-Origin", "*") 
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		res.ContentType =('application/json')
		if(err) {
			console.error(err)
			res.status = 401
			res.send([{ 'message': 'Sorry. Something went wrong' }])
		} else {
			res.status = 200
			//res.render('mail')
		}
	})
})

app.post('/mail', SSOcheck, (req, res) => {
	var conv = new Conversation()
	var users = req.body.newChat
	var userArray = users.split(',').map( (item) => {
		return item.trim()
	})
	userArray.push(req.user.username)
	var uIdArray = User.find({ username: { $in: userArray } }, '_id').lean()
	conv.participants = uIdArray
	conv.save(function (err) {
		res.header("Access-Control-Allow-Origin", "*") 
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		res.ContentType =('application/json')
		if(err) {
			console.error(err)
			res.status = 401
			res.send([{ 'message': 'Sorry. Something went wrong' }])
		} else {
			res.status = 200
		}
	})
})



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
