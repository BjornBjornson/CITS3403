const express = require("express");
const db = require('./db.js')
var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.text());

const port = 3000;
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
app.listen(port, () => {
  console.log('Server start on port ' +port);
});