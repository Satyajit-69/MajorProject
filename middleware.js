const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewsSchema } = require("./schema.js");


// ---------------- AUTH CHECK ----------------
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};


// ---------------- SAVE REDIRECT URL ----------------
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


// ---------------- OWNER CHECK ----------------
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Actions are only valid for the owner!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


// ---------------- VALIDATE LISTING ----------------
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    req.flash("error", errMsg);

    if (req.method === "PUT") {
      return res.redirect(`/listings/${req.params.id}/edit`);
    } else {
      return res.redirect("/listings/new");
    }
  }

  next();
};


// ---------------- VALIDATE REVIEW ----------------
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewsSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect("back");
  }

  next();
};


// ---------------- REVIEW AUTHOR CHECK ----------------
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Actions are only valid for the review author!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
