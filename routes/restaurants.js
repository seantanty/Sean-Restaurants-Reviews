//express router
var express = require("express");
var router = express.Router();

//add used models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// index route, show all restaurants
router.get("/", function(req,res){
	//get restaurants from db
	Restaurant.find({}, function(err,allRestaurants){
		if (err){
			console.log(err);
		} else {
			res.render("restaurants/index",{restaurants: allRestaurants, page:"restaurants"});
		}
	}); 
});

//create route, add new restaurant to database
router.post("/", middleware.isLoggedIn, function(req,res){
	//get data from form and add it to array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var address = req.body.address;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newRest = {name:name, price:price, image:image, address:address, description:description, author:author};
	//create a new restaurant and save to database
	Restaurant.create(newRest, function(err, newlyCreated){
		if(err) {
			console.log(err);
		} else {
			//redirect to restaurants page
			res.redirect("/restaurants");
		}
	});
});

//new, show form to create restaurant
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("restaurants/new");
});

//show, /xxx/:id get, show info about one restaurant
router.get("/:id", function(req,res){
	Restaurant.findById(req.params.id).populate("comments").populate({
		path: "comments",
		options: {sort:{createAt: -1}}
		}).exec(function(err, foundRestaurant){
		if(err || !foundRestaurant) {
			req.flash("error", "Restaurant not found");
			res.redirect("back");
		} else {
			res.render("restaurants/show", {restaurant: foundRestaurant});
		}
	});
});

//edit restaurant route
router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req,res){
	Restaurant.findById(req.params.id, function(err,foundRestaurant){
		res.render("restaurants/edit", {restaurant: foundRestaurant});
	});
});

//update restaurant route
router.put("/:id", middleware.checkRestaurantOwnership, function(req,res){
	delete req.body.restaurant.rating;
	//find and update
	Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, function(err, updatedRestaurant){
		if(err){
			res.redirect("/restaurants");
		} else {
			res.redirect("/restaurants/"+req.params.id);
		}
	});
});

//destory route
router.delete("/:id", middleware.checkRestaurantOwnership, function(req,res){
	Restaurant.findById(req.params.id,function(err, restaurant){
		if(err){
			res.redirect("/restaurants");
		} else{
			// deletes all comments associated with the restaurant
			Comment.remove({"_id": {$in: restaurant.comments}}, function (err) {
				if (err) {
					console.log(err);
					return res.redirect("/restaurants");
				}
				restaurant.remove();
				req.flash("success", "Restaurant deleted successfully!");
				res.redirect("/restaurants");
				});
			}
	});
});

module.exports = router;