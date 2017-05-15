const express = require("express");

const app = express();

const port = 3000;
app.get('/', (request, res)=>{
	console.log(request.url)
	console.log(request.query)
	res.send("Hello World");
});
app.listen(port, () => {
  console.log('Server start on port ' +port);
});
