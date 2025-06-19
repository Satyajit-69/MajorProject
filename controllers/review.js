const Listing = require("../models/listing.js");
const Reviews = require("../models/review.js") ;

module.exports.createReview = async (req,res) =>{
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
  };


  module.exports.deleteReview = async (req, res) => {
      const { id, reviewId } = req.params;
  
      // Remove review reference from listing
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  
      // Delete the review itself
      await Reviews.findByIdAndDelete(reviewId);
  
      req.flash("success", "Review deleted");
      res.redirect(`/listings/${id}`);
    };