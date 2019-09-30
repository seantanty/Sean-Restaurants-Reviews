var mongoose = require("mongoose");

// Schema Setup
var restaurantSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	address: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}
	],
    rating: {
        type: Number,
        default: 0
    }
});

var Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;