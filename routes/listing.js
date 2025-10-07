const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const multer = require('multer');

const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index - All Listings
router.get("/", wrapAsync(listingControllers.index));

// New listings form
router.get("/new", isLoggedIn, listingControllers.new);

// Create Listing
// ✅ FIXED: upload.single PEHELE, validateListing PARE
router.post("/", 
  isLoggedIn, 
  upload.single('listing[image]'),  // ← First: File upload
  validateListing,                   // ← Then: Validation
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
// ✅ FIXED: upload.single PEHELE, validateListing PARE
router.put("/:id", 
  isLoggedIn, 
  isOwner,  
  upload.single('listing[image]'),  // ← First: File upload
  validateListing,                   // ← Then: Validation
  wrapAsync(listingControllers.updateRoute)
);

// Delete Listing
router.delete("/:id", 
  isLoggedIn, 
  isOwner, 
  wrapAsync(listingControllers.deleteRoute)
);

module.exports = router;