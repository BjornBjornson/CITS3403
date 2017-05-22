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
 //returns json of entry of id
function readEntry(id,modelName){
	mod = mongoose.model(modelName);
	mod.findById(id, function(err, result){
		if(err){
			console.log(err);
		}
		if(result){
			console.log(result);
			return result;
		}
		else{
			console.log('null');
			return result;

		}
	});
}
//returns every document
function findEntry(modelName){
	mod = mongoose.model(modelName);
	mod.find(function (err,result){
		if(err){
			console.log(err);
		}
		if(result){
			return result;
		}else{
			return "No entries";
		}
	})
}


//finds entry based on data json paramaters
function findEntry(data,modelName){
	mod = mongoose.model(modelName);
	mod.find(data,function(err,result){
		if(err){
			console.error(err);
		}if(result){
			return result;
		}else{
			//happens when nothing is found,unsure what to return
			console.log("No Result for " + data);
		}
	});

}

/** deletes an entry from the table
deletes entry based on json object from a model
**/

function deleteEntry(data,modelName){
	var mod = mongoose.model(modelName);
	mod.findByIdAndRemove();

}

function editEntry(req, modelName) {
	var mod = mongoose.model(modelName);
	var id = req.params.id;
	mod.findById(id, function (err, object) {
		if(err) {
			console.error(err);
			//res.status(500).send(err)
		} else if(object) {
			mod.schema.eachPath(function (field) {
				if(req.body[field] !== undefined) {
					object[field] = req.body[field];
				}
			});

			object.save(function (err) {
				if(err) {
					console.error(err);
					//res.status(500).send(err)
				}
			});
		} else {
			//res.status(404).send(err)
			console.error(err);
		}
	});
}


module.exports = {
	createEntry,
	readEntry

};
