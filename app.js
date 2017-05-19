const express = require("express");
const db = require('./db.js')
var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true })); //someone figure out what the extended refers to.
const port = 3000;

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
app.post('/login', (req, res)=>{ // Actions for login attempt
	console.log(req.headers)
	console.log(req.url);
	console.log(req.body);
	console.log("that's a login attempt");
	res.set('Content-Type', 'text/plain'); //theoretically sets the content type header.
	res.send(validateLogin(req.body)); // I think this *should* work. having trouble getting a response back to the HTML. not sure what the deal is there.
	
});
app.listen(port, () => {
  console.log('Server start on port ' +port);
});
