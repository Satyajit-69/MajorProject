const express = require("express") ;
const router = express.Router({mergeParams:true}) ;
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {reviewsSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Reviews = require("../models/review.js") ;



//reviews validation
const validateReview = (req,res,next) =>{
let {error} = reviewsSchema.validate(req.body);
    if(error) {
      let errMsg = error.details[0].message;
      console.log(errMsg) ;
      throw new ExpressError(400,errMsg) ;
      }
      else {
      next() ;
    }
}


//Reviews 
  //post
  router.post("/" ,  validateReview ,wrapAsync ( async (req,res) =>{
      let listing = await Listing.findById(req.params.id) ;
      let newReview = new Reviews(req.body.review) ;

      listing.reviews.push(newReview) ;
      await newReview.save()  ;
      await listing.save() ;
        req.flash("success","new review created") ;
      console.log("New review saved") ;
      res.redirect(`/listings/${listing.id}`) ;
  })) ;


  //delete
  router.delete("/:reviewId" ,wrapAsync (async(req,res) =>{
    let  {id , reviewId} = req.params  ;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}}) ;
    await Reviews.findByIdAndDelete(reviewId) ;
      req.flash("success","review deleted") ;
    console.log("review deleted") ;
    res.redirect(`/listings/${id}`) ;
  }));


  module.exports = router ;