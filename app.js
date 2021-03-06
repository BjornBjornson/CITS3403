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
passport.use('login', new LocalStrategy({
	//how to handle login routines
	usernameField : 'email',
    passwordField : 'password',
	passReqToCallback : true 
	//To pass the request to this function
  },
  function(req, email, password, done) { 
  //remember to encrypt the password at some point
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


passport.use('newUser', new LocalStrategy({ 
//how to handle login routines
    passReqToCallback : true,
	//To pass the request to this function
	usernameField : 'email',
  },
  function(req, email, password, done){ //
		User.findOne({'email': email},function(err, user) { 
		//finds a user by their email address, original intent was to allow for changing one, or both of the email address or username.
			if (err) { return done(err); }
			if (user) { 
			return done(null, false); 
			}
		});
		/*User.findOne({'username':	username},function(err, user) {
			if (err) { return done(err); }
			if (user) { //add in some sort of hashing function here.
			return done(null, false, { message: 'Username already exists' });
			}
		});*/
		var user = new User(); //defining a new user object.
		user.username= req.body.username;
		user.email = email;
		user.password = user.generateHash(password);
		//passes to hashing function in schemas.js
		/*user.generateHash(password, (err, hash)=>{
			if(err){
				return done(err);
			}
			user.password=hash;
		});*/
		user.region = req.body.country;
		user.active = req.body.active;
		user.save(function(err){ 
		//attempts to save said user to the database
			if(err){
				return done(err);
			}
			return done(null, user);
		});

	}
));

//these next two are used by passport to track users through cookies.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//this checks if passport knows the cookie they hold, then sends a generalised failure message. 
//Said message is interpreted by the client-side JS to fulfil a variety of functions, but since it is a blank (and final) return,
//it doesn't present a serious security issue.
var SSOcheck = function(req, res, next){
	console.log(req.body);
	if (req.isAuthenticated()){
		return next();
	}
	res.header("Access-Control-Allow-Origin", "*"); 
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.ContentType=('text/plain');
	res.send("You're not logged in");
}
app.post('/logout', SSOcheck, function(req, res){ 
//removes Express' memory of the cookie. making it invalid.
	req.session.destroy(function(err){
		res.redirect("/Home");
	});
});
app.get('/logout', function(req, res){
	//displays the logout page.
	res.render("logout");
});
app.get('/login', (req, res)=>{ 
//when a request for the login page is heard:
	res.render("login"); 
	//show them the login page
	console.log("Login There"); 
	//tell serveradmin about it.
});

app.post('/login', passport.authenticate('login', {
	//login attempt, passport uses the 'login' strategy defined at the top to try check their credentials
	successRedirect: '/Home',
	failureRedirect: '/login' 
	//bounces their request on failure.
}));

app.get('/newUser', (req, res)=>{ 
// Usercreate page. Holds the forms, displays the page.
	res.render("newUser");
	console.log("NewUser There");
});

app.post('/newUser',
	passport.authenticate('newUser', { 
	// endpoint for making a new user, uses 'newUser' strategy.
		successRedirect: '/Home',
		failureRedirect: '/newUser' 
		//bounces if there's an issue.
	}));

app.get('/groupSearch', (req, res)=>{
	// for searching for groups
	res.render("groupSearch");
	console.log("GroupSearch There");
});


app.post('/myGroupSearch', 
	SSOcheck,
	function(req, res){ 
	// for searching for groups using form data
	console.log("Searching for group");
	console.log(req.body);
	Group.find({
		//finding a group that matches the desired specifications.
		'game': req.body.game,
		'region': req.user.region,
		'players': {$ne: req.user.id},
		'roles': {$ne: req.body.role},
		'mode':  req.body.mode
	},'name -_id', function(err, doc){
		console.log(doc);
		res.ContentType =('application/json');
		// seting a header.
		if(err){
			console.log(err);
			res.send([{"message": "Sorry, something went wrong. Please try again."}]); 
			//error message
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
	//searching for group defined in query string. 
	//Not a huge security problem, so leaving it url should be fine. also allows for easier dynamic page construction.
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
app.post('/groupPage', SSOcheck, (req, res)=>{ 
// group Page template, will service interactions with specific groups.
	console.log(req.url);
	Group.findOne({'name': req.query.groupName}, 'players -_id', function(err, doc){ //getting a list of player's ID's
		console.log(doc);
		console.log('this group');
		if(err){
			res.send(err);
			return false;
		}
		if(!doc){
			console.log("NO GROUP"); 
			//if the group doesn't exist, helpfully sends them to a page where they can create one.
			res.render('groupCreate');
			return false;
		}
		console.log("ELSE");
		User.find({'_id': {$in: doc['players']}}, 'username -_id', function(err, names){ 
		//gets corresponding names for the IDs
			console.log(doc['players']);
			console.log(names);
			var userThere= [{'user': 'false'},{'NOTE':'There are no players here'}];  //default to expecting empty.
			//in case it's empty. shouldn't happen, but in case it somehow happens.
			//shouldn't happen, because leaving a group triggers a delete event if there are no users remaining in it.
			if(err){
				res.send(err);
				console.log(err);
			}
			for(var a in names){ // for each name in the list, if the current user appears, then send a flag to allow leaving the group.
				if(names[a].username.localeCompare(req.user.username)!=0){ 	
					userThere= [{'user': 'false'}];//otherwise, don't.
				}
				else{
					userThere=[{'user': 'true'}];
					console.log("HELLO WORLD");
					console.log(userThere.concat(names));
					res.send(userThere.concat(names)); //if the user is there,  send list of flag, plus list of names.
					return true;
				}
			}
			console.log(userThere);
			res.send(userThere.concat(names)); // Case: names is empty, or the user isn't present in list.

		});
	});
});
app.put('/groupPage', SSOcheck, (req, res)=>{ //if a user wants to join the group.
	
	Group.findOneAndUpdate({
		'name': req.query.groupName
	}, 
	{$addToSet: {'players': req.user.id}}, //adds if user they don't already exist.
	(err, group)=>{
		console.log(req.query.groupName);
		if(err){
			console.log(err);
			res.redirect('groupPage?Error='+err); 
			// if an error, tells the user what went wrong.
			//that way they can get tech support.
			return false;
		}
		if(!group){
			console.log("Success?");
			//res.redirect('groupPage?'+req.query.groupName);
			//return true;
		}
		console.log(group);
		User.findByIdAndUpdate(req.user.id, {$addToSet: {grouplist: group._id}}, 
		//adds the group to theuser's list of groups if it doesn't exist already.
		(err, user)=>{
			if(err){
				res.redirect('groupPage?Error='+err);
			}
			res.send('Home'); //returns them home if it all worked out.
		});
	});
});

app.delete('/groupPage', SSOcheck, (req, res)=>{ // when a user wants to leave a group.
	console.log('delete');
	Group.findOne({'name': req.query.groupName}, (err, groupd)=>{ 
	//checks to see if the group exists, redirects if they're playing silly buggers.
		if(err){res.send('groupPage?Error='+err); return false;}
		if(!groupd){ res.send('Home'); return false;}
	});
	Group.findOneAndUpdate({
		//finds the group, 
		'name': req.query.groupName,
		},
		{$pull:{ 'players': req.user._id}},
		{returnNewDocument: false},
			(err, group)=>{
				console.log(group);
				console.log(req.user)
				if(err){
					res.redirect('groupPage?Error='+err);
				}
				console.log(group);
				User.findByIdAndUpdate(req.user.id,// removes the group reference from the user's object
					{$pull: {'grouplist': group._id}},
					(err, user)=>{
						console.log(user);
						if(err){
							res.redirect('groupPage?Error='+err);
						}
						if(group.players.length==1){ 
						//if that was the last player: delete the group.
							Group.findByIdAndRemove(group._id, (err, group)=>{
							if(err){
								console.log(err);
							}
							console.log('end delete'), res.send('Home');
						});
					}
				}
			);
		}
	);
});
app.delete('/Home', (req, res)=>{  //landing home page
	res.render("Home");
	console.log("Homepage There");
});
app.get('/about', (req, res)=>{  //landing home page
	console.log(req.user);
	res.render("about");
	console.log("aboutpage There");
});
app.get('/information', (req, res)=>{  //landing home page
	console.log(req.user);
	res.render("information");
	console.log("infopage There");
});

app.get('/', (req, res)=>{  //landing home page
	res.render("Home");
	console.log("Homepage There");
});
app.get('/groupCreate', function(req, res){ // display group creation page.
	if(req.isAuthenticated){
		res.render('groupCreate');
	}
	else{
		res.redirect('login');
		console.log('someone is being "clever" with groupCreate');
	}
});
app.post('/groupCreate', function(req, res){ //creating a group
	console.log("Creating group");
	if(req.isAuthenticated){
		var wegood = Group.findOne({'name': req.body.name}).exec(function(err, doc){ //seeing if the group exists already
			if(err){
				console.log(err);
				res.redirect("groupCreate?Error="+err);
				return false;
			}
			if(doc){
				console.log(doc);
				console.log("doc");
				res.redirect('groupCreate?name=alreadyexists'); //bad luck, group already exists.
				return false;
			}

			else{//lucky, you got to that name first.
				console.log(req.body);
				var group = new Group(); //filling out details from a form.
				group.name= req.body.name;
				group.game = req.body.game;
				group.mode = req.body.mode;
				group.region = req.body.region;
				group.players = [req.user.id];
				group.save(function(err, group, num){
					if(err){
						res.redirect('groupCreate?Error:'+err);
						//something went wrong!
					}
					console.log(group.name);
					console.log(group._id);
					console.log("updating user");
					//putting in the user's link to their shiny new group.
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
app.get('/mygroups', SSOcheck, function(req, res){  // getting the list of groups that a user is subscribed to.
	var theUser = req.user;
	console.log(theUser.grouplist.length);
	res.header("Access-Control-Allow-Origin", "*"); //currently sorting out an issue with same domain requests during testing.
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.ContentType =('application/json');
	res.status = 200;
	if(theUser.grouplist.length==0){res.send([{'message': 'you have no groups'}]);} //Well, better make some then buddy!
	else{
		var groups =theUser.grouplist;
		console.log("<Groups>")//little diagnostic readout segment.
		console.log(groups);
		Group.findById(groups[0], function(err, doc){
			console.log(doc);
		});
		console.log("</Groups>");
		var sendlist = [];
		Group.find({_id: {$in: groups}}, 'name -_id', function(err, found){ //getting the names of the groups. Nice and human readable.
			if(err){
				res.send(err);
			}
			res.send(found);
		});
	}
});

app.get('/Home', (req, res)=>{// in case they get tricky, or I want to redirect them
	res.render("Home");
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
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.ContentType =('application/json');
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
	});
});

//populate chat history
app.get('/mail/conversation', SSOcheck, (req, res) => {
	var convId = req.params.convId
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
			res.send('No messages')
		} else {
			res.status = 200
			res.send(doc)
		}
	});
});

//send new message
app.post('/mail/conversation', SSOcheck, (req, res) => {
	var msg = new Message()
	msg.author = req.user._id
	msg.conversation = req.params.convId
	msg.message = req.params.newMsg
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
			res.send('no worries m9')
			//res.render('mail')
		}
	})
})

//add a new conversation
app.post('/mail/chats', SSOcheck, (req, res) => {
	var conv = new Conversation()
	var users = req.body.newChat
	var userArray = users.split(',').map( (item) => {
		return item.trim()
	})
	userArray.push(req.user.username)
	//find all users this user wants to talk to
	User.find({ username: { $in: userArray } }, '_id').lean().exec(function (err, uIdArray) {
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
				res.send()
			}
		})
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
