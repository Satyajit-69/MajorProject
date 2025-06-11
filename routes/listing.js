const express = require("express") ;
const router = express.Router() ;
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");



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


// Index - All Listings
  router.get("/", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
}));



// New Listing Form
 router.get("/new", (req, res) => {
  res.render("listings/new");
});



// Create Listing
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
  if (!req.body.listing.image) req.body.listing.image = { url: "/default.avif" };
  const newlisting = new Listing(req.body.listing);
  await newlisting.save();
  req.flash("success","new listing created") ;
  res.redirect("/listings");
}));



// Show Listing
router.get("/:id" ,wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/show", { listing });
}));



// Edit Form
router.get("/:id/edit", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/edit", { listing });
}));



// Update Listing
router.put("/:id", validateListing, wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  let listingData = req.body.listing;
  // Fix: Wrap image as object if it's a string
  if (typeof listingData.image === "string") {
    listingData.image = { url: listingData.image };
  }
  await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  req.flash("success","listing updated") ;
  res.redirect(`/listings/${id}`);
}));



// Delete Listing
router.delete("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("Deleted");
  req.flash("success","listing deleted") ;
  res.redirect("/listings");
}));


module.exports = router ;