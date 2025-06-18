const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");
const {reviewsSchema} = require("./schema.js");
const Review = require("./models/review");



module.exports.isLoggedIn = (req, res, next) =>{
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = res.originalUrl ;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl ;
    }
    next();
}


module.exports.isOwner = async (req,res,next) =>{
  let {id} = req.params ;
   let listing = await Listing.findById(id);
    if (! listing.owner._id.equals(res.locals.currUser._id)) {
     req.flash("error","Actions are only valid for the owners!") ;
     return res.redirect(`/listings/${id}`) ;
  }
    next() ;
}

module.exports.validateListing = (req,res,next) =>{
let {error} = listingSchema.validate(req.body);
    if(error) {
      let errMsg = error.details[0].message;
      console.log(errMsg) ;
      throw new ExpressError(400,errMsg) ;
      }
      else {
      next() ;
    }
}

module.exports.validateReview = (req,res,next) =>{
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


module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params; // ✅ use correct key
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Actions are only valid for the author of the review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

