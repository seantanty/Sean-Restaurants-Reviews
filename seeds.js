var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment");

//used in early development, no longer useful
function seedDB() {
	//remove all restaurants
	Restaurant.remove({}, function(err){
		if(err) {
			console.log(err);
		}
		console.log("removed");
		
		//add restaurant
		data.forEach(function(seed){
		Restaurant.create(seed,function(err, restaurant){
			if(err) {
				console.log(err);
			} else {
				console.log("added a restaurant")
				//add comments
				Comment.create({
					text: "This place is great, but I wish there was internet",
					author: "Homer"
					}, function(err, comment){
					if(err){
						console.log(err);
					} else {
						restaurant.comments.push(comment);
						restaurant.save();
						console.log("Created new comment");
					}
				});
			}
			});
		});
	});	
}

module.exports = seedDB;
