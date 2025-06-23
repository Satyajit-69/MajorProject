const express = require("express") ;
const router = express.Router() ;
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner ,validateListing} = require("../middleware.js")
const listingControllers = require("../controllers/listing.js") ;
const multer  = require('multer');

const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Index - All Listings
  router.get("/", wrapAsync(listingControllers.index));

//New listings
router.get("/new",isLoggedIn, listingControllers.new);



// Create Listing
router.post("/", 
  isLoggedIn, 
  validateListing, 
  upload.single('listing[image]'),
  wrapAsync(listingControllers.createListing));


// Show Reviews
router.get("/:id", wrapAsync(listingControllers.showListing));3



// Edit Form
router.get("/:id/edit", isLoggedIn ,isOwner,wrapAsync(listingControllers.editRoute));

// Update Listing
router.put("/:id", 
    isLoggedIn, 
    isOwner,
    validateListing,
    wrapAsync(listingControllers.updateRoute));



// Delete Listing
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingControllers.deleteRoute));




module.exports = router ;