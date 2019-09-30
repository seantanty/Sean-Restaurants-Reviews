var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var User = require("../models/user");

//all middleware
var middlewareObj = {};

middlewareObj.checkRestaurantOwnership = function(req, res, next) {
	if(req.isAuthenticated()){
		Restaurant.findById(req.params.id, function(err,foundRestaurant){
			if(err || !foundRestaurant){
				req.flash("error", "Restaurant not found");
				res.redirect("back")
			} else{
				//use .equals here to compare between mongoose object and string
				if(foundRestaurant.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err,foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back")
			} else{
				//use .equals here to compare between mongoose object and string
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

middlewareObj.checkCommentExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Restaurant.findById(req.params.id).populate("comments").exec(function (err, foundRestaurant) {
            if (err || !foundRestaurant) {
                req.flash("error", "Restaurant not found.");
                res.redirect("back");
            } else {
                var foundUserComment = foundRestaurant.comments.some(function (comment) {
                    return comment.author.id.equals(req.user._id);
                });
                if (foundUserComment) {
                    req.flash("error", "You already wrote a comment.");
                    return res.redirect("/restaurants/" + foundRestaurant._id);
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
};

module.exports = middlewareObj;