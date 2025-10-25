const Listing = require("../models/listing.js");



//index route
module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { allListings: listings });
};


//new route
module.exports.new = (req, res) => {
  res.render("listings/new");
};


//create listing
module.exports.createListing = async (req, res, next) => {
  let uploadedImage = null;
  
  try {
    if (!req.body.listing) {
      req.flash("error", "Listing data is required");
      return res.redirect("/listings/new");
    }

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;

    // Handle image upload
    if (req.file) {
      console.log("Uploaded file:", req.file);
      uploadedImage = {
        url: req.file.path,
        filename: req.file.filename
      };
      
      // Ensure Cloudinary URL is properly formatted
      if (!uploadedImage.url.startsWith('http')) {
        uploadedImage.url = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/${uploadedImage.filename}`;
      }
      
      newlisting.image = uploadedImage;
    } else {
      // Set default image
      newlisting.image = {
        url: '/default.avif',
        filename: 'default.avif'
      };
    }

    // Save the listing
    await newlisting.save();
    console.log("Created listing:", newlisting);
    
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    
    // If we uploaded an image but the listing creation failed, cleanup the uploaded image
    if (uploadedImage && uploadedImage.filename) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.filename);
      } catch (deleteErr) {
        console.error("Error cleaning up uploaded image:", deleteErr);
      }
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      req.flash("error", validationErrors.join(', '));
    } else {
      req.flash("error", "Error creating listing. Please try again.");
    }
    return res.redirect("/listings/new");
  }
};


//show route
module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings"); 
  }

  res.render("listings/show", { listing });
};


//edit route
module.exports.editRoute = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  if (listing.image && listing.image.url) {
    listing.image.url = listing.image.url.replace("/upload", "/upload/h_300,w_250");
  }
  res.render("listings/edit", { listing });
};


//update route
// Import cloudinary configuration at the top level
const { cloudinary } = require('../cloudConfig');

module.exports.updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Store old image info
    const oldImage = listing.image;

    // Update listing details
    Object.assign(listing, req.body.listing);

    // Update image if new one is uploaded
    if (req.file) {
      try {
        // Update the image
        listing.image = {
          url: req.file.path,
          filename: req.file.filename
        };

        // Ensure Cloudinary URL is properly formatted
        if (!listing.image.url.startsWith('http')) {
          listing.image.url = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/${listing.image.filename}`;
        }

        // If update is successful and there's an old Cloudinary image, delete it
        if (oldImage && oldImage.filename && oldImage.filename !== 'default.avif') {
          try {
            await cloudinary.uploader.destroy(oldImage.filename);
          } catch (deleteErr) {
            console.error("Error deleting old image:", deleteErr);
            // Continue with the update even if old image deletion fails
          }
        }
      } catch (uploadErr) {
        console.error("Error handling image upload:", uploadErr);
        // Restore old image if there's an error
        listing.image = oldImage;
        throw new Error("Failed to process image upload");
      }
    }

    await listing.save();
    console.log("Updated listing:", listing);
    
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      req.flash("error", validationErrors.join(', '));
    } else {
      req.flash("error", err.message || "Error updating listing. Please try again.");
    }
    return res.redirect(`/listings/${id}/edit`);
  }
};


//deleteRoute 
module.exports.deleteRoute =async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  req.flash("success" ,"listing deleted !") ;
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  res.redirect("/listings");
};

