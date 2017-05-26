var mongoose = require('mongoose');

//CRUD

//example of parseRequest

    /*
	dataparser({
		username:'scott  green',
		email:'example@exampe.com',
		password:'test123',
		region:'OCE',
		ageGroup:'13-18',
		active:'Morning'
	},'POST','User');
	res.send("Hello World");
	*/
/**
 * Accepts a json object of data and puts it into the database
 *
 * @param data - the data to be parsed
 * @param requestType - the request type, either 'Put' or 'Post'
 * @param model - the model for the data to be put into
 */
function createEntry(data,modelName){
	//the model variable

	var mod = mongoose.model(modelName);
	//assign the data to a new model
	var object = new mod(data);
	//save object to database

	object.save(function (err){
		if (err){
			console.log(err);
		}else{
			console.log("Saved object" + JSON.stringify(data) +
				"\nto collection:" + modelName);
		}
	});



}


module.exports = createEntry;
