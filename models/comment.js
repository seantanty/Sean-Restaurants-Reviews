var mongoose = require("mongoose");

// Schema Setup
var commentSchema = new mongoose.Schema({
	text: String,
	author: {
		id: {
			type:mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
	},
	rating: {
		type: Number,
		required: "Please provide a rating (1-5 stars).",
		min: 1,
		max: 5,
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value."
		}
	},
	restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    }
}, {
    timestamps: true
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;