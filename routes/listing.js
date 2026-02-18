const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const imageUpload = require("../utils/imageUpload.js");

// Index
router.get("/", wrapAsync(listingControllers.index));

// New
router.get("/new", isLoggedIn, listingControllers.new);

// Create
router.post(
  "/",
  isLoggedIn,
  imageUpload.handleMulterError,
  validateListing,
  wrapAsync(listingControllers.createListing)
);

// Show
router.get("/:id", wrapAsync(listingControllers.showListing));

// Edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.editRoute)
);

// Update
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  imageUpload.handleMulterError,
  validateListing,
  wrapAsync(listingControllers.updateRoute)
);

// Delete
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.deleteRoute)
);

module.exports = router;
