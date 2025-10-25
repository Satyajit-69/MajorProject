const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const { uploadMiddleware, handleMulterError } = require("../utils/imageUpload.js");

// Index - All Listings
router.get("/", wrapAsync(listingControllers.index));

// New listings form
router.get("/new", isLoggedIn, listingControllers.new);

// Create Listing
router.post("/", 
  isLoggedIn,
  uploadMiddleware.single('image'),  // Handle file upload
  validateListing,                   // Validate the listing data
  wrapAsync(listingControllers.createListing)
);

// Show Single Listing
router.get("/:id", wrapAsync(listingControllers.showListing));

// Edit Form
router.get("/:id/edit", 
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.editRoute)
);

// Update Listing
router.put("/:id", 
  isLoggedIn, 
  isOwner,
  uploadMiddleware.single('image'),  // Handle file upload
  validateListing,                   // Validate the listing data      
  wrapAsync(listingControllers.updateRoute)
);

// Delete Listing
router.delete("/:id", 
  isLoggedIn, 
  isOwner, 
  wrapAsync(listingControllers.deleteRoute)
);

module.exports = router;