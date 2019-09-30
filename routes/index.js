//express router
var express = require("express");
var router = express.Router();
var passport = require("passport");

//add used models
var User = require("../models/user");

//root route
router.get("/",function(req,res){
	res.render("landing");	
});

//auth routes
//show register form
router.get("/register",function(req,res){
	res.render("register", {page: "register"});
});

router.post("/register", function(req,res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			return res.render("register", {"error":err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome, " + user.username);
			res.redirect("/restaurants");
		});	
	});
});

//show login form
router.get("/login",function(req,res){
	res.render("login",{page: "login"});
});

//handle login post, ("/login", middleware, callback)
router.post("/login",passport.authenticate("local", 
	{
		successRedirect:"/restaurants",
		failureRedirect:"/login"
	}), function(req,res){
});

//logout route
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/restaurants");
});

module.exports = router;