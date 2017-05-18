const express = require("express");
const db = require('./db.js')
var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const port = 3000;
app.get('/', (request, res)=>{
	console.log(request.url);
	console.log(request.query);
	console.log("that's another one");
	res.send("Hello World");
});
app.post('/', (request, res)=>{
	console.log(request.url);
	console.dir(request.body);
	console.log("that's another post");
	res.send("Hello World");
});
app.listen(port, () => {
  console.log('Server start on port ' +port);
});