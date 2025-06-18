const express = require("express") ;
const router = express.Router() ;
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner ,validateListing} = require("../middleware.js")





// Index - All Listings
  router.get("/", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
}));




//New listings
router.get("/new",isLoggedIn, (req, res) => {
  res.render("listings/new");
});



// Create Listing
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
  if (!req.body.listing.image) req.body.listing.image = { url: "/default.avif" };
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id ;
  await newlisting.save();
  req.flash("success","new listing created") ;
  res.redirect("/listings");
}));



// Show Listing
router.get("/:id" ,wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings"); // <-- Add return here!
  }
  res.render("listings/show", { listing });
}));



// Edit Form
router.get("/:id/edit", isLoggedIn ,isOwner,wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.render("listings/edit", { listing });
}));



// Update Listing
router.put("/:id", 
    isLoggedIn, 
    isOwner,
    validateListing,
    wrapAsync(async (req, res, next) => {
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
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("Deleted");
  req.flash("success","listing deleted") ;
  res.redirect("/listings");
}));




module.exports = router ;