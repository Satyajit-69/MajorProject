const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const {listingSchema , reviewsSchema} = require("./schema.js");
const Reviews = require("./models/review.js") ;


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/wonderlust", {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));




//listing validation
const validateListing = (req,res,next) =>{
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



// Home Route
app.get("/root", (req, res) => {
  res.render("listings/home");
});



// Index - All Listings
app.get("/listings", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
}));



// New Listing Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});



// Create Listing
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
  if (!req.body.listing.image) req.body.listing.image = { url: "/default.avif" };
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  res.redirect("/listings");
}));



// Show Listing
app.get("/listings/:id" ,wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/show", { listing });
}));



// Edit Form
app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/edit", { listing });
}));



// Update Listing
app.put("/listings/:id", validateListing, wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  let listingData = req.body.listing;
  if (!listingData.image) listingData.image = { url: "/default.avif" };
  await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  res.redirect(`/listings/${id}`);
}));



// Delete Listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("Deleted");
  res.redirect("/listings");
}));


//Reviews 
  //post
  app.post("/listings/:id/reviews" ,  validateReview ,wrapAsync ( async (req,res) =>{
      let listing = await Listing.findById(req.params.id) ;
      let newReview = new Reviews(req.body.review) ;

      listing.reviews.push(newReview) ;
      await newReview.save()  ;
      await listing.save() ;

      console.log("New review saved") ;
      res.redirect(`/listings/${listing.id}`) ;
  })) ;


  //delete
  app.delete("/listings/:id/reviews/:reviewId" ,wrapAsync (async(req,res) =>{
    let  {id , reviewId} = req.params  ;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews:reviewId}}) ;
    await Reviews.findByIdAndDelete(reviewId) ;
    console.log("review deleted") ;
    res.redirect(`/listings/${id}`) ;
  }));




//Page not found - 404
app.use((req, res) => {
  res.status(404).render("listings/error.ejs", { message: "Page Not Found" });
});



// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "something went wrong" ;
  res.status(status).render("listings/error.ejs", { message });
});



// Start Server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
