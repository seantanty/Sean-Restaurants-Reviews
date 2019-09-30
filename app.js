//require frameworks
var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");

//require data models
var Restaurant = require("./models/restaurant");
var Comment = require("./models/comment")
var User = require("./models/user");

//require routes
var commentRoutes = require("./routes/comments");
var restaurantRoutes = require("./routes/restaurants");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/sean_restaurants", {useNewUrlParser: true,useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

//passport setup
app.use(require("express-session")({
	secret:"TanSRR",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware to check if user logged in
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/restaurants",restaurantRoutes);
app.use("/restaurants/:id/comments",commentRoutes);

app.listen(3000, function(){
	console.log("Server listening on port 3000.");
});