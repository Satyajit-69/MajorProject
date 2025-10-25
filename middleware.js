const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");
const {reviewsSchema} = require("./schema.js");
const Review = require("./models/review");


//check user is logged in or not
module.exports.isLoggedIn = (req, res, next) =>{
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl ;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};


//redirect url after login
module.exports.saveRedirectUrl = (req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl ;
    }
    next();
}


//to made changes
module.exports.isOwner = async (req,res,next) =>{
  let {id} = req.params ;
   let listing = await Listing.findById(id);
    if (! listing.owner._id.equals(res.locals.currUser._id)) {
     req.flash("error","Actions are only valid for the owners!") ;
     return res.redirect(`/listings/${id}`) ;
  }
    next() ;
}

module.exports.validateListing = (req, res, next) => {
  try {
    if (!req.body.listing) {
      throw new ExpressError(400, "Missing listing data");
    }

    const { error } = listingSchema.validate({ listing: req.body.listing });
    if (error) {
      const errMsg = error.details.map(el => el.message).join(', ');
      console.log("Validation error:", errMsg);
      req.flash("error", errMsg);
      if (req.method === "PUT") {
        return res.redirect(`/listings/${req.params.id}/edit`);
      } else {
        return res.redirect("/listings/new");
      }
    }
    next();
  } catch (err) {
    if (req.method === "PUT") {
      req.flash("error", err.message);
      return res.redirect(`/listings/${req.params.id}/edit`);
    } else {
      req.flash("error", err.message);
      return res.redirect("/listings/new");
    }
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
  const { id, reviewId } = req.params; 
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

