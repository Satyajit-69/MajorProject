const express = require("express") ;
const router = express.Router({mergeParams:true}) ;
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Reviews = require("../models/review.js") ;
const {validateReview ,isLoggedIn, isReviewAuthor} = require("../middleware.js");




//Reviews 
  //post
  router.post("/" ,  isLoggedIn,validateReview ,wrapAsync ( async (req,res) =>{
      let listing = await Listing.findById(req.params.id) ;
      let newReview = new Reviews(req.body.review) ;

      //store the author
      newReview.author = req.user._id ;
      listing.reviews.push(newReview) ;

      await newReview.save() ;
      await listing.save() ;
      req.flash("success","new review created") ;
      console.log(newReview) ;
      res.redirect(`/listings/${listing.id}`) ;
  })) ;

  //delete
  router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review itself
    await Reviews.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
  })
);

  module.exports = router ;