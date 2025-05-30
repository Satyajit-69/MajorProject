const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

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

// Home Route
app.get("/", (req, res) => {
  res.redirect("/listings");
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
app.post("/listings", wrapAsync(async (req, res, next) => {
  const listingData = req.body.listing;
  if (!listingData) {
    throw new ExpressError(400, "Invalid listing data!");
  }
  // Ensure image is always an object
  if (listingData.image && typeof listingData.image === "string") {
    listingData.image = { url: listingData.image };
  }
  const listing = new Listing(listingData);
  await listing.save();
  res.redirect("/listings");
}));

// Show Listing
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
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
app.put("/listings/:id", wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listingData = req.body.listing;
  if (listingData.image && typeof listingData.image === "string") {
    listingData.image = { url: listingData.image };
  }
  await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  res.redirect(`/listings/${id}`);
}));

// Delete Listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// Test Error Route
app.get("/error-test", (req, res) => {
  throw new Error("This is a test error!");
});

app.use((req, res) => {
  res.status(404).render("listings/error.ejs", { message: "Page Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).render("listings/error.ejs", { message });
});

// Start Server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
