var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// Schema Setup
var UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

module.exports = User;