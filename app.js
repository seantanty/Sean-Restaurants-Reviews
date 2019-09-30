//require frameworks
var express = require("express");
var app = express();
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

//mongoose.connect("mongodb://localhost:27017/sean_restaurants", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connect("mongodb+srv://Sean:57719779@seancluster-qiovu.mongodb.net/test?retryWrites=true&w=majority",{
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connect to DB");
}).catch(err =>{
	console.log("ERROR", err.message);
});


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

var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Server started.");
});