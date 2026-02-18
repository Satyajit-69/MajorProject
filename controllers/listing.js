const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig.js");

// ---------------- INDEX ROUTE ----------------
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
};

// ---------------- NEW ROUTE ----------------
module.exports.new = (req, res) => {
  res.render("listings/new");
};

// ---------------- CREATE ROUTE ----------------
module.exports.createListing = async (req, res) => {
  let uploadedImage = null;



  try {
    if (!req.body.listing) {
      req.flash("error", "Listing data is required");
      return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Image upload handling
    if (req.file) {
      uploadedImage = {
        url: req.file.path,
        filename: req.file.filename,
      };

      newListing.image = uploadedImage;
    } else {
      newListing.image = {
        url: "/default.avif",
        filename: "default.avif",
      };
    }

    await newListing.save();

    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Error creating listing:", err);

    // Cleanup uploaded image if DB save fails
    if (uploadedImage && uploadedImage.filename) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.filename);
      } catch (deleteErr) {
        console.error("Error deleting uploaded image:", deleteErr);
      }
    }

    req.flash("error", "Error creating listing.");
    res.redirect("/listings/new");
  }
};

// ---------------- SHOW ROUTE ----------------
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// ---------------- EDIT ROUTE ----------------
module.exports.editRoute = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/edit", { listing });
};

// ---------------- UPDATE ROUTE ----------------
module.exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const oldImage = listing.image;

    Object.assign(listing, req.body.listing);

    // If new image uploaded
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };

      // Delete old image from Cloudinary
      if (oldImage && oldImage.filename !== "default.avif") {
        try {
          await cloudinary.uploader.destroy(oldImage.filename);
        } catch (deleteErr) {
          console.error("Error deleting old image:", deleteErr);
        }
      }
    }

    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.error("Error updating listing:", err);
    req.flash("error", "Error updating listing.");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

// ---------------- DELETE ROUTE ----------------
module.exports.deleteRoute = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndDelete(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
