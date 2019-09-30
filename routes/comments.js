//express router
var express = require("express");
var router = express.Router({mergeParams: true});

//add used models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments index
router.get("/", function (req, res) {
    Restaurant.findById(req.params.id).populate({
        path: "comments",
        options: {sort: {createdAt: -1}} // sorting the populated comments array to show the latest first
    }).exec(function (err, restaurant) {
        if (err || !restaurant) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("comments/index", {restaurant: restaurant});
    });
});

//comments/new
router.get("/new", middleware.isLoggedIn, middleware.checkCommentExistence, function(req, res){
	Restaurant.findById(req.params.id, function(err, restaurant) {
		if(err || !restaurant) {
			req.flash("error", "Restaurant not found");
			red.redirect("back");
		} else {
			res.render("comments/new", {restaurant: restaurant});
		}
	});
});

//comments/create
router.post("/", middleware.isLoggedIn, middleware.checkCommentExistence, function(req,res){
	//lookup using id
	Restaurant.findById(req.params.id).populate("comments").exec(function (err, restaurant){
		if(err) {
			req.flash("error", err.message);
			res.redirect("back");
		} else {
			//create new comment
			Comment.create(req.body.comment, function(err,comment){
				if(err) {
					req.flash("error", err.message);
					return res.redirect("back");
				} else {
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.restaurant = restaurant;
					comment.save();
					//connect new comment to restaurant
					restaurant.comments.push(comment);
					restaurant.rating = calculateAverage(restaurant.comments);
					restaurant.save();
					//redirect to restaurant show page
					req.flash("success", "Successfully added comment");
					res.redirect("/restaurants/"+restaurant._id);
				}
			});
		}
	});
});

//comment edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Restaurant.findById(req.params.id, function(err, foundRestaurant){
		if(err || !foundRestaurant){
			req.flash("error", "Restaurant not found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			} else{
				res.render("comments/edit",{restaurant_id: req.params.id, comment: foundComment});
			}
		});
	});
});

//comment update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {new: true}, function(err, updatedComment){
		if(err) {
			req.flash("error", err.message);
			res.redirect("back");
		} else{
			Restaurant.findById(req.params.id).populate("comments").exec(function (err, restaurant) {
				if (err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}
				// recalculate restaurant average
				restaurant.rating = calculateAverage(restaurant.comments);
				//save changes
				restaurant.save();
				req.flash("success", "Your comments was successfully edited.");
				res.redirect('/restaurants/' + restaurant._id);
			});
		}
	});
});

//comment delete
// /restaurant/:id/comments/:comment_id
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else{
			Restaurant.findByIdAndUpdate(req.params.id, {$pull: {comments: req.params.comment_id}}, {new: true}).populate("comments").exec(function (err, restaurant) {
				if (err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}
				// recalculate restaurant average
				restaurant.rating = calculateAverage(restaurant.comments);
				//save changes
				restaurant.save();
				req.flash("success", "Your comment was deleted successfully.");
				res.redirect("/restaurants/" + req.params.id);
			});
		}
	})
});

function calculateAverage(comments) {
	if (comments.length === 0) {
		return 0;
	}
	var sum = 0;
	comments.forEach(function (element) {
		sum += element.rating;
	});
	return sum / comments.length;
}

module.exports = router;