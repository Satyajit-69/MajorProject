const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig.js");
const fetch = require("node-fetch");
// ── Nominatim geocode helper (free, no API key)
async function geocode(location, country) {
  try {
    const query = `${location}, ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        // Required by Nominatim — replace with your app name & email
        "User-Agent": "WanderlustApp/1.0 (your@email.com)",
      },
    });

    const data = await res.json();

    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // GeoJSON: [lng, lat]
    }
  } catch (err) {
    console.error("Geocoding error:", err.message);
  }
  return null; // never crash the request if geocoding fails
}

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

    // ── Geocode location → save coordinates
    const coords = await geocode(newListing.location, newListing.country);
    if (coords) {
      newListing.geometry = { type: "Point", coordinates: coords };
      console.log(`Geocoded: ${newListing.location} → [${coords}]`);
    } else {
      console.warn(`Geocoding failed for: ${newListing.location}, ${newListing.country}`);
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

    // Track if location changed before overwriting
    const oldLocation = listing.location;
    const oldCountry  = listing.country;

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

    // ── Re-geocode if location/country changed OR coordinates missing
    const locationChanged =
      listing.location !== oldLocation || listing.country !== oldCountry;

    const missingCoords =
      !listing.geometry ||
      !listing.geometry.coordinates ||
      listing.geometry.coordinates.length === 0;

    if (locationChanged || missingCoords) {
      const coords = await geocode(listing.location, listing.country);
      if (coords) {
        listing.geometry = { type: "Point", coordinates: coords };
        console.log(`Re-geocoded: ${listing.location} → [${coords}]`);
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